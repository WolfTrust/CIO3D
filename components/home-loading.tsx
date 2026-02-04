"use client"

import { useState, useEffect } from "react"

export function HomeLoading() {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 8000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background p-6"
      style={{ minHeight: "100vh" }}
    >
      <p className="text-muted-foreground text-lg">Lade …</p>
      {slow && (
        <p className="text-muted-foreground text-sm text-center max-w-sm">
          Laden dauert ungewöhnlich lange. Bitte Seite neu laden (F5) oder F12 → Konsole prüfen, ob ein Fehler angezeigt wird.
        </p>
      )}
    </div>
  )
}
