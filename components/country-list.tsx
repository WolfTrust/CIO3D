"use client"

import { useTravelStore, type TravelStatus } from "@/lib/travel-store"
import { countries, continents } from "@/lib/countries-data"
import { useState, useMemo } from "react"
import { Search, ChevronRight } from "lucide-react"

interface CountryListProps {
  onCountryClick: (countryId: string) => void
}

export function CountryList({ onCountryClick }: CountryListProps) {
  const travels = useTravelStore((state) => state.travels)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | TravelStatus>("all")

  const filteredCountries = useMemo(() => {
    return countries.filter((country) => {
      const matchesSearch =
        country.name.toLowerCase().includes(search.toLowerCase()) ||
        country.code.toLowerCase().includes(search.toLowerCase())

      if (!matchesSearch) return false

      if (filter === "all") return true
      return travels[country.id] === filter
    })
  }, [search, filter, travels])

  const groupedCountries = useMemo(() => {
    const grouped: Record<string, typeof countries> = {}
    continents.forEach((c) => {
      grouped[c.id] = filteredCountries.filter((country) => country.continent === c.id)
    })
    return grouped
  }, [filteredCountries])

  const getStatusBadge = (status: TravelStatus) => {
    switch (status) {
      case "visited":
        return <span className="px-2 py-0.5 rounded-full text-[10px] bg-chart-2/20 text-chart-2">Besucht</span>
      case "lived":
        return <span className="px-2 py-0.5 rounded-full text-[10px] bg-chart-3/20 text-chart-3">Gelebt</span>
      case "bucket-list":
        return <span className="px-2 py-0.5 rounded-full text-[10px] bg-chart-1/20 text-chart-1">Bucket List</span>
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Land suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: "all", label: "Alle" },
            { id: "visited", label: "Besucht" },
            { id: "lived", label: "Gelebt" },
            { id: "bucket-list", label: "Bucket List" },
            { id: null, label: "Nicht besucht" },
          ].map((f) => (
            <button
              key={f.id ?? "null"}
              onClick={() => setFilter(f.id as typeof filter)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Country List */}
      <div className="flex-1 overflow-y-auto">
        {continents.map((continent) => {
          const continentCountries = groupedCountries[continent.id]
          if (!continentCountries || continentCountries.length === 0) return null

          return (
            <div key={continent.id} className="mb-4">
              <div className="sticky top-0 bg-background/95 backdrop-blur px-4 py-2 border-b border-border">
                <h3 className="font-semibold text-sm">{continent.name}</h3>
              </div>
              <div className="divide-y divide-border">
                {continentCountries.map((country) => (
                  <button
                    key={country.id}
                    onClick={() => onCountryClick(country.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
                  >
                    <span className="text-2xl">{country.flag}</span>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{country.name}</p>
                      <p className="text-xs text-muted-foreground">{country.capital}</p>
                    </div>
                    {getStatusBadge(travels[country.id])}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
