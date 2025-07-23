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
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, StickyNote } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface NotesManagerProps {
  currentUser: string
  vacationId: string
  onBack: () => void
  onPublishUpdate: () => void
  database: any
}

interface Note {
  id: string
  title: string
  content: string
  category: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

const noteCategories = {
  general: { label: "Generale", color: "bg-blue-500" },
  important: { label: "Importante", color: "bg-red-500" },
  ideas: { label: "Idee", color: "bg-purple-500" },
  reminders: { label: "Promemoria", color: "bg-orange-500" },
  contacts: { label: "Contatti", color: "bg-green-500" },
  other: { label: "Altro", color: "bg-gray-500" },
}

export function NotesManager({ currentUser, vacationId, onBack, onPublishUpdate, database }: NotesManagerProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    category: "general",
  })
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    loadNotes()
  }, [vacationId])

  const loadNotes = async () => {
    try {
      setIsLoading(true)
      const noteData = await database.getNotes(vacationId)
      setNotes(noteData.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()))
    } catch (error) {
      console.error("Errore nel caricamento note:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile caricare le note.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNote = async () => {
    if (!newNote.title || !newNote.content) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Titolo e contenuto sono obbligatori.",
      })
      return
    }

    try {
      const noteData = {
        id: `note_${Date.now()}`,
        ...newNote,
        createdBy: currentUser,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await database.createNote(vacationId, noteData)
      await loadNotes()
      onPublishUpdate()

      setNewNote({ title: "", content: "", category: "general" })
      setShowNewNoteDialog(false)

      toast({
        title: "Nota aggiunta",
        description: "La nuova nota è stata salvata.",
      })
    } catch (error) {
      console.error("Errore nella creazione nota:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile creare la nota.",
      })
    }
  }

  const handleUpdateNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      await database.updateNote(vacationId, noteId, updatedData)
      await loadNotes()
      onPublishUpdate()
      setEditingNote(null)

      toast({
        title: "Nota aggiornata",
        description: "Le modifiche sono state salvate.",
      })
    } catch (error) {
      console.error("Errore nell'aggiornamento nota:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile aggiornare la nota.",
      })
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa nota?")) {
      return
    }

    try {
      await database.deleteNote(vacationId, noteId)
      await loadNotes()
      onPublishUpdate()

      toast({
        title: "Nota eliminata",
        description: "La nota è stata rimossa.",
      })
    } catch (error) {
      console.error("Errore nell'eliminazione nota:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile eliminare la nota.",
      })
    }
  }

  const filteredNotes = selectedCategory === "all" ? notes : notes.filter((note) => note.category === selectedCategory)

  const getCategoryStats = () => {
    const stats: { [key: string]: number } = {}
    notes.forEach((note) => {
      stats[note.category] = (stats[note.category] || 0) + 1
    })
    return stats
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Caricamento Note</h2>
          <p className="text-gray-600">Recupero dei dati in corso...</p>
        </div>
      </div>
    )
  }

  const categoryStats = getCategoryStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Torna alla Vacanza
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Note Condivise</h1>
          </div>

          <Dialog open={showNewNoteDialog} onOpenChange={setShowNewNoteDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nuova Nota
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Aggiungi Nuova Nota</DialogTitle>
                <DialogDescription>Crea una nuova nota condivisa per la vacanza</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titolo</Label>
                  <Input
                    id="title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    placeholder="es. Informazioni hotel"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <select
                    id="category"
                    value={newNote.category}
                    onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {Object.entries(noteCategories).map(([key, { label }]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="content">Contenuto</Label>
                  <Textarea
                    id="content"
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    placeholder="Scrivi qui il contenuto della nota..."
                    rows={6}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateNote} className="flex-1">
                    Crea Nota
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewNoteDialog(false)}>
                    Annulla
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtri per categoria */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtra per Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                Tutte ({notes.length})
              </Button>
              {Object.entries(noteCategories).map(([key, { label, color }]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                  className={selectedCategory === key ? `${color} text-white` : ""}
                >
                  {label} ({categoryStats[key] || 0})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lista Note */}
        <div className="space-y-4">
          {filteredNotes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <StickyNote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedCategory === "all" ? "Nessuna nota trovata" : "Nessuna nota in questa categoria"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedCategory === "all"
                    ? "Inizia creando la prima nota condivisa"
                    : "Cambia categoria o crea una nuova nota"}
                </p>
                <Button onClick={() => setShowNewNoteDialog(true)} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Aggiungi Prima Nota
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredNotes.map((note) => (
              <Card key={note.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {editingNote === note.id ? (
                        <div className="space-y-3">
                          <Input
                            value={note.title}
                            onChange={(e) => {
                              const updatedNotes = notes.map((n) =>
                                n.id === note.id ? { ...n, title: e.target.value } : n,
                              )
                              setNotes(updatedNotes)
                            }}
                            className="font-semibold text-lg"
                          />
                          <select
                            value={note.category}
                            onChange={(e) => {
                              const updatedNotes = notes.map((n) =>
                                n.id === note.id ? { ...n, category: e.target.value } : n,
                              )
                              setNotes(updatedNotes)
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                          >
                            {Object.entries(noteCategories).map(([key, { label }]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg">{note.title}</CardTitle>
                            <Badge
                              variant="secondary"
                              className={`text-white ${
                                noteCategories[note.category as keyof typeof noteCategories]?.color || "bg-gray-500"
                              }`}
                            >
                              {noteCategories[note.category as keyof typeof noteCategories]?.label || "Altro"}
                            </Badge>
                          </div>
                          <CardDescription>
                            Creata da {note.createdBy} il {new Date(note.createdAt).toLocaleDateString("it-IT")}
                            {note.updatedAt !== note.createdAt && (
                              <span> • Modificata il {new Date(note.updatedAt).toLocaleDateString("it-IT")}</span>
                            )}
                          </CardDescription>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {editingNote === note.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateNote(note.id, {
                                title: note.title,
                                category: note.category,
                                content: note.content,
                              })
                            }
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingNote(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => setEditingNote(note.id)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteNote(note.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingNote === note.id ? (
                    <Textarea
                      value={note.content}
                      onChange={(e) => {
                        const updatedNotes = notes.map((n) =>
                          n.id === note.id ? { ...n, content: e.target.value } : n,
                        )
                        setNotes(updatedNotes)
                      }}
                      rows={6}
                      className="w-full"
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">{note.content}</div>
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
