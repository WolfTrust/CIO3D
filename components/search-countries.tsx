"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { countries } from "@/lib/countries-data"
import { useTravelStore } from "@/lib/travel-store"
import { Search, X, MapPin, Plane, Heart } from "lucide-react"

interface SearchCountriesProps {
  onSelectCountry: (countryId: string) => void
  isOpen: boolean
  onClose: () => void
}

export function SearchCountries({ onSelectCountry, isOpen, onClose }: SearchCountriesProps) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const travels = useTravelStore((state) => state.travels)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
    if (!isOpen) {
      setQuery("")
    }
  }, [isOpen])

  const filteredCountries = useMemo(() => {
    if (!query.trim()) return []
    const lowerQuery = query.toLowerCase()
    return countries
      .filter(
        (c) =>
          c.name.toLowerCase().includes(lowerQuery) ||
          c.capital.toLowerCase().includes(lowerQuery) ||
          c.id.toLowerCase().includes(lowerQuery),
      )
      .slice(0, 8)
  }, [query])

  const getStatusIcon = (countryId: string) => {
    const status = travels[countryId]
    if (status === "visited") return <Plane className="w-4 h-4 text-chart-2" />
    if (status === "lived") return <Heart className="w-4 h-4 text-chart-3" />
    if (status === "bucket-list") return <MapPin className="w-4 h-4 text-chart-1" />
    return null
  }

  if (!isOpen) return null

  return (
    <div className="absolute inset-x-0 top-0 z-50 p-4 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Land oder Hauptstadt suchen..."
          className="w-full pl-10 pr-10 py-3 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={onClose}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {filteredCountries.length > 0 && (
        <div className="mt-3 space-y-1 max-h-80 overflow-y-auto">
          {filteredCountries.map((country) => (
            <button
              key={country.id}
              onClick={() => {
                onSelectCountry(country.id)
                onClose()
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
            >
              <span className="text-2xl">{country.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{country.name}</p>
                <p className="text-xs text-muted-foreground truncate">{country.capital}</p>
              </div>
              {getStatusIcon(country.id)}
            </button>
          ))}
        </div>
      )}

      {query.trim() && filteredCountries.length === 0 && (
        <div className="mt-4 text-center text-muted-foreground text-sm py-8">Kein Land gefunden für "{query}"</div>
      )}
    </div>
  )
}
