"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Plus, Calendar, MapPin, Clock, Edit2, Trash2, Save, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface VacationPlannerProps {
  currentUser: string
  vacationId: string
  onBack: () => void
  onPublishUpdate: () => void
  database: any
}

interface VacationDay {
  id: string
  date: string
  title: string
  description: string
  activities: Activity[]
}

interface Activity {
  id: string
  time: string
  title: string
  description: string
  location: string
  type: "transport" | "accommodation" | "activity" | "meal" | "other"
}

const activityTypes = {
  transport: { label: "Trasporto", color: "bg-blue-500" },
  accommodation: { label: "Alloggio", color: "bg-green-500" },
  activity: { label: "Attività", color: "bg-purple-500" },
  meal: { label: "Pasto", color: "bg-orange-500" },
  other: { label: "Altro", color: "bg-gray-500" },
}

export function VacationPlanner({ currentUser, vacationId, onBack, onPublishUpdate, database }: VacationPlannerProps) {
  const [days, setDays] = useState<VacationDay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingDay, setEditingDay] = useState<string | null>(null)
  const [editingActivity, setEditingActivity] = useState<{ dayId: string; activityId: string } | null>(null)
  const [newDay, setNewDay] = useState({
    date: "",
    title: "",
    description: "",
  })
  const [newActivity, setNewActivity] = useState({
    time: "",
    title: "",
    description: "",
    location: "",
    type: "activity" as keyof typeof activityTypes,
  })
  const [showNewDayDialog, setShowNewDayDialog] = useState(false)
  const [showNewActivityDialog, setShowNewActivityDialog] = useState<string | null>(null)

  useEffect(() => {
    loadVacationDays()
  }, [vacationId])

  const loadVacationDays = async () => {
    try {
      setIsLoading(true)
      const vacationDays = await database.getVacationDays(vacationId)
      setDays(vacationDays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
    } catch (error) {
      console.error("Errore nel caricamento giorni:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile caricare i giorni della vacanza.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateDay = async () => {
    if (!newDay.date || !newDay.title) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Data e titolo sono obbligatori.",
      })
      return
    }

    try {
      const dayData = {
        id: `day_${Date.now()}`,
        ...newDay,
        activities: [],
      }

      await database.createVacationDay(vacationId, dayData)
      await loadVacationDays()
      onPublishUpdate()

      setNewDay({ date: "", title: "", description: "" })
      setShowNewDayDialog(false)

      toast({
        title: "Giorno aggiunto",
        description: "Il nuovo giorno è stato aggiunto al piano.",
      })
    } catch (error) {
      console.error("Errore nella creazione giorno:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile creare il giorno.",
      })
    }
  }

  const handleUpdateDay = async (dayId: string, updates: Partial<VacationDay>) => {
    try {
      await database.updateVacationDay(vacationId, dayId, updates)
      await loadVacationDays()
      onPublishUpdate()
      setEditingDay(null)

      toast({
        title: "Giorno aggiornato",
        description: "Le modifiche sono state salvate.",
      })
    } catch (error) {
      console.error("Errore nell'aggiornamento giorno:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile aggiornare il giorno.",
      })
    }
  }

  const handleDeleteDay = async (dayId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo giorno e tutte le sue attività?")) {
      return
    }

    try {
      await database.deleteVacationDay(vacationId, dayId)
      await loadVacationDays()
      onPublishUpdate()

      toast({
        title: "Giorno eliminato",
        description: "Il giorno è stato rimosso dal piano.",
      })
    } catch (error) {
      console.error("Errore nell'eliminazione giorno:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile eliminare il giorno.",
      })
    }
  }

  const handleCreateActivity = async (dayId: string) => {
    if (!newActivity.time || !newActivity.title) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Ora e titolo sono obbligatori.",
      })
      return
    }

    try {
      const activityData = {
        id: `activity_${Date.now()}`,
        ...newActivity,
      }

      await database.addActivityToDay(vacationId, dayId, activityData)
      await loadVacationDays()
      onPublishUpdate()

      setNewActivity({
        time: "",
        title: "",
        description: "",
        location: "",
        type: "activity",
      })
      setShowNewActivityDialog(null)

      toast({
        title: "Attività aggiunta",
        description: "La nuova attività è stata aggiunta al giorno.",
      })
    } catch (error) {
      console.error("Errore nella creazione attività:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile creare l'attività.",
      })
    }
  }

  const handleUpdateActivity = async (dayId: string, activityId: string, updates: Partial<Activity>) => {
    try {
      await database.updateActivity(vacationId, dayId, activityId, updates)
      await loadVacationDays()
      onPublishUpdate()
      setEditingActivity(null)

      toast({
        title: "Attività aggiornata",
        description: "Le modifiche sono state salvate.",
      })
    } catch (error) {
      console.error("Errore nell'aggiornamento attività:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile aggiornare l'attività.",
      })
    }
  }

  const handleDeleteActivity = async (dayId: string, activityId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa attività?")) {
      return
    }

    try {
      await database.deleteActivity(vacationId, dayId, activityId)
      await loadVacationDays()
      onPublishUpdate()

      toast({
        title: "Attività eliminata",
        description: "L'attività è stata rimossa dal giorno.",
      })
    } catch (error) {
      console.error("Errore nell'eliminazione attività:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile eliminare l'attività.",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Caricamento Piano</h2>
          <p className="text-gray-600">Recupero dei dati in corso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Torna alla Vacanza
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Piano di Viaggio</h1>
          </div>

          <Dialog open={showNewDayDialog} onOpenChange={setShowNewDayDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Aggiungi Giorno
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aggiungi Nuovo Giorno</DialogTitle>
                <DialogDescription>Crea un nuovo giorno nel piano di viaggio</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newDay.date}
                    onChange={(e) => setNewDay({ ...newDay, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="title">Titolo</Label>
                  <Input
                    id="title"
                    value={newDay.title}
                    onChange={(e) => setNewDay({ ...newDay, title: e.target.value })}
                    placeholder="es. Arrivo a Roma"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrizione</Label>
                  <Textarea
                    id="description"
                    value={newDay.description}
                    onChange={(e) => setNewDay({ ...newDay, description: e.target.value })}
                    placeholder="Descrizione del giorno..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateDay} className="flex-1">
                    Crea Giorno
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewDayDialog(false)}>
                    Annulla
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          {days.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessun giorno pianificato</h3>
                <p className="text-gray-600 mb-4">Inizia creando il primo giorno del tuo viaggio</p>
                <Button onClick={() => setShowNewDayDialog(true)} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Aggiungi Primo Giorno
                </Button>
              </CardContent>
            </Card>
          ) : (
            days.map((day) => (
              <Card key={day.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      {editingDay === day.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={day.title}
                            onChange={(e) => {
                              const updatedDays = days.map((d) =>
                                d.id === day.id ? { ...d, title: e.target.value } : d,
                              )
                              setDays(updatedDays)
                            }}
                            className="font-semibold"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleUpdateDay(day.id, { title: day.title, description: day.description })}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingDay(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <CardTitle>{day.title}</CardTitle>
                          <Badge variant="outline">
                            {new Date(day.date).toLocaleDateString("it-IT", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </Badge>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog
                        open={showNewActivityDialog === day.id}
                        onOpenChange={(open) => setShowNewActivityDialog(open ? day.id : null)}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-1" />
                            Attività
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Aggiungi Attività</DialogTitle>
                            <DialogDescription>Aggiungi una nuova attività a {day.title}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="time">Ora</Label>
                                <Input
                                  id="time"
                                  type="time"
                                  value={newActivity.time}
                                  onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="type">Tipo</Label>
                                <select
                                  id="type"
                                  value={newActivity.type}
                                  onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value as any })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                  {Object.entries(activityTypes).map(([key, { label }]) => (
                                    <option key={key} value={key}>
                                      {label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="activity-title">Titolo</Label>
                              <Input
                                id="activity-title"
                                value={newActivity.title}
                                onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                                placeholder="es. Visita al Colosseo"
                              />
                            </div>
                            <div>
                              <Label htmlFor="location">Luogo</Label>
                              <Input
                                id="location"
                                value={newActivity.location}
                                onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                                placeholder="es. Piazza del Colosseo, Roma"
                              />
                            </div>
                            <div>
                              <Label htmlFor="activity-description">Descrizione</Label>
                              <Textarea
                                id="activity-description"
                                value={newActivity.description}
                                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                                placeholder="Dettagli dell'attività..."
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={() => handleCreateActivity(day.id)} className="flex-1">
                                Aggiungi Attività
                              </Button>
                              <Button variant="outline" onClick={() => setShowNewActivityDialog(null)}>
                                Annulla
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" variant="ghost" onClick={() => setEditingDay(day.id)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteDay(day.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {editingDay === day.id ? (
                    <Textarea
                      value={day.description}
                      onChange={(e) => {
                        const updatedDays = days.map((d) =>
                          d.id === day.id ? { ...d, description: e.target.value } : d,
                        )
                        setDays(updatedDays)
                      }}
                      placeholder="Descrizione del giorno..."
                    />
                  ) : (
                    day.description && <CardDescription>{day.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  {day.activities && day.activities.length > 0 ? (
                    <div className="divide-y">
                      {day.activities
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((activity) => (
                          <div key={activity.id} className="p-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <span className="font-mono text-sm font-medium">{activity.time}</span>
                                </div>
                                <div className="flex-1">
                                  {editingActivity?.dayId === day.id && editingActivity?.activityId === activity.id ? (
                                    <div className="space-y-2">
                                      <Input
                                        value={activity.title}
                                        onChange={(e) => {
                                          const updatedDays = days.map((d) =>
                                            d.id === day.id
                                              ? {
                                                  ...d,
                                                  activities: d.activities.map((a) =>
                                                    a.id === activity.id ? { ...a, title: e.target.value } : a,
                                                  ),
                                                }
                                              : d,
                                          )
                                          setDays(updatedDays)
                                        }}
                                        className="font-semibold"
                                      />
                                      <Input
                                        value={activity.location}
                                        onChange={(e) => {
                                          const updatedDays = days.map((d) =>
                                            d.id === day.id
                                              ? {
                                                  ...d,
                                                  activities: d.activities.map((a) =>
                                                    a.id === activity.id ? { ...a, location: e.target.value } : a,
                                                  ),
                                                }
                                              : d,
                                          )
                                          setDays(updatedDays)
                                        }}
                                        placeholder="Luogo"
                                      />
                                      <Textarea
                                        value={activity.description}
                                        onChange={(e) => {
                                          const updatedDays = days.map((d) =>
                                            d.id === day.id
                                              ? {
                                                  ...d,
                                                  activities: d.activities.map((a) =>
                                                    a.id === activity.id ? { ...a, description: e.target.value } : a,
                                                  ),
                                                }
                                              : d,
                                          )
                                          setDays(updatedDays)
                                        }}
                                        placeholder="Descrizione"
                                      />
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            handleUpdateActivity(day.id, activity.id, {
                                              title: activity.title,
                                              location: activity.location,
                                              description: activity.description,
                                            })
                                          }
                                        >
                                          <Save className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => setEditingActivity(null)}>
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold">{activity.title}</h4>
                                        <Badge
                                          variant="secondary"
                                          className={`text-white ${activityTypes[activity.type].color}`}
                                        >
                                          {activityTypes[activity.type].label}
                                        </Badge>
                                      </div>
                                      {activity.location && (
                                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                                          <MapPin className="w-3 h-3" />
                                          {activity.location}
                                        </div>
                                      )}
                                      {activity.description && (
                                        <p className="text-sm text-gray-700">{activity.description}</p>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 ml-4">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingActivity({ dayId: day.id, activityId: activity.id })}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteActivity(day.id, activity.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>Nessuna attività pianificata per questo giorno</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-transparent"
                        onClick={() => setShowNewActivityDialog(day.id)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Aggiungi Prima Attività
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
