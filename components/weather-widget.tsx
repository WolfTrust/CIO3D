"use client"

import { useState, useEffect } from "react"
import { countries } from "@/lib/countries-data"
import { Cloud, Sun, CloudRain, Snowflake, Wind, Droplets, Thermometer } from "lucide-react"

interface WeatherWidgetProps {
  countryId: string
}

// Simulierte Wetterdaten basierend auf Jahreszeit und Land
function getSimulatedWeather(countryId: string) {
  const country = countries.find((c) => c.id === countryId)
  if (!country) return null

  const month = new Date().getMonth()
  const lat = country.coordinates[0]

  // Basis-Temperatur nach Breitengrad
  let baseTemp = 25 - Math.abs(lat) * 0.5

  // Jahreszeitliche Anpassung (Nordhalbkugel)
  if (lat > 0) {
    if (month >= 5 && month <= 8)
      baseTemp += 10 // Sommer
    else if (month >= 11 || month <= 2) baseTemp -= 10 // Winter
  } else {
    if (month >= 11 || month <= 2)
      baseTemp += 10 // Süd-Sommer
    else if (month >= 5 && month <= 8) baseTemp -= 10 // Süd-Winter
  }

  // Zufällige Variation
  const temp = Math.round(baseTemp + (Math.random() * 6 - 3))
  const humidity = Math.round(40 + Math.random() * 40)
  const wind = Math.round(5 + Math.random() * 20)

  // Wetterbedingung
  let condition: "sunny" | "cloudy" | "rainy" | "snowy" = "sunny"
  if (temp < 0) condition = "snowy"
  else if (humidity > 70) condition = Math.random() > 0.5 ? "rainy" : "cloudy"
  else if (humidity > 50) condition = "cloudy"

  return { temp, humidity, wind, condition, feelsLike: temp - Math.round(wind / 10) }
}

export function WeatherWidget({ countryId }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<ReturnType<typeof getSimulatedWeather>>(null)
  const country = countries.find((c) => c.id === countryId)

  useEffect(() => {
    setWeather(getSimulatedWeather(countryId))
  }, [countryId])

  if (!weather || !country) return null

  const weatherIcons = {
    sunny: { icon: Sun, color: "text-amber-500", bg: "bg-amber-500/10" },
    cloudy: { icon: Cloud, color: "text-gray-500", bg: "bg-gray-500/10" },
    rainy: { icon: CloudRain, color: "text-blue-500", bg: "bg-blue-500/10" },
    snowy: { icon: Snowflake, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  }

  const { icon: WeatherIcon, color, bg } = weatherIcons[weather.condition]

  const conditionText = {
    sunny: "Sonnig",
    cloudy: "Bewölkt",
    rainy: "Regnerisch",
    snowy: "Schnee",
  }

  return (
    <div className={`${bg} rounded-xl p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{country.capital}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold">{weather.temp}°</span>
            <span className="text-sm text-muted-foreground">C</span>
          </div>
          <p className={`text-sm ${color} font-medium`}>{conditionText[weather.condition]}</p>
        </div>
        <WeatherIcon className={`w-14 h-14 ${color}`} />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          <Thermometer className="w-3.5 h-3.5 text-muted-foreground" />
          <div>
            <p className="text-[10px] text-muted-foreground">Gefühlt</p>
            <p className="text-xs font-medium">{weather.feelsLike}°C</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-muted-foreground" />
          <div>
            <p className="text-[10px] text-muted-foreground">Feuchte</p>
            <p className="text-xs font-medium">{weather.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Wind className="w-3.5 h-3.5 text-muted-foreground" />
          <div>
            <p className="text-[10px] text-muted-foreground">Wind</p>
            <p className="text-xs font-medium">{weather.wind} km/h</p>
          </div>
        </div>
      </div>
    </div>
  )
}
