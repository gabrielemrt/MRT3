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
      <div className="container mx-auto p-4 sm:p-6">
        {/* Header - Ottimizzato per mobile */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button variant="outline" onClick={onBack} size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Torna alle </span>Vacanze
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold line-clamp-2">{vacation.title}</h1>
          </div>

          {onDeleteVacation && (
            <Button variant="destructive" onClick={() => onDeleteVacation(vacation.id)} size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Elimina </span>Vacanza
            </Button>
          )}
        </div>

        {/* Card informazioni vacanza - Ottimizzata per mobile */}
        <div className="mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                <div
                  className="w-full lg:w-1/3 h-40 sm:h-48 bg-cover bg-center rounded-lg"
                  style={{
                    backgroundImage: `url(${vacation.imageUrl || "/placeholder.svg?height=200&width=400"})`,
                  }}
                />
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold mb-2">{vacation.title}</h2>
                  <div className="flex items-center gap-1 text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm sm:text-base">{vacation.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 mb-3 sm:mb-4">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm sm:text-base">
                      {new Date(vacation.startDate).toLocaleDateString()} -{" "}
                      {new Date(vacation.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">{vacation.description}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm text-gray-500">
                    <span>Creata da:</span>
                    <Badge variant="outline">{vacation.createdBy}</Badge>
                    <span>il {new Date(vacation.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-lg sm:text-xl font-semibold mb-4">Gestisci la tua vacanza</h2>

        {/* Grid delle funzionalità - Ottimizzata per mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate("planner")}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Planner Vacanza
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Visualizza e gestisci l'itinerario della vacanza
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-xs sm:text-sm text-gray-600">
                Organizza le attività giorno per giorno, aggiungi punti di interesse e dettagli per ogni tappa.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate("expenses")}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                Gestione Spese
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Traccia le spese condivise e calcola i debiti
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-xs sm:text-sm text-gray-600">
                Tieni traccia di chi ha pagato cosa e calcola automaticamente i debiti tra i partecipanti.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate("notes")}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <StickyNote className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                Note Condivise
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Aggiungi note informative per il gruppo</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-xs sm:text-sm text-gray-600">
                Condividi informazioni importanti, suggerimenti e promemoria con tutti i partecipanti.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
