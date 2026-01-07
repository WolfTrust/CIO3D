"use client"

import { useTravelStore, getStats } from "@/lib/travel-store"
import { continents } from "@/lib/countries-data"
import { useMemo } from "react"
import { TrendingUp, Globe, Calendar, Plane } from "lucide-react"

export function TravelStatsCharts() {
  const travels = useTravelStore((state) => state.travels)
  const tripData = useTravelStore((state) => state.tripData)

  const stats = useMemo(() => getStats(travels), [travels])

  const yearlyStats = useMemo(() => {
    const years: Record<string, number> = {}
    Object.entries(tripData).forEach(([countryId, data]) => {
      if (data.date && travels[countryId]) {
        const year = new Date(data.date).getFullYear()
        years[year] = (years[year] || 0) + 1
      }
    })
    return Object.entries(years)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => Number(a.year) - Number(b.year))
  }, [tripData, travels])

  const continentProgress = useMemo(() => {
    return stats.continentStats.map((cs) => {
      const continent = continents.find((c) => c.id === cs.id)
      return {
        ...cs,
        color: continent?.color || "#888",
      }
    })
  }, [stats])

  const avgRating = useMemo(() => {
    const ratings = Object.values(tripData)
      .filter((t) => t.rating)
      .map((t) => t.rating!)
    if (ratings.length === 0) return 0
    return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
  }, [tripData])

  const maxYearCount = Math.max(...yearlyStats.map((y) => y.count), 1)

  return (
    <div className="p-4 overflow-y-auto h-full space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Reise-Statistiken</h2>
        <p className="text-sm text-muted-foreground">Deine Reise-Aktivität im Überblick</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Globe className="w-4 h-4" />
            <span className="text-xs">Weltfortschritt</span>
          </div>
          <p className="text-3xl font-bold text-primary">{stats.percentage}%</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Plane className="w-4 h-4" />
            <span className="text-xs">Bereiste Länder</span>
          </div>
          <p className="text-3xl font-bold">{stats.visited}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Durchschnitt</span>
          </div>
          <p className="text-3xl font-bold">
            {avgRating} <span className="text-sm text-muted-foreground">/ 5</span>
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">Reisejahre</span>
          </div>
          <p className="text-3xl font-bold">{yearlyStats.length}</p>
        </div>
      </div>

      {/* Yearly Activity Chart */}
      {yearlyStats.length > 0 && (
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-medium mb-4">Reisen pro Jahr</h3>
          <div className="flex items-end gap-2 h-32">
            {yearlyStats.map((year) => (
              <div key={year.year} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary rounded-t-md transition-all duration-500"
                  style={{ height: `${(year.count / maxYearCount) * 100}%`, minHeight: "4px" }}
                />
                <span className="text-xs text-muted-foreground">{year.year.slice(-2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Continent Progress */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="font-medium mb-4">Kontinente</h3>
        <div className="space-y-3">
          {continentProgress.map((continent) => (
            <div key={continent.id}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>{continent.name}</span>
                <span className="text-muted-foreground">
                  {continent.visited}/{continent.total}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${continent.percentage}%`,
                    backgroundColor: continent.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* World Map Progress Ring */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="font-medium mb-4 text-center">Weltfortschritt</h3>
        <div className="flex justify-center">
          <div className="relative w-40 h-40">
            <svg className="w-40 h-40 -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-muted"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-primary"
                strokeDasharray={`${(stats.percentage / 100) * 440} 440`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{stats.visited}</span>
              <span className="text-sm text-muted-foreground">von {stats.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
