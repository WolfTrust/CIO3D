"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import { useTravelStore } from "@/lib/travel-store"
import { countries } from "@/lib/countries-data"
import { Button } from "@/components/ui/button"

interface TravelCalendarProps {
  onCountryClick?: (countryId: string) => void
}

export function TravelCalendar({ onCountryClick }: TravelCalendarProps) {
  const tripData = useTravelStore((state) => state.tripData)
  const travels = useTravelStore((state) => state.travels)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const calendarData = useMemo(() => {
    const months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]

    const tripsByMonth: Record<string, Array<{ id: string; country: (typeof countries)[0] }>> = {}

    Object.entries(tripData).forEach(([id, data]) => {
      if (data.visitDate && travels[id]) {
        const date = new Date(data.visitDate)
        if (date.getFullYear() === currentYear) {
          const monthKey = date.getMonth().toString()
          if (!tripsByMonth[monthKey]) {
            tripsByMonth[monthKey] = []
          }
          const country = countries.find((c) => c.id === id)
          if (country) {
            tripsByMonth[monthKey].push({ id, country })
          }
        }
      }
    })

    return months.map((name, index) => ({
      name,
      trips: tripsByMonth[index.toString()] || [],
    }))
  }, [tripData, travels, currentYear])

  const totalTripsThisYear = calendarData.reduce((sum, month) => sum + month.trips.length, 0)

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => setCurrentYear((y) => y - 1)}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h3 className="font-bold text-lg">{currentYear}</h3>
          <p className="text-xs text-muted-foreground">{totalTripsThisYear} Reisen</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentYear((y) => y + 1)}
          disabled={currentYear >= new Date().getFullYear()}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-px bg-border">
        {calendarData.map((month, index) => (
          <div
            key={index}
            className={`p-3 bg-background min-h-[100px] ${month.trips.length > 0 ? "bg-primary/5" : ""}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">{month.name}</span>
              {month.trips.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {month.trips.length}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {month.trips.slice(0, 4).map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => onCountryClick?.(trip.id)}
                  className="text-lg hover:scale-125 transition-transform"
                  title={trip.country.name}
                >
                  {trip.country.flag}
                </button>
              ))}
              {month.trips.length > 4 && (
                <span className="text-xs text-muted-foreground">+{month.trips.length - 4}</span>
              )}
            </div>
            {month.trips.length === 0 && (
              <div className="flex items-center justify-center h-8 text-muted-foreground/30">
                <MapPin className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
