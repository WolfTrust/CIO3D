"use client"

import { useMemo } from "react"
import { useTravelStore } from "@/lib/travel-store"
import { countries, continents } from "@/lib/countries-data"
import { Brain, TrendingUp, Compass, Sun, Building, Waves } from "lucide-react"

export function TravelInsights() {
  const travels = useTravelStore((state) => state.travels)
  const tripData = useTravelStore((state) => state.tripData)

  const insights = useMemo(() => {
    const visited = countries.filter((c) => travels[c.id] === "visited" || travels[c.id] === "lived")

    if (visited.length < 3) {
      return {
        hasEnoughData: false,
        travelStyle: null,
        favoriteContinent: null,
        avgRating: 0,
        totalLocations: 0,
        insights: [],
      }
    }

    // Kontinent-Präferenz
    const continentCounts: Record<string, number> = {}
    visited.forEach((c) => {
      continentCounts[c.continent] = (continentCounts[c.continent] || 0) + 1
    })
    const favoriteContinent = Object.entries(continentCounts).sort((a, b) => b[1] - a[1])[0]
    const continent = continents.find((c) => c.id === favoriteContinent?.[0])

    // Durchschnittliche Bewertung
    const ratings = Object.values(tripData)
      .filter((d) => d.rating && d.rating > 0)
      .map((d) => d.rating!)
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

    // Gesamtanzahl Orte
    const totalLocations = Object.values(tripData).reduce((acc, d) => acc + (d.locations?.length || 0), 0)

    // Reisestil bestimmen
    let travelStyle = { name: "Weltenbummler", icon: Compass, description: "Du liebst es, die Welt zu erkunden" }

    const europeanCountries = visited.filter((c) => c.continent === "europe").length
    const asianCountries = visited.filter((c) => c.continent === "asia").length
    const islandCountries = visited.filter((c) =>
      ["jp", "id", "ph", "nz", "gb", "ie", "is", "cu", "fj", "mv", "lk", "mg", "mt", "cy"].includes(c.id),
    ).length

    if (europeanCountries > visited.length * 0.6) {
      travelStyle = { name: "Europa-Enthusiast", icon: Building, description: "Kultur und Geschichte ziehen dich an" }
    } else if (asianCountries > visited.length * 0.4) {
      travelStyle = { name: "Asien-Entdecker", icon: Sun, description: "Exotische Kulturen faszinieren dich" }
    } else if (islandCountries > 3) {
      travelStyle = { name: "Insel-Hopper", icon: Waves, description: "Strände und Meer sind dein Element" }
    } else if (visited.length > 20) {
      travelStyle = { name: "Globetrotter", icon: Compass, description: "Die ganze Welt ist dein Zuhause" }
    }

    // Personalisierte Insights
    const insightMessages = []

    if (europeanCountries >= 10) {
      insightMessages.push("Du bist ein wahrer Europa-Kenner!")
    }
    if (totalLocations > 20) {
      insightMessages.push(`${totalLocations} Orte entdeckt - beeindruckend detailliert!`)
    }
    if (avgRating >= 4) {
      insightMessages.push("Deine Reisen machen dich glücklich - hohe Bewertungen!")
    }
    if (visited.length > continents.length) {
      insightMessages.push("Du warst auf mehreren Kontinenten - echte Vielfalt!")
    }

    return {
      hasEnoughData: true,
      travelStyle,
      favoriteContinent: continent,
      avgRating,
      totalLocations,
      insights: insightMessages,
      visitedCount: visited.length,
    }
  }, [travels, tripData])

  if (!insights.hasEnoughData) {
    return (
      <div className="bg-secondary/50 rounded-xl p-6 text-center">
        <Brain className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h4 className="font-medium mb-1">Noch nicht genug Daten</h4>
        <p className="text-sm text-muted-foreground">
          Besuche mindestens 3 Länder, um personalisierte Reise-Insights zu erhalten.
        </p>
      </div>
    )
  }

  const StyleIcon = insights.travelStyle?.icon || Compass

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-500" />
        <h3 className="font-semibold">Reise-Insights</h3>
      </div>

      {/* Reisestil */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
            <StyleIcon className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Dein Reisestil</p>
            <p className="font-bold text-lg">{insights.travelStyle?.name}</p>
            <p className="text-xs text-muted-foreground">{insights.travelStyle?.description}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-secondary rounded-xl p-3 text-center">
          <p className="text-2xl font-bold">{insights.visitedCount}</p>
          <p className="text-[10px] text-muted-foreground">Länder</p>
        </div>
        <div className="bg-secondary rounded-xl p-3 text-center">
          <p className="text-2xl font-bold">{insights.totalLocations}</p>
          <p className="text-[10px] text-muted-foreground">Orte</p>
        </div>
        <div className="bg-secondary rounded-xl p-3 text-center">
          <p className="text-2xl font-bold">{insights.avgRating.toFixed(1)}</p>
          <p className="text-[10px] text-muted-foreground">Avg. Rating</p>
        </div>
      </div>

      {/* Lieblingskontinent */}
      {insights.favoriteContinent && (
        <div className="bg-secondary/50 rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">Lieblingskontinent</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{insights.favoriteContinent.emoji}</span>
            <span className="font-medium">{insights.favoriteContinent.name}</span>
          </div>
        </div>
      )}

      {/* Insight Messages */}
      {insights.insights.length > 0 && (
        <div className="space-y-2">
          {insights.insights.map((insight, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
