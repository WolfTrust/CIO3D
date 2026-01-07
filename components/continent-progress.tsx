"use client"

import { useMemo } from "react"
import { useTravelStore, getStats } from "@/lib/travel-store"
import { Globe, Check } from "lucide-react"

export function ContinentProgress() {
  const travels = useTravelStore((state) => state.travels)
  const stats = useMemo(() => getStats(travels), [travels])

  const continentIcons: Record<string, string> = {
    europe: "🇪🇺",
    asia: "🌏",
    africa: "🌍",
    "north-america": "🌎",
    "south-america": "🌎",
    oceania: "🏝️",
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-4 h-4 text-primary" />
        <h3 className="font-semibold">Kontinente-Fortschritt</h3>
      </div>

      <div className="space-y-4">
        {stats.continentStats.map((continent) => {
          const isComplete = continent.percentage === 100
          return (
            <div key={continent.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{continentIcons[continent.id] || "🌍"}</span>
                  <span className="text-sm font-medium">{continent.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {continent.visited}/{continent.total}
                  </span>
                  {isComplete && <Check className="w-4 h-4 text-green-500" />}
                </div>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isComplete
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : "bg-gradient-to-r from-primary to-primary/80"
                  }`}
                  style={{ width: `${continent.percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Overall Progress */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Gesamt-Fortschritt</span>
          <span className="text-lg font-bold text-primary">{stats.percentage}%</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {stats.visited} von {stats.total} Ländern besucht
        </p>
      </div>
    </div>
  )
}
