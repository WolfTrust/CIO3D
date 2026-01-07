"use client"

import { useState, useMemo } from "react"
import { Lightbulb, ChevronLeft, ChevronRight, Utensils, Camera, Calendar, AlertTriangle } from "lucide-react"
import { countries } from "@/lib/countries-data"

interface TravelTipsProps {
  countryId: string
}

interface Tip {
  icon: typeof Lightbulb
  title: string
  content: string
}

const countryTips: Record<string, Tip[]> = {
  jp: [
    { icon: Utensils, title: "Essen", content: "Probiere unbedingt authentisches Ramen, Sushi und Wagyu-Beef." },
    {
      icon: Camera,
      title: "Sehenswürdigkeiten",
      content: "Der Fushimi Inari-Schrein in Kyoto ist besonders bei Sonnenaufgang magisch.",
    },
    {
      icon: Calendar,
      title: "Beste Reisezeit",
      content: "Frühling (März-Mai) für Kirschblüten oder Herbst (Sept-Nov) für Laubfärbung.",
    },
    {
      icon: AlertTriangle,
      title: "Wichtig",
      content: "Bargeld ist noch weit verbreitet - nicht alle Geschäfte akzeptieren Karten.",
    },
  ],
  it: [
    {
      icon: Utensils,
      title: "Essen",
      content: "Pizza in Neapel, Pasta in Rom und Gelato überall - am besten in kleinen lokalen Restaurants.",
    },
    {
      icon: Camera,
      title: "Sehenswürdigkeiten",
      content: "Reserviere Tickets für beliebte Attraktionen wie das Kolosseum vorab.",
    },
    {
      icon: Calendar,
      title: "Beste Reisezeit",
      content: "April-Juni und Sept-Okt bieten angenehmes Wetter und weniger Touristen.",
    },
    { icon: AlertTriangle, title: "Wichtig", content: "Vorsicht vor Taschendieben in touristischen Gebieten." },
  ],
  th: [
    {
      icon: Utensils,
      title: "Essen",
      content: "Street Food ist köstlich und sicher - achte auf Stände mit vielen Einheimischen.",
    },
    {
      icon: Camera,
      title: "Sehenswürdigkeiten",
      content: "Der Grand Palace und Wat Pho in Bangkok sind Pflichtbesuche.",
    },
    {
      icon: Calendar,
      title: "Beste Reisezeit",
      content: "Nov-Feb ist die kühlere Trockenzeit - ideal für Sightseeing.",
    },
    { icon: AlertTriangle, title: "Wichtig", content: "Bedecke Schultern und Knie beim Besuch von Tempeln." },
  ],
}

// Default tips for countries without specific tips
const defaultTips: Tip[] = [
  {
    icon: Utensils,
    title: "Lokale Küche",
    content: "Erkunde lokale Märkte und Restaurants für authentische Erfahrungen.",
  },
  {
    icon: Camera,
    title: "Fotografie",
    content: "Informiere dich vorab über Foto-Regeln an religiösen oder historischen Stätten.",
  },
  {
    icon: Calendar,
    title: "Planung",
    content: "Recherchiere die beste Reisezeit basierend auf Klima und lokalen Festivals.",
  },
  {
    icon: AlertTriangle,
    title: "Sicherheit",
    content: "Registriere dich bei deiner Botschaft und halte Kopien wichtiger Dokumente bereit.",
  },
]

export function TravelTips({ countryId }: TravelTipsProps) {
  const [currentTip, setCurrentTip] = useState(0)
  const country = useMemo(() => countries.find((c) => c.id === countryId), [countryId])
  const tips = countryTips[countryId] || defaultTips

  const nextTip = () => setCurrentTip((prev) => (prev + 1) % tips.length)
  const prevTip = () => setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length)

  const tip = tips[currentTip]
  const Icon = tip.icon

  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <h4 className="font-medium text-sm">Reisetipps für {country?.name}</h4>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevTip} className="p-1 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-xs text-muted-foreground px-1">
            {currentTip + 1}/{tips.length}
          </span>
          <button onClick={nextTip} className="p-1 rounded-full hover:bg-white/10 transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h5 className="font-medium text-sm">{tip.title}</h5>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tip.content}</p>
        </div>
      </div>
    </div>
  )
}
