"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Calendar, Clock, MapPin, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { User } from "@/data/users"

interface VacationDay {
  id: string
  date: string
  activities: Activity[]
  createdBy: string
  createdAt: string
}

interface Activity {
  id: string
  title: string
  description: string
  time: string
  location: string
  mapUrl?: string
  createdBy: string
  createdAt: string
}

interface VacationPlannerProps {
  currentUser: string
  vacationId: string
  onBack: () => void
}

export function VacationPlanner({ currentUser, vacationId, onBack }: VacationPlannerProps) {
  const [vacationDays, setVacationDays] = useState<VacationDay[]>([])
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [isAddingDay, setIsAddingDay] = useState(false)
  const [isAddingActivity, setIsAddingActivity] = useState<string | null>(null)
  const [newDate, setNewDate] = useState("")

  // Aggiungiamo gli stati per la modifica
  const [isEditingDay, setIsEditingDay] = useState<string | null>(null)
  const [isEditingActivity, setIsEditingActivity] = useState<Activity | null>(null)
  const [editDate, setEditDate] = useState("")

  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    time: "",
    location: "",
    mapUrl: "",
  })

  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const saved = localStorage.getItem(`vacationDays_${vacationId}`)
    if (saved) {
      const loadedDays = JSON.parse(saved)
      // Ordina le attività per ogni giorno al caricamento
      const sortedDays = loadedDays.map((day: VacationDay) => ({
        ...day,
        activities: day.activities.sort((a: Activity, b: Activity) => a.time.localeCompare(b.time)),
      }))
      setVacationDays(sortedDays)
    }
  }, [vacationId])

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

  const saveToStorage = (days: VacationDay[]) => {
    localStorage.setItem(`vacationDays_${vacationId}`, JSON.stringify(days))
  }

  const addDay = () => {
    if (!newDate) return

    const newDay: VacationDay = {
      id: Date.now().toString(),
      date: newDate,
      activities: [],
      createdBy: currentUser,
      createdAt: new Date().toISOString(),
    }

    const updatedDays = [...vacationDays, newDay].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )
    setVacationDays(updatedDays)
    saveToStorage(updatedDays)
    setNewDate("")
    setIsAddingDay(false)
  }

  // Aggiungiamo funzioni per eliminare e modificare giorni e attività
  const deleteDay = (dayId: string) => {
    if (confirm("Sei sicuro di voler eliminare questo giorno?")) {
      const updatedDays = vacationDays.filter((day) => day.id !== dayId)
      setVacationDays(updatedDays)
      saveToStorage(updatedDays)
    }
  }

  const startEditDay = (day: VacationDay) => {
    setIsEditingDay(day.id)
    setEditDate(day.date)
  }

  const updateDay = () => {
    if (!editDate || !isEditingDay) return

    const updatedDays = vacationDays
      .map((day) => (day.id === isEditingDay ? { ...day, date: editDate } : day))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    setVacationDays(updatedDays)
    saveToStorage(updatedDays)
    setEditDate("")
    setIsEditingDay(null)
  }

  const deleteActivity = (dayId: string, activityId: string) => {
    if (confirm("Sei sicuro di voler eliminare questa attività?")) {
      const updatedDays = vacationDays.map((day) => {
        if (day.id === dayId) {
          return {
            ...day,
            activities: day.activities.filter((activity) => activity.id !== activityId),
          }
        }
        return day
      })

      setVacationDays(updatedDays)
      saveToStorage(updatedDays)
    }
  }

  const startEditActivity = (activity: Activity, dayId: string) => {
    setIsEditingActivity(activity)
    setIsAddingActivity(dayId)
    setNewActivity({
      title: activity.title,
      description: activity.description,
      time: activity.time,
      location: activity.location,
      mapUrl: activity.mapUrl || "",
    })
  }

  const updateActivity = (dayId: string) => {
    if (!newActivity.title || !newActivity.time || !isEditingActivity) return

    const updatedDays = vacationDays.map((day) => {
      if (day.id === dayId) {
        const updatedActivities = day.activities
          .map((activity) => (activity.id === isEditingActivity.id ? { ...activity, ...newActivity } : activity))
          .sort((a, b) => {
            // Ordina per orario dopo la modifica
            return a.time.localeCompare(b.time)
          })
        return { ...day, activities: updatedActivities }
      }
      return day
    })

    setVacationDays(updatedDays)
    saveToStorage(updatedDays)
    setNewActivity({ title: "", description: "", time: "", location: "", mapUrl: "" })
    setIsAddingActivity(null)
    setIsEditingActivity(null)
  }

  // Modifichiamo la funzione addActivity per gestire sia l'aggiunta che la modifica
  const addOrUpdateActivity = (dayId: string) => {
    if (isEditingActivity) {
      updateActivity(dayId)
    } else {
      addActivity(dayId)
    }
  }

  const addActivity = (dayId: string) => {
    if (!newActivity.title || !newActivity.time) return

    const activity: Activity = {
      id: Date.now().toString(),
      ...newActivity,
      createdBy: currentUser,
      createdAt: new Date().toISOString(),
    }

    const updatedDays = vacationDays.map((day) => {
      if (day.id === dayId) {
        const updatedActivities = [...day.activities, activity].sort((a, b) => {
          // Ordina per orario (formato HH:MM)
          return a.time.localeCompare(b.time)
        })
        return { ...day, activities: updatedActivities }
      }
      return day
    })

    setVacationDays(updatedDays)
    saveToStorage(updatedDays)
    setNewActivity({ title: "", description: "", time: "", location: "", mapUrl: "" })
    setIsAddingActivity(null)
  }

  const getUserName = (username: string) => {
    const user = users.find((u) => u.username === username)
    return user ? user.username : username // Restituisce lo username se trovato, altrimenti il valore originale
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla Vacanza
          </Button>
          <h1 className="text-2xl font-bold">Planner Vacanza</h1>
        </div>

        <div className="mb-6">
          <Button onClick={() => setIsAddingDay(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Aggiungi Giorno
          </Button>
        </div>

        {isAddingDay && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Aggiungi Nuovo Giorno</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="date">Data</Label>
                <Input id="date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={addDay}>Aggiungi</Button>
                <Button variant="outline" onClick={() => setIsAddingDay(false)}>
                  Annulla
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {vacationDays.map((day) => (
            <Card key={day.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {new Date(day.date).toLocaleDateString("it-IT", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    <Badge variant="secondary" className="ml-2">
                      {getUserName(day.createdBy)}
                    </Badge>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEditDay(day)}>
                      Modifica
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteDay(day.id)}>
                      Elimina
                    </Button>
                  </div>
                </div>
                <Button size="sm" onClick={() => setIsAddingActivity(day.id)} className="w-fit">
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi Attività
                </Button>
              </CardHeader>
              <CardContent>
                {isEditingDay === day.id && (
                  <Card className="mb-4">
                    <CardContent className="pt-4 space-y-4">
                      <div>
                        <Label htmlFor="edit-date">Modifica Data</Label>
                        <Input
                          id="edit-date"
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={updateDay}>Salva</Button>
                        <Button variant="outline" onClick={() => setIsEditingDay(null)}>
                          Annulla
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {isAddingActivity === day.id && (
                  <Card className="mb-4">
                    <CardContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title">Titolo</Label>
                          <Input
                            id="title"
                            value={newActivity.title}
                            onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="time">Orario</Label>
                          <Input
                            id="time"
                            type="time"
                            value={newActivity.time}
                            onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="location">Posizione</Label>
                        <Input
                          id="location"
                          value={newActivity.location}
                          onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Descrizione</Label>
                        <Textarea
                          id="description"
                          value={newActivity.description}
                          onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="mapUrl">Link Google Maps (opzionale)</Label>
                        <Input
                          id="mapUrl"
                          value={newActivity.mapUrl}
                          onChange={(e) => setNewActivity({ ...newActivity, mapUrl: e.target.value })}
                          placeholder="https://maps.google.com/..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => addOrUpdateActivity(day.id)}>
                          {isEditingActivity ? "Aggiorna" : "Aggiungi"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsAddingActivity(null)
                            setIsEditingActivity(null)
                            setNewActivity({ title: "", description: "", time: "", location: "", mapUrl: "" })
                          }}
                        >
                          Annulla
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {day.activities.map((activity) => (
                    <Dialog key={activity.id}>
                      <DialogTrigger asChild>
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{activity.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {activity.time}
                              <Badge variant="outline" className="ml-2">
                                {getUserName(activity.createdBy)}
                              </Badge>
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {activity.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                {activity.location}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="break-words">{activity.title}</DialogTitle>
                          <DialogDescription className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {activity.time}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pr-2">
                          {activity.location && (
                            <div>
                              <h4 className="font-semibold flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Posizione
                              </h4>
                              <p className="text-gray-600 break-words">{activity.location}</p>
                              {activity.mapUrl && (
                                <Button asChild variant="outline" size="sm" className="mt-2 bg-transparent">
                                  <a href={activity.mapUrl} target="_blank" rel="noopener noreferrer">
                                    Apri su Google Maps
                                  </a>
                                </Button>
                              )}
                            </div>
                          )}
                          {activity.description && (
                            <div>
                              <h4 className="font-semibold">Descrizione</h4>
                              <div className="text-gray-600 whitespace-pre-wrap break-words max-h-60 overflow-y-auto bg-gray-50 p-3 rounded-lg border">
                                {activity.description}
                              </div>
                            </div>
                          )}
                          <div className="text-xs text-gray-500 border-t pt-3">
                            <p>
                              Creata da: <span className="font-medium">{getUserName(activity.createdBy)}</span>
                            </p>
                            <p>
                              Il:{" "}
                              {new Date(activity.createdAt).toLocaleDateString("it-IT", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <div className="flex gap-2 pt-4 border-t">
                            <Button
                              onClick={() => {
                                startEditActivity(activity, day.id)
                                document
                                  .querySelector('[role="dialog"]')
                                  ?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
                              }}
                            >
                              Modifica
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                document
                                  .querySelector('[role="dialog"]')
                                  ?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
                                setTimeout(() => deleteActivity(day.id, activity.id), 100)
                              }}
                            >
                              Elimina
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {vacationDays.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nessun giorno pianificato</h3>
              <p className="text-gray-600 mb-4">Inizia aggiungendo i giorni della tua vacanza</p>
              <Button onClick={() => setIsAddingDay(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Primo Giorno
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
