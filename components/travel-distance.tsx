"use client"

import { useTravelStore } from "@/lib/travel-store"
import { countries } from "@/lib/countries-data"
import { useMemo } from "react"
import { Plane, Globe2, Clock, Route } from "lucide-react"

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Germany as starting point (approximate center)
const HOME_COORDS = { lat: 51.1657, lon: 10.4515 }

export function TravelDistance() {
  const travels = useTravelStore((state) => state.travels)

  const stats = useMemo(() => {
    const visitedCountries = countries.filter((c) => travels[c.id] === "visited" || travels[c.id] === "lived")

    let totalDistance = 0
    let furthestCountry = { country: null as (typeof countries)[0] | null, distance: 0 }

    visitedCountries.forEach((country) => {
      const distance = calculateDistance(
        HOME_COORDS.lat,
        HOME_COORDS.lon,
        country.coordinates[0],
        country.coordinates[1],
      )
      totalDistance += distance * 2 // Round trip
      if (distance > furthestCountry.distance) {
        furthestCountry = { country, distance }
      }
    })

    // Estimate flight hours (average 800 km/h)
    const flightHours = totalDistance / 800

    // Calculate approximate time zones crossed
    const timeZones = new Set(visitedCountries.map((c) => Math.round(c.coordinates[1] / 15))).size

    return {
      totalDistance: Math.round(totalDistance),
      flightHours: Math.round(flightHours),
      furthestCountry: furthestCountry.country,
      furthestDistance: Math.round(furthestCountry.distance),
      timeZones,
      earthCircumferences: (totalDistance / 40075).toFixed(1),
    }
  }, [travels])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("de-DE").format(num)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Route className="w-5 h-5 text-primary" />
        Reise-Distanzen
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Globe2 className="w-4 h-4" />
            <span className="text-xs">Gesamtdistanz</span>
          </div>
          <p className="text-2xl font-bold">{formatNumber(stats.totalDistance)}</p>
          <p className="text-xs text-muted-foreground">Kilometer</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Plane className="w-4 h-4" />
            <span className="text-xs">Flugzeit</span>
          </div>
          <p className="text-2xl font-bold">~{formatNumber(stats.flightHours)}</p>
          <p className="text-xs text-muted-foreground">Stunden</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Zeitzonen</span>
          </div>
          <p className="text-2xl font-bold">{stats.timeZones}</p>
          <p className="text-xs text-muted-foreground">durchquert</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Globe2 className="w-4 h-4" />
            <span className="text-xs">Erdumrundungen</span>
          </div>
          <p className="text-2xl font-bold">{stats.earthCircumferences}x</p>
          <p className="text-xs text-muted-foreground">um die Welt</p>
        </div>
      </div>

      {stats.furthestCountry && (
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-2">Weitestes Reiseziel</p>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{stats.furthestCountry.flag}</span>
            <div>
              <p className="font-semibold">{stats.furthestCountry.name}</p>
              <p className="text-sm text-muted-foreground">{formatNumber(stats.furthestDistance)} km Entfernung</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
