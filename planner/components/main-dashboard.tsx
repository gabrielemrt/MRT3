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
  QrCode,
} from "lucide-react"
import type { Vacation } from "@/app/page"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
}: MainDashboardProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      {/* Header professionale - Ottimizzato per mobile */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <Building2 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Vacation Planner</h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Benvenuto, <span className="font-semibold text-gray-800">{currentUser}</span>
                  {isAdmin && (
                    <Badge className="ml-1 sm:ml-2 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-xs">
                      Admin
                    </Badge>
                  )}
                </p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onUserProfile}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <Settings className="w-4 h-4 mr-2" />
                Impostazioni
              </Button>
              <Button
                variant="outline"
                onClick={onLogout}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Mobile Menu */}
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={onUserProfile}>
                    <Settings className="w-4 h-4 mr-2" />
                    Impostazioni
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Contenuto principale */}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-7xl">
        {/* Pannello Admin - Ottimizzato per mobile */}
        {isAdmin && (
          <div className="mb-6 sm:mb-8">
            <Card className="bg-white border border-gray-200 shadow-lg rounded-xl">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100 rounded-t-xl p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <UserCog className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold text-gray-900">
                      Pannello Amministratore
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-gray-600">
                      Gestisci utenti, vacanze e configurazioni
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Button
                    onClick={onCreateVacation}
                    className="h-10 sm:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg font-semibold text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuova Vacanza
                  </Button>

                  <Button
                    variant="outline"
                    onClick={onManageUsers}
                    className="h-10 sm:h-12 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-sm"
                  >
                    <UserCog className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Gestione </span>Utenti
                  </Button>

                  <Button
                    variant="outline"
                    onClick={onExportData}
                    className="h-10 sm:h-12 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Esporta
                  </Button>

                  <Button
                    variant="outline"
                    onClick={onImportData}
                    className="h-10 sm:h-12 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Importa
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onSyncManager}
                    className="h-10 sm:h-12 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-sm"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Sincronizza
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Statistiche rapide - Ottimizzate per mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white border border-gray-200 shadow-md rounded-xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Vacanze Totali</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{vacations.length}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-md rounded-xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Vacanze Attive</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {
                      vacations.filter((v) => new Date(v.startDate) <= new Date() && new Date(v.endDate) >= new Date())
                        .length
                    }
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-md rounded-xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Prossime Vacanze</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {vacations.filter((v) => new Date(v.startDate) > new Date()).length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sezione Vacanze - Ottimizzata per mobile */}
        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100 rounded-t-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Le tue Vacanze</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600">
                    Gestisci e organizza tutte le tue avventure
                  </CardDescription>
                </div>
              </div>
              {isAdmin && (
                <Button
                  onClick={onCreateVacation}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-md rounded-lg text-xs sm:text-sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Nuova </span>Vacanza
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {vacations.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Nessuna vacanza pianificata</h3>
                {isAdmin ? (
                  <>
                    <p className="text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
                      Inizia a pianificare la tua prossima avventura creando una nuova vacanza
                    </p>
                    <Button
                      onClick={onCreateVacation}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg rounded-lg h-10 sm:h-12 px-6 sm:px-8 font-semibold"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Crea la tua Prima Vacanza
                    </Button>
                  </>
                ) : (
                  <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base">
                    Non ci sono vacanze disponibili. Contatta l'amministratore per crearne una.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {vacations.map((vacation) => (
                  <Card
                    key={vacation.id}
                    className="group overflow-hidden bg-white hover:bg-gray-50 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 rounded-xl"
                    onClick={() => onSelectVacation(vacation)}
                  >
                    <div className="relative overflow-hidden">
                      <div
                        className="h-32 sm:h-48 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                        style={{
                          backgroundImage: `url(${vacation.imageUrl || "/placeholder.svg?height=200&width=400"})`,
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
                        <Badge className="bg-white/90 text-gray-800 border-0 shadow-sm rounded-lg px-2 sm:px-3 py-1 font-medium text-xs">
                          <MapPin className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                          {vacation.location}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
                      <CardTitle className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                        {vacation.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 line-clamp-2 text-xs sm:text-sm">
                        {vacation.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0 p-3 sm:p-4">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>
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

                    <CardFooter className="pt-0 flex justify-between items-center p-3 sm:p-4">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 rounded-lg text-xs">
                        Creata da: {vacation.createdBy}
                      </Badge>
                      <div className="text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
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
