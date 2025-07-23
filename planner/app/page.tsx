"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { LoginForm } from "@/components/login-form"
import { MainDashboard } from "@/components/main-dashboard"
import { VacationDashboard } from "@/components/vacation-dashboard"
import { VacationPlanner } from "@/components/vacation-planner"
import { ExpenseManager } from "@/components/expense-manager"
import { NotesManager } from "@/components/notes-manager"
import { VacationCreator } from "@/components/vacation-creator"
import { UserManager } from "@/components/user-manager"
import { UserProfile } from "@/components/user-profile"
import { SyncManager } from "@/components/sync-manager"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useDatabase } from "@/hooks/use-database"
import { VacationParticipantsManager } from "@/components/vacation-participants-manager"

export type View =
  | "main"
  | "vacation"
  | "planner"
  | "expenses"
  | "notes"
  | "create-vacation"
  | "manage-users"
  | "user-profile"
  | "sync-manager"
  | "manage-participants"

export interface Vacation {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  imageUrl?: string
  createdBy: string
  createdAt: string
  participants: VacationParticipant[]
  dbId?: string
}

export interface VacationParticipant {
  username: string
  role: "admin" | "member"
  joinedAt: string
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<View>("main")
  const [vacations, setVacations] = useState<Vacation[]>([])
  const [currentVacation, setCurrentVacation] = useState<Vacation | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isLoadingRef = useRef(false)

  // Hook del database
  const database = useDatabase(currentUser || "system")

  // Effetto per gestire il mounting del componente
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Funzione per caricare i dati dal database (ottimizzata)
  const loadData = useCallback(async () => {
    if (!currentUser || isLoadingRef.current || !isMounted) return

    try {
      isLoadingRef.current = true

      // Carica vacanze
      const dbVacations = await database.getVacations()
      setVacations(dbVacations)

      // Carica utenti per verificare se l'utente corrente è admin
      const users = await database.getUsers()
      const user = users.find((u: any) => u.username === currentUser)
      setIsAdmin(user?.role === "admin")
    } catch (error) {
      console.error("Errore nel caricamento dati:", error)
    } finally {
      isLoadingRef.current = false
    }
  }, [currentUser, database, isMounted])

  // Effetto per inizializzare l'app (ottimizzato)
  useEffect(() => {
    if (!isMounted) return

    let isEffectActive = true

    const initializeApp = async () => {
      if (!isEffectActive) return

      try {
        // Controlla se ci sono dati da migrare
        const hasOldData =
          typeof window !== "undefined" && (localStorage.getItem("vacations") || localStorage.getItem("users"))

        if (hasOldData) {
          try {
            await database.migrateFromLocalStorage()
          } catch (error) {
            console.error("Errore durante la migrazione:", error)
          }
        }

        // Inizializza utenti di default se il database è vuoto
        const users = await database.getUsers()
        if (users.length === 0) {
          const { users: defaultUsers } = await import("@/data/users")
          for (const user of defaultUsers) {
            await database.createUser(user)
          }
        }

        // Controlla se c'è un utente salvato
        const savedUser = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null
        if (savedUser && isEffectActive) {
          setCurrentUser(savedUser)
        }

        if (isEffectActive) {
          setIsInitialized(true)
        }
      } catch (error) {
        console.error("Errore nell'inizializzazione:", error)
        if (isEffectActive) {
          setIsInitialized(true)
        }
      }
    }

    initializeApp()

    return () => {
      isEffectActive = false
    }
  }, [database, isMounted])

  // Effetto per caricare i dati quando l'utente cambia (ottimizzato)
  useEffect(() => {
    if (currentUser && isInitialized && isMounted) {
      loadData()
    }
  }, [currentUser, isInitialized, isMounted, loadData])

  const handleLogin = async (username: string) => {
    setCurrentUser(username)
    if (typeof window !== "undefined") {
      localStorage.setItem("currentUser", username)
    }

    // Carica i dati dell'utente
    const users = await database.getUsers()
    const user = users.find((u: any) => u.username === username)
    setIsAdmin(user?.role === "admin")
  }

  const handleLogout = () => {
    setCurrentUser(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser")
    }
    setCurrentView("main")
    setCurrentVacation(null)
    setVacations([])
  }

  const handleCreateVacation = async (newVacation: Vacation) => {
    try {
      await database.createVacation(newVacation)
      await loadData() // Ricarica i dati
      setCurrentView("main")
    } catch (error) {
      console.error("Errore nella creazione vacanza:", error)
    }
  }

  const handleDeleteVacation = async (vacationId: string) => {
    if (confirm("Sei sicuro di voler eliminare questa vacanza? Tutti i dati associati saranno persi.")) {
      try {
        // Trova la vacanza nel database usando l'id della vacanza
        const vacation = vacations.find((v) => v.id === vacationId)
        if (vacation?.dbId) {
          await database.deleteVacation(vacation.dbId)
          await loadData() // Ricarica i dati
          setCurrentView("main")
          setCurrentVacation(null)
        } else {
          // Se non ha dbId, prova a eliminare direttamente
          const allVacations = await database.getVacations()
          const vacationToDelete = allVacations.find((v: any) => v.id === vacationId)
          if (vacationToDelete?.dbId) {
            await database.deleteVacation(vacationToDelete.dbId)
            await loadData()
            setCurrentView("main")
            setCurrentVacation(null)
          }
        }
      } catch (error) {
        console.error("Errore nell'eliminazione vacanza:", error)
        alert("Errore nell'eliminazione della vacanza")
      }
    }
  }

