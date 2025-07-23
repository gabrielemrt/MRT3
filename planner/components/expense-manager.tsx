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
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, Euro, Users, TrendingUp, Edit2, Trash2, Save, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ExpenseManagerProps {
  currentUser: string
  vacationId: string
  onBack: () => void
  onPublishUpdate: () => void
  database: any
}

interface Expense {
  id: string
  title: string
  description: string
  amount: number
  category: string
  paidBy: string
  splitBetween: string[]
  date: string
  createdBy: string
  createdAt: string
}

const expenseCategories = {
  accommodation: { label: "Alloggio", color: "bg-blue-500" },
  transport: { label: "Trasporto", color: "bg-green-500" },
  food: { label: "Cibo", color: "bg-orange-500" },
  activities: { label: "Attività", color: "bg-purple-500" },
  shopping: { label: "Shopping", color: "bg-pink-500" },
  other: { label: "Altro", color: "bg-gray-500" },
}

export function ExpenseManager({ currentUser, vacationId, onBack, onPublishUpdate, database }: ExpenseManagerProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [participants, setParticipants] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingExpense, setEditingExpense] = useState<string | null>(null)
  const [newExpense, setNewExpense] = useState({
    title: "",
    description: "",
    amount: "",
    category: "other",
    paidBy: currentUser,
    splitBetween: [currentUser],
  })
  const [showNewExpenseDialog, setShowNewExpenseDialog] = useState(false)

  useEffect(() => {
    loadExpenses()
    loadParticipants()
  }, [vacationId])

  const loadExpenses = async () => {
    try {
      setIsLoading(true)
      const expenseData = await database.getExpenses(vacationId)
      setExpenses(expenseData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    } catch (error) {
      console.error("Errore nel caricamento spese:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile caricare le spese.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadParticipants = async () => {
    try {
      const vacation = await database.getVacationById(vacationId)
      if (vacation?.participants) {
        setParticipants(vacation.participants.map((p: any) => p.username))
      }
    } catch (error) {
      console.error("Errore nel caricamento partecipanti:", error)
    }
  }

  const handleCreateExpense = async () => {
    if (!newExpense.title || !newExpense.amount || newExpense.splitBetween.length === 0) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Titolo, importo e almeno un partecipante sono obbligatori.",
      })
      return
    }

    try {
      const expenseData = {
        id: `expense_${Date.now()}`,
        ...newExpense,
        amount: Number.parseFloat(newExpense.amount),
        date: new Date().toISOString(),
        createdBy: currentUser,
        createdAt: new Date().toISOString(),
      }

      await database.createExpense(vacationId, expenseData)
      await loadExpenses()
      onPublishUpdate()

      setNewExpense({
        title: "",
        description: "",
        amount: "",
        category: "other",
        paidBy: currentUser,
        splitBetween: [currentUser],
      })
      setShowNewExpenseDialog(false)

      toast({
        title: "Spesa aggiunta",
        description: "La nuova spesa è stata registrata.",
      })
    } catch (error) {
      console.error("Errore nella creazione spesa:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile creare la spesa.",
      })
    }
  }

  const handleUpdateExpense = async (expenseId: string, updates: Partial<Expense>) => {
    try {
      await database.updateExpense(vacationId, expenseId, updates)
      await loadExpenses()
      onPublishUpdate()
      setEditingExpense(null)

      toast({
        title: "Spesa aggiornata",
        description: "Le modifiche sono state salvate.",
      })
    } catch (error) {
      console.error("Errore nell'aggiornamento spesa:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile aggiornare la spesa.",
      })
    }
  }

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa spesa?")) {
      return
    }

    try {
      await database.deleteExpense(vacationId, expenseId)
      await loadExpenses()
      onPublishUpdate()

      toast({
        title: "Spesa eliminata",
        description: "La spesa è stata rimossa.",
      })
    } catch (error) {
      console.error("Errore nell'eliminazione spesa:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile eliminare la spesa.",
      })
    }
  }

  const calculateBalances = () => {
    const balances: { [key: string]: number } = {}

    // Inizializza i saldi
    participants.forEach((participant) => {
      balances[participant] = 0
    })

    // Calcola i saldi
    expenses.forEach((expense) => {
      const amountPerPerson = expense.amount / expense.splitBetween.length

      // Chi ha pagato riceve credito
      balances[expense.paidBy] += expense.amount

      // Chi deve pagare riceve debito
      expense.splitBetween.forEach((person) => {
        balances[person] -= amountPerPerson
      })
    })

    return balances
  }

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0)
  }

  const getExpensesByCategory = () => {
    const categoryTotals: { [key: string]: number } = {}

    expenses.forEach((expense) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount
    })

    return categoryTotals
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Caricamento Spese</h2>
          <p className="text-gray-600">Recupero dei dati in corso...</p>
        </div>
      </div>
    )
  }

  const balances = calculateBalances()
  const totalExpenses = getTotalExpenses()
  const categoryTotals = getExpensesByCategory()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Torna alla Vacanza
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Gestione Spese</h1>
          </div>

          <Dialog open={showNewExpenseDialog} onOpenChange={setShowNewExpenseDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nuova Spesa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Aggiungi Nuova Spesa</DialogTitle>
                <DialogDescription>Registra una nuova spesa per la vacanza</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titolo</Label>
                  <Input
                    id="title"
                    value={newExpense.title}
                    onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                    placeholder="es. Cena al ristorante"
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
                  <Label htmlFor="category">Categoria</Label>
                  <select
                    id="category"
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {Object.entries(expenseCategories).map(([key, { label }]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="paidBy">Pagato da</Label>
                  <select
                    id="paidBy"
                    value={newExpense.paidBy}
                    onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {participants.map((participant) => (
                      <option key={participant} value={participant}>
                        {participant}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Diviso tra</Label>
                  <div className="space-y-2 mt-2">
                    {participants.map((participant) => (
                      <div key={participant} className="flex items-center space-x-2">
                        <Checkbox
                          id={participant}
                          checked={newExpense.splitBetween.includes(participant)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewExpense({
                                ...newExpense,
                                splitBetween: [...newExpense.splitBetween, participant],
                              })
                            } else {
                              setNewExpense({
                                ...newExpense,
                                splitBetween: newExpense.splitBetween.filter((p) => p !== participant),
                              })
                            }
                          }}
                        />
                        <Label htmlFor={participant}>{participant}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Descrizione</Label>
                  <Textarea
                    id="description"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="Dettagli della spesa..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateExpense} className="flex-1">
                    Aggiungi Spesa
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewExpenseDialog(false)}>
                    Annulla
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Riepilogo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale Spese</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{expenses.length} spese registrate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Spesa per Persona</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                €{participants.length > 0 ? (totalExpenses / participants.length).toFixed(2) : "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">Media tra {participants.length} partecipanti</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categoria Principale</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(categoryTotals).length > 0
                  ? expenseCategories[
                      Object.keys(categoryTotals).reduce((a, b) =>
                        categoryTotals[a] > categoryTotals[b] ? a : b,
                      ) as keyof typeof expenseCategories
                    ]?.label || "N/A"
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">Categoria con più spese</p>
            </CardContent>
          </Card>
        </div>

        {/* Saldi */}
        {Object.keys(balances).length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Saldi</CardTitle>
              <CardDescription>Chi deve a chi e quanto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(balances).map(([person, balance]) => (
                  <div
                    key={person}
                    className={`p-4 rounded-lg border ${
                      balance > 0
                        ? "bg-green-50 border-green-200"
                        : balance < 0
                          ? "bg-red-50 border-red-200"
                          : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{person}</span>
                      <span
                        className={`font-bold ${
                          balance > 0 ? "text-green-600" : balance < 0 ? "text-red-600" : "text-gray-600"
                        }`}
                      >
                        €{Math.abs(balance).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {balance > 0 ? "Deve ricevere" : balance < 0 ? "Deve pagare" : "In pari"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista Spese */}
        <Card>
          <CardHeader>
            <CardTitle>Spese Registrate</CardTitle>
            <CardDescription>Cronologia di tutte le spese della vacanza</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenses.length === 0 ? (
                <div className="text-center py-12">
                  <Euro className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessuna spesa registrata</h3>
                  <p className="text-gray-600 mb-4">Inizia aggiungendo la prima spesa</p>
                  <Button onClick={() => setShowNewExpenseDialog(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Aggiungi Prima Spesa
                  </Button>
                </div>
              ) : (
                expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          expenseCategories[expense.category as keyof typeof expenseCategories]?.color || "bg-gray-500"
                        }`}
                      />
                      <div className="flex-1">
                        {editingExpense === expense.id ? (
                          <div className="space-y-2">
                            <Input
                              value={expense.title}
                              onChange={(e) => {
                                const updatedExpenses = expenses.map((exp) =>
                                  exp.id === expense.id ? { ...exp, title: e.target.value } : exp,
                                )
                                setExpenses(updatedExpenses)
                              }}
                              className="font-semibold"
                            />
                            <Input
                              type="number"
                              step="0.01"
                              value={expense.amount}
                              onChange={(e) => {
                                const updatedExpenses = expenses.map((exp) =>
                                  exp.id === expense.id
                                    ? { ...exp, amount: Number.parseFloat(e.target.value) || 0 }
                                    : exp,
                                )
                                setExpenses(updatedExpenses)
                              }}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleUpdateExpense(expense.id, {
                                    title: expense.title,
                                    amount: expense.amount,
                                  })
                                }
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingExpense(null)}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h4 className="font-semibold">{expense.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>Pagato da {expense.paidBy}</span>
                              <span>•</span>
                              <span>Diviso tra {expense.splitBetween.join(", ")}</span>
                              <span>•</span>
                              <span>{new Date(expense.date).toLocaleDateString("it-IT")}</span>
                            </div>
                            {expense.description && <p className="text-sm text-gray-700 mt-1">{expense.description}</p>}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className={`text-white ${
                          expenseCategories[expense.category as keyof typeof expenseCategories]?.color || "bg-gray-500"
                        }`}
                      >
                        {expenseCategories[expense.category as keyof typeof expenseCategories]?.label || "Altro"}
                      </Badge>
                      <span className="font-bold text-lg">€{expense.amount.toFixed(2)}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingExpense(expense.id)}
                          disabled={editingExpense === expense.id}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteExpense(expense.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
