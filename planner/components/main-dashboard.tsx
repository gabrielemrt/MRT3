"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LogOut,
  Plus,
  MapPin,
  Calendar,
  UserCog,
  Download,
  Upload,
  Building2,
  ArrowRight,
  Settings,
  BarChart3,
  Menu,
} from "lucide-react"
import type { Vacation } from "@/app/page"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SyncStatus } from "@/components/sync-status"

interface MainDashboardProps {
  currentUser: string
  isAdmin: boolean
  vacations: Vacation[]
  onSelectVacation: (vacation: Vacation) => void
  onCreateVacation: () => void
  onManageUsers: () => void
  onExportData: () => void
  onImportData: () => void
  onLogout: () => void
  onUserProfile: () => void
  onSyncManager: () => void
  lastSync?: Date | null
  lastUpdatedBy?: string
  onPublishUpdate: () => void
}

export function MainDashboard({
  currentUser,
  isAdmin,
  vacations,
  onSelectVacation,
  onCreateVacation,
  onManageUsers,
  onExportData,
  onImportData,
  onLogout,
  onUserProfile,
  onSyncManager,
  lastSync,
  lastUpdatedBy,
  onPublishUpdate,
}: MainDashboardProps) {
  // Filtra le vacanze in base ai permessi dell'utente
  const accessibleVacations = vacations.filter((vacation) => {
    // Se è admin del sistema, può vedere tutto
    if (isAdmin) return true

    // Altrimenti, può vedere solo le vacanze di cui è partecipante
    return vacation.participants?.some((p) => p.username === currentUser) || false
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      {/* Header - Completamente responsive */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">Vacation Planner</h1>
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    Ciao, <span className="font-semibold text-gray-800">{currentUser}</span>
                    {isAdmin && (
                      <Badge className="ml-1 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-xs px-1 py-0">
                        Admin
                      </Badge>
                    )}
                  </p>
                  <div className="hidden sm:block">
                    <SyncStatus isOnline={true} lastSync={lastSync || undefined} lastUpdatedBy={lastUpdatedBy} />
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Desktop */}
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={onUserProfile}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs"
              >
                <Settings className="w-3 h-3 mr-1" />
                <span className="hidden md:inline">Impostazioni</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs"
              >
                <LogOut className="w-3 h-3 mr-1" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>

            {/* Menu Mobile */}
            <div className="sm:hidden flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0 bg-transparent">
                    <Menu className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={onUserProfile} className="text-sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Impostazioni
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLogout} className="text-sm">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Sync status mobile */}
          <div className="sm:hidden mt-2">
            <SyncStatus isOnline={true} lastSync={lastSync || undefined} lastUpdatedBy={lastUpdatedBy} />
          </div>
        </div>
      </div>

      {/* Contenuto principale */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Pannello Admin - Mobile responsive */}
        {isAdmin && (
          <div className="mb-6 sm:mb-8">
            <Card className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100 p-3 sm:p-4 lg:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <UserCog className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
                      Pannello Amministratore
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-gray-600 break-anywhere">
                      Gestisci utenti e vacanze - Sync automatica
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                  <Button
                    onClick={onCreateVacation}
                    className="h-9 sm:h-10 lg:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg font-semibold text-xs sm:text-sm"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Nuova </span>Vacanza
                  </Button>

                  <Button
                    variant="outline"
                    onClick={onManageUsers}
                    className="h-9 sm:h-10 lg:h-12 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-xs sm:text-sm"
                  >
                    <UserCog className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Gestione </span>Utenti
                  </Button>

                  <Button
                    variant="outline"
                    onClick={onExportData}
                    className="h-9 sm:h-10 lg:h-12 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-xs sm:text-sm"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Esporta
                  </Button>

                  <Button
                    variant="outline"
                    onClick={onImportData}
                    className="h-9 sm:h-10 lg:h-12 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-xs sm:text-sm"
                  >
                    <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Importa
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Statistiche - Mobile responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white border border-gray-200 shadow-md rounded-xl">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Vacanze Totali</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {accessibleVacations.length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-md rounded-xl">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Vacanze Attive</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {
                      accessibleVacations.filter(
                        (v) => new Date(v.startDate) <= new Date() && new Date(v.endDate) >= new Date(),
                      ).length
                    }
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-md rounded-xl">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Prossime Vacanze</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {accessibleVacations.filter((v) => new Date(v.startDate) > new Date()).length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sezione Vacanze - Mobile responsive */}
        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
                    Le tue Vacanze
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 break-anywhere">
                    Gestisci le tue avventure - Aggiornamenti in tempo reale
                  </CardDescription>
                </div>
              </div>
              {isAdmin && (
                <Button
                  onClick={onCreateVacation}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-md rounded-lg text-xs flex-shrink-0"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Nuova </span>
                  <span className="sm:hidden">+</span>
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-3 sm:p-4 lg:p-6">
            {accessibleVacations.length === 0 ? (
              <div className="text-center py-8 sm:py-12 lg:py-16">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Nessuna vacanza pianificata
                </h3>
                {isAdmin ? (
                  <>
                    <p className="text-gray-600 mb-3 sm:mb-4 lg:mb-6 max-w-md mx-auto text-sm sm:text-base px-4">
                      Inizia a pianificare la tua prossima avventura creando una nuova vacanza
                    </p>
                    <Button
                      onClick={onCreateVacation}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg rounded-lg h-9 sm:h-10 lg:h-12 px-4 sm:px-6 lg:px-8 font-semibold text-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Crea la tua Prima Vacanza
                    </Button>
                  </>
                ) : (
                  <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base px-4">
                    Non ci sono vacanze disponibili. Contatta l'amministratore per crearne una.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {accessibleVacations.map((vacation) => (
                  <Card
                    key={vacation.id}
                    className="group overflow-hidden bg-white hover:bg-gray-50 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 rounded-xl"
                    onClick={() => onSelectVacation(vacation)}
                  >
                    <div className="relative overflow-hidden">
                      <div
                        className="h-28 sm:h-32 lg:h-48 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                        style={{
                          backgroundImage: `url(${vacation.imageUrl || "/placeholder.svg?height=200&width=400"})`,
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <Badge className="bg-white/90 text-gray-800 border-0 shadow-sm rounded-lg px-2 py-1 font-medium text-xs truncate max-w-full">
                          <MapPin className="w-2 h-2 sm:w-3 sm:h-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{vacation.location}</span>
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="p-3 sm:p-4">
                      <CardTitle className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 break-anywhere">
                        {vacation.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 line-clamp-2 text-xs sm:text-sm break-anywhere">
                        {vacation.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0 p-3 sm:p-4">
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">
                          {new Date(vacation.startDate).toLocaleDateString("it-IT", {
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          -{" "}
                          {new Date(vacation.endDate).toLocaleDateString("it-IT", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0 flex justify-between items-center p-3 sm:p-4 min-w-0">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 rounded-lg text-xs truncate max-w-[70%]"
                      >
                        <span className="truncate">Creata da: {vacation.createdBy}</span>
                      </Badge>
                      <div className="text-blue-600 group-hover:text-blue-700 transition-colors duration-300 flex-shrink-0">
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
