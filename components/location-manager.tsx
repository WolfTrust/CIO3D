"use client"

import { useState, forwardRef, useImperativeHandle, useEffect, useRef } from "react"
import { useTravelStore, type TravelLocation } from "@/lib/travel-store"
import { searchCities, findCityByName, type CityData } from "@/lib/city-coordinates"
import {
  MapPin,
  Building2,
  Landmark,
  TreePine,
  Waves,
  Mountain,
  MoreHorizontal,
  Plus,
  Star,
  Trash2,
  Edit2,
  Check,
  X,
  Calendar,
  ChevronDown,
  ChevronUp,
  Navigation,
} from "lucide-react"

interface LocationManagerProps {
  countryId: string
  countryName: string
}

export interface LocationManagerHandle {
  openAddForm: () => void
}

const locationTypes = [
  { type: "city" as const, label: "Stadt", icon: Building2 },
  { type: "landmark" as const, label: "Sehenswürdigkeit", icon: Landmark },
  { type: "nature" as const, label: "Natur", icon: TreePine },
  { type: "beach" as const, label: "Strand", icon: Waves },
  { type: "mountain" as const, label: "Berg", icon: Mountain },
  { type: "other" as const, label: "Sonstiges", icon: MoreHorizontal },
]

function getLocationIcon(type: TravelLocation["type"]) {
  const found = locationTypes.find((t) => t.type === type)
  return found?.icon || MapPin
}

function getLocationLabel(type: TravelLocation["type"]) {
  const found = locationTypes.find((t) => t.type === type)
  return found?.label || "Ort"
}

