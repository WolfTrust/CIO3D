"use client"

import { useTravelStore } from "@/lib/travel-store"
import { countries } from "@/lib/countries-data"
import { useMemo, useState, useEffect } from "react"
import { Sparkles, MapPin, ChevronRight, Plane } from "lucide-react"

interface TravelRecommendationsProps {
  onSelectCountry: (countryId: string) => void
}

export function TravelRecommendations({ onSelectCountry }: TravelRecommendationsProps) {
  const travels = useTravelStore((state) => state.travels)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const recommendations = useMemo(() => {
    const visitedCountries = countries.filter((c) => travels[c.id] === "visited" || travels[c.id] === "lived")
    const unvisitedCountries = countries.filter((c) => !travels[c.id])

    if (visitedCountries.length === 0) {
      // For new users, recommend popular destinations
      return {
        type: "popular" as const,
        title: "Beliebte Reiseziele",
        description: "Perfekt für den Einstieg",
        countries: countries.filter((c) => ["fr", "it", "es", "jp", "us", "th"].includes(c.id)).slice(0, 4),
      }
    }

    // Find most visited continent
    const continentCount: Record<string, number> = {}
    visitedCountries.forEach((c) => {
      continentCount[c.continent] = (continentCount[c.continent] || 0) + 1
    })
    const favoriteContinent = Object.entries(continentCount).sort((a, b) => b[1] - a[1])[0]?.[0]

    // Recommend unvisited countries from favorite continent
    const sameContinentRecs = unvisitedCountries.filter((c) => c.continent === favoriteContinent).slice(0, 4)

    if (sameContinentRecs.length >= 2) {
      return {
        type: "continent" as const,
        title: `Mehr ${favoriteContinent} entdecken`,
        description: `Basierend auf deiner Vorliebe für ${favoriteContinent}`,
        countries: sameContinentRecs,
      }
    }

    // Find neighboring countries
    const visitedContinents = new Set(visitedCountries.map((c) => c.continent))
    const newContinents = unvisitedCountries.filter((c) => !visitedContinents.has(c.continent))

    return {
      type: "explore" as const,
      title: "Neue Kontinente erkunden",
      description: "Erweitere deinen Horizont",
      countries: newContinents.slice(0, 4),
    }
  }, [travels])

  if (!mounted) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Empfehlungen für dich</h3>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Plane className="w-4 h-4 text-primary" />
          <div>
            <h4 className="font-medium text-sm">{recommendations.title}</h4>
            <p className="text-xs text-muted-foreground">{recommendations.description}</p>
          </div>
        </div>

        <div className="space-y-2">
          {recommendations.countries.map((country) => (
            <button
              key={country.id}
              onClick={() => onSelectCountry(country.id)}
              className="w-full flex items-center gap-3 p-3 bg-secondary/50 hover:bg-secondary rounded-xl transition-colors text-left"
            >
              <span className="text-2xl">{country.flag}</span>
              <div className="flex-1">
                <p className="font-medium text-sm">{country.name}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{country.capital}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
