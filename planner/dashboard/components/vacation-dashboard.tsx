"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CreditCard, ArrowLeft, MapPin, StickyNote, Trash2 } from "lucide-react"
import type { Vacation, View } from "@/app/page"
import { Badge } from "@/components/ui/badge"

interface VacationDashboardProps {
  currentUser: string
  vacation: Vacation
  onNavigate: (view: View) => void
  onBack: () => void
  onDeleteVacation?: (vacationId: string) => void
}

export function VacationDashboard({
  currentUser,
  vacation,
  onNavigate,
  onBack,
  onDeleteVacation,
}: VacationDashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna alle Vacanze
            </Button>
            <h1 className="text-2xl font-bold">{vacation.title}</h1>
          </div>

          {onDeleteVacation && (
            <Button variant="destructive" onClick={() => onDeleteVacation(vacation.id)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Elimina Vacanza
            </Button>
          )}
        </div>

        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div
                  className="w-full md:w-1/3 h-48 bg-cover bg-center rounded-lg"
                  style={{
                    backgroundImage: `url(${vacation.imageUrl || "/placeholder.svg?height=200&width=400"})`,
                  }}
                />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">{vacation.title}</h2>
                  <div className="flex items-center gap-1 text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    {vacation.location}
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 mb-4">
                    <Calendar className="w-4 h-4" />
                    {new Date(vacation.startDate).toLocaleDateString()} -{" "}
                    {new Date(vacation.endDate).toLocaleDateString()}
                  </div>
                  <p className="text-gray-700 mb-4">{vacation.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Creata da:</span>
                    <Badge variant="outline">{vacation.createdBy}</Badge>
                    <span>il {new Date(vacation.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-semibold mb-4">Gestisci la tua vacanza</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate("planner")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Planner Vacanza
              </CardTitle>
              <CardDescription>Visualizza e gestisci l'itinerario della vacanza</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Organizza le attività giorno per giorno, aggiungi punti di interesse e dettagli per ogni tappa.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate("expenses")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                Gestione Spese
              </CardTitle>
              <CardDescription>Traccia le spese condivise e calcola i debiti</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Tieni traccia di chi ha pagato cosa e calcola automaticamente i debiti tra i partecipanti.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate("notes")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-yellow-600" />
                Note Condivise
              </CardTitle>
              <CardDescription>Aggiungi note informative per il gruppo</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Condividi informazioni importanti, suggerimenti e promemoria con tutti i partecipanti.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