  const handleSelectVacation = (vacation: Vacation) => {
    setCurrentVacation(vacation)
    setCurrentView("vacation")
  }

  const handleNavigate = (view: View) => {
    setCurrentView(view)
  }

  const handleExportData = async () => {
    try {
      const exportData = await database.exportDatabase()

      // Creiamo un file JSON da scaricare
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

      const exportFileDefaultName = `vacation-planner-db-export-${new Date().toISOString().slice(0, 10)}.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()

      toast({
        title: "Esportazione completata",
        description: "Il database è stato esportato con successo.",
      })
    } catch (error) {
      console.error("Errore nell'esportazione:", error)
      toast({
        variant: "destructive",
        title: "Errore esportazione",
        description: "Si è verificato un errore durante l'esportazione.",
      })
    }
  }

  const handleImportData = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)

        // Verifichiamo che il file contenga i dati necessari
        if (!importedData.users && !importedData.vacations) {
          throw new Error("Il file non contiene dati validi")
        }

        // Mostra informazioni sull'importazione
        const confirmMessage = `
Stai per importare un database completo.
Versione: ${importedData.version || "Sconosciuta"}
Esportato il: ${importedData.exportedAt ? new Date(importedData.exportedAt).toLocaleString() : "Data sconosciuta"}
Utenti: ${importedData.users?.length || 0}
Vacanze: ${importedData.vacations?.length || 0}

Questa operazione sovrascriverà tutti i dati attuali. Continuare?`

        if (!confirm(confirmMessage)) {
          return
        }

        await database.importDatabase(importedData)
        await loadData() // Ricarica i dati

        toast({
          title: "Importazione completata",
          description: "Il database è stato importato con successo.",
        })
      } catch (error) {
        console.error("Errore durante l'importazione:", error)
        toast({
          variant: "destructive",
          title: "Errore durante l'importazione",
          description: "Il file selezionato non contiene dati validi.",
        })
      }
    }
    reader.readAsText(file)

    // Reset the file input
    if (event.target) {
      event.target.value = ""
    }
  }

  // Mostra loading se non inizializzato o non montato
  if (!isInitialized || !isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Inizializzazione Database</h2>
          <p className="text-gray-600">Configurazione del sistema in corso...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-background">
      {currentView === "main" && (
        <MainDashboard
          currentUser={currentUser}
          isAdmin={isAdmin}
          vacations={vacations}
          onSelectVacation={handleSelectVacation}
          onCreateVacation={() => setCurrentView("create-vacation")}
          onManageUsers={() => setCurrentView("manage-users")}
          onExportData={handleExportData}
          onImportData={handleImportData}
          onLogout={handleLogout}
          onUserProfile={() => setCurrentView("user-profile")}
          onSyncManager={() => setCurrentView("sync-manager")}
          lastSync={database.lastSync}
          lastUpdatedBy={database.syncLog[0]?.createdBy || ""}
          onPublishUpdate={loadData}
        />
      )}

      {currentView === "create-vacation" && (
        <VacationCreator
          currentUser={currentUser}
          onBack={() => setCurrentView("main")}
          onCreateVacation={handleCreateVacation}
        />
      )}

      {currentView === "manage-users" && (
        <UserManager
          currentUser={currentUser}
          onBack={() => setCurrentView("main")}
          onPublishUpdate={loadData}
          database={database}
        />
      )}

      {currentView === "vacation" && currentVacation && (
        <VacationDashboard
          currentUser={currentUser}
          vacation={currentVacation}
          onNavigate={handleNavigate}
          onBack={() => setCurrentView("main")}
          onDeleteVacation={isAdmin ? handleDeleteVacation : undefined}
        />
      )}

      {currentView === "planner" && currentVacation && (
        <VacationPlanner
          currentUser={currentUser}
          vacationId={currentVacation.id}
          onBack={() => setCurrentView("vacation")}
          onPublishUpdate={loadData}
          database={database}
        />
      )}

      {currentView === "expenses" && currentVacation && (
        <ExpenseManager
          currentUser={currentUser}
          vacationId={currentVacation.id}
          onBack={() => setCurrentView("vacation")}
          onPublishUpdate={loadData}
          database={database}
        />
      )}

      {currentView === "notes" && currentVacation && (
        <NotesManager
          currentUser={currentUser}
          vacationId={currentVacation.id}
          onBack={() => setCurrentView("vacation")}
          onPublishUpdate={loadData}
          database={database}
        />
      )}

      {currentView === "manage-participants" && currentVacation && (
        <VacationParticipantsManager
          currentUser={currentUser}
          vacation={currentVacation}
          onBack={() => setCurrentView("vacation")}
          onVacationUpdate={(updatedVacation) => {
            setCurrentVacation(updatedVacation)
            loadData() // Ricarica tutti i dati
          }}
        />
      )}

      {currentView === "user-profile" && (
        <UserProfile
          currentUser={currentUser}
          onBack={() => setCurrentView("main")}
          onPublishUpdate={loadData}
          database={database}
        />
      )}

      {currentView === "sync-manager" && (
        <SyncManager currentUser={currentUser} onBack={() => setCurrentView("main")} database={database} />
      )}

      {/* Input file nascosto per l'importazione */}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" style={{ display: "none" }} />

      <Toaster />
    </div>
  )
}
