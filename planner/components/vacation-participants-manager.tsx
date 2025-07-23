"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeft,
  Users,
  Crown,
  User,
  Plus,
  Trash2,
  Save,
  Search,
  UserPlus,
  Shield,
  AlertTriangle,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import type { Vacation, VacationParticipant } from "@/app/page"
import type { User as UserType } from "@/data/users"
import { useDatabase } from "@/hooks/use-database"
import { useVacationPermissions } from "@/hooks/use-vacation-permissions"

interface VacationParticipantsManagerProps {
  currentUser: string
  vacation: Vacation
  onBack: () => void
  onVacationUpdate: (updatedVacation: Vacation) => void
}

export function VacationParticipantsManager({
  currentUser,
  vacation,
  onBack,
  onVacationUpdate,
}: VacationParticipantsManagerProps) {
  const [participants, setParticipants] = useState<VacationParticipant[]>(vacation.participants || [])
  const [availableUsers, setAvailableUsers] = useState<UserType[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const database = useDatabase(currentUser)
  const permissions = useVacationPermissions(vacation, currentUser)

  useEffect(() => {
    loadAvailableUsers()
  }, [])

  useEffect(() => {
    // Controlla se ci sono stati cambiamenti
    const originalParticipants = vacation.participants || []
    const hasChanged = JSON.stringify(participants) !== JSON.stringify(originalParticipants)
    setHasChanges(hasChanged)
  }, [participants, vacation.participants])

  const loadAvailableUsers = async () => {
    try {
      const users = await database.getUsers()
      setAvailableUsers(users)
    } catch (error) {
      console.error("Errore nel caricamento utenti:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile caricare la lista utenti.",
      })
    }
  }

  const addParticipant = (username: string) => {
    if (participants.some((p) => p.username === username)) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "L'utente è già un partecipante.",
      })
      return
    }

    const newParticipant: VacationParticipant = {
      username,
      role: "member",
      joinedAt: new Date().toISOString(),
    }

    setParticipants([...participants, newParticipant])
    toast({
      title: "Partecipante aggiunto",
      description: `${username} è stato aggiunto alla vacanza.`,
    })
  }

  const removeParticipant = (username: string) => {
    // Non permettere di rimuovere il creatore della vacanza
    if (username === vacation.createdBy) {
      toast({
        variant: "destructive",
        title: "Operazione non consentita",
        description: "Non puoi rimuovere il creatore della vacanza.",
      })
      return
    }

    // Non permettere di rimuovere se stesso se è l'ultimo admin
    const adminCount = participants.filter((p) => p.role === "admin").length
    const isRemovingSelf = username === currentUser
    const isCurrentUserAdmin = participants.find((p) => p.username === currentUser)?.role === "admin"

    if (isRemovingSelf && isCurrentUserAdmin && adminCount === 1) {
      toast({
        variant: "destructive",
        title: "Operazione non consentita",
        description: "Non puoi rimuoverti se sei l'ultimo amministratore.",
      })
      return
    }

    if (confirm(`Sei sicuro di voler rimuovere ${username} dalla vacanza?`)) {
      setParticipants(participants.filter((p) => p.username !== username))
      toast({
        title: "Partecipante rimosso",
        description: `${username} è stato rimosso dalla vacanza.`,
      })
    }
  }

  const toggleParticipantRole = (username: string) => {
    // Non permettere di cambiare il ruolo del creatore
    if (username === vacation.createdBy) {
      toast({
        variant: "destructive",
        title: "Operazione non consentita",
        description: "Non puoi modificare il ruolo del creatore della vacanza.",
      })
      return
    }

    const participant = participants.find((p) => p.username === username)
    if (!participant) return

    const newRole = participant.role === "admin" ? "member" : "admin"

    // Se sta rimuovendo i privilegi admin da se stesso, controlla che non sia l'ultimo admin
    if (username === currentUser && newRole === "member") {
      const adminCount = participants.filter((p) => p.role === "admin").length
      if (adminCount === 1) {
        toast({
          variant: "destructive",
          title: "Operazione non consentita",
          description: "Non puoi rimuovere i tuoi privilegi se sei l'ultimo amministratore.",
        })
        return
      }
    }

    setParticipants(participants.map((p) => (p.username === username ? { ...p, role: newRole } : p)))

    toast({
      title: "Ruolo aggiornato",
      description: `${username} è ora ${newRole === "admin" ? "amministratore" : "membro"}.`,
    })
  }

  const saveChanges = async () => {
    if (!hasChanges) return

    setIsLoading(true)
    try {
      const updatedVacation = {
        ...vacation,
        participants,
      }

      if (vacation.dbId) {
        await database.updateVacation(vacation.dbId, updatedVacation)
        onVacationUpdate(updatedVacation)

        toast({
          title: "Modifiche salvate",
          description: "I partecipanti sono stati aggiornati con successo.",
        })

        setHasChanges(false)
      }
    } catch (error) {
      console.error("Errore nel salvataggio:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile salvare le modifiche.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetChanges = () => {
    setParticipants(vacation.participants || [])
    setHasChanges(false)
    toast({
      title: "Modifiche annullate",
      description: "Le modifiche sono state ripristinate.",
    })
  }

  const filteredUsers = availableUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !participants.some((p) => p.username === user.username),
  )

  const currentUserParticipant = participants.find((p) => p.username === currentUser)
  const canManageParticipants = permissions.canManageParticipants

  if (!canManageParticipants) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-4 mb-6">
            <Button variant="outline" onClick={onBack} size="sm">
              <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
              Torna alla Vacanza
            </Button>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">Gestione Partecipanti</h1>
          </div>

          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              Non hai i permessi necessari per gestire i partecipanti di questa vacanza.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-6">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Button variant="outline" onClick={onBack} size="sm">
              <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
              Torna alla Vacanza
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold break-anywhere">Gestione Partecipanti</h1>
              <p className="text-sm text-gray-600 break-anywhere">{vacation.title}</p>
            </div>
          </div>

          {/* Pulsanti di salvataggio */}
          {hasChanges && (
            <div className="flex gap-2 flex-shrink-0">
              <Button onClick={saveChanges} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvataggio...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salva Modifiche
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetChanges} disabled={isLoading}>
                Annulla
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Partecipanti Attuali */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="p-3 sm:p-4 lg:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  Partecipanti Attuali ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                <div className="space-y-3">
                  {participants.map((participant) => {
                    const user = availableUsers.find((u) => u.username === participant.username)
                    const isCreator = participant.username === vacation.createdBy
                    const isSelf = participant.username === currentUser

                    return (
                      <div
                        key={participant.username}
                        className={`border rounded-lg p-3 sm:p-4 transition-colors ${
                          isSelf ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex-shrink-0">
                              {participant.role === "admin" ? (
                                <Crown className="w-5 h-5 text-yellow-600" />
                              ) : (
                                <User className="w-5 h-5 text-gray-500" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm sm:text-base break-anywhere">
                                  {participant.username}
                                </span>
                                {isCreator && (
                                  <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs">
                                    Creatore
                                  </Badge>
                                )}
                                {isSelf && (
                                  <Badge variant="outline" className="text-xs">
                                    Tu
                                  </Badge>
                                )}
                                {user?.role === "admin" && (
                                  <Badge variant="outline" className="text-xs">
                                    Admin Sistema
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                Partecipa dal {new Date(participant.joinedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 pl-8 sm:pl-0">
                            {/* Switch per ruolo admin */}
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`admin-${participant.username}`} className="text-sm whitespace-nowrap">
                                Admin
                              </Label>
                              <Switch
                                id={`admin-${participant.username}`}
                                checked={participant.role === "admin"}
                                onCheckedChange={() => toggleParticipantRole(participant.username)}
                                disabled={isCreator || isLoading}
                              />
                            </div>

                            {/* Pulsante rimozione */}
                            {!isCreator && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeParticipant(participant.username)}
                                disabled={isLoading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Descrizione ruolo */}
                        <div className="mt-3 pl-8 sm:pl-0 text-xs text-gray-600">
                          {participant.role === "admin" ? (
                            <div className="flex items-center gap-1 text-yellow-700">
                              <Shield className="w-3 h-3" />
                              <span>Può modificare la vacanza, gestire partecipanti e eliminare contenuti</span>
                            </div>
                          ) : (
                            <span>• Può aggiungere attività, spese e note</span>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {participants.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Nessun partecipante configurato</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Statistiche */}
            <Card>
              <CardHeader className="p-3 sm:p-4 lg:p-6">
                <CardTitle className="text-base sm:text-lg">Statistiche Partecipanti</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{participants.length}</div>
                    <div className="text-sm text-blue-800">Totale</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {participants.filter((p) => p.role === "admin").length}
                    </div>
                    <div className="text-sm text-yellow-800">Admin</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Aggiungi Nuovi Partecipanti */}
          <div>
            <Card>
              <CardHeader className="p-3 sm:p-4 lg:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Aggiungi Partecipanti
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6 pt-0 space-y-4">
                {/* Barra di ricerca */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cerca utenti..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Lista utenti disponibili */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm">
                        {searchTerm ? "Nessun utente trovato" : "Tutti gli utenti sono già partecipanti"}
                      </p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user.username}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm break-anywhere">{user.username}</span>
                              {user.role === "admin" && (
                                <Badge variant="outline" className="text-xs">
                                  Admin Sistema
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => addParticipant(user.username)} disabled={isLoading}>
                          <Plus className="w-4 h-4 mr-1" />
                          Aggiungi
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alert per modifiche non salvate */}
        {hasChanges && (
          <div className="fixed bottom-4 right-4 z-50">
            <Alert className="border-orange-200 bg-orange-50 shadow-lg">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-orange-800">
                Hai modifiche non salvate. Ricordati di salvare prima di uscire.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  )
}
