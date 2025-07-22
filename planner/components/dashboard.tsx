"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CreditCard, LogOut, MapPin, Users, StickyNote } from "lucide-react"

interface DashboardProps {
  currentUser: string
  onNavigate: (view: "dashboard" | "planner" | "expenses" | "notes") => void
  onLogout: () => void
}

export function Dashboard({ currentUser, onNavigate, onLogout }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vacation Dashboard</h1>
            <p className="text-gray-600">Benvenuto, {currentUser}!</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate("planner")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Planner Vacanza
              </CardTitle>
              <CardDescription>Visualizza e gestisci l'itinerario della vacanza</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Punti di interesse
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Date e orari
                </div>
              </div>
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
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Spese condivise
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  Calcolo debiti
                </div>
              </div>
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
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <StickyNote className="w-4 h-4" />
                  Note di gruppo
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Informazioni utili
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
