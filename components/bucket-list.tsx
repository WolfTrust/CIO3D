"use client"

import { useTravelStore, getBucketListCountries } from "@/lib/travel-store"
import { MapPin, Trash2 } from "lucide-react"
import { useMemo } from "react"

interface BucketListProps {
  onCountryClick: (countryId: string) => void
}

export function BucketList({ onCountryClick }: BucketListProps) {
  const travels = useTravelStore((state) => state.travels)
  const setCountryStatus = useTravelStore((state) => state.setCountryStatus)

  const bucketListCountries = useMemo(() => getBucketListCountries(travels), [travels])

  if (bucketListCountries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <MapPin className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Deine Bucket List ist leer</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Füge Länder hinzu, die du noch besuchen möchtest, indem du sie auf der Karte oder in der Länderliste
          auswählst.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Bucket List</h2>
        <span className="text-sm text-muted-foreground">
          {bucketListCountries.length} {bucketListCountries.length === 1 ? "Land" : "Länder"}
        </span>
      </div>

      <div className="space-y-2">
        {bucketListCountries.map((country, index) => (
          <div key={country.id} className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border group">
            <span className="text-lg font-semibold text-primary w-6">{index + 1}</span>
            <button onClick={() => onCountryClick(country.id)} className="flex-1 flex items-center gap-3 text-left">
              <span className="text-2xl">{country.flag}</span>
              <div>
                <p className="font-medium">{country.name}</p>
                <p className="text-xs text-muted-foreground">{country.capital}</p>
              </div>
            </button>
            <button
              onClick={() => setCountryStatus(country.id, "visited")}
              className="px-3 py-1.5 rounded-lg bg-chart-2/10 text-chart-2 text-xs font-medium hover:bg-chart-2/20 transition-colors"
            >
              Besucht ✓
            </button>
            <button
              onClick={() => setCountryStatus(country.id, null)}
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
