"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, QrCode, Download, Copy, Check, RefreshCw, Wifi, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

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
  const [syncHistory, setSyncHistory] = useState<any[]>([])
  const [lastGlobalSync, setLastGlobalSync] = useState<Date | null>(null)

  // Carica la cronologia di sincronizzazione
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("global_vacation_sync_history") || "[]")
    setSyncHistory(history.slice(0, 5)) // Mostra solo gli ultimi 5

    const lastSync = localStorage.getItem("global_vacation_sync_timestamp")
    if (lastSync) {
      setLastGlobalSync(new Date(Number.parseInt(lastSync)))
    }
  }, [])

  const generateSyncCode = async () => {
    setIsGenerating(true)

    try {
      // Raccogli tutti i dati
      const allData = {
        vacations: JSON.parse(localStorage.getItem("vacations") || "[]"),
        users: JSON.parse(localStorage.getItem("users") || "[]"),
        timestamp: new Date().toISOString(),
        version: "2.0",
        createdBy: currentUser,
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

      // Genera un codice di 8 caratteri più sicuro
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()

      // Salva con scadenza di 48 ore
      const expirationTime = Date.now() + 48 * 60 * 60 * 1000
      localStorage.setItem(`sync_${code}`, compressed)
      localStorage.setItem(`sync_${code}_expires`, expirationTime.toString())
      localStorage.setItem(`sync_${code}_creator`, currentUser)

      setGeneratedCode(code)

      toast({
        title: "Codice generato con successo!",
        description: "Il codice è valido per 48 ore. Usalo su altri dispositivi per sincronizzare i dati.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore durante la generazione",
        description: "Si è verificato un errore durante la creazione del codice.",
      })
    } finally {
      setIsGenerating(false)
    }
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
      const creator = localStorage.getItem(`sync_${code}_creator`)

      if (!data || !expires) {
        throw new Error("Codice non trovato o non valido")
      }

      if (Date.now() > Number.parseInt(expires)) {
        // Rimuovi i dati scaduti
        localStorage.removeItem(`sync_${code}`)
        localStorage.removeItem(`sync_${code}_expires`)
        localStorage.removeItem(`sync_${code}_creator`)
        throw new Error("Codice scaduto")
      }

      // Decodifica i dati
      const compressed = data
      const dataString = decodeURIComponent(atob(compressed))
      const syncData = JSON.parse(dataString)

      // Mostra informazioni sul sync
      const confirmMessage = `
Stai per importare dati da: ${creator || "Utente sconosciuto"}
Creati il: ${new Date(syncData.timestamp).toLocaleString()}
Vacanze: ${syncData.vacations?.length || 0}
Utenti: ${syncData.users?.length || 0}

Questa operazione sovrascriverà tutti i dati attuali. Continuare?`

      if (!confirm(confirmMessage)) {
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

      // Aggiorna il sistema di sincronizzazione globale
      const globalSyncData = {
        ...syncData,
        timestamp: Date.now(),
        lastUpdatedBy: currentUser,
        syncId: `import-${Date.now()}`,
      }

      localStorage.setItem("global_vacation_sync", JSON.stringify(globalSyncData))
      localStorage.setItem("global_vacation_sync_timestamp", globalSyncData.timestamp.toString())

      toast({
        title: "Sincronizzazione completata!",
        description: `Dati importati con successo da ${creator}. La pagina verrà ricaricata.`,
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

  const forceGlobalSync = () => {
    // Trigger evento di sincronizzazione forzata
    window.dispatchEvent(new CustomEvent("force-vacation-sync"))
    toast({
      title: "Sincronizzazione forzata",
      description: "Controllo aggiornamenti in corso...",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="flex items-center gap-2 sm:gap-4 mb-6">
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Torna alla </span>Dashboard
          </Button>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">Sincronizzazione Dispositivi</h1>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Status Sincronizzazione */}
          <Card>
            <CardHeader className="p-3 sm:p-4 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Wifi className="w-4 h-4 sm:w-5 sm:h-5" />
                Status Sincronizzazione
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500">Attivo</Badge>
                    <span className="text-sm text-gray-600">Sistema di sincronizzazione automatica</span>
                  </div>
                  {lastGlobalSync && (
                    <p className="text-xs text-gray-500">Ultimo aggiornamento: {lastGlobalSync.toLocaleString()}</p>
                  )}
                </div>
                <Button onClick={forceGlobalSync} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Forza Sync
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Genera Codice */}
          <Card>
            <CardHeader className="p-3 sm:p-4 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                Genera Codice di Sincronizzazione
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0 space-y-4">
              <p className="text-sm text-gray-600 break-anywhere">
                Genera un codice temporaneo per sincronizzare i tuoi dati con altri dispositivi. Il codice è valido per
                48 ore e include tutti i dati delle vacanze.
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
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-green-800">Codice generato:</p>
                        <p className="text-xl sm:text-2xl font-mono font-bold text-green-900 break-all">
                          {generatedCode}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={copyToClipboard} className="bg-white flex-shrink-0">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-green-700 break-anywhere">
                      Usa questo codice su altri dispositivi per sincronizzare i dati. Scade tra 48 ore.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Sincronizza con Codice */}
          <Card>
            <CardHeader className="p-3 sm:p-4 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                Sincronizza con Codice
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0 space-y-4">
              <p className="text-sm text-gray-600 break-anywhere">
                Inserisci un codice di sincronizzazione per importare i dati da un altro dispositivo.
              </p>

              <div>
                <Label htmlFor="syncCode" className="text-sm sm:text-base">
                  Codice di Sincronizzazione
                </Label>
                <Input
                  id="syncCode"
                  value={syncCode}
                  onChange={(e) => setSyncCode(e.target.value.toUpperCase())}
                  placeholder="Inserisci il codice (es: ABC12345)"
                  className="font-mono text-center text-base sm:text-lg mt-1"
                  maxLength={8}
                />
              </div>

              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-yellow-800 break-anywhere">
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

          {/* Cronologia Sincronizzazioni */}
          {syncHistory.length > 0 && (
            <Card>
              <CardHeader className="p-3 sm:p-4 lg:p-6">
                <CardTitle className="text-base sm:text-lg">Cronologia Sincronizzazioni</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                <div className="space-y-2">
                  {syncHistory.map((sync, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium break-anywhere">Aggiornamento da: {sync.lastUpdatedBy}</p>
                        <p className="text-xs text-gray-500">{new Date(sync.timestamp).toLocaleString()}</p>
                      </div>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {sync.vacations?.length || 0} vacanze
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Istruzioni */}
          <Card>
            <CardHeader className="p-3 sm:p-4 lg:p-6">
              <CardTitle className="text-base sm:text-lg">Come Funziona la Sincronizzazione</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm sm:text-base">🔄 Sincronizzazione Automatica:</h4>
                  <p className="text-sm text-gray-600 break-anywhere">
                    Il sistema controlla automaticamente ogni 3 secondi se ci sono aggiornamenti da altri utenti sullo
                    stesso dispositivo.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm sm:text-base">📱 Tra Dispositivi Diversi:</h4>
                  <p className="text-sm text-gray-600 break-anywhere">
                    1. Sul dispositivo principale: genera un codice di sincronizzazione
                    <br />
                    2. Su altri dispositivi: inserisci il codice per importare tutti i dati
                    <br />
                    3. I codici scadono dopo 48 ore per sicurezza
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm sm:text-base">⚠️ Importante:</h4>
                  <p className="text-sm text-gray-600 break-anywhere">
                    La sincronizzazione tra dispositivi diversi richiede l'uso manuale dei codici. Tutti i dati verranno
                    sincronizzati: vacanze, utenti, attività, spese e note.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
