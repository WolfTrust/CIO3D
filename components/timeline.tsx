"use client"

import { useTravelStore } from "@/lib/travel-store"
import { countries } from "@/lib/countries-data"
import { useMemo } from "react"
import { Calendar, Star, ChevronRight } from "lucide-react"

interface TimelineProps {
  onCountryClick: (countryId: string) => void
}

export function Timeline({ onCountryClick }: TimelineProps) {
  const travels = useTravelStore((state) => state.travels)
  const tripData = useTravelStore((state) => state.tripData)

  const timelineEntries = useMemo(() => {
    const entries: {
      countryId: string
      country: (typeof countries)[0]
      date: Date | null
      notes?: string
      rating?: number
      status: string
    }[] = []

    Object.entries(travels).forEach(([countryId, status]) => {
      if (status === "visited" || status === "lived") {
        const country = countries.find((c) => c.id === countryId)
        if (country) {
          const data = tripData[countryId]
          entries.push({
            countryId,
            country,
            date: data?.date ? new Date(data.date) : null,
            notes: data?.notes,
            rating: data?.rating,
            status: status === "lived" ? "Gelebt" : "Besucht",
          })
        }
      }
    })

    // Sort by date (newest first), entries without date at the end
    return entries.sort((a, b) => {
      if (!a.date && !b.date) return 0
      if (!a.date) return 1
      if (!b.date) return -1
      return b.date.getTime() - a.date.getTime()
    })
  }, [travels, tripData])

  const groupedByYear = useMemo(() => {
    const groups: Record<string, typeof timelineEntries> = {}

    timelineEntries.forEach((entry) => {
      const year = entry.date ? entry.date.getFullYear().toString() : "Ohne Datum"
      if (!groups[year]) {
        groups[year] = []
      }
      groups[year].push(entry)
    })

    return Object.entries(groups).sort(([a], [b]) => {
      if (a === "Ohne Datum") return 1
      if (b === "Ohne Datum") return -1
      return Number.parseInt(b) - Number.parseInt(a)
    })
  }, [timelineEntries])

  if (timelineEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Noch keine Reisen</h3>
        <p className="text-muted-foreground text-sm">
          Markiere Länder als besucht und füge Daten hinzu, um deine Reise-Timeline zu sehen.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Reise-Timeline</h2>
        <span className="text-sm text-muted-foreground">{timelineEntries.length} Reisen</span>
      </div>

      <div className="space-y-6">
        {groupedByYear.map(([year, entries]) => (
          <div key={year}>
            <div className="sticky top-0 bg-background/95 backdrop-blur py-2 mb-3 z-10">
              <h3 className="text-sm font-medium text-primary">{year}</h3>
            </div>

            <div className="relative pl-6 border-l-2 border-border space-y-4">
              {entries.map((entry) => (
                <button
                  key={entry.countryId}
                  onClick={() => onCountryClick(entry.countryId)}
                  className="relative w-full text-left"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[25px] top-3 w-3 h-3 rounded-full bg-primary border-2 border-background" />

                  <div className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{entry.country.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-semibold truncate">{entry.country.name}</h4>
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              entry.status === "Gelebt" ? "bg-chart-3/20 text-chart-3" : "bg-chart-2/20 text-chart-2"
                            }`}
                          >
                            {entry.status}
                          </span>
                          {entry.date && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {entry.date.toLocaleDateString("de-DE", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          )}
                        </div>

                        {entry.rating && entry.rating > 0 && (
                          <div className="flex items-center gap-0.5 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${star <= entry.rating! ? "fill-primary text-primary" : "text-muted"}`}
                              />
                            ))}
                          </div>
                        )}

                        {entry.notes && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
