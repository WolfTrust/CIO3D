"use client"

import { useState, useEffect } from "react"
import { WifiOff, Wifi } from "lucide-react"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowReconnected(true)
      setTimeout(() => setShowReconnected(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowReconnected(false)
    }

    setIsOnline(navigator.onLine)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (isOnline && !showReconnected) return null

  return (
    <div
      className={`fixed top-16 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium shadow-lg transition-all duration-300 ${
        isOnline ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white animate-pulse"
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          Wieder verbunden
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          Offline - Daten werden lokal gespeichert
        </>
      )}
    </div>
  )
}
