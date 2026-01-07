"use client"

import { useTravelStore } from "@/lib/travel-store"
import { countries } from "@/lib/countries-data"
import { useMemo } from "react"
import { Star, Heart, Calendar } from "lucide-react"

interface FavoritesProps {
  onCountryClick: (countryId: string) => void
}

export function Favorites({ onCountryClick }: FavoritesProps) {
  const travels = useTravelStore((state) => state.travels)
  const tripData = useTravelStore((state) => state.tripData)

  const favoriteCountries = useMemo(() => {
    return countries
      .filter((c) => tripData[c.id]?.favorite)
      .map((c) => ({
        ...c,
        data: tripData[c.id],
        status: travels[c.id],
      }))
  }, [tripData, travels])

  const topRatedCountries = useMemo(() => {
    return countries
      .filter((c) => tripData[c.id]?.rating && tripData[c.id].rating! >= 4)
      .map((c) => ({
        ...c,
        data: tripData[c.id],
        status: travels[c.id],
      }))
      .sort((a, b) => (b.data?.rating || 0) - (a.data?.rating || 0))
      .slice(0, 5)
  }, [tripData, travels])

  if (favoriteCountries.length === 0 && topRatedCountries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Keine Favoriten</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Markiere Länder als Favoriten oder bewerte sie mit 4+ Sternen, um sie hier zu sehen.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 overflow-y-auto h-full space-y-6">
      {favoriteCountries.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-primary fill-primary" />
            <h3 className="font-semibold">Favoriten</h3>
          </div>
          <div className="space-y-2">
            {favoriteCountries.map((country) => (
              <button
                key={country.id}
                onClick={() => onCountryClick(country.id)}
                className="w-full flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors text-left"
              >
                <span className="text-2xl">{country.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{country.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {country.data?.rating && (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${star <= country.data!.rating! ? "fill-primary text-primary" : "text-muted"}`}
                          />
                        ))}
                      </div>
                    )}
                    {country.data?.date && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(country.data.date).getFullYear()}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {topRatedCountries.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <h3 className="font-semibold">Top Bewertungen</h3>
          </div>
          <div className="space-y-2">
            {topRatedCountries.map((country, index) => (
              <button
                key={country.id}
                onClick={() => onCountryClick(country.id)}
                className="w-full flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors text-left"
              >
                <span className="text-lg font-bold text-primary w-6">#{index + 1}</span>
                <span className="text-2xl">{country.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{country.name}</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${star <= (country.data?.rating || 0) ? "fill-primary text-primary" : "text-muted"}`}
                      />
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
