"use client"

import { useMemo, useState } from "react"
import { useTravelStore } from "@/lib/travel-store"
import { countries } from "@/lib/countries-data"
import { Target, Lock, CheckCircle2, ChevronRight, Trophy } from "lucide-react"

const challenges = [
  {
    id: "eu-explorer",
    name: "EU-Entdecker",
    description: "Besuche alle 27 EU-Mitgliedsstaaten",
    countries: [
      "de",
      "fr",
      "it",
      "es",
      "pt",
      "nl",
      "be",
      "at",
      "pl",
      "cz",
      "sk",
      "hu",
      "ro",
      "bg",
      "gr",
      "hr",
      "si",
      "ie",
      "dk",
      "se",
      "fi",
      "ee",
      "lv",
      "lt",
      "cy",
      "mt",
      "lu",
    ],
    icon: "🇪🇺",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "nordic",
    name: "Nordische Saga",
    description: "Erlebe alle nordischen Länder",
    countries: ["no", "se", "fi", "dk", "is"],
    icon: "❄️",
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "mediterranean",
    name: "Mittelmeer-Träumer",
    description: "Entdecke die Mittelmeerküsten",
    countries: ["es", "fr", "it", "gr", "hr", "mt", "cy", "tr", "eg", "tn", "ma"],
    icon: "🌊",
    color: "from-teal-500 to-cyan-500",
  },
  {
    id: "asia-pacific",
    name: "Asien-Abenteurer",
    description: "Erkunde die Vielfalt Asiens",
    countries: ["jp", "kr", "cn", "th", "vn", "id", "my", "sg", "ph", "in"],
    icon: "🏯",
    color: "from-red-500 to-orange-500",
  },
  {
    id: "americas",
    name: "Amerika-Pionier",
    description: "Von Kanada bis Argentinien",
    countries: ["us", "ca", "mx", "br", "ar", "cl", "pe", "co"],
    icon: "🗽",
    color: "from-amber-500 to-red-500",
  },
  {
    id: "island-hopper",
    name: "Insel-Hopper",
    description: "Besuche 10 Inselstaaten",
    countries: ["jp", "id", "ph", "nz", "cu", "is", "ie", "gb", "mt", "cy", "fj", "mv", "lk", "mg"],
    icon: "🏝️",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "g7-summit",
    name: "G7-Gipfel",
    description: "Besuche alle G7-Staaten",
    countries: ["us", "gb", "fr", "de", "it", "ca", "jp"],
    icon: "🤝",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "world-wonders",
    name: "Weltwunder-Jäger",
    description: "Länder mit Weltwundern",
    countries: ["eg", "cn", "pe", "it", "in", "jo", "mx", "br"],
    icon: "🏛️",
    color: "from-yellow-500 to-amber-600",
  },
]

export function TravelChallenges() {
  const travels = useTravelStore((state) => state.travels)
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null)

  const challengeProgress = useMemo(() => {
    return challenges.map((challenge) => {
      const visited = challenge.countries.filter((c) => travels[c] === "visited" || travels[c] === "lived").length
      const total = challenge.countries.length
      const percentage = Math.round((visited / total) * 100)
      const isComplete = visited === total
      return { ...challenge, visited, total, percentage, isComplete }
    })
  }, [travels])

  const completedCount = challengeProgress.filter((c) => c.isComplete).length

  const selected = selectedChallenge ? challengeProgress.find((c) => c.id === selectedChallenge) : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Challenges</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          {completedCount}/{challenges.length} abgeschlossen
        </div>
      </div>

      <div className="grid gap-2">
        {challengeProgress.map((challenge) => (
          <button
            key={challenge.id}
            onClick={() => setSelectedChallenge(challenge.id)}
            className={`relative overflow-hidden rounded-xl p-3 text-left transition-all ${
              challenge.isComplete
                ? "bg-gradient-to-r " + challenge.color + " text-white"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{challenge.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{challenge.name}</span>
                  {challenge.isComplete && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`flex-1 h-1.5 rounded-full ${challenge.isComplete ? "bg-white/30" : "bg-muted"}`}>
                    <div
                      className={`h-full rounded-full transition-all ${
                        challenge.isComplete ? "bg-white" : "bg-primary"
                      }`}
                      style={{ width: `${challenge.percentage}%` }}
                    />
                  </div>
                  <span className={`text-xs ${challenge.isComplete ? "text-white/80" : "text-muted-foreground"}`}>
                    {challenge.visited}/{challenge.total}
                  </span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 ${challenge.isComplete ? "text-white/70" : "text-muted-foreground"}`} />
            </div>
          </button>
        ))}
      </div>

      {/* Challenge Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedChallenge(null)}
          />
          <div className="relative bg-card w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl max-h-[85vh] overflow-hidden">
            <div className={`bg-gradient-to-r ${selected.color} p-5 text-white`}>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="absolute right-3 top-3 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-90" />
              </button>
              <span className="text-4xl">{selected.icon}</span>
              <h3 className="text-xl font-bold mt-2">{selected.name}</h3>
              <p className="text-white/80 text-sm">{selected.description}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-white/30">
                  <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{ width: `${selected.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{selected.percentage}%</span>
              </div>
            </div>
            <div className="p-4 max-h-[50vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {selected.countries.map((countryId) => {
                  const country = countries.find((c) => c.id === countryId)
                  const isVisited = travels[countryId] === "visited" || travels[countryId] === "lived"
                  if (!country) return null
                  return (
                    <div
                      key={countryId}
                      className={`flex items-center gap-2 p-2.5 rounded-lg ${
                        isVisited ? "bg-primary/10 border border-primary/30" : "bg-secondary"
                      }`}
                    >
                      {isVisited ? (
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      ) : (
                        <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className="text-lg">{country.flag}</span>
                      <span className={`text-xs truncate ${isVisited ? "font-medium" : "text-muted-foreground"}`}>
                        {country.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
