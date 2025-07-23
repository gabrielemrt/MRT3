"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { db, type DatabaseTable } from "@/lib/database"
import { toast } from "@/components/ui/use-toast"

export function useDatabase(currentUser: string) {
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncLog, setSyncLog] = useState<DatabaseTable[]>([])
  const isLoadingRef = useRef(false)
  const [isMounted, setIsMounted] = useState(false)

  // Effetto per gestire il mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Funzione per ricaricare i log di sincronizzazione (ottimizzata)
  const loadSyncLog = useCallback(async () => {
    if (isLoadingRef.current || !isMounted || !db) return

    try {
      isLoadingRef.current = true
      const logs = await db.getSyncLog()
      setSyncLog(logs.slice(0, 10)) // Ultimi 10 log

      if (logs.length > 0) {
        setLastSync(new Date(logs[0].createdAt))
      }
    } catch (error) {
      console.error("Errore nel caricamento dei log:", error)
    } finally {
      isLoadingRef.current = false
    }
  }, [isMounted])

  // Effetto per ascoltare i cambiamenti del database (ottimizzato)
  useEffect(() => {
    if (!isMounted || !db) return

    let timeoutId: NodeJS.Timeout

    const debouncedLoadSyncLog = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        loadSyncLog()
      }, 500) // Debounce di 500ms
    }

    const unsubscribe = db.onDatabaseChange(debouncedLoadSyncLog)

    // Carica i log iniziali
    loadSyncLog()

    return () => {
      clearTimeout(timeoutId)
      unsubscribe()
    }
  }, [loadSyncLog, isMounted])

  // Funzioni per gestire gli utenti
  const getUsers = useCallback(async () => {
    if (!db) return []

    try {
      const users = await db.findAll("users")
      return users.map((record) => record.data)
    } catch (error) {
      console.error("Errore nel caricamento utenti:", error)
      return []
    }
  }, [])

  const createUser = useCallback(
    async (userData: any) => {
      if (!db) throw new Error("Database non disponibile")

      try {
        setIsLoading(true)
        await db.insert("users", userData, currentUser)
        toast({
          title: "Utente creato",
          description: `L'utente ${userData.username} è stato creato con successo.`,
        })
      } catch (error) {
        console.error("Errore nella creazione utente:", error)
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Impossibile creare l'utente.",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [currentUser],
  )

  const updateUser = useCallback(
    async (userId: string, userData: any) => {
      if (!db) throw new Error("Database non disponibile")

      try {
        setIsLoading(true)
        await db.update("users", userId, userData, currentUser)
        toast({
          title: "Utente aggiornato",
          description: "Le modifiche sono state salvate con successo.",
        })
      } catch (error) {
        console.error("Errore nell'aggiornamento utente:", error)
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Impossibile aggiornare l'utente.",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [currentUser],
  )

  const deleteUser = useCallback(
    async (userId: string) => {
      if (!db) throw new Error("Database non disponibile")

      try {
        setIsLoading(true)
        await db.delete("users", userId, currentUser)
        toast({
          title: "Utente eliminato",
          description: "L'utente è stato eliminato con successo.",
        })
      } catch (error) {
        console.error("Errore nell'eliminazione utente:", error)
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Impossibile eliminare l'utente.",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [currentUser],
  )

  // Funzioni per gestire le vacanze
  const getVacations = useCallback(async () => {
    if (!db) return []

    try {
      const vacations = await db.findAll("vacations")
      return vacations.map((record) => ({ ...record.data, dbId: record.id }))
    } catch (error) {
      console.error("Errore nel caricamento vacanze:", error)
      return []
    }
  }, [])

  const createVacation = useCallback(
    async (vacationData: any) => {
      if (!db) throw new Error("Database non disponibile")

      try {
        setIsLoading(true)
        await db.insert("vacations", vacationData, currentUser)
        toast({
          title: "Vacanza creata",
          description: `La vacanza "${vacationData.title}" è stata creata con successo.`,
        })
      } catch (error) {
        console.error("Errore nella creazione vacanza:", error)
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Impossibile creare la vacanza.",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [currentUser],
  )

  const updateVacation = useCallback(
    async (vacationId: string, vacationData: any) => {
      if (!db) throw new Error("Database non disponibile")

      try {
        setIsLoading(true)
        await db.update("vacations", vacationId, vacationData, currentUser)
        toast({
          title: "Vacanza aggiornata",
          description: "Le modifiche sono state salvate con successo.",
        })
      } catch (error) {
        console.error("Errore nell'aggiornamento vacanza:", error)
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Impossibile aggiornare la vacanza.",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [currentUser],
  )

  const deleteVacation = useCallback(
    async (vacationId: string) => {
      if (!db) throw new Error("Database non disponibile")

      try {
        setIsLoading(true)

        // Elimina anche tutti i dati correlati
        const days = await db.findWhere("vacation_days", (record) => record.data.vacationId === vacationId)
        const expenses = await db.findWhere("expenses", (record) => record.data.vacationId === vacationId)
        const notes = await db.findWhere("notes", (record) => record.data.vacationId === vacationId)

        // Elimina i dati correlati
        for (const day of days) {
          await db.delete("vacation_days", day.id, currentUser)
        }
        for (const expense of expenses) {
          await db.delete("expenses", expense.id, currentUser)
        }
        for (const note of notes) {
          await db.delete("notes", note.id, currentUser)
        }

        // Elimina la vacanza
        await db.delete("vacations", vacationId, currentUser)

        toast({
          title: "Vacanza eliminata",
          description: "La vacanza e tutti i dati associati sono stati eliminati.",
        })
      } catch (error) {
        console.error("Errore nell'eliminazione vacanza:", error)
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Impossibile eliminare la vacanza.",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [currentUser],
  )

  // Funzioni per gestire i giorni delle vacanze
  const getVacationDays = useCallback(async (vacationId: string) => {
    if (!db) return []

    try {
      const days = await db.findWhere("vacation_days", (record) => record.data.vacationId === vacationId)
      return days.map((record) => ({ ...record.data, dbId: record.id }))
    } catch (error) {
      console.error("Errore nel caricamento giorni vacanza:", error)
      return []
    }
  }, [])

  const createVacationDay = useCallback(
    async (dayData: any) => {
      if (!db) throw new Error("Database non disponibile")

      try {
        await db.insert("vacation_days", dayData, currentUser)
      } catch (error) {
        console.error("Errore nella creazione giorno:", error)
        throw error
      }
    },
    [currentUser],
  )

  const updateVacationDay = useCallback(
    async (dayId: string, dayData: any) => {
      if (!db) throw new Error("Database non disponibile")

      try {
        await db.update("vacation_days", dayId, dayData, currentUser)
      } catch (error) {
        console.error("Errore nell'aggiornamento giorno:", error)
        throw error
      }
    },
    [currentUser],
  )

  const deleteVacationDay = useCallback(
    async (dayId: string) => {
      if (!db) throw new Error("Database non disponibile")

      try {
        await db.delete("vacation_days", dayId, currentUser)
      } catch (error) {
        console.error("Errore nell'eliminazione giorno:", error)
        throw error
      }
    },
    [currentUser],
  )

  // Funzioni per gestire le spese
  const getExpenses = useCallback(async (vacationId: string) => {
    if (!db) return []

    try {
      const expenses = await db.findWhere("expenses", (record) => record.data.vacationId === vacationId)
      return expenses.map((record) => ({ ...record.data, dbId: record.id }))
    } catch (error) {
      console.error("Errore nel caricamento spese:", error)
      return []
    }
  }, [])

  const createExpense = useCallback(
    async (expenseData: any) => {
      if (!db) throw new Error("Database non disponibile")

      try {
        await db.insert("expenses", expenseData, currentUser)
      } catch (error) {
        console.error("Errore nella creazione spesa:", error)
        throw error
      }
    },
    [currentUser],
  )

  const updateExpense = useCallback(
    async (expenseId: string, expenseData: any) => {
      if (!db) throw new Error("Database non disponibile")

      try {
        await db.update("expenses", expenseId, expenseData, currentUser)
      } catch (error) {
        console.error("Errore nell'aggiornamento spesa:", error)
        throw error
      }
    },
    [currentUser],
  )

  const deleteExpense = useCallback(
    async (expenseId: string) => {
      if (!db) throw new Error("Database non disponibile")

      try {
        await db.delete("expenses", expenseId, currentUser)
      } catch (error) {
        console.error("Errore nell'eliminazione spesa:", error)
        throw error
      }
    },
    [currentUser],
  )

  // Funzioni per gestire le note
  const getNotes = useCallback(async (vacationId: string) => {
    if (!db) return []

    try {
      const notes = await db.findWhere("notes", (record) => record.data.vacationId === vacationId)
      return notes.map((record) => ({ ...record.data, dbId: record.id }))
    } catch (error) {
      console.error("Errore nel caricamento note:", error)
      return []
    }
  }, [])

  const createNote = useCallback(
    async (noteData: any) => {
      if (!db) throw new Error("Database non disponibile")

      try {
        await db.insert("notes", noteData, currentUser)
      } catch (error) {
        console.error("Errore nella creazione nota:", error)
        throw error
      }
    },
    [currentUser],
  )

  const updateNote = useCallback(
    async (noteId: string, noteData: any) => {
      if (!db) throw new Error("Database non disponibile")

      try {
        await db.update("notes", noteId, noteData, currentUser)
      } catch (error) {
        console.error("Errore nell'aggiornamento nota:", error)
        throw error
      }
    },
    [currentUser],
  )

  const deleteNote = useCallback(
    async (noteId: string) => {
      if (!db) throw new Error("Database non disponibile")

      try {
        await db.delete("notes", noteId, currentUser)
      } catch (error) {
        console.error("Errore nell'eliminazione nota:", error)
        throw error
      }
    },
    [currentUser],
  )

  // Funzioni di utilità
  const migrateFromLocalStorage = useCallback(async () => {
    if (!db) throw new Error("Database non disponibile")

    try {
      setIsLoading(true)
      await db.migrateFromLocalStorage(currentUser)
      toast({
        title: "Migrazione completata",
        description: "I dati sono stati migrati al nuovo sistema database.",
      })
    } catch (error) {
      console.error("Errore nella migrazione:", error)
      toast({
        variant: "destructive",
        title: "Errore migrazione",
        description: "Si è verificato un errore durante la migrazione dei dati.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentUser])

  const exportDatabase = useCallback(async () => {
    if (!db) throw new Error("Database non disponibile")

    try {
      return await db.exportDatabase()
    } catch (error) {
      console.error("Errore nell'esportazione:", error)
      throw error
    }
  }, [])

  const importDatabase = useCallback(
    async (importedData: any) => {
      if (!db) throw new Error("Database non disponibile")

      try {
        setIsLoading(true)
        await db.importDatabase(importedData)
        toast({
          title: "Importazione completata",
          description: "I dati sono stati importati con successo.",
        })
      } catch (error) {
        console.error("Errore nell'importazione:", error)
        toast({
          variant: "destructive",
          title: "Errore importazione",
          description: "Si è verificato un errore durante l'importazione dei dati.",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [currentUser],
  )

  return {
    /* flags */
    isLoading,
    lastSync,
    syncLog,

    /* users */
    getUsers,
    createUser,
    updateUser,
    deleteUser,

    /* vacations */
    getVacations,
    createVacation,
    updateVacation,
    deleteVacation,

    /* vacation-days */
    getVacationDays,
    createVacationDay,
    updateVacationDay,
    deleteVacationDay,

    /* expenses */
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,

    /* notes */
    getNotes,
    createNote,
    updateNote,
    deleteNote,

    /* utils */
    migrateFromLocalStorage,
    exportDatabase,
    importDatabase,
  }
}
