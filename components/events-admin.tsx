"use client"

import { useState, useEffect } from "react"
import { useEventsStore, type Event } from "@/lib/events-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit2, Trash2, X, Save, Calendar, MapPin, Users, Image as ImageIcon } from "lucide-react"
import { searchCities, findCityByName, type CityData } from "@/lib/city-coordinates"
import { initialEvents } from "@/lib/events-initial-data"

const cityImages: Record<string, string> = {
  "Paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
  "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop",
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop",
}

interface EventsAdminProps {
  onBack?: () => void
}

export function EventsAdmin({ onBack }: EventsAdminProps) {
  const events = useEventsStore((state) => state.events)
  const addEvent = useEventsStore((state) => state.addEvent)
  const addEventFromServer = useEventsStore((state) => state.addEventFromServer)
  const updateEvent = useEventsStore((state) => state.updateEvent)
  const deleteEvent = useEventsStore((state) => state.deleteEvent)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [citySuggestions, setCitySuggestions] = useState<CityData[]>([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)

  const [formData, setFormData] = useState<Partial<Event>>({
    title: "",
    description: "",
    city: "",
    country: "",
    coordinates: undefined,
    startDate: "",
    endDate: "",
    imageUrl: "",
    maxParticipants: undefined,
    category: "strategic",
    status: "upcoming",
  })

  useEffect(() => {
    if (formData.city && formData.city.length >= 2) {
      const results = searchCities(formData.city)
      setCitySuggestions(results)
      setShowCitySuggestions(results.length > 0)
    } else {
      setCitySuggestions([])
      setShowCitySuggestions(false)
    }
  }, [formData.city])

  const selectCity = (city: CityData) => {
    setFormData({
      ...formData,
      city: city.name,
      country: city.country.toUpperCase(),
      coordinates: city.coordinates,
      imageUrl: cityImages[city.name] || formData.imageUrl,
    })
    setShowCitySuggestions(false)
  }

  const handleOpenForm = (event?: Event) => {
    if (event) {
      setEditingId(event.id)
      setFormData({
        title: event.title,
        description: event.description,
        city: event.city,
        country: event.country,
        coordinates: event.coordinates,
        startDate: event.startDate.split("T")[0],
        endDate: event.endDate.split("T")[0],
        imageUrl: event.imageUrl,
        maxParticipants: event.maxParticipants,
        category: event.category,
        status: event.status,
      })
    } else {
      setEditingId(null)
      setFormData({
        title: "",
        description: "",
        city: "",
        country: "",
        coordinates: undefined,
        startDate: "",
        endDate: "",
        imageUrl: "",
        maxParticipants: undefined,
        category: "strategic",
        status: "upcoming",
      })
    }
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      title: "",
      description: "",
      city: "",
      country: "",
      coordinates: undefined,
      startDate: "",
      endDate: "",
      imageUrl: "",
      maxParticipants: undefined,
      category: "strategic",
      status: "upcoming",
    })
    setCitySuggestions([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.city || !formData.startDate || !formData.endDate) {
      alert("Bitte füllen Sie alle Pflichtfelder aus")
      return
    }

    const eventData = {
      title: formData.title!,
      description: formData.description || "",
      city: formData.city!,
      country: formData.country || "",
      coordinates: formData.coordinates || [0, 0],
      startDate: new Date(formData.startDate!).toISOString(),
      endDate: new Date(formData.endDate!).toISOString(),
      imageUrl: formData.imageUrl,
      maxParticipants: formData.maxParticipants,
      category: formData.category || "strategic",
      status: formData.status || "upcoming",
    }

    try {
      if (editingId) {
        const res = await fetch(`/api/events/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        })
        if (res.ok) updateEvent(editingId, eventData)
        else addEvent(eventData)
      } else {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        })
        if (res.ok) {
          const created = await res.json()
          addEventFromServer(created)
        } else {
          addEvent(eventData)
        }
      }
    } catch {
      if (editingId) updateEvent(editingId, eventData)
      else addEvent(eventData)
    }
    handleCloseForm()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Möchten Sie dieses Event wirklich löschen?")) return
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" })
      if (res.ok) deleteEvent(id)
      else deleteEvent(id)
    } catch {
      deleteEvent(id)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Events verwalten</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {events.length} Event{events.length !== 1 ? "s" : ""} vorhanden
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onBack && (
              <Button onClick={onBack} variant="outline">
                Zurück zur Übersicht
              </Button>
            )}
            <Button
              onClick={async () => {
                if (events.length === 0) {
                  try {
                    for (const event of initialEvents) {
                      const res = await fetch("/api/events", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(event),
                      })
                      if (res.ok) addEventFromServer(await res.json())
                      else addEvent(event)
                    }
                    alert("Beispiel-Events wurden geladen!")
                  } catch {
                    initialEvents.forEach((event) => addEvent(event))
                    alert("Beispiel-Events (lokal) wurden geladen!")
                  }
                }
              }}
              variant="outline"
              disabled={events.length > 0}
            >
              Beispiel-Events laden
            </Button>
            <Button onClick={() => handleOpenForm()}>
              <Plus className="w-4 h-4 mr-1" />
              Neues Event
            </Button>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Noch keine Events vorhanden</p>
            <Button onClick={() => handleOpenForm()} className="mt-4" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Erstes Event hinzufügen
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${event.status === "upcoming" ? "bg-green-500/20 text-green-600" : "bg-gray-500/20 text-gray-600"}`}>
                        {event.status === "upcoming" ? "Bevorstehend" : event.status === "completed" ? "Abgeschlossen" : event.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{event.city}, {event.country}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(event.startDate).toLocaleDateString("de-DE")} - {new Date(event.endDate).toLocaleDateString("de-DE")}
                        </span>
                      </div>
                      {event.maxParticipants && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>Max. {event.maxParticipants}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleOpenForm(event)}
                      size="sm"
                      variant="outline"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(event.id)}
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg border shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                {editingId ? "Event bearbeiten" : "Neues Event hinzufügen"}
              </h3>
              <Button onClick={handleCloseForm} size="icon-sm" variant="ghost">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Titel *</label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="z.B. Strategietagung 2024"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Beschreibung</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Beschreibung des Events..."
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="relative">
                <label className="text-sm font-medium mb-1.5 block">Stadt *</label>
                <Input
                  value={formData.city || ""}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  onFocus={() => setShowCitySuggestions(true)}
                  placeholder="Stadt"
                  required
                />
                {showCitySuggestions && citySuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-popover border border-border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {citySuggestions.map((city) => (
                      <div
                        key={`${city.name}-${city.country}`}
                        className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                        onClick={() => selectCity(city)}
                      >
                        {city.name}, {city.country.toUpperCase()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Startdatum *</label>
                  <Input
                    type="date"
                    value={formData.startDate || ""}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Enddatum *</label>
                  <Input
                    type="date"
                    value={formData.endDate || ""}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Kategorie</label>
                  <select
                    value={formData.category || "strategic"}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Event["category"] })}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="strategic">Strategietagung</option>
                    <option value="networking">Networking</option>
                    <option value="training">Training</option>
                    <option value="conference">Konferenz</option>
                    <option value="workshop">Workshop</option>
                    <option value="other">Sonstiges</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Status</label>
                  <select
                    value={formData.status || "upcoming"}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Event["status"] })}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="upcoming">Bevorstehend</option>
                    <option value="ongoing">Läuft</option>
                    <option value="completed">Abgeschlossen</option>
                    <option value="cancelled">Abgesagt</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Max. Teilnehmer</label>
                <Input
                  type="number"
                  value={formData.maxParticipants || ""}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Optional"
                  min="1"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Bild-URL</label>
                <Input
                  value={formData.imageUrl || ""}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="URL zum Event-Bild (optional)"
                />
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="mt-2 w-full h-32 object-cover rounded-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                    }}
                  />
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button onClick={handleCloseForm} variant="outline" type="button">
                  Abbrechen
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-1" />
                  {editingId ? "Speichern" : "Hinzufügen"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
