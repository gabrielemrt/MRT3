"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Users, Crown } from "lucide-react"
import type { User as UserType } from "@/data/users"

export interface VacationParticipant {
  username: string
  role: "admin" | "member"
  joinedAt: string
}

interface ParticipantsSelectorProps {
  currentUser: string
  selectedParticipants: VacationParticipant[]
  onParticipantsChange: (participants: VacationParticipant[]) => void
}

export function ParticipantsSelector({
  currentUser,
  selectedParticipants,
  onParticipantsChange,
}: ParticipantsSelectorProps) {
  const [users, setUsers] = useState<UserType[]>([])

  useEffect(() => {
    const savedUsers = localStorage.getItem("users")
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    } else {
      import("@/data/users").then(({ users: defaultUsers }) => {
        setUsers(defaultUsers)
      })
    }
  }, [])

  const handleParticipantToggle = (username: string, checked: boolean) => {
    if (checked) {
      // Aggiungi partecipante
      const newParticipant: VacationParticipant = {
        username,
        role: username === currentUser ? "admin" : "member", // Il creatore è sempre admin
        joinedAt: new Date().toISOString(),
      }
      onParticipantsChange([...selectedParticipants, newParticipant])
    } else {
      // Rimuovi partecipante (non permettere di rimuovere il creatore)
      if (username !== currentUser) {
        onParticipantsChange(selectedParticipants.filter((p) => p.username !== username))
      }
    }
  }

  const handleRoleToggle = (username: string, isAdmin: boolean) => {
    // Non permettere di cambiare il ruolo del creatore
    if (username === currentUser) return

    const updatedParticipants = selectedParticipants.map((p) =>
      p.username === username ? { ...p, role: isAdmin ? "admin" : "member" } : p,
    )
    onParticipantsChange(updatedParticipants)
  }

  const isParticipantSelected = (username: string) => {
    return selectedParticipants.some((p) => p.username === username)
  }

  const getParticipantRole = (username: string) => {
    const participant = selectedParticipants.find((p) => p.username === username)
    return participant?.role || "member"
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 sm:p-4 lg:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          Partecipanti alla Vacanza
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 lg:p-6 pt-0 space-y-3 sm:space-y-4">
        <div className="text-sm text-gray-600 mb-3 sm:mb-4 break-anywhere">
          Seleziona gli utenti che parteciperanno a questa vacanza e assegna i permessi amministrativi.
        </div>

        <div className="space-y-2 sm:space-y-3">
          {users.map((user) => {
            const isSelected = isParticipantSelected(user.username)
            const participantRole = getParticipantRole(user.username)
            const isCreator = user.username === currentUser

            return (
              <div
                key={user.username}
                className={`border rounded-lg p-3 sm:p-4 transition-colors ${
                  isSelected ? "border-blue-200 bg-blue-50" : "border-gray-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <Checkbox
                      id={`participant-${user.username}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => handleParticipantToggle(user.username, checked as boolean)}
                      disabled={isCreator} // Il creatore è sempre selezionato
                      className="flex-shrink-0"
                    />
                    <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                      <Label
                        htmlFor={`participant-${user.username}`}
                        className="font-medium text-sm sm:text-base break-anywhere"
                      >
                        {user.username}
                      </Label>
                      {isCreator && (
                        <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs flex-shrink-0">
                          Tu (Creatore)
                        </Badge>
                      )}
                      {user.role === "admin" && (
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          Admin Sistema
                        </Badge>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center justify-between sm:justify-end space-x-3 pl-6 sm:pl-0">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`admin-${user.username}`} className="text-sm whitespace-nowrap">
                          Admin Vacanza
                        </Label>
                        <Switch
                          id={`admin-${user.username}`}
                          checked={participantRole === "admin"}
                          onCheckedChange={(checked) => handleRoleToggle(user.username, checked)}
                          disabled={isCreator} // Il creatore è sempre admin
                        />
                      </div>
                      <div className="flex items-center flex-shrink-0">
                        {participantRole === "admin" ? (
                          <Crown className="w-4 h-4 text-yellow-600" />
                        ) : (
                          <div className="w-4 h-4"></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {isSelected && (
                  <div className="mt-2 pl-6 sm:pl-0 text-xs text-gray-600 break-anywhere">
                    {participantRole === "admin" ? (
                      <span className="text-yellow-700 font-medium">
                        ✓ Può modificare la vacanza, gestire partecipanti e eliminare contenuti
                      </span>
                    ) : (
                      <span>• Può aggiungere attività, spese e note</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {selectedParticipants.length > 0 && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Riepilogo Partecipanti ({selectedParticipants.length})</h4>
            <div className="flex flex-wrap gap-2">
              {selectedParticipants.map((participant) => (
                <Badge
                  key={participant.username}
                  variant={participant.role === "admin" ? "default" : "outline"}
                  className={`text-xs break-anywhere ${
                    participant.role === "admin" ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white" : ""
                  }`}
                >
                  {participant.role === "admin" && <Crown className="w-3 h-3 mr-1 flex-shrink-0" />}
                  <span className="break-anywhere">
                    {participant.username}
                    {participant.username === currentUser && " (Tu)"}
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
