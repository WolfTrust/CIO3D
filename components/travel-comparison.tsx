"use client"

import { useTravelStore, getStats } from "@/lib/travel-store"
import { countries } from "@/lib/countries-data"
import { useMemo, useState, useEffect } from "react"
import { Users, Globe, TrendingUp, Award } from "lucide-react"

// Simulated global averages (would be from a real API in production)
const GLOBAL_STATS = {
  averageCountries: 8.5,
  topTravelerCountries: 45,
  averagePerContinent: {
    Europa: 4.2,
    Asien: 2.1,
    Afrika: 0.8,
    Nordamerika: 1.5,
    Südamerika: 0.9,
    Ozeanien: 0.3,
  } as Record<string, number>,
}

export function TravelComparison() {
  const travels = useTravelStore((state) => state.travels)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const stats = useMemo(() => getStats(travels), [travels])

  const continentStats = useMemo(() => {
    const visitedCountries = countries.filter((c) => travels[c.id] === "visited" || travels[c.id] === "lived")
    const byContinent: Record<string, number> = {}
    visitedCountries.forEach((c) => {
      byContinent[c.continent] = (byContinent[c.continent] || 0) + 1
    })
    return byContinent
  }, [travels])

  const percentile = useMemo(() => {
    // Calculate percentile based on visited countries
    if (stats.visited >= 45) return 99
    if (stats.visited >= 30) return 95
    if (stats.visited >= 20) return 90
    if (stats.visited >= 15) return 80
    if (stats.visited >= 10) return 70
    if (stats.visited >= 5) return 50
    if (stats.visited >= 3) return 30
    return 10
  }, [stats.visited])

  if (!mounted) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Weltweiter Vergleich</h3>
      </div>

      {/* Percentile Card */}
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-2xl p-5">
        <div className="text-center">
          <Award className="w-10 h-10 mx-auto text-primary mb-2" />
          <p className="text-4xl font-bold text-primary mb-1">Top {100 - percentile}%</p>
          <p className="text-sm text-muted-foreground">Du hast mehr Länder besucht als {percentile}% der Menschen</p>
        </div>
      </div>

      {/* Comparison Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Globe className="w-4 h-4" />
            <span className="text-xs">Du</span>
          </div>
          <p className="text-2xl font-bold">{stats.visited}</p>
          <p className="text-xs text-muted-foreground">Länder besucht</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Durchschnitt</span>
          </div>
          <p className="text-2xl font-bold">{GLOBAL_STATS.averageCountries}</p>
          <p className="text-xs text-muted-foreground">Länder weltweit</p>
        </div>
      </div>

      {/* Continent Comparison */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h4 className="text-sm font-medium mb-3">Pro Kontinent (Du vs. Durchschnitt)</h4>
        <div className="space-y-3">
          {Object.entries(GLOBAL_STATS.averagePerContinent).map(([continent, avg]) => {
            const yourCount = continentStats[continent] || 0
            const isAboveAvg = yourCount > avg

            return (
              <div key={continent} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{continent}</span>
                <div className="flex items-center gap-3">
                  <span className={`font-medium ${isAboveAvg ? "text-green-500" : ""}`}>{yourCount}</span>
                  <span className="text-muted-foreground/50">/</span>
                  <span className="text-muted-foreground">{avg}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
