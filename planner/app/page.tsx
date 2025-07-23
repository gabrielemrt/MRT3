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
import { useSync } from "@/hooks/use-sync"

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
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Callback per gestire gli aggiornamenti dei dati dalla sincronizzazione
  const handleDataUpdate = useCallback(
    (syncData: any) => {
      console.log(
        `📥 Ricevuto aggiornamento da ${syncData.lastUpdatedBy} alle ${new Date(syncData.timestamp).toLocaleTimeString()}`,
      )

      setVacations(syncData.vacations)
      setLastSync(new Date(syncData.timestamp))
      setLastUpdatedBy(syncData.lastUpdatedBy)

      // Se l'utente corrente è cambiato, aggiorna anche lo stato admin
      if (currentUser) {
        const users = syncData.users
        const user = users.find((u: any) => u.username === currentUser)
        if (user) {
          setIsAdmin(user.role === "admin")
        }
      }
    },
    [currentUser],
  )

  // Hook per la sincronizzazione automatica
  const { publishUpdate, forcSync } = useSync(currentUser || "", handleDataUpdate)

  useEffect(() => {
    // Inizializza gli utenti se non esistono già
    initializeUsers()

    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      setCurrentUser(savedUser)
      checkIfAdmin(savedUser)
    }

    const savedVacations = localStorage.getItem("vacations")
    if (savedVacations) {
      setVacations(JSON.parse(savedVacations))
    } else {
      // Inizializza con una vacanza di esempio se non ce ne sono
      const exampleVacation: Vacation = {
        id: "1",
        title: "Vacanza in Sardegna",
        description: "Una settimana di relax nelle spiagge della Sardegna",
        startDate: "2023-07-15",
        endDate: "2023-07-22",
        location: "Sardegna, Italia",
        imageUrl: "/placeholder.svg?height=200&width=400",
        createdBy: "admin",
        createdAt: new Date().toISOString(),
        participants: [],
      }
      setVacations([exampleVacation])
      localStorage.setItem("vacations", JSON.stringify([exampleVacation]))
      // Pubblica l'aggiornamento iniziale
      setTimeout(() => publishUpdate(), 100)
    }

    // Pulizia automatica dei codici di sincronizzazione scaduti
    cleanupExpiredSyncCodes()

    // Listener per sincronizzazione forzata
    const handleForceSync = () => {
      console.log("🔄 Sincronizzazione forzata richiesta")
      forcSync()
    }

    window.addEventListener("force-vacation-sync", handleForceSync)

    return () => {
      window.removeEventListener("force-vacation-sync", handleForceSync)
    }
  }, [publishUpdate, forcSync])

  // Funzione per pulire i codici di sincronizzazione scaduti
  const cleanupExpiredSyncCodes = () => {
    const keys = Object.keys(localStorage)
    const now = Date.now()

    keys.forEach((key) => {
      if (key.startsWith("sync_") && key.endsWith("_expires")) {
        const expires = Number.parseInt(localStorage.getItem(key) || "0")
        if (now > expires) {
          const codeKey = key.replace("_expires", "")
          const creatorKey = key.replace("_expires", "_creator")
          localStorage.removeItem(key)
          localStorage.removeItem(codeKey)
          localStorage.removeItem(creatorKey)
        }
      }
    })
  }

  // Funzione per inizializzare gli utenti se non esistono già
  const initializeUsers = async () => {
    if (!localStorage.getItem("users")) {
      const { users: defaultUsers } = await import("@/data/users")
      localStorage.setItem("users", JSON.stringify(defaultUsers))
    }
  }

  const checkIfAdmin = (username: string) => {
    // Controlla se l'utente è admin
    const savedUsers = localStorage.getItem("users")
    if (savedUsers) {
      const users = JSON.parse(savedUsers)
      const user = users.find((u: any) => u.username === username)
      setIsAdmin(user?.role === "admin")
    } else {
      import("@/data/users").then(({ users }) => {
        const user = users.find((u) => u.username === username)
        setIsAdmin(user?.role === "admin")
      })
    }
  }

  const handleLogin = (username: string) => {
    setCurrentUser(username)
    localStorage.setItem("currentUser", username)
    checkIfAdmin(username)

    // Forza una sincronizzazione al login
    setTimeout(() => forcSync(), 500)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem("currentUser")
    setCurrentView("main")
    setCurrentVacation(null)
  }

  const handleCreateVacation = (newVacation: Vacation) => {
    const updatedVacations = [...vacations, newVacation]
    setVacations(updatedVacations)
    localStorage.setItem("vacations", JSON.stringify(updatedVacations))
    setCurrentView("main")

    // Pubblica l'aggiornamento
    setTimeout(() => publishUpdate(), 100)
  }

  const handleDeleteVacation = (vacationId: string) => {
    if (confirm("Sei sicuro di voler eliminare questa vacanza? Tutti i dati associati saranno persi.")) {
      const updatedVacations = vacations.filter((v) => v.id !== vacationId)
      setVacations(updatedVacations)
      localStorage.setItem("vacations", JSON.stringify(updatedVacations))

      // Rimuovi anche i dati associati a questa vacanza
      localStorage.removeItem(`vacationDays_${vacationId}`)
      localStorage.removeItem(`expenses_${vacationId}`)
      localStorage.removeItem(`vacationNotes_${vacationId}`)

      setCurrentView("main")
      setCurrentVacation(null)

      // Pubblica l'aggiornamento
      setTimeout(() => publishUpdate(), 100)
    }
  }

  const handleSelectVacation = (vacation: Vacation) => {
    setCurrentVacation(vacation)
    setCurrentView("vacation")
  }

  const handleNavigate = (view: View) => {
    setCurrentView(view)
  }

  const handleExportData = () => {
    // Raccogliamo tutti i dati da esportare
    const exportData: any = {
      vacations: vacations,
      users: JSON.parse(localStorage.getItem("users") || "[]"),
      exportedBy: currentUser,
      exportedAt: new Date().toISOString(),
      version: "2.0",
    }

    // Per ogni vacanza, aggiungiamo i dati correlati
    vacations.forEach((vacation) => {
      const vacationId = vacation.id
      const days = localStorage.getItem(`vacationDays_${vacationId}`)
      const expenses = localStorage.getItem(`expenses_${vacationId}`)
      const notes = localStorage.getItem(`vacationNotes_${vacationId}`)

      exportData[`vacationDays_${vacationId}`] = days ? JSON.parse(days) : []
      exportData[`expenses_${vacationId}`] = expenses ? JSON.parse(expenses) : []
      exportData[`vacationNotes_${vacationId}`] = notes ? JSON.parse(notes) : []
    })

    // Creiamo un file JSON da scaricare
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `vacation-planner-export-${new Date().toISOString().slice(0, 10)}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast({
      title: "Esportazione completata",
      description: "I dati sono stati esportati con successo.",
    })
  }

  const handleImportData = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)

        // Verifichiamo che il file contenga i dati necessari
        if (!importedData.vacations) {
          throw new Error("Il file non contiene dati validi")
        }

        // Mostra informazioni sull'importazione
        const confirmMessage = `
Stai per importare dati da: ${importedData.exportedBy || "Utente sconosciuto"}
Esportati il: ${importedData.exportedAt ? new Date(importedData.exportedAt).toLocaleString() : "Data sconosciuta"}
Vacanze: ${importedData.vacations?.length || 0}
Utenti: ${importedData.users?.length || 0}

Questa operazione sovrascriverà tutti i dati attuali. Continuare?`

        if (!confirm(confirmMessage)) {
          return
        }

        // Importiamo i dati
        localStorage.setItem("vacations", JSON.stringify(importedData.vacations))
        if (importedData.users) {
          localStorage.setItem("users", JSON.stringify(importedData.users))
        }

        // Importiamo i dati correlati per ogni vacanza
        importedData.vacations.forEach((vacation: Vacation) => {
          const vacationId = vacation.id
          if (importedData[`vacationDays_${vacationId}`]) {
            localStorage.setItem(
              `vacationDays_${vacationId}`,
              JSON.stringify(importedData[`vacationDays_${vacationId}`]),
            )
          }
          if (importedData[`expenses_${vacationId}`]) {
            localStorage.setItem(`expenses_${vacationId}`, JSON.stringify(importedData[`expenses_${vacationId}`]))
          }
          if (importedData[`vacationNotes_${vacationId}`]) {
            localStorage.setItem(
              `vacationNotes_${vacationId}`,
              JSON.stringify(importedData[`vacationNotes_${vacationId}`]),
            )
          }
        })

        // Aggiorniamo lo stato
        setVacations(importedData.vacations)

        // Pubblica l'aggiornamento
        setTimeout(() => publishUpdate(), 100)

        toast({
          title: "Importazione completata",
          description: `Dati importati con successo da ${importedData.exportedBy || "file di backup"}.`,
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
          lastSync={lastSync}
          lastUpdatedBy={lastUpdatedBy}
          onPublishUpdate={publishUpdate}
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
        <UserManager currentUser={currentUser} onBack={() => setCurrentView("main")} onPublishUpdate={publishUpdate} />
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
          onPublishUpdate={publishUpdate}
        />
      )}

      {currentView === "expenses" && currentVacation && (
        <ExpenseManager
          currentUser={currentUser}
          vacationId={currentVacation.id}
          onBack={() => setCurrentView("vacation")}
          onPublishUpdate={publishUpdate}
        />
      )}

      {currentView === "notes" && currentVacation && (
        <NotesManager
          currentUser={currentUser}
          vacationId={currentVacation.id}
          onBack={() => setCurrentView("vacation")}
          onPublishUpdate={publishUpdate}
        />
      )}

      {currentView === "user-profile" && (
        <UserProfile currentUser={currentUser} onBack={() => setCurrentView("main")} onPublishUpdate={publishUpdate} />
      )}

      {currentView === "sync-manager" && (
        <SyncManager currentUser={currentUser} onBack={() => setCurrentView("main")} />
      )}

      {/* Input file nascosto per l'importazione */}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" style={{ display: "none" }} />

      <Toaster />
    </div>
  )
}
