"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, RefreshCw, Trash2, Download, Monitor, Wifi } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { cloudSync } from "@/lib/cloud-sync"

interface SyncManagerProps {
  currentUser: string
  onBack: () => void
  database: any
}

export function SyncManager({ currentUser, onBack, database }: SyncManagerProps) {
  const [syncLog, setSyncLog] = useState<any[]>([])
  const [cloudStatus, setCloudStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadSyncData()
    const interval = setInterval(loadSyncData, 3000)
    return () => clearInterval(interval)
  }, [])

  const loadSyncData = async () => {
    try {
      const log = await database.getSyncLog()
      setSyncLog(log.slice(0, 20))
      setCloudStatus(cloudSync.getCloudStatus())
    } catch (error) {
      console.error("Errore nel caricamento dati sync:", error)
    }
  }

  const handleForceSync = async () => {
    setIsLoading(true)
    try {
      // Forza un aggiornamento pubblicando lo stato corrente
      const currentDb = await database.exportDatabase()
      cloudSync.publishUpdate(currentDb, currentUser)

      toast({
        title: "Sincronizzazione forzata",
        description: "I dati sono stati pubblicati per la sincronizzazione.",
      })

      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Errore nella sincronizzazione:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile forzare la sincronizzazione.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearCloudData = () => {
    if (confirm("Sei sicuro di voler cancellare tutti i dati cloud? Questa operazione non può essere annullata.")) {
      try {
        cloudSync.clearCloudData()
        toast({
          title: "Dati cloud cancellati",
          description: "Tutti i dati di sincronizzazione cloud sono stati rimossi.",
        })
        loadSyncData()
      } catch (error) {
        console.error("Errore nella cancellazione:", error)
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Impossibile cancellare i dati cloud.",
        })
      }
    }
  }

  const handleExportSyncData = async () => {
    try {
      const exportData = {
        syncLog,
        cloudStatus,
        exportedAt: new Date().toISOString(),
        deviceId: cloudStatus?.deviceId,
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

      const exportFileDefaultName = `sync-data-export-${new Date().toISOString().slice(0, 10)}.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()

      toast({
        title: "Esportazione completata",
        description: "I dati di sincronizzazione sono stati esportati.",
      })
    } catch (error) {
      console.error("Errore nell'esportazione:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile esportare i dati di sincronizzazione.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Torna alla Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Sincronizzazione</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Stato Cloud */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                Stato Sincronizzazione Cloud
              </CardTitle>
              <CardDescription>Informazioni sulla sincronizzazione tra dispositivi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cloudStatus && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">ID Dispositivo:</span>
                    <Badge variant="outline" className="font-mono">
                      {cloudStatus.deviceId.slice(-12)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Dispositivi Connessi:</span>
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      <span className="font-semibold">{cloudStatus.devices.length}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Aggiornamenti Cloud:</span>
                    <span className="font-semibold">{cloudStatus.cloudUpdates}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Ultimo Aggiornamento:</span>
                    <span className="text-sm text-gray-600">
                      {cloudStatus.lastUpdate ? cloudStatus.lastUpdate.toLocaleString("it-IT") : "Nessuno"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Versione Locale:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(cloudStatus.localVersion).toLocaleString("it-IT")}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Azioni */}
          <Card>
            <CardHeader>
              <CardTitle>Azioni di Sincronizzazione</CardTitle>
              <CardDescription>Gestisci la sincronizzazione dei dati</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleForceSync} disabled={isLoading} className="w-full flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                Forza Sincronizzazione
              </Button>

              <Button
                variant="outline"
                onClick={handleExportSyncData}
                className="w-full flex items-center gap-2 bg-transparent"
              >
                <Download className="w-4 h-4" />
                Esporta Dati Sync
              </Button>

              <Button variant="destructive" onClick={handleClearCloudData} className="w-full flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Cancella Dati Cloud
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Log di Sincronizzazione */}
        <Card>
          <CardHeader>
            <CardTitle>Log di Sincronizzazione</CardTitle>
            <CardDescription>Cronologia delle operazioni di sincronizzazione (ultimi 20 eventi)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {syncLog.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nessun evento di sincronizzazione</p>
              ) : (
                syncLog.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          log.data.operation === "INSERT"
                            ? "default"
                            : log.data.operation === "UPDATE"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {log.data.operation}
                      </Badge>
                      <span className="font-medium">{log.data.table}</span>
                      <span className="text-sm text-gray-600">da {log.createdBy}</span>
                    </div>
                    <span className="text-sm text-gray-500">{new Date(log.createdAt).toLocaleString("it-IT")}</span>
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
