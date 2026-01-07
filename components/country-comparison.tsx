"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { ArrowLeftRight, Globe, MapPin, Languages, Banknote } from "lucide-react"
import { countries } from "@/lib/countries-data"
import { useTravelStore } from "@/lib/travel-store"

interface CountryComparisonProps {
  onSelectCountry?: (countryId: string) => void
}

export function CountryComparison({ onSelectCountry }: CountryComparisonProps) {
  const travels = useTravelStore((state) => state.travels)
  const tripData = useTravelStore((state) => state.tripData)
  const [country1, setCountry1] = useState<string | null>(null)
  const [country2, setCountry2] = useState<string | null>(null)
  const [isSelectingFor, setIsSelectingFor] = useState<1 | 2 | null>(null)

  const visitedCountries = useMemo(() => {
    return countries.filter((c) => travels[c.id])
  }, [travels])

  const c1 = country1 ? countries.find((c) => c.id === country1) : null
  const c2 = country2 ? countries.find((c) => c.id === country2) : null

  const ComparisonRow = ({
    label,
    icon: Icon,
    value1,
    value2,
  }: {
    label: string
    icon: React.ElementType
    value1: string
    value2: string
  }) => (
    <div className="grid grid-cols-3 gap-2 items-center py-3 border-b border-border last:border-0">
      <div className="text-right text-sm">{value1}</div>
      <div className="flex flex-col items-center gap-1">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-left text-sm">{value2}</div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="font-bold text-lg">Länder vergleichen</h3>
        <p className="text-sm text-muted-foreground">Vergleiche zwei besuchte Länder</p>
      </div>

      {/* Country Selection */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSelectingFor(1)}
          className={`flex-1 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${
            isSelectingFor === 1 ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
          }`}
        >
          {c1 ? (
            <>
              <span className="text-4xl">{c1.flag}</span>
              <span className="text-sm font-medium">{c1.name}</span>
            </>
          ) : (
            <>
              <Globe className="w-8 h-8 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Land wählen</span>
            </>
          )}
        </button>

        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeftRight className="w-5 h-5 text-muted-foreground" />
        </div>

        <button
          onClick={() => setIsSelectingFor(2)}
          className={`flex-1 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${
            isSelectingFor === 2 ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
          }`}
        >
          {c2 ? (
            <>
              <span className="text-4xl">{c2.flag}</span>
              <span className="text-sm font-medium">{c2.name}</span>
            </>
          ) : (
            <>
              <Globe className="w-8 h-8 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Land wählen</span>
            </>
          )}
        </button>
      </div>

      {/* Country Picker */}
      {isSelectingFor !== null && (
        <div className="bg-card rounded-xl border border-border p-3 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-4 gap-2">
            {visitedCountries.map((country) => (
              <button
                key={country.id}
                onClick={() => {
                  if (isSelectingFor === 1) {
                    setCountry1(country.id)
                  } else {
                    setCountry2(country.id)
                  }
                  setIsSelectingFor(null)
                }}
                disabled={
                  (isSelectingFor === 1 && country.id === country2) || (isSelectingFor === 2 && country.id === country1)
                }
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span className="text-2xl">{country.flag}</span>
                <span className="text-[10px] text-muted-foreground truncate w-full text-center">{country.name}</span>
              </button>
            ))}
            {visitedCountries.length === 0 && (
              <div className="col-span-4 text-center py-4 text-muted-foreground text-sm">
                Besuche zuerst einige Länder!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {c1 && c2 && (
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="grid grid-cols-3 gap-2 items-center mb-4 pb-4 border-b border-border">
            <div className="text-center">
              <span className="text-3xl">{c1.flag}</span>
              <div className="font-semibold text-sm mt-1">{c1.name}</div>
            </div>
            <div className="text-center text-xs text-muted-foreground">VS</div>
            <div className="text-center">
              <span className="text-3xl">{c2.flag}</span>
              <div className="font-semibold text-sm mt-1">{c2.name}</div>
            </div>
          </div>

          <ComparisonRow label="Kontinent" icon={Globe} value1={c1.continent} value2={c2.continent} />
          <ComparisonRow label="Hauptstadt" icon={MapPin} value1={c1.capital} value2={c2.capital} />
          <ComparisonRow label="Sprache" icon={Languages} value1={c1.language || "-"} value2={c2.language || "-"} />
          <ComparisonRow label="Währung" icon={Banknote} value1={c1.currency || "-"} value2={c2.currency || "-"} />
          <ComparisonRow
            label="Bewertung"
            icon={MapPin}
            value1={tripData[c1.id]?.rating ? `${tripData[c1.id].rating}/5` : "-"}
            value2={tripData[c2.id]?.rating ? `${tripData[c2.id].rating}/5` : "-"}
          />
          <ComparisonRow
            label="Orte"
            icon={MapPin}
            value1={`${tripData[c1.id]?.locations?.length || 0}`}
            value2={`${tripData[c2.id]?.locations?.length || 0}`}
          />
        </div>
      )}
    </div>
  )
}
