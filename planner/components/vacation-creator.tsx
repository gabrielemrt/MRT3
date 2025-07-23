"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import type { Vacation } from "@/app/page"
import { ParticipantsSelector, type VacationParticipant } from "./participants-selector"

interface VacationCreatorProps {
  currentUser: string
  onBack: () => void
  onCreateVacation: (vacation: Vacation) => void
}

export function VacationCreator({ currentUser, onBack, onCreateVacation }: VacationCreatorProps) {
  const [newVacation, setNewVacation] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    imageUrl: "",
  })

  // Aggiungi lo stato per i partecipanti
  const [participants, setParticipants] = useState<VacationParticipant[]>([
    {
      username: currentUser,
      role: "admin",
      joinedAt: new Date().toISOString(),
    },
  ])

  // Modifica la funzione handleSubmit per includere i partecipanti
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newVacation.title || !newVacation.startDate || !newVacation.endDate || !newVacation.location) {
      alert("Per favore compila tutti i campi obbligatori")
      return
    }

    if (participants.length === 0) {
      alert("Devi selezionare almeno un partecipante")
      return
    }

    const vacation: Vacation = {
      id: Date.now().toString(),
      ...newVacation,
      createdBy: currentUser,
      createdAt: new Date().toISOString(),
      participants: participants,
    }

    onCreateVacation(vacation)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="flex items-center gap-2 sm:gap-4 mb-6">
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Torna alla </span>Dashboard
          </Button>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold break-anywhere">Crea Nuova Vacanza</h1>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-base sm:text-lg lg:text-xl">Dettagli Vacanza</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <Label htmlFor="title" className="text-sm sm:text-base">
                  Titolo *
                </Label>
                <Input
                  id="title"
                  value={newVacation.title}
                  onChange={(e) => setNewVacation({ ...newVacation, title: e.target.value })}
                  placeholder="Es: Vacanza in Sardegna"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm sm:text-base">
                  Descrizione
                </Label>
                <Textarea
                  id="description"
                  value={newVacation.description}
                  onChange={(e) => setNewVacation({ ...newVacation, description: e.target.value })}
                  placeholder="Descrivi brevemente questa vacanza..."
                  rows={3}
                  className="mt-1 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-sm sm:text-base">
                    Data Inizio *
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newVacation.startDate}
                    onChange={(e) => setNewVacation({ ...newVacation, startDate: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="endDate" className="text-sm sm:text-base">
                    Data Fine *
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newVacation.endDate}
                    onChange={(e) => setNewVacation({ ...newVacation, endDate: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location" className="text-sm sm:text-base">
                  Destinazione *
                </Label>
                <Input
                  id="location"
                  value={newVacation.location}
                  onChange={(e) => setNewVacation({ ...newVacation, location: e.target.value })}
                  placeholder="Es: Sardegna, Italia"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="imageUrl" className="text-sm sm:text-base">
                  URL Immagine (opzionale)
                </Label>
                <Input
                  id="imageUrl"
                  value={newVacation.imageUrl}
                  onChange={(e) => setNewVacation({ ...newVacation, imageUrl: e.target.value })}
                  placeholder="https://esempio.com/immagine.jpg"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Lascia vuoto per usare un'immagine predefinita</p>
              </div>

              <div className="pt-2">
                <ParticipantsSelector
                  currentUser={currentUser}
                  selectedParticipants={participants}
                  onParticipantsChange={setParticipants}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
                <Button type="submit" className="w-full sm:w-auto">
                  Crea Vacanza
                </Button>
                <Button type="button" variant="outline" onClick={onBack} className="w-full sm:w-auto bg-transparent">
                  Annulla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
