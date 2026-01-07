"use client"

import { useTravelStore, getStats } from "@/lib/travel-store"
import { countries } from "@/lib/countries-data"
import { useMemo, useRef, useState } from "react"
import { Share2, X, Check } from "lucide-react"

interface ShareCardProps {
  isOpen: boolean
  onClose: () => void
}

export function ShareCard({ isOpen, onClose }: ShareCardProps) {
  const travels = useTravelStore((state) => state.travels)
  const stats = useMemo(() => getStats(travels), [travels])
  const cardRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const visitedCountries = useMemo(() => {
    return countries.filter((c) => travels[c.id] === "visited" || travels[c.id] === "lived")
  }, [travels])

  const shareText = useMemo(() => {
    const continentList = stats.continentStats
      .filter((c) => c.visited > 0)
      .map((c) => `${c.name}: ${c.visited}/${c.total}`)
      .join("\n")

    return `Ich habe ${stats.visited} von ${stats.total} Ländern bereist (${stats.percentage}%)

${continentList}

Tracke deine Reisen mit Wanderlust!`
  }, [stats])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Meine Reise-Statistik",
          text: shareText,
        })
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-background rounded-2xl w-full max-w-sm overflow-hidden border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">Teilen</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Card Preview */}
        <div className="p-4">
          <div
            ref={cardRef}
            className="bg-gradient-to-br from-primary/20 via-background to-chart-2/20 rounded-xl p-6 border border-border"
          >
            <div className="text-center mb-4">
              <h4 className="text-2xl font-bold">Wanderlust</h4>
              <p className="text-sm text-muted-foreground">Meine Reise-Statistik</p>
            </div>

            <div className="bg-background/80 backdrop-blur rounded-xl p-4 mb-4">
              <div className="text-center">
                <p className="text-5xl font-bold text-primary">{stats.percentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.visited} von {stats.total} Ländern
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 justify-center">
              {visitedCountries.slice(0, 20).map((country) => (
                <span key={country.id} className="text-lg" title={country.name}>
                  {country.flag}
                </span>
              ))}
              {visitedCountries.length > 20 && (
                <span className="text-xs text-muted-foreground self-center ml-1">+{visitedCountries.length - 20}</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 pt-0 space-y-2">
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-primary-foreground rounded-xl font-medium transition-colors hover:bg-primary/90"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                Kopiert!
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                Teilen
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
