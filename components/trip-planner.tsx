"use client"

import { useState, useMemo } from "react"
import { Plus, Trash2, Plane, X } from "lucide-react"
import { countries } from "@/lib/countries-data"

interface PlannedTrip {
  id: string
  countryId: string
  startDate: string
  endDate: string
  notes: string
  activities: string[]
}

export function TripPlanner() {
  const [trips, setTrips] = useState<PlannedTrip[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("wanderlust-planned-trips")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [isAddingTrip, setIsAddingTrip] = useState(false)
  const [editingTrip, setEditingTrip] = useState<string | null>(null)
  const [newTrip, setNewTrip] = useState({
    countryId: "",
    startDate: "",
    endDate: "",
    notes: "",
    activities: [] as string[],
  })
  const [newActivity, setNewActivity] = useState("")

  const saveTrips = (newTrips: PlannedTrip[]) => {
    setTrips(newTrips)
    localStorage.setItem("wanderlust-planned-trips", JSON.stringify(newTrips))
  }

  const handleAddTrip = () => {
    if (!newTrip.countryId || !newTrip.startDate) return

    const trip: PlannedTrip = {
      id: `trip_${Date.now()}`,
      ...newTrip,
    }

    saveTrips([...trips, trip])
    setNewTrip({
      countryId: "",
      startDate: "",
      endDate: "",
      notes: "",
      activities: [],
    })
    setIsAddingTrip(false)
  }

  const handleDeleteTrip = (id: string) => {
    saveTrips(trips.filter((t) => t.id !== id))
  }

  const handleAddActivity = () => {
    if (!newActivity.trim()) return
    setNewTrip({ ...newTrip, activities: [...newTrip.activities, newActivity.trim()] })
    setNewActivity("")
  }

  const handleRemoveActivity = (idx: number) => {
    setNewTrip({
      ...newTrip,
      activities: newTrip.activities.filter((_, i) => i !== idx),
    })
  }

  const upcomingTrips = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    return trips.filter((t) => t.startDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate))
  }, [trips])

  const pastTrips = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    return trips.filter((t) => t.startDate < today).sort((a, b) => b.startDate.localeCompare(a.startDate))
  }, [trips])

  const getDaysUntil = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const getTripDuration = (start: string, end: string) => {
    if (!end) return null
    const diff = new Date(end).getTime() - new Date(start).getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Plane className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold">Reiseplaner</h3>
              <p className="text-xs text-muted-foreground">Plane deine nächsten Abenteuer</p>
            </div>
          </div>
          <button onClick={() => setIsAddingTrip(true)} className="p-2 bg-primary text-primary-foreground rounded-lg">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Upcoming trips */}
      {upcomingTrips.length > 0 && (
        <div className="p-4 border-b border-border">
          <p className="text-xs text-muted-foreground mb-3">Kommende Reisen</p>
          <div className="space-y-3">
            {upcomingTrips.map((trip) => {
              const country = countries.find((c) => c.id === trip.countryId)
              const daysUntil = getDaysUntil(trip.startDate)
              const duration = getTripDuration(trip.startDate, trip.endDate)

              return (
                <div
                  key={trip.id}
                  className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-3 border border-purple-500/20"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{country?.flag}</span>
                      <div>
                        <p className="font-medium">{country?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(trip.startDate).toLocaleDateString("de-DE")}
                          {trip.endDate && ` - ${new Date(trip.endDate).toLocaleDateString("de-DE")}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                        {daysUntil === 0 ? "Heute!" : daysUntil === 1 ? "Morgen" : `In ${daysUntil} Tagen`}
                      </span>
                      {duration && <p className="text-xs text-muted-foreground mt-1">{duration} Tage</p>}
                    </div>
                  </div>
                  {trip.activities.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {trip.activities.slice(0, 3).map((act, idx) => (
                        <span key={idx} className="text-xs bg-secondary px-2 py-0.5 rounded">
                          {act}
                        </span>
                      ))}
                      {trip.activities.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{trip.activities.length - 3} mehr</span>
                      )}
                    </div>
                  )}
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="p-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Past trips */}
      {pastTrips.length > 0 && (
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-3">Vergangene geplante Reisen</p>
          <div className="space-y-2">
            {pastTrips.slice(0, 3).map((trip) => {
              const country = countries.find((c) => c.id === trip.countryId)
              return (
                <div
                  key={trip.id}
                  className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg opacity-60"
                >
                  <div className="flex items-center gap-2">
                    <span>{country?.flag}</span>
                    <span className="text-sm">{country?.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(trip.startDate).toLocaleDateString("de-DE")}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {trips.length === 0 && (
        <div className="p-6 text-center text-muted-foreground">
          <Plane className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Noch keine Reisen geplant</p>
          <p className="text-xs mt-1">Tippe + um deine erste Reise zu planen</p>
        </div>
      )}

      {/* Add Trip Modal */}
      {isAddingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
              <h3 className="font-semibold">Reise planen</h3>
              <button onClick={() => setIsAddingTrip(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Reiseziel</label>
                <select
                  value={newTrip.countryId}
                  onChange={(e) => setNewTrip({ ...newTrip, countryId: e.target.value })}
                  className="w-full mt-1 p-3 bg-secondary rounded-xl border-0 text-sm"
                >
                  <option value="">Land auswählen</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground">Von</label>
                  <input
                    type="date"
                    value={newTrip.startDate}
                    onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                    className="w-full mt-1 p-3 bg-secondary rounded-xl border-0 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Bis</label>
                  <input
                    type="date"
                    value={newTrip.endDate}
                    onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                    className="w-full mt-1 p-3 bg-secondary rounded-xl border-0 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Notizen</label>
                <textarea
                  value={newTrip.notes}
                  onChange={(e) => setNewTrip({ ...newTrip, notes: e.target.value })}
                  placeholder="Flugdetails, Unterkunft, etc."
                  rows={2}
                  className="w-full mt-1 p-3 bg-secondary rounded-xl border-0 text-sm resize-none"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Geplante Aktivitäten</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddActivity()}
                    placeholder="z.B. Eiffelturm besuchen"
                    className="flex-1 p-2 bg-secondary rounded-lg border-0 text-sm"
                  />
                  <button onClick={handleAddActivity} className="p-2 bg-secondary rounded-lg">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {newTrip.activities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newTrip.activities.map((act, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full"
                      >
                        {act}
                        <button onClick={() => handleRemoveActivity(idx)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleAddTrip}
                disabled={!newTrip.countryId || !newTrip.startDate}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-50"
              >
                Reise speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
