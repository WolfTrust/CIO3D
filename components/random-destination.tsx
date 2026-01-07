"use client"

import { useTravelStore } from "@/lib/travel-store"
import { countries } from "@/lib/countries-data"
import { useState, useMemo, useCallback } from "react"
import { Shuffle, Plane, MapPin, ArrowRight, Heart, Check } from "lucide-react"

interface RandomDestinationProps {
  onSelectCountry: (countryId: string) => void
  onFlyToCountry?: (countryId: string) => void
}

export function RandomDestination({ onSelectCountry, onFlyToCountry }: RandomDestinationProps) {
  const travels = useTravelStore((state) => state.travels)
  const setCountryStatus = useTravelStore((state) => state.setCountryStatus)
  const [suggestion, setSuggestion] = useState<(typeof countries)[0] | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)

  const unvisitedCountries = useMemo(() => {
    return countries.filter((c) => !travels[c.id] || travels[c.id] === "bucket-list")
  }, [travels])

  const bucketListCountries = useMemo(() => {
    return countries.filter((c) => travels[c.id] === "bucket-list")
  }, [travels])

  const getRandomCountry = useCallback(() => {
    setIsSpinning(true)

    const pool = bucketListCountries.length > 0 && Math.random() < 0.3 ? bucketListCountries : unvisitedCountries

    if (pool.length === 0) {
      setIsSpinning(false)
      return
    }

    let count = 0
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * pool.length)
      setSuggestion(pool[randomIndex])
      count++
      if (count >= 10) {
        clearInterval(interval)
        setIsSpinning(false)
      }
    }, 100)
  }, [unvisitedCountries, bucketListCountries])

  const handleAddToBucketList = () => {
    if (suggestion && travels[suggestion.id] !== "bucket-list") {
      setCountryStatus(suggestion.id, "bucket-list")
    }
  }

  const handleMarkAsVisited = () => {
    if (suggestion) {
      setCountryStatus(suggestion.id, "visited")
    }
  }

  const currentStatus = suggestion ? travels[suggestion.id] : null

  return (
    <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Shuffle className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Wohin als Nächstes?</h3>
          <p className="text-xs text-muted-foreground">Lass dich inspirieren</p>
        </div>
      </div>

      {suggestion ? (
        <div className="bg-card rounded-xl p-4 mb-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{suggestion.flag}</span>
            <div className="flex-1">
              <h4 className="font-bold text-lg">{suggestion.name}</h4>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{suggestion.capital}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{suggestion.continent}</p>
              {currentStatus === "bucket-list" && (
                <span className="inline-block mt-1 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  Auf deiner Bucket List
                </span>
              )}
              {currentStatus === "visited" && (
                <span className="inline-block mt-1 text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
                  Bereits besucht
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={() => onSelectCountry(suggestion.id)}
              className="py-2 flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors"
            >
              <span>Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {currentStatus !== "bucket-list" && currentStatus !== "visited" && (
              <button
                onClick={handleAddToBucketList}
                className="py-2 flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg text-sm font-medium transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span>Bucket List</span>
              </button>
            )}
            {currentStatus !== "visited" && (
              <button
                onClick={handleMarkAsVisited}
                className={`py-2 flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg text-sm font-medium transition-colors ${currentStatus === "bucket-list" ? "col-span-1" : ""}`}
              >
                <Check className="w-4 h-4" />
                <span>Besucht</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-card/50 rounded-xl p-6 mb-4 text-center">
          <Plane className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Klicke auf den Button um ein Reiseziel zu entdecken</p>
        </div>
      )}

      <button
        onClick={getRandomCountry}
        disabled={isSpinning || unvisitedCountries.length === 0}
        className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
          isSpinning
            ? "bg-primary/50 text-primary-foreground"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        <Shuffle className={`w-5 h-5 ${isSpinning ? "animate-spin" : ""}`} />
        <span>{isSpinning ? "Suche..." : suggestion ? "Neues Ziel" : "Zufälliges Ziel"}</span>
      </button>

      <p className="text-xs text-center text-muted-foreground mt-3">
        Noch {unvisitedCountries.length} Länder zu entdecken
        {bucketListCountries.length > 0 && ` (${bucketListCountries.length} auf Bucket List)`}
      </p>
    </div>
  )
}
