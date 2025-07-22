"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, StickyNote, Calendar, User } from "lucide-react"
import type { User as UserType } from "@/data/users"

interface Note {
  id: string
  title: string
  content: string
  createdBy: string
  createdAt: string
  updatedAt?: string
}

interface NotesManagerProps {
  currentUser: string
  vacationId: string
  onBack: () => void
}

export function NotesManager({ currentUser, vacationId, onBack }: NotesManagerProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [isEditingNote, setIsEditingNote] = useState<string | null>(null)
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
  })
  const [users, setUsers] = useState<UserType[]>([])

  useEffect(() => {
    const saved = localStorage.getItem(`vacationNotes_${vacationId}`)
    if (saved) {
      setNotes(JSON.parse(saved))
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

  const saveToStorage = (notesList: Note[]) => {
    localStorage.setItem(`vacationNotes_${vacationId}`, JSON.stringify(notesList))
  }

  const addNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      createdBy: currentUser,
      createdAt: new Date().toISOString(),
    }

    const updatedNotes = [note, ...notes]
    setNotes(updatedNotes)
    saveToStorage(updatedNotes)

    setNewNote({ title: "", content: "" })
    setIsAddingNote(false)
  }

  const updateNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim() || !isEditingNote) return

    const updatedNotes = notes.map((note) => {
      if (note.id === isEditingNote) {
        return {
          ...note,
          title: newNote.title,
          content: newNote.content,
          updatedAt: new Date().toISOString(),
        }
      }
      return note
    })

    setNotes(updatedNotes)
    saveToStorage(updatedNotes)

    setNewNote({ title: "", content: "" })
    setIsEditingNote(null)
    setIsAddingNote(false)
  }

  const deleteNote = (noteId: string) => {
    if (confirm("Sei sicuro di voler eliminare questa nota?")) {
      const updatedNotes = notes.filter((note) => note.id !== noteId)
      setNotes(updatedNotes)
      saveToStorage(updatedNotes)
    }
  }

  const startEditNote = (note: Note) => {
    setIsEditingNote(note.id)
    setNewNote({
      title: note.title,
      content: note.content,
    })
    setIsAddingNote(true)
  }

  const addOrUpdateNote = () => {
    if (isEditingNote) {
      updateNote()
    } else {
      addNote()
    }
  }

  const getUserName = (username: string) => {
    const user = users.find((u) => u.username === username)
    return user ? user.username : username
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla Vacanza
          </Button>
          <h1 className="text-2xl font-bold">Note Condivise</h1>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Add Note Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {isEditingNote ? "Modifica Nota" : "Aggiungi Nota"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isAddingNote ? (
                <Button onClick={() => setIsAddingNote(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuova Nota
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titolo</Label>
                    <Input
                      id="title"
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      placeholder="Inserisci il titolo della nota..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Contenuto</Label>
                    <Textarea
                      id="content"
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      placeholder="Scrivi qui il contenuto della nota..."
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={addOrUpdateNote}>{isEditingNote ? "Aggiorna Nota" : "Aggiungi Nota"}</Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingNote(false)
                        setIsEditingNote(null)
                        setNewNote({ title: "", content: "" })
                      }}
                    >
                      Annulla
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes List */}
          <div className="space-y-4">
            {notes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <StickyNote className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nessuna nota presente</h3>
                  <p className="text-gray-600 mb-4">Inizia aggiungendo la prima nota per il gruppo</p>
                  <Button onClick={() => setIsAddingNote(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi Prima Nota
                  </Button>
                </CardContent>
              </Card>
            ) : (
              notes.map((note) => (
                <Card key={note.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{note.title}</CardTitle>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {getUserName(note.createdBy)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Creata il{" "}
                            {new Date(note.createdAt).toLocaleDateString("it-IT", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          {note.updatedAt && (
                            <Badge variant="outline" className="text-xs">
                              Modificata il{" "}
                              {new Date(note.updatedAt).toLocaleDateString("it-IT", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {note.createdBy === currentUser && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEditNote(note)}>
                            Modifica
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteNote(note.id)}>
                            Elimina
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <p className="text-gray-700 whitespace-pre-wrap break-words">{note.content}</p>
                    </div>
                    {note.createdBy !== currentUser && (
                      <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>Nota creata da {getUserName(note.createdBy)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
