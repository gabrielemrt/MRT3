"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Plus, Users, Edit2, Trash2, Save, X, Shield, User } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface UserManagerProps {
  currentUser: string
  onBack: () => void
  onPublishUpdate: () => void
  database: any
}

export function UserManager({ currentUser, onBack, onPublishUpdate, database }: UserManagerProps) {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    role: "member" as "admin" | "member",
  })
  const [showNewUserDialog, setShowNewUserDialog] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const userData = await database.getUsers()
      setUsers(userData)
    } catch (error) {
      console.error("Errore nel caricamento utenti:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile caricare gli utenti.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.email) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Username e email sono obbligatori.",
      })
      return
    }

    // Controlla se l'username esiste già
    if (users.some((user) => user.username === newUser.username)) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Username già esistente.",
      })
      return
    }

    try {
      const userData = {
        ...newUser,
        createdAt: new Date().toISOString(),
        lastLogin: null,
      }

      await database.createUser(userData)
      await loadUsers()
      onPublishUpdate()

      setNewUser({ username: "", email: "", role: "member" })
      setShowNewUserDialog(false)

      toast({
        title: "Utente creato",
        description: `L'utente ${userData.username} è stato creato con successo.`,
      })
    } catch (error) {
      console.error("Errore nella creazione utente:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile creare l'utente.",
      })
    }
  }

  const handleUpdateUser = async (username: string, updates: any) => {
    try {
      await database.updateUser(username, updates)
      await loadUsers()
      onPublishUpdate()
      setEditingUser(null)

      toast({
        title: "Utente aggiornato",
        description: "Le modifiche sono state salvate.",
      })
    } catch (error) {
      console.error("Errore nell'aggiornamento utente:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile aggiornare l'utente.",
      })
    }
  }

  const handleDeleteUser = async (username: string) => {
    if (username === currentUser) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Non puoi eliminare il tuo account.",
      })
      return
    }

    if (username === "admin") {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Non puoi eliminare l'account amministratore principale.",
      })
      return
    }

    if (!confirm(`Sei sicuro di voler eliminare l'utente ${username}?`)) {
      return
    }

    try {
      await database.deleteUser(username)
      await loadUsers()
      onPublishUpdate()

      toast({
        title: "Utente eliminato",
        description: `L'utente ${username} è stato eliminato.`,
      })
    } catch (error) {
      console.error("Errore nell'eliminazione utente:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile eliminare l'utente.",
      })
    }
  }

  const handleToggleRole = async (username: string, currentRole: string) => {
    if (username === "admin") {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Non puoi modificare il ruolo dell'amministratore principale.",
      })
      return
    }

    const newRole = currentRole === "admin" ? "member" : "admin"
    await handleUpdateUser(username, { role: newRole })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Caricamento Utenti</h2>
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
              Torna alla Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Gestione Utenti</h1>
          </div>

          <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nuovo Utente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crea Nuovo Utente</DialogTitle>
                <DialogDescription>Aggiungi un nuovo utente al sistema</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="es. mario.rossi"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="es. mario.rossi@email.com"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="role">Ruolo Amministratore</Label>
                  <Switch
                    id="role"
                    checked={newUser.role === "admin"}
                    onCheckedChange={(checked) => setNewUser({ ...newUser, role: checked ? "admin" : "member" })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateUser} className="flex-1">
                    Crea Utente
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewUserDialog(false)}>
                    Annulla
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {users.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessun utente trovato</h3>
                <p className="text-gray-600 mb-4">Inizia creando il primo utente</p>
                <Button onClick={() => setShowNewUserDialog(true)} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Crea Primo Utente
                </Button>
              </CardContent>
            </Card>
          ) : (
            users.map((user) => (
              <Card key={user.username} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        {editingUser === user.username ? (
                          <div className="space-y-2">
                            <Input
                              value={user.email}
                              onChange={(e) => {
                                const updatedUsers = users.map((u) =>
                                  u.username === user.username ? { ...u, email: e.target.value } : u,
                                )
                                setUsers(updatedUsers)
                              }}
                              placeholder="Email"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleUpdateUser(user.username, { email: user.email })}>
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingUser(null)}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <CardTitle className="flex items-center gap-2">
                              {user.username}
                              {user.username === currentUser && <Badge variant="secondary">Tu</Badge>}
                            </CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {user.role === "admin" ? (
                          <Shield className="w-4 h-4 text-orange-500" />
                        ) : (
                          <User className="w-4 h-4 text-gray-500" />
                        )}
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role === "admin" ? "Amministratore" : "Membro"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={user.role === "admin"}
                          onCheckedChange={() => handleToggleRole(user.username, user.role)}
                          disabled={user.username === "admin"}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingUser(user.username)}
                          disabled={editingUser === user.username}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteUser(user.username)}
                          disabled={user.username === currentUser || user.username === "admin"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Creato il:</span>
                      <p>{new Date(user.createdAt).toLocaleDateString("it-IT")}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Ultimo accesso:</span>
                      <p>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("it-IT") : "Mai"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
