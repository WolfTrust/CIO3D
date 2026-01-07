"use client"

import { Sun, Cloud, Thermometer, Droplets } from "lucide-react"
import { countries } from "@/lib/countries-data"

interface BestTravelTimeProps {
  countryId: string
}

// Simplified climate data
const CLIMATE_DATA: Record<
  string,
  {
    bestMonths: number[]
    climate: string
    avgTemp: { summer: number; winter: number }
    rainyMonths: number[]
  }
> = {
  de: {
    bestMonths: [5, 6, 7, 8, 9],
    climate: "Gemäßigt",
    avgTemp: { summer: 22, winter: 2 },
    rainyMonths: [6, 7, 8],
  },
  es: {
    bestMonths: [4, 5, 6, 9, 10],
    climate: "Mediterran",
    avgTemp: { summer: 30, winter: 12 },
    rainyMonths: [10, 11, 12],
  },
  th: {
    bestMonths: [11, 12, 1, 2, 3],
    climate: "Tropisch",
    avgTemp: { summer: 34, winter: 28 },
    rainyMonths: [5, 6, 7, 8, 9, 10],
  },
  jp: {
    bestMonths: [3, 4, 5, 10, 11],
    climate: "Gemäßigt/Subtropisch",
    avgTemp: { summer: 28, winter: 5 },
    rainyMonths: [6, 7],
  },
  au: {
    bestMonths: [9, 10, 11, 3, 4, 5],
    climate: "Variiert",
    avgTemp: { summer: 28, winter: 15 },
    rainyMonths: [1, 2, 3],
  },
  us: {
    bestMonths: [4, 5, 9, 10],
    climate: "Variiert",
    avgTemp: { summer: 28, winter: 5 },
    rainyMonths: [3, 4, 5],
  },
  it: {
    bestMonths: [4, 5, 6, 9, 10],
    climate: "Mediterran",
    avgTemp: { summer: 28, winter: 8 },
    rainyMonths: [10, 11],
  },
  fr: {
    bestMonths: [5, 6, 9, 10],
    climate: "Gemäßigt",
    avgTemp: { summer: 25, winter: 5 },
    rainyMonths: [10, 11, 12],
  },
  default: {
    bestMonths: [4, 5, 9, 10],
    climate: "Variiert",
    avgTemp: { summer: 25, winter: 10 },
    rainyMonths: [],
  },
}

const MONTH_NAMES = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]

export function BestTravelTime({ countryId }: BestTravelTimeProps) {
  const country = countries.find((c) => c.id === countryId)
  if (!country) return null

  const climate = CLIMATE_DATA[countryId] || CLIMATE_DATA.default
  const currentMonth = new Date().getMonth() + 1
  const isGoodTimeNow = climate.bestMonths.includes(currentMonth)

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Sun className="w-4 h-4 text-amber-500" />
        Beste Reisezeit
      </h4>

      {/* Current recommendation */}
      <div
        className={`rounded-xl p-3 ${
          isGoodTimeNow ? "bg-green-500/10 border border-green-500/20" : "bg-amber-500/10 border border-amber-500/20"
        }`}
      >
        <div className="flex items-center gap-2">
          {isGoodTimeNow ? <Sun className="w-5 h-5 text-green-500" /> : <Cloud className="w-5 h-5 text-amber-500" />}
          <div>
            <p className="text-sm font-medium">{isGoodTimeNow ? "Gute Reisezeit!" : "Nebensaison"}</p>
            <p className="text-xs text-muted-foreground">
              {isGoodTimeNow ? "Aktuell ideale Bedingungen" : "Möglicherweise nicht optimale Bedingungen"}
            </p>
          </div>
        </div>
      </div>

      {/* Month overview */}
      <div className="bg-secondary/50 rounded-xl p-3">
        <p className="text-xs text-muted-foreground mb-2">Monatsübersicht</p>
        <div className="grid grid-cols-6 gap-1">
          {MONTH_NAMES.map((month, idx) => {
            const monthNum = idx + 1
            const isBest = climate.bestMonths.includes(monthNum)
            const isRainy = climate.rainyMonths.includes(monthNum)
            const isCurrent = monthNum === currentMonth

            return (
              <div
                key={month}
                className={`text-center p-1 rounded text-xs ${
                  isBest
                    ? "bg-green-500/20 text-green-400"
                    : isRainy
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-muted-foreground"
                } ${isCurrent ? "ring-1 ring-primary" : ""}`}
              >
                {month}
                {isBest && <Sun className="w-2 h-2 mx-auto mt-0.5" />}
                {isRainy && !isBest && <Droplets className="w-2 h-2 mx-auto mt-0.5" />}
              </div>
            )
          })}
        </div>
        <div className="flex gap-4 mt-2 text-xs">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-green-500/50" /> Beste Zeit
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-blue-500/50" /> Regenzeit
          </span>
        </div>
      </div>

      {/* Climate info */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-secondary/50 rounded-lg p-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Thermometer className="w-3 h-3" />
            Sommer
          </div>
          <p className="text-lg font-bold">{climate.avgTemp.summer}°C</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Thermometer className="w-3 h-3" />
            Winter
          </div>
          <p className="text-lg font-bold">{climate.avgTemp.winter}°C</p>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Klima: <span className="text-foreground">{climate.climate}</span>
      </div>
    </div>
  )
}