export const LocationManager = forwardRef<LocationManagerHandle, LocationManagerProps>(function LocationManager(
  { countryId, countryName },
  ref,
) {
  const tripData = useTravelStore((state) => state.tripData)
  const addLocation = useTravelStore((state) => state.addLocation)
  const updateLocation = useTravelStore((state) => state.updateLocation)
  const deleteLocation = useTravelStore((state) => state.deleteLocation)

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)

  const [suggestions, setSuggestions] = useState<CityData[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Form states
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState<TravelLocation["type"]>("city")
  const [newDate, setNewDate] = useState("")
  const [newNotes, setNewNotes] = useState("")
  const [newRating, setNewRating] = useState(0)
  const [newCoordinates, setNewCoordinates] = useState<[number, number] | null>(null)
  const [showManualCoords, setShowManualCoords] = useState(false)
  const [manualLat, setManualLat] = useState("")
  const [manualLng, setManualLng] = useState("")

  // Edit states
  const [editName, setEditName] = useState("")
  const [editType, setEditType] = useState<TravelLocation["type"]>("city")
  const [editDate, setEditDate] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [editRating, setEditRating] = useState(0)
  const [editCoordinates, setEditCoordinates] = useState<[number, number] | null>(null)

  const locations = tripData[countryId]?.locations || []

  useImperativeHandle(ref, () => ({
    openAddForm: () => {
      setExpanded(true)
      setShowAddForm(true)
    },
  }))

  useEffect(() => {
    if (newName.length >= 2) {
      const results = searchCities(newName, countryId)
      setSuggestions(results)
      setShowSuggestions(results.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [newName, countryId])

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectSuggestion = (city: CityData) => {
    setNewName(city.name)
    setNewCoordinates(city.coordinates)
    setShowSuggestions(false)
  }

  const applyManualCoords = () => {
    const lat = Number.parseFloat(manualLat)
    const lng = Number.parseFloat(manualLng)
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      setNewCoordinates([lat, lng])
      setShowManualCoords(false)
    }
  }

  const resetForm = () => {
    setNewName("")
    setNewType("city")
    setNewDate("")
    setNewNotes("")
    setNewRating(0)
    setNewCoordinates(null)
    setShowAddForm(false)
    setShowManualCoords(false)
    setManualLat("")
    setManualLng("")
  }

  const handleAdd = () => {
    if (!newName.trim()) return

    // Try to find coordinates if not set
    let coords = newCoordinates
    if (!coords) {
      const found = findCityByName(newName, countryId)
      if (found) {
        coords = found.coordinates
      }
    }

    addLocation(countryId, {
      name: newName.trim(),
      type: newType,
      date: newDate || undefined,
      notes: newNotes || undefined,
      rating: newRating || undefined,
      coordinates: coords || undefined,
    })
    resetForm()
  }

  const startEdit = (location: TravelLocation) => {
    setEditingId(location.id)
    setEditName(location.name)
    setEditType(location.type)
    setEditDate(location.date || "")
    setEditNotes(location.notes || "")
    setEditRating(location.rating || 0)
    setEditCoordinates(location.coordinates || null)
  }

  const handleUpdate = () => {
    if (!editingId || !editName.trim()) return
    updateLocation(countryId, editingId, {
      name: editName.trim(),
      type: editType,
      date: editDate || undefined,
      notes: editNotes || undefined,
      rating: editRating || undefined,
      coordinates: editCoordinates || undefined,
    })
    setEditingId(null)
  }

  const toggleFavorite = (location: TravelLocation) => {
    updateLocation(countryId, location.id, { favorite: !location.favorite })
  }

  return (
    <div className="bg-secondary/50 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/70 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <h4 className="font-medium text-sm">Besuchte Orte in {countryName}</h4>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{locations.length}</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Locations List */}
          {locations.length > 0 ? (
            <div className="space-y-2">
              {locations.map((location) => {
                const Icon = getLocationIcon(location.type)
                const isEditing = editingId === location.id

                if (isEditing) {
                  return (
                    <div key={location.id} className="bg-background rounded-lg p-3 space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Name des Ortes"
                          className="flex-1 px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {locationTypes.map((lt) => (
                          <button
                            key={lt.type}
                            onClick={() => setEditType(lt.type)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
                              editType === lt.type
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary hover:bg-secondary/80"
                            }`}
                          >
                            <lt.icon className="w-3 h-3" />
                            {lt.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="flex-1 px-3 py-2 bg-secondary rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => setEditRating(star)} className="p-0.5">
                              <Star
                                className={`w-4 h-4 ${
                                  star <= editRating ? "fill-primary text-primary" : "text-muted hover:text-primary/50"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Coordinates display for edit */}
                      {editCoordinates && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                          <Navigation className="w-3 h-3" />
                          <span>
                            {editCoordinates[0].toFixed(4)}, {editCoordinates[1].toFixed(4)}
                          </span>
                          <button
                            onClick={() => setEditCoordinates(null)}
                            className="ml-auto text-destructive hover:text-destructive/80"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Notizen..."
                        className="w-full px-3 py-2 bg-secondary rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px] resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 py-2 px-3 bg-muted rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Abbrechen
                        </button>
                        <button
                          onClick={handleUpdate}
                          className="flex-1 py-2 px-3 bg-primary text-primary-foreground rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Speichern
                        </button>
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={location.id} className="bg-background rounded-lg p-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-sm truncate">{location.name}</h5>
                        {location.favorite && <Star className="w-3 h-3 fill-primary text-primary shrink-0" />}
                        {location.coordinates && (
                          <MapPin className="w-3 h-3 text-green-500 shrink-0" title="Auf Karte sichtbar" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{getLocationLabel(location.type)}</span>
                        {location.date && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(location.date).toLocaleDateString("de-DE")}
                            </span>
                          </>
                        )}
                        {location.rating && location.rating > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-2.5 h-2.5 ${
                                    star <= location.rating! ? "fill-primary text-primary" : "text-muted"
                                  }`}
                                />
                              ))}
                            </span>
                          </>
                        )}
                      </div>
                      {location.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{location.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleFavorite(location)}
                        className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            location.favorite ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary"
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => startEdit(location)}
                        className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => deleteLocation(countryId, location.id)}
                        className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : !showAddForm ? (
            <p className="text-xs text-muted-foreground text-center py-3">Noch keine Orte erfasst</p>
          ) : null}

          {/* Add Form */}
          {showAddForm ? (
            <div className="bg-background rounded-lg p-3 space-y-3">
              <div className="relative" ref={suggestionsRef}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Name des Ortes (z.B. Paris, Eiffelturm)"
                  className="w-full px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                    {suggestions.map((city, index) => (
                      <button
                        key={`${city.name}-${index}`}
                        onClick={() => selectSuggestion(city)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-secondary flex items-center gap-2 transition-colors"
                      >
                        <MapPin className="w-3 h-3 text-primary" />
                        <span>{city.name}</span>
                        <Navigation className="w-3 h-3 text-green-500 ml-auto" title="Hat Koordinaten" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                {locationTypes.map((lt) => (
                  <button
                    key={lt.type}
                    onClick={() => setNewType(lt.type)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
                      newType === lt.type ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    <lt.icon className="w-3 h-3" />
                    {lt.label}
                  </button>
                ))}
              </div>

              {newCoordinates ? (
                <div className="flex items-center gap-2 text-xs bg-green-500/10 text-green-500 px-3 py-2 rounded-lg">
                  <Navigation className="w-4 h-4" />
                  <span>
                    Koordinaten: {newCoordinates[0].toFixed(4)}, {newCoordinates[1].toFixed(4)}
                  </span>
                  <button onClick={() => setNewCoordinates(null)} className="ml-auto hover:text-green-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : showManualCoords ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="any"
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      placeholder="Breitengrad (-90 bis 90)"
                      className="flex-1 px-3 py-2 bg-secondary rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="number"
                      step="any"
                      value={manualLng}
                      onChange={(e) => setManualLng(e.target.value)}
                      placeholder="Längengrad (-180 bis 180)"
                      className="flex-1 px-3 py-2 bg-secondary rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowManualCoords(false)}
                      className="flex-1 py-1.5 text-xs bg-muted rounded-lg"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={applyManualCoords}
                      className="flex-1 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg"
                    >
                      Anwenden
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowManualCoords(true)}
                  className="w-full py-2 text-xs text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Navigation className="w-3 h-3" />
                  Koordinaten manuell eingeben (für Stecknadel auf Karte)
                </button>
              )}

              <div className="flex gap-2">
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="flex-1 px-3 py-2 bg-secondary rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setNewRating(star)} className="p-0.5">
                      <Star
                        className={`w-4 h-4 ${
                          star <= newRating ? "fill-primary text-primary" : "text-muted hover:text-primary/50"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Notizen zu diesem Ort..."
                className="w-full px-3 py-2 bg-secondary rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px] resize-none"
              />

              <div className="flex gap-2">
                <button
                  onClick={resetForm}
                  className="flex-1 py-2 px-3 bg-muted rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Abbrechen
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newName.trim()}
                  className="flex-1 py-2 px-3 bg-primary text-primary-foreground rounded-lg text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  <Check className="w-3 h-3" />
                  Hinzufügen
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Neuen Ort hinzufügen
            </button>
          )}
        </div>
      )}
    </div>
  )
})
