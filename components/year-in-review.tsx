"use client"

import { useMemo, useState } from "react"
import { X, Globe, MapPin, Star, Plane, Calendar, Award, ChevronRight } from "lucide-react"
import { useTravelStore, getStats } from "@/lib/travel-store"
import { countries } from "@/lib/countries-data"
import { Button } from "@/components/ui/button"

interface YearInReviewProps {
  isOpen: boolean
  onClose: () => void
}

export function YearInReview({ isOpen, onClose }: YearInReviewProps) {
  const travels = useTravelStore((state) => state.travels)
  const tripData = useTravelStore((state) => state.tripData)
  const [currentSlide, setCurrentSlide] = useState(0)

  const reviewData = useMemo(() => {
    const currentYear = new Date().getFullYear()

    const thisYearTrips = Object.entries(tripData)
      .filter(([id, data]) => {
        if (!data.visitDate || !travels[id]) return false
        return new Date(data.visitDate).getFullYear() === currentYear
      })
      .map(([id, data]) => ({
        id,
        country: countries.find((c) => c.id === id)!,
        date: new Date(data.visitDate!),
        rating: data.rating || 0,
        notes: data.notes || "",
        locations: data.locations || [],
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    const stats = getStats(travels)
    const topRated = [...thisYearTrips].sort((a, b) => b.rating - a.rating)[0]
    const totalLocations = thisYearTrips.reduce((sum, trip) => sum + trip.locations.length, 0)

    const continentSet = new Set(thisYearTrips.map((t) => t.country.continent))

    return {
      year: currentYear,
      trips: thisYearTrips,
      totalCountries: thisYearTrips.length,
      totalLocations,
      topRated,
      continentsVisited: continentSet.size,
      overallStats: stats,
    }
  }, [travels, tripData])

  const slides = [
    {
      id: "intro",
      render: () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6 animate-pulse">
            <Globe className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Dein Jahr {reviewData.year}</h2>
          <p className="text-muted-foreground">Ein Rückblick auf deine Reiseabenteuer</p>
        </div>
      ),
    },
    {
      id: "stats",
      render: () => (
        <div className="flex flex-col items-center justify-center h-full p-6">
          <h3 className="text-xl font-bold mb-8 text-center">Deine Zahlen</h3>
          <div className="grid grid-cols-2 gap-6 w-full max-w-xs">
            <div className="bg-primary/10 rounded-2xl p-5 text-center">
              <Plane className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-4xl font-bold text-primary">{reviewData.totalCountries}</div>
              <div className="text-sm text-muted-foreground">Länder</div>
            </div>
            <div className="bg-blue-500/10 rounded-2xl p-5 text-center">
              <MapPin className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-4xl font-bold text-blue-500">{reviewData.totalLocations}</div>
              <div className="text-sm text-muted-foreground">Orte</div>
            </div>
            <div className="bg-green-500/10 rounded-2xl p-5 text-center">
              <Globe className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-4xl font-bold text-green-500">{reviewData.continentsVisited}</div>
              <div className="text-sm text-muted-foreground">Kontinente</div>
            </div>
            <div className="bg-yellow-500/10 rounded-2xl p-5 text-center">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-4xl font-bold text-yellow-500">{reviewData.overallStats.percentage}%</div>
              <div className="text-sm text-muted-foreground">der Welt</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "countries",
      render: () => (
        <div className="flex flex-col h-full p-6">
          <h3 className="text-xl font-bold mb-4 text-center">Deine Reisen</h3>
          <div className="flex-1 overflow-y-auto space-y-2">
            {reviewData.trips.length > 0 ? (
              reviewData.trips.map((trip, index) => (
                <div key={trip.id} className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {index + 1}
                  </div>
                  <span className="text-2xl">{trip.country.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{trip.country.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {trip.date.toLocaleDateString("de-DE", { month: "long" })}
                    </div>
                  </div>
                  {trip.rating > 0 && (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: trip.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Calendar className="w-12 h-12 mb-4 opacity-50" />
                <p>Noch keine Reisen dieses Jahr</p>
                <p className="text-sm">Zeit für ein Abenteuer!</p>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "highlight",
      render: () => (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          {reviewData.topRated ? (
            <>
              <Award className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Dein Highlight</h3>
              <div className="text-6xl mb-4">{reviewData.topRated.country.flag}</div>
              <div className="text-2xl font-bold mb-2">{reviewData.topRated.country.name}</div>
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: reviewData.topRated.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              {reviewData.topRated.notes && (
                <p className="text-muted-foreground text-sm italic max-w-xs">
                  "{reviewData.topRated.notes.slice(0, 100)}
                  {reviewData.topRated.notes.length > 100 ? "..." : ""}"
                </p>
              )}
            </>
          ) : (
            <>
              <Star className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">Noch kein Highlight</h3>
              <p className="text-muted-foreground">Bewerte deine Reisen!</p>
            </>
          )}
        </div>
      ),
    },
    {
      id: "outro",
      render: () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <div className="text-6xl mb-6">
            {reviewData.trips
              .slice(0, 5)
              .map((t) => t.country.flag)
              .join(" ")}
          </div>
          <h2 className="text-2xl font-bold mb-2">Auf ein neues Jahr!</h2>
          <p className="text-muted-foreground mb-6">
            {reviewData.totalCountries > 0
              ? `Du hast ${reviewData.totalCountries} ${reviewData.totalCountries === 1 ? "Land" : "Länder"} bereist. Weiter so!`
              : "Starte dein Reiseabenteuer!"}
          </p>
          <Button onClick={onClose} size="lg">
            Schließen
          </Button>
        </div>
      ),
    },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Content */}
      <div className="flex-1 overflow-hidden">{slides[currentSlide].render()}</div>

      {/* Navigation */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          {currentSlide < slides.length - 1 && (
            <Button onClick={() => setCurrentSlide((s) => s + 1)} className="gap-2">
              Weiter
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
