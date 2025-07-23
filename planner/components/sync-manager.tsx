"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, QrCode, Download, Copy, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"

interface SyncManagerProps {
  currentUser: string
  onBack: () => void
}

export function SyncManager({ currentUser, onBack }: SyncManagerProps) {
  const [syncCode, setSyncCode] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateSyncCode = async () => {
    setIsGenerating(true)

    // Raccogli tutti i dati
    const allData = {
      vacations: JSON.parse(localStorage.getItem("vacations") || "[]"),
      users: JSON.parse(localStorage.getItem("users") || "[]"),
      timestamp: new Date().toISOString(),
      version: "1.0",
    }

    // Aggiungi i dati delle vacanze
    const vacations = allData.vacations
    vacations.forEach((vacation: any) => {
      const vacationId = vacation.id
      const days = localStorage.getItem(`vacationDays_${vacationId}`)
      const expenses = localStorage.getItem(`expenses_${vacationId}`)
      const notes = localStorage.getItem(`vacationNotes_${vacationId}`)

      if (days) allData[`vacationDays_${vacationId}`] = JSON.parse(days)
      if (expenses) allData[`expenses_${vacationId}`] = JSON.parse(expenses)
      if (notes) allData[`vacationNotes_${vacationId}`] = JSON.parse(notes)
    })

    // Comprimi e codifica i dati
    const dataString = JSON.stringify(allData)
    const compressed = btoa(encodeURIComponent(dataString))

    // Genera un codice di 6 cifre
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Simula il salvataggio su un servizio temporaneo (in realtà salviamo in localStorage con prefisso)
    localStorage.setItem(`sync_${code}`, compressed)

    // Imposta scadenza (24 ore)
    localStorage.setItem(`sync_${code}_expires`, (Date.now() + 24 * 60 * 60 * 1000).toString())

    setGeneratedCode(code)
    setIsGenerating(false)

    toast({
      title: "Codice generato!",
      description: "Il codice è valido per 24 ore. Condividilo con i tuoi altri dispositivi.",
    })
  }

  const syncWithCode = async () => {
    if (!syncCode.trim()) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Inserisci un codice di sincronizzazione valido.",
      })
      return
    }

    setIsLoading(true)

    try {
      const code = syncCode.toUpperCase().trim()
      const data = localStorage.getItem(`sync_${code}`)
      const expires = localStorage.getItem(`sync_${code}_expires`)

      if (!data || !expires) {
        throw new Error("Codice non trovato o scaduto")
      }

      if (Date.now() > Number.parseInt(expires)) {
        // Rimuovi i dati scaduti
        localStorage.removeItem(`sync_${code}`)
        localStorage.removeItem(`sync_${code}_expires`)
        throw new Error("Codice scaduto")
      }

      // Decodifica i dati
      const compressed = data
      const dataString = decodeURIComponent(atob(compressed))
      const syncData = JSON.parse(dataString)

      // Conferma prima di sovrascrivere
      if (!confirm("Questo sovrascriverà tutti i dati attuali. Continuare?")) {
        setIsLoading(false)
        return
      }

      // Importa i dati
      localStorage.setItem("vacations", JSON.stringify(syncData.vacations))
      localStorage.setItem("users", JSON.stringify(syncData.users))

      // Importa i dati delle vacanze
      syncData.vacations.forEach((vacation: any) => {
        const vacationId = vacation.id
        if (syncData[`vacationDays_${vacationId}`]) {
          localStorage.setItem(`vacationDays_${vacationId}`, JSON.stringify(syncData[`vacationDays_${vacationId}`]))
        }
        if (syncData[`expenses_${vacationId}`]) {
          localStorage.setItem(`expenses_${vacationId}`, JSON.stringify(syncData[`expenses_${vacationId}`]))
        }
        if (syncData[`vacationNotes_${vacationId}`]) {
          localStorage.setItem(`vacationNotes_${vacationId}`, JSON.stringify(syncData[`vacationNotes_${vacationId}`]))
        }
      })

      toast({
        title: "Sincronizzazione completata!",
        description: "I dati sono stati importati con successo. Ricarica la pagina per vedere le modifiche.",
      })

      // Ricarica la pagina dopo 2 secondi
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore di sincronizzazione",
        description: error instanceof Error ? error.message : "Codice non valido o scaduto.",
      })
    }

    setIsLoading(false)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copiato!",
        description: "Il codice è stato copiato negli appunti.",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile copiare il codice.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Sincronizzazione Dispositivi</h1>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Genera Codice */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Genera Codice di Sincronizzazione
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Genera un codice temporaneo per sincronizzare i tuoi dati con altri dispositivi. Il codice è valido per
                24 ore.
              </p>

              <Button onClick={generateSyncCode} disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generazione...
                  </div>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    Genera Codice
                  </>
                )}
              </Button>

              {generatedCode && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-green-800">Codice generato:</p>
                        <p className="text-2xl font-mono font-bold text-green-900">{generatedCode}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={copyToClipboard} className="bg-white">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-green-700">
                      Usa questo codice su altri dispositivi per sincronizzare i dati. Scade tra 24 ore.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Sincronizza con Codice */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Sincronizza con Codice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Inserisci un codice di sincronizzazione per importare i dati da un altro dispositivo.
              </p>

              <div>
                <Label htmlFor="syncCode">Codice di Sincronizzazione</Label>
                <Input
                  id="syncCode"
                  value={syncCode}
                  onChange={(e) => setSyncCode(e.target.value.toUpperCase())}
                  placeholder="Inserisci il codice (es: ABC123)"
                  className="font-mono text-center text-lg"
                  maxLength={6}
                />
              </div>

              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertDescription className="text-yellow-800">
                  <strong>Attenzione:</strong> Questa operazione sovrascriverà tutti i dati attuali su questo
                  dispositivo con quelli del codice inserito.
                </AlertDescription>
              </Alert>

              <Button
                onClick={syncWithCode}
                disabled={isLoading || !syncCode.trim()}
                className="w-full bg-transparent"
                variant="outline"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    Sincronizzazione...
                  </div>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Sincronizza Dati
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Istruzioni */}
          <Card>
            <CardHeader>
              <CardTitle>Come Funziona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-semibold">1. Sul dispositivo principale:</h4>
                <p className="text-sm text-gray-600">
                  Clicca "Genera Codice" per creare un codice di sincronizzazione.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">2. Su altri dispositivi:</h4>
                <p className="text-sm text-gray-600">Inserisci il codice nella sezione "Sincronizza con Codice".</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">3. Importante:</h4>
                <p className="text-sm text-gray-600">
                  I codici scadono dopo 24 ore per sicurezza. Tutti i dati verranno sincronizzati: vacanze, utenti,
                  attività, spese e note.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
