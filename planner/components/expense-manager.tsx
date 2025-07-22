"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, CreditCard, Users, Euro } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Expense {
  id: string
  description: string
  amount: number
  paidBy: string
  sharedWith: string[]
  date: string
  createdAt: string
}

interface User {
  username: string
  password: string
  role: "admin" | "member"
}

interface ExpenseManagerProps {
  currentUser: string
  vacationId: string
  onBack: () => void
}

export function ExpenseManager({ currentUser, vacationId, onBack }: ExpenseManagerProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    paidBy: currentUser,
    sharedWith: [] as string[],
  })

  // Aggiungiamo gli stati e le funzioni per modificare ed eliminare le spese
  const [isEditingExpense, setIsEditingExpense] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const saved = localStorage.getItem(`expenses_${vacationId}`)
    if (saved) {
      setExpenses(JSON.parse(saved))
    }
  }, [vacationId])

  useEffect(() => {
    const savedUsers = localStorage.getItem("users")
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    } else {
      // Fallback agli utenti predefiniti se non ci sono utenti salvati
      import("@/data/users").then(({ users: defaultUsers }) => {
        setUsers(defaultUsers)
      })
    }
  }, [])

  const saveToStorage = (expenseList: Expense[]) => {
    localStorage.setItem(`expenses_${vacationId}`, JSON.stringify(expenseList))
  }

  const addExpense = () => {
    if (!newExpense.description || !newExpense.amount || newExpense.sharedWith.length === 0) return

    const expense: Expense = {
      id: Date.now().toString(),
      description: newExpense.description,
      amount: Number.parseFloat(newExpense.amount),
      paidBy: newExpense.paidBy,
      sharedWith: newExpense.sharedWith,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    const updatedExpenses = [...expenses, expense]
    setExpenses(updatedExpenses)
    saveToStorage(updatedExpenses)

    setNewExpense({ description: "", amount: "", paidBy: currentUser, sharedWith: [] })
    setIsAddingExpense(false)
  }

  // Modifichiamo la funzione addExpense per gestire sia l'aggiunta che la modifica
  const addOrUpdateExpense = () => {
    if (isEditingExpense) {
      updateExpense()
    } else {
      addExpense()
    }
  }

  const toggleSharedWith = (username: string) => {
    setNewExpense((prev) => ({
      ...prev,
      sharedWith: prev.sharedWith.includes(username)
        ? prev.sharedWith.filter((u) => u !== username)
        : [...prev.sharedWith, username],
    }))
  }

  // Aggiungi queste funzioni prima di calculateBalances()
  const deleteExpense = (expenseId: string) => {
    if (confirm("Sei sicuro di voler eliminare questa spesa?")) {
      const updatedExpenses = expenses.filter((expense) => expense.id !== expenseId)
      setExpenses(updatedExpenses)
      saveToStorage(updatedExpenses)
    }
  }

  const startEditExpense = (expense: Expense) => {
    setIsEditingExpense(expense.id)
    setNewExpense({
      description: expense.description,
      amount: expense.amount.toString(),
      paidBy: expense.paidBy,
      sharedWith: [...expense.sharedWith],
    })
    setIsAddingExpense(true)
  }

  const updateExpense = () => {
    if (!newExpense.description || !newExpense.amount || newExpense.sharedWith.length === 0 || !isEditingExpense) return

    const updatedExpenses = expenses.map((expense) => {
      if (expense.id === isEditingExpense) {
        return {
          ...expense,
          description: newExpense.description,
          amount: Number.parseFloat(newExpense.amount),
          paidBy: newExpense.paidBy,
          sharedWith: newExpense.sharedWith,
        }
      }
      return expense
    })

    setExpenses(updatedExpenses)
    saveToStorage(updatedExpenses)

    setNewExpense({ description: "", amount: "", paidBy: currentUser, sharedWith: [] })
    setIsAddingExpense(false)
    setIsEditingExpense(null)
  }

  const calculateBalances = () => {
    const balances: { [key: string]: { [key: string]: number } } = {}

    // Initialize balances
    users.forEach((user) => {
      balances[user.username] = {}
      users.forEach((otherUser) => {
        if (user.username !== otherUser.username) {
          balances[user.username][otherUser.username] = 0
        }
      })
    })

    // Calculate balances from expenses
    expenses.forEach((expense) => {
      const amountPerPerson = expense.amount / expense.sharedWith.length

      expense.sharedWith.forEach((person) => {
        if (person !== expense.paidBy) {
          balances[person][expense.paidBy] += amountPerPerson
        }
      })
    })

    return balances
  }

  const balances = calculateBalances()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla Vacanza
          </Button>
          <h1 className="text-2xl font-bold">Gestione Spese</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Expense Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Aggiungi Spesa
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isAddingExpense ? (
                  <Button onClick={() => setIsAddingExpense(true)} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuova Spesa
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="description">Descrizione</Label>
                      <Input
                        id="description"
                        value={newExpense.description}
                        onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                        placeholder="Es: Cena al ristorante"
                      />
                    </div>

                    <div>
                      <Label htmlFor="amount">Importo (€)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="paidBy">Pagato da</Label>
                      <Select
                        value={newExpense.paidBy}
                        onValueChange={(value) => setNewExpense({ ...newExpense, paidBy: value })}
                      >
                        <SelectTrigger id="paidBy">
                          <SelectValue placeholder="Seleziona chi ha pagato" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.username} value={user.username}>
                              {user.username} {user.username === currentUser ? "(Tu)" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Condiviso con:</Label>
                      <div className="space-y-2 mt-2">
                        {users.map((user) => (
                          <div key={user.username} className="flex items-center space-x-2">
                            <Checkbox
                              id={user.username}
                              checked={newExpense.sharedWith.includes(user.username)}
                              onCheckedChange={() => toggleSharedWith(user.username)}
                            />
                            <Label htmlFor={user.username}>
                              {user.username} {user.username === currentUser ? "(Tu)" : ""}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={addOrUpdateExpense}>
                        {isEditingExpense ? "Aggiorna Spesa" : "Aggiungi Spesa"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingExpense(false)
                          setIsEditingExpense(null)
                          setNewExpense({ description: "", amount: "", paidBy: currentUser, sharedWith: [] })
                        }}
                      >
                        Annulla
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expenses List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Spese Recenti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenses.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nessuna spesa registrata</p>
                  ) : (
                    expenses
                      .slice()
                      .reverse()
                      .map((expense) => (
                        <div key={expense.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{expense.description}</h4>
                            <span className="font-bold text-green-600">€{expense.amount.toFixed(2)}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>
                              Pagato da:{" "}
                              <span className="font-medium">
                                {expense.paidBy} {expense.paidBy === currentUser ? "(Tu)" : ""}
                              </span>
                            </p>
                            <p>
                              Condiviso con: <span className="font-medium">{expense.sharedWith.join(", ")}</span>
                            </p>
                            <p>Data: {new Date(expense.date).toLocaleDateString("it-IT")}</p>
                            <p className="text-xs text-gray-500">
                              Creata il:{" "}
                              {new Date(expense.createdAt).toLocaleDateString("it-IT", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {(expense.paidBy === currentUser || currentUser === "admin") && (
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" variant="outline" onClick={() => startEditExpense(expense)}>
                                Modifica
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => deleteExpense(expense.id)}>
                                Elimina
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Balances Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Riepilogo Debiti
                </CardTitle>
                <CardDescription>Chi deve soldi a chi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.username} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Euro className="w-4 h-4" />
                        {user.username} {user.username === currentUser ? "(Tu)" : ""}
                      </h4>
                      <div className="space-y-2">
                        {users
                          .filter((otherUser) => otherUser.username !== user.username)
                          .map((otherUser) => {
                            const amount = balances[user.username][otherUser.username]
                            const owedAmount = balances[otherUser.username][user.username]
                            const netAmount = amount - owedAmount

                            if (Math.abs(netAmount) < 0.01) return null

                            return (
                              <div key={otherUser.username} className="flex justify-between items-center text-sm">
                                <span>
                                  {netAmount > 0 ? `Deve a ${otherUser.username}:` : `${otherUser.username} gli deve:`}
                                </span>
                                <span className={`font-semibold ${netAmount > 0 ? "text-red-600" : "text-green-600"}`}>
                                  €{Math.abs(netAmount).toFixed(2)}
                                </span>
                              </div>
                            )
                          })}
                        {users
                          .filter((otherUser) => otherUser.username !== user.username)
                          .every((otherUser) => {
                            const amount = balances[user.username][otherUser.username]
                            const owedAmount = balances[otherUser.username][user.username]
                            const netAmount = amount - owedAmount
                            return Math.abs(netAmount) < 0.01
                          }) && <p className="text-gray-500 text-sm">Nessun debito</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
