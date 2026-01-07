"use client"

import { useState } from "react"
import { Plus, X, MapPin, Star, Heart } from "lucide-react"
import { useTravelStore } from "@/lib/travel-store"
import { countries } from "@/lib/countries-data"

interface QuickAddButtonProps {
  onCountryAdded?: (countryId: string) => void
}

export function QuickAddButton({ onCountryAdded }: QuickAddButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedAction, setSelectedAction] = useState<"visited" | "lived" | "bucketList" | null>(null)
  const setCountryStatus = useTravelStore((state) => state.setCountryStatus)
  const travels = useTravelStore((state) => state.travels)

  const filteredCountries = countries
    .filter((c) => !travels[c.id])
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) || c.capital.toLowerCase().includes(search.toLowerCase()),
    )
    .slice(0, 8)

  const handleSelectCountry = (countryId: string) => {
    if (selectedAction) {
      setCountryStatus(countryId, selectedAction)
      onCountryAdded?.(countryId)
      setIsOpen(false)
      setSearch("")
      setSelectedAction(null)
    }
  }

  const actions = [
    {
      id: "visited" as const,
      icon: MapPin,
      label: "Besucht",
      color: "text-green-500 bg-green-500/10 border-green-500/30",
    },
    {
      id: "lived" as const,
      icon: Star,
      label: "Gelebt",
      color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30",
    },
    {
      id: "bucketList" as const,
      icon: Heart,
      label: "Bucket List",
      color: "text-blue-500 bg-blue-500/10 border-blue-500/30",
    },
  ]

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-bold text-lg">Land hinzufügen</h3>
              <button
                onClick={() => {
                  setIsOpen(false)
                  setSearch("")
                  setSelectedAction(null)
                }}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Selection */}
            {!selectedAction ? (
              <div className="p-4 space-y-3">
                <p className="text-sm text-muted-foreground mb-3">Was möchtest du hinzufügen?</p>
                {actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => setSelectedAction(action.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-colors ${action.color}`}
                  >
                    <action.icon className="w-5 h-5" />
                    <span className="font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4">
                {/* Search */}
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Land suchen..."
                  className="w-full px-4 py-3 bg-secondary rounded-xl text-sm outline-none focus:ring-2 ring-primary mb-3"
                  autoFocus
                />

                {/* Country List */}
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.id}
                      onClick={() => handleSelectCountry(country.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors"
                    >
                      <span className="text-2xl">{country.flag}</span>
                      <div className="text-left">
                        <div className="font-medium">{country.name}</div>
                        <div className="text-xs text-muted-foreground">{country.continent}</div>
                      </div>
                    </button>
                  ))}
                  {filteredCountries.length === 0 && (
                    <p className="text-center text-muted-foreground py-4 text-sm">
                      {search ? "Keine Länder gefunden" : "Alle Länder bereits hinzugefügt"}
                    </p>
                  )}
                </div>

                {/* Back Button */}
                <button
                  onClick={() => setSelectedAction(null)}
                  className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Zurück zur Auswahl
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
