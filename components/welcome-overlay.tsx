"use client"

import { useMemo } from "react"
import { Plane, MapPin, Sparkles, Star, Heart } from "lucide-react"
import { useTravelStore, getStats, getUnlockedAchievements } from "@/lib/travel-store"
import { countries } from "@/lib/countries-data"
import { Button } from "@/components/ui/button"

interface WelcomeOverlayProps {
  onStartExploring: () => void
  onCountryClick: (countryId: string) => void
}

export function WelcomeOverlay({ onStartExploring, onCountryClick }: WelcomeOverlayProps) {
  const travels = useTravelStore((state) => state.travels)
  const tripData = useTravelStore((state) => state.tripData)
  const recentlyViewed = useTravelStore((state) => state.recentlyViewed)

  const stats = useMemo(() => getStats(travels), [travels])
  const unlockedAchievements = useMemo(() => getUnlockedAchievements(travels), [travels])
  const hasVisited = stats.visited > 0

  const recentCountries = useMemo(() => {
    return recentlyViewed
      .slice(0, 4)
      .map((id) => countries.find((c) => c.id === id))
      .filter(Boolean)
  }, [recentlyViewed])

  const favoriteCountries = useMemo(() => {
    return countries.filter((c) => tripData[c.id]?.favorite).slice(0, 4)
  }, [tripData])

  const topRatedCountries = useMemo(() => {
    return countries
      .filter((c) => tripData[c.id]?.rating && tripData[c.id]?.rating! >= 4)
      .sort((a, b) => (tripData[b.id]?.rating || 0) - (tripData[a.id]?.rating || 0))
      .slice(0, 4)
  }, [tripData])

  const suggestedCountries = useMemo(() => {
    const popular = ["JP", "IT", "FR", "ES", "TH", "AU", "US", "GR"]
    return popular
      .filter((id) => !travels[id])
      .slice(0, 4)
      .map((id) => countries.find((c) => c.id === id))
      .filter(Boolean)
  }, [travels])

  if (!hasVisited) {
    // Welcome screen for new users
    return (
      <div className="absolute inset-0 z-20 bg-gradient-to-b from-background/95 via-background/80 to-transparent flex flex-col items-center justify-center p-6 text-center">
        <div className="space-y-6 max-w-sm">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Plane className="w-10 h-10 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Welcome to the global CIO Venture Network</h1>
            <p className="text-muted-foreground text-sm">
              Establish Lifetime Relationships
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center py-4">
            <div className="space-y-1">
              <div className="w-10 h-10 mx-auto rounded-lg bg-green-500/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground">Besucht</p>
            </div>
            <div className="space-y-1">
              <div className="w-10 h-10 mx-auto rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-xs text-muted-foreground">Gelebt</p>
            </div>
            <div className="space-y-1">
              <div className="w-10 h-10 mx-auto rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground">Bucket List</p>
            </div>
          </div>

          <Button onClick={onStartExploring} size="lg" className="w-full gap-2">
            <Sparkles className="w-4 h-4" />
            Jetzt starten
          </Button>

          {suggestedCountries.length > 0 && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3">Beliebte Reiseziele</p>
              <div className="flex justify-center gap-2">
                {suggestedCountries.map((country) => (
                  <button
                    key={country!.id}
                    onClick={() => onCountryClick(country!.id)}
                    className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-2xl hover:scale-110 transition-transform hover:border-primary"
                  >
                    {country!.flag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Compact floating panel for returning users
  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 space-y-3">
      {/* Quick Stats Bar */}
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-3 shadow-lg">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="space-y-0.5">
            <div className="text-lg font-bold text-green-500">{stats.visited}</div>
            <div className="text-[10px] text-muted-foreground">Besucht</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-lg font-bold text-yellow-500">{stats.lived}</div>
            <div className="text-[10px] text-muted-foreground">Gelebt</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-lg font-bold text-blue-500">{stats.bucketList}</div>
            <div className="text-[10px] text-muted-foreground">Bucket List</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-lg font-bold text-primary">{unlockedAchievements.length}</div>
            <div className="text-[10px] text-muted-foreground">Erfolge</div>
          </div>
        </div>
      </div>

      {/* Recent / Favorite Countries */}
      {(recentCountries.length > 0 || favoriteCountries.length > 0 || topRatedCountries.length > 0) && (
        <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-3 shadow-lg">
          {recentCountries.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Zuletzt angesehen</span>
              </div>
              <div className="flex gap-2">
                {recentCountries.map((country) => (
                  <button
                    key={country!.id}
                    onClick={() => onCountryClick(country!.id)}
                    className="flex-1 bg-secondary/50 hover:bg-secondary rounded-xl p-2 flex flex-col items-center gap-1 transition-colors"
                  >
                    <span className="text-xl">{country!.flag}</span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-full">{country!.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {topRatedCountries.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500" /> Top bewertet
                </span>
              </div>
              <div className="flex gap-2">
                {topRatedCountries.map((country) => (
                  <button
                    key={country.id}
                    onClick={() => onCountryClick(country.id)}
                    className="flex-1 bg-secondary/50 hover:bg-secondary rounded-xl p-2 flex flex-col items-center gap-1 transition-colors"
                  >
                    <span className="text-xl">{country.flag}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: tripData[country.id]?.rating || 0 }).map((_, i) => (
                        <Star key={i} className="w-2 h-2 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {favoriteCountries.length > 0 && topRatedCountries.length === 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-500" /> Favoriten
                </span>
              </div>
              <div className="flex gap-2">
                {favoriteCountries.map((country) => (
                  <button
                    key={country.id}
                    onClick={() => onCountryClick(country.id)}
                    className="flex-1 bg-secondary/50 hover:bg-secondary rounded-xl p-2 flex flex-col items-center gap-1 transition-colors"
                  >
                    <span className="text-xl">{country.flag}</span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-full">{country.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suggested next destinations if bucket list is empty */}
      {stats.bucketList === 0 && suggestedCountries.length > 0 && (
        <div className="bg-blue-500/10 backdrop-blur-md border border-blue-500/20 rounded-2xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-blue-500">Wohin als nächstes?</span>
          </div>
          <div className="flex gap-2">
            {suggestedCountries.map((country) => (
              <button
                key={country!.id}
                onClick={() => onCountryClick(country!.id)}
                className="flex-1 bg-card/80 hover:bg-card rounded-xl p-2 flex flex-col items-center gap-1 transition-colors border border-transparent hover:border-blue-500/30"
              >
                <span className="text-xl">{country!.flag}</span>
                <span className="text-[10px] text-muted-foreground truncate max-w-full">{country!.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
