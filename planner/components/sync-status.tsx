"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, RefreshCw, Monitor } from "lucide-react"
import { cloudSync } from "@/lib/cloud-sync"

interface SyncStatusProps {
  isOnline: boolean
  lastSync?: Date
  lastUpdatedBy?: string
}

export function SyncStatus({ isOnline, lastSync, lastUpdatedBy }: SyncStatusProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [cloudStatus, setCloudStatus] = useState<any>(null)

  useEffect(() => {
    if (lastSync) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [lastSync])

  useEffect(() => {
    // Aggiorna lo stato del cloud ogni 5 secondi
    const updateCloudStatus = () => {
      setCloudStatus(cloudSync.getCloudStatus())
    }

    updateCloudStatus()
    const interval = setInterval(updateCloudStatus, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleForceSync = () => {
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge
        variant={isOnline ? "default" : "secondary"}
        className={`flex items-center gap-1 ${isOnline ? "bg-green-500" : "bg-gray-500"}`}
      >
        {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        <span className="text-xs">{isOnline ? "Online" : "Offline"}</span>
      </Badge>

      {cloudStatus && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Monitor className="w-3 h-3" />
          <span className="text-xs">{cloudStatus.devices.length} dispositivi</span>
        </Badge>
      )}

      {lastSync && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <RefreshCw className={`w-3 h-3 ${isAnimating ? "animate-spin" : ""}`} />
          <span>
            {lastSync.toLocaleTimeString("it-IT", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {lastUpdatedBy && ` da ${lastUpdatedBy}`}
          </span>
        </div>
      )}

      <Button variant="ghost" size="sm" onClick={handleForceSync} className="h-6 px-2 text-xs">
        <RefreshCw className="w-3 h-3 mr-1" />
        Aggiorna
      </Button>

      {cloudStatus && <div className="text-xs text-gray-500">ID: {cloudStatus.deviceId.slice(-8)}</div>}
    </div>
  )
}
