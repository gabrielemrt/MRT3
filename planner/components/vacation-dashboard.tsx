"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CreditCard, ArrowLeft, MapPin, StickyNote, Trash2, Users, Crown, User } from "lucide-react"
import type { Vacation, View } from "@/app/page"
import { Badge } from "@/components/ui/badge"
import { useVacationPermissions } from "@/hooks/use-vacation-permissions"

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
  const permissions = useVacationPermissions(vacation, currentUser)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header - Mobile responsive */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
            <Button variant="outline" onClick={onBack} size="sm" className="flex-shrink-0 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Torna alle </span>Vacanze
            </Button>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold line-clamp-3 break-anywhere min-w-0">
              {vacation.title}
            </h1>
          </div>

          {permissions.canDelete && onDeleteVacation && (
            <Button
              variant="destructive"
              onClick={() => onDeleteVacation(vacation.id)}
              size="sm"
              className="flex-shrink-0 w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              <span className="sm:hidden">Elimina </span>
              <span className="hidden sm:inline">Elimina </span>Vacanza
            </Button>
          )}
        </div>

        {/* Card informazioni vacanza - Mobile responsive */}
        <div className="mb-6 sm:mb-8">
          <Card className="overflow-hidden">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                <div
                  className="w-full lg:w-1/3 h-32 sm:h-40 lg:h-48 bg-cover bg-center rounded-lg flex-shrink-0"
                  style={{
                    backgroundImage: `url(${vacation.imageUrl || "/placeholder.svg?height=200&width=400"})`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 break-anywhere">
                    {vacation.title}
                  </h2>
                  <div className="flex items-center gap-1 sm:gap-2 text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm sm:text-base break-anywhere">{vacation.location}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 text-gray-600 mb-3 sm:mb-4">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm sm:text-base">
                      {new Date(vacation.startDate).toLocaleDateString()} -{" "}
                      {new Date(vacation.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base break-anywhere">
                    {vacation.description}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm text-gray-500">
                    <span>Creata da:</span>
                    <Badge variant="outline" className="w-fit">
                      {vacation.createdBy}
                    </Badge>
                    <span>il {new Date(vacation.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Partecipanti - Mobile responsive */}
        <div className="mb-6 sm:mb-8">
          <Card>
            <CardHeader className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  Partecipanti ({vacation.participants?.length || 0})
                </CardTitle>
                {permissions.canManageParticipants && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate("manage-participants")}
                    className="bg-transparent"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Gestisci
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {vacation.participants?.map((participant) => (
                  <div
                    key={participant.username}
                    className="flex items-center justify-between p-2 sm:p-3 border rounded-lg bg-gray-50 min-w-0"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {participant.role === "admin" ? (
                        <Crown className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                      ) : (
                        <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      )}
                      <span className="font-medium text-sm sm:text-base truncate">{participant.username}</span>
                      {participant.username === currentUser && (
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          Tu
                        </Badge>
                      )}
                    </div>
                    <Badge
                      variant={participant.role === "admin" ? "default" : "outline"}
                      className={`text-xs flex-shrink-0 ${participant.role === "admin" ? "bg-yellow-500 text-white" : ""}`}
                    >
                      {participant.role === "admin" ? "Admin" : "Membro"}
                    </Badge>
                  </div>
                )) || (
                  <p className="text-gray-500 col-span-full text-center py-4 text-sm">
                    Nessun partecipante configurato
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-4">Gestisci la tua vacanza</h2>

        {/* Grid delle funzionalità - Mobile responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {permissions.canAddContent && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate("planner")}>
              <CardHeader className="p-3 sm:p-4 lg:p-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                  <span className="break-anywhere">Planner Vacanza</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm break-anywhere">
                  Visualizza e gestisci l'itinerario della vacanza
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                <p className="text-xs sm:text-sm text-gray-600 break-anywhere">
                  Organizza le attività giorno per giorno, aggiungi punti di interesse e dettagli per ogni tappa.
                </p>
              </CardContent>
            </Card>
          )}

          {permissions.canAddContent && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate("expenses")}>
              <CardHeader className="p-3 sm:p-4 lg:p-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                  <span className="break-anywhere">Gestione Spese</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm break-anywhere">
                  Traccia le spese condivise e calcola i debiti
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                <p className="text-xs sm:text-sm text-gray-600 break-anywhere">
                  Tieni traccia di chi ha pagato cosa e calcola automaticamente i debiti tra i partecipanti.
                </p>
              </CardContent>
            </Card>
          )}

          {permissions.canAddContent && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate("notes")}>
              <CardHeader className="p-3 sm:p-4 lg:p-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                  <StickyNote className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
                  <span className="break-anywhere">Note Condivise</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm break-anywhere">
                  Aggiungi note informative per il gruppo
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                <p className="text-xs sm:text-sm text-gray-600 break-anywhere">
                  Condividi informazioni importanti, suggerimenti e promemoria con tutti i partecipanti.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
