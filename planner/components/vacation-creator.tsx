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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newVacation.title || !newVacation.startDate || !newVacation.endDate || !newVacation.location) {
      alert("Per favore compila tutti i campi obbligatori")
      return
    }

    const vacation: Vacation = {
      id: Date.now().toString(),
      ...newVacation,
      createdBy: currentUser,
      createdAt: new Date().toISOString(),
    }

    onCreateVacation(vacation)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Crea Nuova Vacanza</h1>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Dettagli Vacanza</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Titolo *</Label>
                <Input
                  id="title"
                  value={newVacation.title}
                  onChange={(e) => setNewVacation({ ...newVacation, title: e.target.value })}
                  placeholder="Es: Vacanza in Sardegna"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  value={newVacation.description}
                  onChange={(e) => setNewVacation({ ...newVacation, description: e.target.value })}
                  placeholder="Descrivi brevemente questa vacanza..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Data Inizio *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newVacation.startDate}
                    onChange={(e) => setNewVacation({ ...newVacation, startDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">Data Fine *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newVacation.endDate}
                    onChange={(e) => setNewVacation({ ...newVacation, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Destinazione *</Label>
                <Input
                  id="location"
                  value={newVacation.location}
                  onChange={(e) => setNewVacation({ ...newVacation, location: e.target.value })}
                  placeholder="Es: Sardegna, Italia"
                  required
                />
              </div>

              <div>
                <Label htmlFor="imageUrl">URL Immagine (opzionale)</Label>
                <Input
                  id="imageUrl"
                  value={newVacation.imageUrl}
                  onChange={(e) => setNewVacation({ ...newVacation, imageUrl: e.target.value })}
                  placeholder="https://esempio.com/immagine.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">Lascia vuoto per usare un'immagine predefinita</p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">Crea Vacanza</Button>
                <Button type="button" variant="outline" onClick={onBack}>
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
