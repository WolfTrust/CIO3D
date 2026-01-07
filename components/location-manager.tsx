"use client"

import { useState, forwardRef, useImperativeHandle } from "react"
import { useTravelStore, type TravelLocation } from "@/lib/travel-store"
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

  // Form states
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState<TravelLocation["type"]>("city")
  const [newDate, setNewDate] = useState("")
  const [newNotes, setNewNotes] = useState("")
  const [newRating, setNewRating] = useState(0)

  // Edit states
  const [editName, setEditName] = useState("")
  const [editType, setEditType] = useState<TravelLocation["type"]>("city")
  const [editDate, setEditDate] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [editRating, setEditRating] = useState(0)

  const locations = tripData[countryId]?.locations || []

  useImperativeHandle(ref, () => ({
    openAddForm: () => {
      setExpanded(true)
      setShowAddForm(true)
    },
  }))

  const resetForm = () => {
    setNewName("")
    setNewType("city")
    setNewDate("")
    setNewNotes("")
    setNewRating(0)
    setShowAddForm(false)
  }

  const handleAdd = () => {
    if (!newName.trim()) return
    addLocation(countryId, {
      name: newName.trim(),
      type: newType,
      date: newDate || undefined,
      notes: newNotes || undefined,
      rating: newRating || undefined,
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
  }

  const handleUpdate = () => {
    if (!editingId || !editName.trim()) return
    updateLocation(countryId, editingId, {
      name: editName.trim(),
      type: editType,
      date: editDate || undefined,
      notes: editNotes || undefined,
      rating: editRating || undefined,
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
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Name des Ortes (z.B. Paris, Eiffelturm)"
                  className="flex-1 px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
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
