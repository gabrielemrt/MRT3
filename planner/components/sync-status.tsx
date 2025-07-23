"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"

interface SyncStatusProps {
  isOnline: boolean
  lastSync?: Date
  lastUpdatedBy?: string
}

export function SyncStatus({ isOnline, lastSync, lastUpdatedBy }: SyncStatusProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (lastSync) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [lastSync])

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={isOnline ? "default" : "secondary"}
        className={`flex items-center gap-1 ${isOnline ? "bg-green-500" : "bg-gray-500"}`}
      >
        {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        <span className="text-xs">{isOnline ? "Sincronizzato" : "Offline"}</span>
      </Badge>

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
    </div>
  )
}
