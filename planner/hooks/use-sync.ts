"use client"

import { useEffect, useCallback, useRef } from "react"
import { toast } from "@/components/ui/use-toast"

interface SyncData {
  vacations: any[]
  users: any[]
  timestamp: number
  lastUpdatedBy: string
  syncId: string
  [key: string]: any
}

export function useSync(currentUser: string, onDataUpdate: (data: SyncData) => void) {
  const lastSyncTimestamp = useRef<number>(0)
  const syncInterval = useRef<NodeJS.Timeout | null>(null)
  const isUpdating = useRef<boolean>(false)
  const lastSyncId = useRef<string>("")

  // Funzione per generare un ID univoco per ogni sincronizzazione
  const generateSyncId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
  }, [])

  // Funzione per ottenere tutti i dati correnti
  const getCurrentData = useCallback((): SyncData => {
    const vacations = JSON.parse(localStorage.getItem("vacations") || "[]")
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    const data: SyncData = {
      vacations,
      users,
      timestamp: Date.now(),
      lastUpdatedBy: currentUser,
      syncId: generateSyncId(),
    }

    // Aggiungi i dati delle vacanze
    vacations.forEach((vacation: any) => {
      const vacationId = vacation.id
      const days = localStorage.getItem(`vacationDays_${vacationId}`)
      const expenses = localStorage.getItem(`expenses_${vacationId}`)
      const notes = localStorage.getItem(`vacationNotes_${vacationId}`)

      if (days) data[`vacationDays_${vacationId}`] = JSON.parse(days)
      if (expenses) data[`expenses_${vacationId}`] = JSON.parse(expenses)
      if (notes) data[`vacationNotes_${vacationId}`] = JSON.parse(notes)
    })

    return data
  }, [currentUser, generateSyncId])

  // Funzione per salvare i dati nel sistema di sincronizzazione globale
  const saveSyncData = useCallback((data: SyncData) => {
    if (isUpdating.current) return

    try {
      // Salva nei dati di sincronizzazione globale con timestamp
      const globalSyncKey = "global_vacation_sync"
      const syncHistory = JSON.parse(localStorage.getItem(`${globalSyncKey}_history`) || "[]")

      // Mantieni solo gli ultimi 10 sync per evitare di riempire il localStorage
      const updatedHistory = [data, ...syncHistory.slice(0, 9)]

      localStorage.setItem(globalSyncKey, JSON.stringify(data))
      localStorage.setItem(`${globalSyncKey}_history`, JSON.stringify(updatedHistory))
      localStorage.setItem(`${globalSyncKey}_timestamp`, data.timestamp.toString())

      lastSyncTimestamp.current = data.timestamp
      lastSyncId.current = data.syncId

      // Trigger evento personalizzato per notificare altri tab/finestre
      window.dispatchEvent(
        new CustomEvent("vacation-sync-update", {
          detail: {
            timestamp: data.timestamp,
            syncId: data.syncId,
            updatedBy: data.lastUpdatedBy,
          },
        }),
      )
    } catch (error) {
      console.error("Errore durante il salvataggio dei dati di sync:", error)
    }
  }, [])

  // Funzione per applicare i dati sincronizzati
  const applySyncData = useCallback(
    (data: SyncData) => {
      if (isUpdating.current || data.syncId === lastSyncId.current) return

      isUpdating.current = true

      try {
        // Applica i dati principali
        localStorage.setItem("vacations", JSON.stringify(data.vacations))
        localStorage.setItem("users", JSON.stringify(data.users))

        // Applica i dati delle vacanze
        data.vacations.forEach((vacation: any) => {
          const vacationId = vacation.id
          if (data[`vacationDays_${vacationId}`]) {
            localStorage.setItem(`vacationDays_${vacationId}`, JSON.stringify(data[`vacationDays_${vacationId}`]))
          }
          if (data[`expenses_${vacationId}`]) {
            localStorage.setItem(`expenses_${vacationId}`, JSON.stringify(data[`expenses_${vacationId}`]))
          }
          if (data[`vacationNotes_${vacationId}`]) {
            localStorage.setItem(`vacationNotes_${vacationId}`, JSON.stringify(data[`vacationNotes_${vacationId}`]))
          }
        })

        lastSyncTimestamp.current = data.timestamp
        lastSyncId.current = data.syncId
        onDataUpdate(data)

        // Mostra notifica solo se l'aggiornamento non è stato fatto dall'utente corrente
        if (data.lastUpdatedBy !== currentUser) {
          toast({
            title: "Dati aggiornati",
            description: `Sincronizzazione da ${data.lastUpdatedBy} - ${new Date(data.timestamp).toLocaleTimeString()}`,
            duration: 4000,
          })
        }
      } finally {
        isUpdating.current = false
      }
    },
    [currentUser, onDataUpdate],
  )

  // Funzione per controllare gli aggiornamenti dal sistema globale
  const checkForUpdates = useCallback(() => {
    if (isUpdating.current) return

    try {
      const globalSyncKey = "global_vacation_sync"
      const savedTimestamp = localStorage.getItem(`${globalSyncKey}_timestamp`)
      const savedData = localStorage.getItem(globalSyncKey)

      if (savedTimestamp && savedData) {
        const timestamp = Number.parseInt(savedTimestamp)

        // Se ci sono dati più recenti, applicali
        if (timestamp > lastSyncTimestamp.current) {
          const data: SyncData = JSON.parse(savedData)

          // Verifica che non sia lo stesso sync ID per evitare loop
          if (data.syncId !== lastSyncId.current) {
            applySyncData(data)
          }
        }
      }
    } catch (error) {
      console.error("Errore durante il controllo degli aggiornamenti:", error)
    }
  }, [applySyncData])

  // Funzione per pubblicare gli aggiornamenti
  const publishUpdate = useCallback(() => {
    if (isUpdating.current) return

    try {
      const currentData = getCurrentData()
      saveSyncData(currentData)

      // Notifica immediata per debug
      console.log(`📤 Pubblicato aggiornamento da ${currentUser} alle ${new Date().toLocaleTimeString()}`)
    } catch (error) {
      console.error("Errore durante la pubblicazione:", error)
    }
  }, [getCurrentData, saveSyncData, currentUser])

  // Funzione per forzare la sincronizzazione
  const forcSync = useCallback(() => {
    console.log("🔄 Forzando sincronizzazione...")
    checkForUpdates()
  }, [checkForUpdates])

  // Inizializza la sincronizzazione
  useEffect(() => {
    // Controlla immediatamente se ci sono aggiornamenti
    checkForUpdates()

    // Imposta il polling per controllare gli aggiornamenti ogni 3 secondi
    syncInterval.current = setInterval(() => {
      checkForUpdates()
    }, 3000)

    // Listener per gli eventi di storage (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "global_vacation_sync_timestamp" && e.newValue) {
        setTimeout(() => checkForUpdates(), 100)
      }
    }

    // Listener per eventi personalizzati
    const handleCustomSync = (e: CustomEvent) => {
      if (e.detail.updatedBy !== currentUser) {
        setTimeout(() => checkForUpdates(), 100)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("vacation-sync-update", handleCustomSync as EventListener)

    // Cleanup
    return () => {
      if (syncInterval.current) {
        clearInterval(syncInterval.current)
      }
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("vacation-sync-update", handleCustomSync as EventListener)
    }
  }, [checkForUpdates, currentUser])

  // Inizializza il timestamp se non esiste
  useEffect(() => {
    const globalSyncKey = "global_vacation_sync"
    const savedTimestamp = localStorage.getItem(`${globalSyncKey}_timestamp`)

    if (!savedTimestamp) {
      const currentData = getCurrentData()
      saveSyncData(currentData)
      console.log("🚀 Inizializzato sistema di sincronizzazione")
    } else {
      lastSyncTimestamp.current = Number.parseInt(savedTimestamp)
      const savedSyncId = JSON.parse(localStorage.getItem(globalSyncKey) || "{}")?.syncId
      if (savedSyncId) {
        lastSyncId.current = savedSyncId
      }
    }
  }, [getCurrentData, saveSyncData])

  return {
    publishUpdate,
    checkForUpdates,
    forcSync,
  }
}
