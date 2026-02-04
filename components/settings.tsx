"use client"

import type React from "react"

import { useTravelStore, getStats } from "@/lib/travel-store"
import { useMemo, useState, useRef } from "react"
import { Download, Upload, Trash2, Check, AlertCircle, Info, Calendar, RotateCcw, Globe, Map } from "lucide-react"
import { UserProfile } from "@/components/user-profile"
import { ThemeToggle } from "@/components/theme-toggle"
import { ContinentProgress } from "@/components/continent-progress"

interface SettingsProps {
  onOpenYearInReview?: () => void
  useCesiumGlobe?: boolean
  setUseCesiumGlobe?: (value: boolean) => void
}

export function Settings({ onOpenYearInReview, useCesiumGlobe = true, setUseCesiumGlobe }: SettingsProps) {
  const travels = useTravelStore((state) => state.travels)
  const tripData = useTravelStore((state) => state.tripData)
  const exportData = useTravelStore((state) => state.exportData)
  const importData = useTravelStore((state) => state.importData)

  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const stats = useMemo(() => getStats(travels), [travels])

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cio-venture-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const success = importData(content)
      setImportStatus(success ? "success" : "error")
      setTimeout(() => setImportStatus("idle"), 3000)
    }
    reader.readAsText(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleReset = () => {
    localStorage.removeItem("cio-venture-travels")
    window.location.reload()
  }

  const handleResetOnboarding = () => {
    localStorage.removeItem("cio-venture-onboarding-complete")
    window.location.reload()
  }

  return (
    <div className="p-4 space-y-6 overflow-y-auto h-full pb-24">
      <div>
        <h2 className="text-lg font-semibold mb-1">Einstellungen</h2>
        <p className="text-sm text-muted-foreground">Verwalte deine Daten und Einstellungen</p>
      </div>

      <UserProfile />

      <ContinentProgress />

      {/* Year in Review */}
      <div className="bg-gradient-to-br from-primary/20 via-blue-500/10 to-purple-500/20 rounded-xl p-4 border border-primary/30">
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Jahresrückblick
        </h3>
        <p className="text-sm text-muted-foreground mb-3">Sieh dir deine Reisestatistiken des Jahres an</p>
        <button
          onClick={onOpenYearInReview}
          className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-medium transition-colors hover:bg-primary/90"
        >
          Jahresrückblick öffnen
        </button>
      </div>

      {/* Stats Summary */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-muted-foreground" />
          Datenübersicht
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-muted-foreground text-xs">Besuchte Länder</p>
            <p className="font-semibold text-lg">{stats.visited}</p>
          </div>
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-muted-foreground text-xs">Bucket List</p>
            <p className="font-semibold text-lg">{stats.bucketList}</p>
          </div>
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-muted-foreground text-xs">Mit Notizen</p>
            <p className="font-semibold text-lg">{Object.values(tripData).filter((t) => t.notes).length}</p>
          </div>
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-muted-foreground text-xs">Mit Bewertung</p>
            <p className="font-semibold text-lg">{Object.values(tripData).filter((t) => t.rating).length}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="font-medium mb-3">Erscheinungsbild</h3>
        <ThemeToggle />
        {typeof useCesiumGlobe === "boolean" && setUseCesiumGlobe && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-2">Globus-Ansicht auf der Karte</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUseCesiumGlobe(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors ${
                  useCesiumGlobe ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <Globe className="w-4 h-4" />
                CesiumJS
              </button>
              <button
                type="button"
                onClick={() => setUseCesiumGlobe(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors ${
                  !useCesiumGlobe ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <Map className="w-4 h-4" />
                D3.js
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export/Import */}
      <div className="bg-card rounded-xl p-4 border border-border space-y-4">
        <h3 className="font-medium">Backup & Wiederherstellung</h3>

        <button
          onClick={handleExport}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-primary-foreground rounded-xl font-medium transition-colors hover:bg-primary/90"
        >
          <Download className="w-5 h-5" />
          Daten exportieren
        </button>

        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-secondary text-secondary-foreground rounded-xl font-medium transition-colors hover:bg-secondary/80">
            <Upload className="w-5 h-5" />
            Daten importieren
          </button>
        </div>

        {importStatus === "success" && (
          <div className="flex items-center gap-2 text-chart-2 text-sm bg-chart-2/10 rounded-lg p-3">
            <Check className="w-4 h-4" />
            Daten erfolgreich importiert!
          </div>
        )}

        {importStatus === "error" && (
          <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg p-3">
            <AlertCircle className="w-4 h-4" />
            Fehler beim Importieren. Bitte prüfe die Datei.
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="font-medium mb-2">Tutorial</h3>
        <p className="text-sm text-muted-foreground mb-3">Zeige das Einführungs-Tutorial erneut an</p>
        <button
          onClick={handleResetOnboarding}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-secondary text-secondary-foreground rounded-xl font-medium transition-colors hover:bg-secondary/80"
        >
          <RotateCcw className="w-5 h-5" />
          Tutorial zurücksetzen
        </button>
      </div>

      {/* Reset */}
      <div className="bg-card rounded-xl p-4 border border-destructive/30">
        <h3 className="font-medium text-destructive mb-2">Gefahrenzone</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Alle Daten werden unwiderruflich gelöscht. Erstelle vorher ein Backup.
        </p>

        {!showConfirmReset ? (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-destructive/10 text-destructive rounded-xl font-medium transition-colors hover:bg-destructive/20"
          >
            <Trash2 className="w-5 h-5" />
            Alle Daten löschen
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-destructive font-medium">Bist du sicher?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-2 px-3 bg-secondary rounded-lg text-sm font-medium"
              >
                Abbrechen
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2 px-3 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium"
              >
                Ja, löschen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* App Info */}
      <div className="text-center text-xs text-muted-foreground pt-4">
        <p>CIO-Venture v2.0</p>
        <p>Deine Daten werden lokal gespeichert</p>
      </div>
    </div>
  )
}
