"use client"

import { useState, useEffect, useCallback } from "react"
import { db } from "@/lib/database"

export function useDatabase(userId: string) {
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncLog, setSyncLog] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Carica il log di sincronizzazione
  const loadSyncLog = useCallback(async () => {
    if (!db) return

    try {
      const log = await db.getSyncLog()
      setSyncLog(log)
      if (log.length > 0) {
        setLastSync(new Date(log[0].createdAt))
      }
    } catch (error) {
      console.error("Errore nel caricamento sync log:", error)
    }
  }, [])

  // Setup listener per cambiamenti del database
  useEffect(() => {
    if (!db) return

    const unsubscribe = db.onDatabaseChange(() => {
      loadSyncLog()
    })

    loadSyncLog()

    return unsubscribe
  }, [loadSyncLog])

  // Metodi per gli utenti
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
    async (user: any) => {
      if (!db) throw new Error("Database non disponibile")
      return await db.insert("users", user, userId)
    },
    [userId],
  )

  const updateUser = useCallback(
    async (username: string, userData: any) => {
      if (!db) throw new Error("Database non disponibile")

      const users = await db.findAll("users")
      const userRecord = users.find((record) => record.data.username === username)

      if (userRecord) {
        return await db.update("users", userRecord.id, userData, userId)
      }
      return false
    },
    [userId],
  )

  const deleteUser = useCallback(
    async (username: string) => {
      if (!db) throw new Error("Database non disponibile")

      const users = await db.findAll("users")
      const userRecord = users.find((record) => record.data.username === username)

      if (userRecord) {
        return await db.delete("users", userRecord.id, userId)
      }
      return false
    },
    [userId],
  )

  // Metodi per le vacanze
  const getVacations = useCallback(async () => {
    if (!db) return []

    try {
      const vacations = await db.findAll("vacations")
      return vacations.map((record) => ({
        ...record.data,
        dbId: record.id,
      }))
    } catch (error) {
      console.error("Errore nel caricamento vacanze:", error)
      return []
    }
  }, [])

  const getVacationById = useCallback(async (vacationId: string) => {
    if (!db) return null

    try {
      const vacations = await db.findAll("vacations")
      const vacation = vacations.find((record) => record.data.id === vacationId)
      return vacation ? { ...vacation.data, dbId: vacation.id } : null
    } catch (error) {
      console.error("Errore nel caricamento vacanza:", error)
      return null
    }
  }, [])

  const createVacation = useCallback(
    async (vacation: any) => {
      if (!db) throw new Error("Database non disponibile")
      return await db.insert("vacations", vacation, userId)
    },
    [userId],
  )

  const deleteVacation = useCallback(
    async (dbId: string) => {
      if (!db) throw new Error("Database non disponibile")
      return await db.delete("vacations", dbId, userId)
    },
    [userId],
  )

  // Metodi per i giorni delle vacanze
  const getVacationDays = useCallback(async (vacationId: string) => {
    if (!db) return []

    try {
      const days = await db.findWhere("vacation_days", (record) => record.data.vacationId === vacationId)
      return days.map((record) => record.data)
    } catch (error) {
      console.error("Errore nel caricamento giorni:", error)
      return []
    }
  }, [])

  const createVacationDay = useCallback(
    async (vacationId: string, day: any) => {
      if (!db) throw new Error("Database non disponibile")
      return await db.insert("vacation_days", { ...day, vacationId }, userId)
    },
    [userId],
  )

  const updateVacationDay = useCallback(
    async (vacationId: string, dayId: string, dayData: any) => {
      if (!db) throw new Error("Database non disponibile")

      const days = await db.findWhere(
        "vacation_days",
        (record) => record.data.vacationId === vacationId && record.data.id === dayId,
      )

      if (days.length > 0) {
        return await db.update("vacation_days", days[0].id, dayData, userId)
      }
      return false
    },
    [userId],
  )

  const deleteVacationDay = useCallback(
    async (vacationId: string, dayId: string) => {
      if (!db) throw new Error("Database non disponibile")

      const days = await db.findWhere(
        "vacation_days",
        (record) => record.data.vacationId === vacationId && record.data.id === dayId,
      )

      if (days.length > 0) {
        return await db.delete("vacation_days", days[0].id, userId)
      }
      return false
    },
    [userId],
  )

  // Metodi per le attività
  const addActivityToDay = useCallback(
    async (vacationId: string, dayId: string, activity: any) => {
      if (!db) throw new Error("Database non disponibile")

      const days = await db.findWhere(
        "vacation_days",
        (record) => record.data.vacationId === vacationId && record.data.id === dayId,
      )

      if (days.length > 0) {
        const day = days[0].data
        const updatedActivities = [...(day.activities || []), activity]
        return await db.update("vacation_days", days[0].id, { ...day, activities: updatedActivities }, userId)
      }
      return false
    },
    [userId],
  )

  const updateActivity = useCallback(
    async (vacationId: string, dayId: string, activityId: string, activityData: any) => {
      if (!db) throw new Error("Database non disponibile")

      const days = await db.findWhere(
        "vacation_days",
        (record) => record.data.vacationId === vacationId && record.data.id === dayId,
      )

      if (days.length > 0) {
        const day = days[0].data
        const updatedActivities = day.activities.map((activity: any) =>
          activity.id === activityId ? { ...activity, ...activityData } : activity,
        )
        return await db.update("vacation_days", days[0].id, { ...day, activities: updatedActivities }, userId)
      }
      return false
    },
    [userId],
  )

  const deleteActivity = useCallback(
    async (vacationId: string, dayId: string, activityId: string) => {
      if (!db) throw new Error("Database non disponibile")

      const days = await db.findWhere(
        "vacation_days",
        (record) => record.data.vacationId === vacationId && record.data.id === dayId,
      )

      if (days.length > 0) {
        const day = days[0].data
        const updatedActivities = day.activities.filter((activity: any) => activity.id !== activityId)
        return await db.update("vacation_days", days[0].id, { ...day, activities: updatedActivities }, userId)
      }
      return false
    },
    [userId],
  )

  // Metodi per le spese
  const getExpenses = useCallback(async (vacationId: string) => {
    if (!db) return []

    try {
      const expenses = await db.findWhere("expenses", (record) => record.data.vacationId === vacationId)
      return expenses.map((record) => record.data)
    } catch (error) {
      console.error("Errore nel caricamento spese:", error)
      return []
    }
  }, [])

  const createExpense = useCallback(
    async (vacationId: string, expense: any) => {
      if (!db) throw new Error("Database non disponibile")
      return await db.insert("expenses", { ...expense, vacationId }, userId)
    },
    [userId],
  )

  const updateExpense = useCallback(
    async (vacationId: string, expenseId: string, expenseData: any) => {
      if (!db) throw new Error("Database non disponibile")

      const expenses = await db.findWhere(
        "expenses",
        (record) => record.data.vacationId === vacationId && record.data.id === expenseId,
      )

      if (expenses.length > 0) {
        return await db.update("expenses", expenses[0].id, expenseData, userId)
      }
      return false
    },
    [userId],
  )

  const deleteExpense = useCallback(
    async (vacationId: string, expenseId: string) => {
      if (!db) throw new Error("Database non disponibile")

      const expenses = await db.findWhere(
        "expenses",
        (record) => record.data.vacationId === vacationId && record.data.id === expenseId,
      )

      if (expenses.length > 0) {
        return await db.delete("expenses", expenses[0].id, userId)
      }
      return false
    },
    [userId],
  )

  // Metodi per le note
  const getNotes = useCallback(async (vacationId: string) => {
    if (!db) return []

    try {
      const notes = await db.findWhere("notes", (record) => record.data.vacationId === vacationId)
      return notes.map((record) => record.data)
    } catch (error) {
      console.error("Errore nel caricamento note:", error)
      return []
    }
  }, [])

  const createNote = useCallback(
    async (vacationId: string, note: any) => {
      if (!db) throw new Error("Database non disponibile")
      return await db.insert("notes", { ...note, vacationId }, userId)
    },
    [userId],
  )

  const updateNote = useCallback(
    async (vacationId: string, noteId: string, noteData: any) => {
      if (!db) throw new Error("Database non disponibile")

      const notes = await db.findWhere(
        "notes",
        (record) => record.data.vacationId === vacationId && record.data.id === noteId,
      )

      if (notes.length > 0) {
        return await db.update("notes", notes[0].id, noteData, userId)
      }
      return false
    },
    [userId],
  )

  const deleteNote = useCallback(
    async (vacationId: string, noteId: string) => {
      if (!db) throw new Error("Database non disponibile")

      const notes = await db.findWhere(
        "notes",
        (record) => record.data.vacationId === vacationId && record.data.id === noteId,
      )

      if (notes.length > 0) {
        return await db.delete("notes", notes[0].id, userId)
      }
      return false
    },
    [userId],
  )

  // Metodi per migrazione e gestione database
  const migrateFromLocalStorage = useCallback(async () => {
    if (!db) throw new Error("Database non disponibile")
    return await db.migrateFromLocalStorage(userId)
  }, [userId])

  const exportDatabase = useCallback(async () => {
    if (!db) throw new Error("Database non disponibile")
    return await db.exportDatabase()
  }, [])

  const importDatabase = useCallback(
    async (data: any) => {
      if (!db) throw new Error("Database non disponibile")
      return await db.importDatabase(data, userId)
    },
    [userId],
  )

  return {
    // Stato
    lastSync,
    syncLog,
    isLoading,

    // Metodi utenti
    getUsers,
    createUser,
    updateUser,
    deleteUser,

    // Metodi vacanze
    getVacations,
    getVacationById,
    createVacation,
    deleteVacation,

    // Metodi giorni vacanze
    getVacationDays,
    createVacationDay,
    updateVacationDay,
    deleteVacationDay,

    // Metodi attività
    addActivityToDay,
    updateActivity,
    deleteActivity,

    // Metodi spese
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,

    // Metodi note
    getNotes,
    createNote,
    updateNote,
    deleteNote,

    // Metodi database
    migrateFromLocalStorage,
    exportDatabase,
    importDatabase,
  }
}
