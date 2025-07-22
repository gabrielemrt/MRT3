"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Trash2, UserCog, Save, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import type { User } from "@/data/users"

interface UserManagerProps {
  currentUser: string
  onBack: () => void
}

export function UserManager({ currentUser, onBack }: UserManagerProps) {
  const [users, setUsers] = useState<User[]>([])
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [newUser, setNewUser] = useState<User>({
    username: "",
    password: "",
    role: "member",
  })

  useEffect(() => {
    // Carica gli utenti dal localStorage o dal modulo predefinito
    const savedUsers = localStorage.getItem("users")
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    } else {
      // Importa gli utenti predefiniti
      import("@/data/users").then(({ users: defaultUsers }) => {
        setUsers(defaultUsers)
        localStorage.setItem("users", JSON.stringify(defaultUsers))
      })
    }
  }, [])

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
  }

  const addUser = () => {
    if (!newUser.username || !newUser.password) {
      alert("Username e password sono obbligatori")
      return
    }

    if (users.some((user) => user.username === newUser.username)) {
      alert("Username già in uso")
      return
    }

    const updatedUsers = [...users, newUser]
    saveUsers(updatedUsers)
    setNewUser({ username: "", password: "", role: "member" })
    setIsAddingUser(false)
  }

  const startEditUser = (user: User) => {
    setEditingUserId(user.username)
    setNewUser({ ...user })
  }

  const updateUser = () => {
    if (!newUser.username || !newUser.password) {
      alert("Username e password sono obbligatori")
      return
    }

    // Se stiamo cambiando lo username, verifichiamo che non sia già in uso
    if (editingUserId !== newUser.username && users.some((user) => user.username === newUser.username)) {
      alert("Username già in uso")
      return
    }

    const updatedUsers = users.map((user) => (user.username === editingUserId ? { ...newUser } : user))
    saveUsers(updatedUsers)
    setNewUser({ username: "", password: "", role: "member" })
    setEditingUserId(null)
  }

  const deleteUser = (username: string) => {
    if (username === currentUser) {
      alert("Non puoi eliminare il tuo account")
      return
    }

    if (username === "admin") {
      alert("Non puoi eliminare l'account amministratore principale")
      return
    }

    if (confirm(`Sei sicuro di voler eliminare l'utente ${username}?`)) {
      const updatedUsers = users.filter((user) => user.username !== username)
      saveUsers(updatedUsers)
    }
  }

  const cancelEdit = () => {
    setEditingUserId(null)
    setNewUser({ username: "", password: "", role: "member" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Gestione Utenti</h1>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Add User Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="w-5 h-5" />
                {editingUserId ? "Modifica Utente" : "Aggiungi Utente"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isAddingUser && !editingUserId ? (
                <Button onClick={() => setIsAddingUser(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuovo Utente
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        placeholder="Username"
                        disabled={editingUserId === "admin"}
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        placeholder="Password"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="admin-role"
                      checked={newUser.role === "admin"}
                      onCheckedChange={(checked) => setNewUser({ ...newUser, role: checked ? "admin" : "member" })}
                      disabled={editingUserId === "admin"}
                    />
                    <Label htmlFor="admin-role">Amministratore</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={editingUserId ? updateUser : addUser}>
                      <Save className="w-4 h-4 mr-2" />
                      {editingUserId ? "Salva Modifiche" : "Aggiungi Utente"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (editingUserId) {
                          cancelEdit()
                        } else {
                          setIsAddingUser(false)
                          setNewUser({ username: "", password: "", role: "member" })
                        }
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Annulla
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>Utenti Registrati</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.username}
                    className={`border rounded-lg p-4 ${
                      editingUserId === user.username ? "border-blue-500 bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{user.username}</h3>
                          {user.role === "admin" && <Badge>Amministratore</Badge>}
                          {user.username === currentUser && <Badge variant="outline">Tu</Badge>}
                        </div>
                        <p className="text-sm text-gray-500">Password: {user.password}</p>
                      </div>
                      <div className="flex gap-2">
                        {editingUserId !== user.username && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => startEditUser(user)}>
                              Modifica
                            </Button>
                            {user.username !== "admin" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteUser(user.username)}
                                disabled={user.username === currentUser}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
