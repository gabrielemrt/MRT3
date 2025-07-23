"use client"

// Simulazione di un sistema di sincronizzazione cloud
interface CloudData {
  id: string
  data: any
  timestamp: number
  deviceId: string
  userId: string
  version: number
}

interface CloudStorage {
  [key: string]: CloudData
}

class CloudSyncManager {
  private cloudKey = "vacation_planner_cloud"
  private deviceId: string
  private syncInterval: NodeJS.Timeout | null = null
  private listeners: Set<(data: any) => void> = new Set()

  constructor() {
    // Genera un ID univoco per questo dispositivo/browser
    this.deviceId = this.getOrCreateDeviceId()
    this.startSyncLoop()
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem("device_id")
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      localStorage.setItem("device_id", deviceId)
    }
    return deviceId
  }

  private getCloudStorage(): CloudStorage {
    // Simula un storage cloud usando una chiave condivisa
    // In un'app reale, questo sarebbe un database remoto
    const cloudData = localStorage.getItem(this.cloudKey)
    return cloudData ? JSON.parse(cloudData) : {}
  }

  private saveCloudStorage(storage: CloudStorage) {
    localStorage.setItem(this.cloudKey, JSON.stringify(storage))

    // Simula la propagazione ai altri dispositivi
    this.notifyOtherDevices()
  }

  private notifyOtherDevices() {
    // Simula la notifica ad altri dispositivi
    window.dispatchEvent(
      new CustomEvent("cloud-sync-update", {
        detail: { deviceId: this.deviceId, timestamp: Date.now() },
      }),
    )
  }

  private startSyncLoop() {
    // Controlla aggiornamenti ogni 2 secondi
    this.syncInterval = setInterval(() => {
      this.checkForUpdates()
    }, 2000)

    // Listener per eventi di storage (stesso browser, tab diverse)
    window.addEventListener("storage", (e) => {
      if (e.key === this.cloudKey) {
        this.checkForUpdates()
      }
    })

    // Listener per eventi personalizzati
    window.addEventListener("cloud-sync-update", () => {
      setTimeout(() => this.checkForUpdates(), 100)
    })
  }

  private checkForUpdates() {
    try {
      const cloudStorage = this.getCloudStorage()
      const localVersion = this.getLocalVersion()

      // Trova aggiornamenti più recenti
      const updates: any[] = []

      Object.values(cloudStorage).forEach((cloudData) => {
        if (cloudData.deviceId !== this.deviceId && cloudData.timestamp > localVersion) {
          updates.push(cloudData)
        }
      })

      if (updates.length > 0) {
        // Ordina per timestamp
        updates.sort((a, b) => a.timestamp - b.timestamp)

        // Applica gli aggiornamenti
        updates.forEach((update) => {
          this.applyUpdate(update)
        })

        // Aggiorna la versione locale
        this.setLocalVersion(Math.max(...updates.map((u) => u.timestamp)))
      }
    } catch (error) {
      console.error("Errore nel controllo aggiornamenti:", error)
    }
  }

  private getLocalVersion(): number {
    const version = localStorage.getItem("local_sync_version")
    return version ? Number.parseInt(version) : 0
  }

  private setLocalVersion(version: number) {
    localStorage.setItem("local_sync_version", version.toString())
  }

  private applyUpdate(update: CloudData) {
    try {
      // Applica l'aggiornamento al localStorage locale
      const { data } = update

      if (data.type === "database_update") {
        // Aggiorna il database locale
        localStorage.setItem("vacation_planner_db", JSON.stringify(data.database))

        // Notifica i listener
        this.listeners.forEach((listener) => {
          try {
            listener(data)
          } catch (error) {
            console.error("Errore nel listener:", error)
          }
        })
      }
    } catch (error) {
      console.error("Errore nell'applicazione aggiornamento:", error)
    }
  }

  // Metodi pubblici
  publishUpdate(data: any, userId: string) {
    try {
      const cloudStorage = this.getCloudStorage()
      const updateId = `update_${Date.now()}_${this.deviceId}`

      const cloudData: CloudData = {
        id: updateId,
        data: {
          type: "database_update",
          database: data,
          userId,
        },
        timestamp: Date.now(),
        deviceId: this.deviceId,
        userId,
        version: 1,
      }

      cloudStorage[updateId] = cloudData

      // Mantieni solo gli ultimi 50 aggiornamenti
      const updates = Object.values(cloudStorage)
      if (updates.length > 50) {
        updates.sort((a, b) => b.timestamp - a.timestamp)
        const toKeep = updates.slice(0, 50)
        const newStorage: CloudStorage = {}
        toKeep.forEach((update) => {
          newStorage[update.id] = update
        })
        this.saveCloudStorage(newStorage)
      } else {
        this.saveCloudStorage(cloudStorage)
      }

      // Aggiorna la versione locale
      this.setLocalVersion(cloudData.timestamp)

      console.log(`📤 Pubblicato aggiornamento da ${userId} (${this.deviceId})`)
    } catch (error) {
      console.error("Errore nella pubblicazione:", error)
    }
  }

  onUpdate(callback: (data: any) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  getDeviceId() {
    return this.deviceId
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    this.listeners.clear()
  }

  // Metodi per debug
  getCloudStatus() {
    const cloudStorage = this.getCloudStorage()
    const updates = Object.values(cloudStorage)

    return {
      deviceId: this.deviceId,
      localVersion: this.getLocalVersion(),
      cloudUpdates: updates.length,
      lastUpdate: updates.length > 0 ? new Date(Math.max(...updates.map((u) => u.timestamp))) : null,
      devices: [...new Set(updates.map((u) => u.deviceId))],
    }
  }

  clearCloudData() {
    localStorage.removeItem(this.cloudKey)
    localStorage.removeItem("local_sync_version")
  }
}

// Singleton instance
export const cloudSync = new CloudSyncManager()
