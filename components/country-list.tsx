"use client"

import { useTravelStore, type TravelStatus } from "@/lib/travel-store"
import { useMembersStore } from "@/lib/members-store"
import { countries, continents, alpha3ToCountryId } from "@/lib/countries-data"
import { useState, useMemo } from "react"
import { Search, ChevronRight, Users, X, MapPin, Building2 } from "lucide-react"

interface CountryListProps {
  onCountryClick: (countryId: string) => void
}

// Helper: Convert country ID to alpha3 code
const countryIdToAlpha3: Record<string, string> = Object.fromEntries(
  Object.entries(alpha3ToCountryId).map(([alpha3, id]) => [id, alpha3])
)

export function CountryList({ onCountryClick }: CountryListProps) {
  const travels = useTravelStore((state) => state.travels)
  const members = useMembersStore((state) => state.members)
  const relationships = useMembersStore((state) => state.relationships)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | TravelStatus>("all")
  const [selectedCountryForMembers, setSelectedCountryForMembers] = useState<string | null>(null)

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

  // Get members for selected country
  const countryMembers = useMemo(() => {
    if (!selectedCountryForMembers) return []
    // Country-ID ist bereits der 2-Letter-Code (z.B. "de"), genau wie in member.country gespeichert
    const countryCode = selectedCountryForMembers.toLowerCase()
    return members.filter(
      (member) => member.coordinates && member.city && member.country?.toLowerCase() === countryCode
    )
  }, [selectedCountryForMembers, members])

  // Get relationships between members in the selected country
  const countryRelationships = useMemo(() => {
    if (!selectedCountryForMembers || countryMembers.length === 0) return []
    const memberIds = new Set(countryMembers.map(m => m.id))
    return relationships.filter(
      (rel) => memberIds.has(rel.fromMemberId) && memberIds.has(rel.toMemberId)
    )
  }, [selectedCountryForMembers, countryMembers, relationships])

  const handleCountryClick = (countryId: string) => {
    setSelectedCountryForMembers(countryId)
    onCountryClick(countryId)
  }

  return (
    <div className="flex flex-col h-full relative">
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
                    onClick={() => handleCountryClick(country.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors ${
                      selectedCountryForMembers === country.id ? "bg-primary/10 border-l-2 border-l-primary" : ""
                    }`}
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

      {/* Mitglieder-Sidebar */}
      {selectedCountryForMembers && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-background border-l border-border shadow-xl z-10 flex flex-col">
          <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {countries.find(c => c.id === selectedCountryForMembers)?.flag}
              </span>
              <div>
                <h3 className="font-semibold text-sm">
                  {countries.find(c => c.id === selectedCountryForMembers)?.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {countryMembers.length} Mitglied{countryMembers.length !== 1 ? "er" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedCountryForMembers(null)}
              className="p-1.5 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {countryMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-sm">
                  Keine Mitglieder in diesem Land
                </p>
              </div>
            ) : (
              countryMembers.map((member) => {
                const memberRelationships = relationships.filter(
                  (rel) => (rel.fromMemberId === member.id || rel.toMemberId === member.id) &&
                           countryMembers.some(m => m.id === (rel.fromMemberId === member.id ? rel.toMemberId : rel.fromMemberId))
                )
                return (
                  <div
                    key={member.id}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-sm">
                        {member.firstName} {member.lastName}
                      </h4>
                      {memberRelationships.length > 0 && (
                        <span className="text-xs bg-blue-500/20 text-blue-600 px-2 py-0.5 rounded-full">
                          {memberRelationships.length}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      {member.company && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3 h-3 shrink-0" />
                          <span>{member.company}</span>
                        </div>
                      )}
                      {member.city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{member.city}</span>
                        </div>
                      )}
                    </div>
                    {memberRelationships.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Beziehungen:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {memberRelationships.map((rel) => {
                            const otherMemberId = rel.fromMemberId === member.id ? rel.toMemberId : rel.fromMemberId
                            const otherMember = countryMembers.find(m => m.id === otherMemberId)
                            if (!otherMember) return null
                            return (
                              <span
                                key={rel.id}
                                className="text-xs px-2 py-0.5 rounded-full bg-secondary"
                              >
                                {otherMember.firstName} {otherMember.lastName}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
