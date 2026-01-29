"use client"

import { useState, useMemo } from "react"
import { useEventsStore, type Event } from "@/lib/events-store"
import { Calendar, MapPin, Users, Clock, Building2, ChevronRight, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EventDetail } from "@/components/event-detail"

const cityImages: Record<string, string> = {
  "Paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
  "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop",
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop",
}

const categoryLabels: Record<Event["category"], string> = {
  strategic: "Strategietagung",
  networking: "Networking",
  training: "Training",
  conference: "Konferenz",
  workshop: "Workshop",
  other: "Sonstiges",
}

const categoryColors: Record<Event["category"], string> = {
  strategic: "bg-blue-500/20 text-blue-600 border-blue-500/30",
  networking: "bg-purple-500/20 text-purple-600 border-purple-500/30",
  training: "bg-green-500/20 text-green-600 border-green-500/30",
  conference: "bg-orange-500/20 text-orange-600 border-orange-500/30",
  workshop: "bg-pink-500/20 text-pink-600 border-pink-500/30",
  other: "bg-gray-500/20 text-gray-600 border-gray-500/30",
}

const statusLabels: Record<Event["status"], string> = {
  upcoming: "Bevorstehend",
  ongoing: "Läuft",
  completed: "Abgeschlossen",
  cancelled: "Abgesagt",
}

const statusColors: Record<Event["status"], string> = {
  upcoming: "bg-green-500/20 text-green-600",
  ongoing: "bg-blue-500/20 text-blue-600",
  completed: "bg-gray-500/20 text-gray-600",
  cancelled: "bg-red-500/20 text-red-600",
}

interface EventsProps {
  selectedEventId?: string | null
  onEventSelect?: (eventId: string | null) => void
}

export function Events({ selectedEventId: propSelectedEventId, onEventSelect }: EventsProps = {}) {
  const events = useEventsStore((state) => state.events)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Event["category"] | "all">("all")
  const [selectedCity, setSelectedCity] = useState<string>("all")
  const [internalSelectedEventId, setInternalSelectedEventId] = useState<string | null>(null)
  
  // Verwende propSelectedEventId wenn vorhanden, sonst internal state
  const selectedEventId = propSelectedEventId !== undefined ? propSelectedEventId : internalSelectedEventId
  const setSelectedEventId = (id: string | null) => {
    if (onEventSelect) {
      onEventSelect(id)
    } else {
      setInternalSelectedEventId(id)
    }
  }

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.city.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === "all" || event.category === selectedCategory
      const matchesCity = selectedCity === "all" || event.city === selectedCity

      return matchesSearch && matchesCategory && matchesCity
    })
  }, [events, searchQuery, selectedCategory, selectedCity])

  const uniqueCities = useMemo(() => {
    return Array.from(new Set(events.map(e => e.city))).sort()
  }, [events])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("de-DE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const startFormatted = start.toLocaleDateString("de-DE", { day: "numeric", month: "long" })
    const endFormatted = end.toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })
    
    if (start.getTime() === end.getTime()) {
      return startFormatted
    }
    return `${startFormatted} - ${endFormatted}`
  }

  const getDaysUntil = (dateString: string) => {
    const eventDate = new Date(dateString)
    const now = new Date()
    const diffTime = eventDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (selectedEventId) {
    return <EventDetail eventId={selectedEventId} onBack={() => setSelectedEventId(null)} />
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 space-y-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              Events
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Strategietagungen, Konferenzen und Networking-Events
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Events suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            Alle Kategorien
          </button>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as Event["category"])}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* City Filter */}
        {uniqueCities.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCity("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCity === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              Alle Städte
            </button>
            {uniqueCities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCity === city
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory !== "all" || selectedCity !== "all"
                ? "Keine Events gefunden"
                : "Noch keine Events vorhanden"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const imageUrl = event.imageUrl || cityImages[event.city] || cityImages["Paris"]
              const daysUntil = getDaysUntil(event.startDate)
              const isUpcoming = daysUntil > 0 && event.status === "upcoming"

              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  className="group relative overflow-hidden rounded-xl border bg-card hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={event.city}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = cityImages["Paris"]
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
                        {statusLabels[event.status]}
                      </span>
                    </div>

                    {/* Days Until */}
                    {isUpcoming && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/90 text-primary-foreground backdrop-blur-sm">
                          {daysUntil === 0
                            ? "Heute"
                            : daysUntil === 1
                            ? "Morgen"
                            : `In ${daysUntil} Tagen`}
                        </span>
                      </div>
                    )}

                    {/* City Name */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center gap-2 text-white">
                        <MapPin className="w-4 h-4" />
                        <span className="font-semibold text-lg">{event.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Category */}
                    <div>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${categoryColors[event.category]}`}>
                        {categoryLabels[event.category]}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-lg line-clamp-2">{event.title}</h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

                    {/* Details */}
                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{formatDateRange(event.startDate, event.endDate)}</span>
                      </div>
                      {event.maxParticipants && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>Max. {event.maxParticipants} Teilnehmer</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
