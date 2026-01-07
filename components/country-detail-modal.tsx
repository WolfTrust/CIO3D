"use client"

import type React from "react"

import { useTravelStore, type TravelStatus } from "@/lib/travel-store"
import { countries } from "@/lib/countries-data"
import {
  X,
  Plane,
  Heart,
  MapPin,
  XCircle,
  Users,
  Map,
  Languages,
  Coins,
  Calendar,
  Star,
  FileText,
  Bookmark,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  UtensilsCrossed,
  Camera,
} from "lucide-react"
import { useMemo, useState, useEffect, useRef } from "react"
import { LocationManager } from "./location-manager"
import { CountryMap2D } from "./country-map-2d"
import { TravelTips } from "./travel-tips"
import { EmergencyInfo } from "./emergency-info"
import { BestTravelTime } from "./best-travel-time"
import { CurrencyConverter } from "./currency-converter"
import { PhraseBook } from "./phrase-book"
import { PhotoGallery } from "./photo-gallery"
import { LocalCuisine } from "./local-cuisine"
import { WeatherWidget } from "./weather-widget"

interface CountryDetailModalProps {
  countryId: string | null
  onClose: () => void
}

interface CollapsibleSectionProps {
  id: string
  title: string
  icon: typeof MapPin
  iconColor: string
  children: React.ReactNode
}

export function CountryDetailModal({ countryId, onClose }: CountryDetailModalProps) {
  const travels = useTravelStore((state) => state.travels)
  const tripData = useTravelStore((state) => state.tripData)
  const setCountryStatus = useTravelStore((state) => state.setCountryStatus)
  const updateTripData = useTravelStore((state) => state.updateTripData)
  const addToRecentlyViewed = useTravelStore((state) => state.addToRecentlyViewed)

  const locationManagerRef = useRef<{ openAddForm: () => void } | null>(null)

  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState("")
  const [visitDate, setVisitDate] = useState("")
  const [rating, setRating] = useState(0)
  const [isMapFullscreen, setIsMapFullscreen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(["info"])

  const country = useMemo(() => {
    if (!countryId) return null
    return countries.find((c) => c.id === countryId)
  }, [countryId])

  useEffect(() => {
    if (countryId && country) {
      addToRecentlyViewed(countryId)
      const data = tripData[countryId]
      if (data) {
        setNotes(data.notes || "")
        setVisitDate(data.date || "")
        setRating(data.rating || 0)
      } else {
        setNotes("")
        setVisitDate("")
        setRating(0)
      }
    }
  }, [countryId, country, tripData, addToRecentlyViewed])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  if (!country) return null

  const currentStatus = travels[country.id]
  const currentTripData = tripData[country.id] || {}
  const hasLocations = (currentTripData.locations?.length || 0) > 0

  const statusOptions: { status: TravelStatus; label: string; icon: typeof Plane; color: string }[] = [
    { status: "visited", label: "Besucht", icon: Plane, color: "bg-chart-2 text-chart-2" },
    { status: "lived", label: "Gelebt", icon: Heart, color: "bg-chart-3 text-chart-3" },
    { status: "bucket-list", label: "Bucket List", icon: MapPin, color: "bg-chart-1 text-chart-1" },
    { status: null, label: "Entfernen", icon: XCircle, color: "bg-muted text-muted-foreground" },
  ]

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("de-DE").format(num)
  }

  const handleSaveNotes = () => {
    updateTripData(country.id, {
      notes,
      date: visitDate,
      rating,
    })
    setShowNotes(false)
  }

  const toggleFavorite = () => {
    updateTripData(country.id, {
      favorite: !currentTripData.favorite,
    })
  }

  const handleAddLocationFromMap = () => {
    locationManagerRef.current?.openAddForm()
  }

  const CollapsibleSection = ({ id, title, icon: Icon, iconColor, children }: CollapsibleSectionProps) => {
    const isExpanded = expandedSections.includes(id)
    return (
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-3 bg-secondary/30 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${iconColor}`} />
            <span className="font-medium text-sm">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        {isExpanded && <div className="p-3 border-t border-border">{children}</div>}
      </div>
    )
  }

  if (isMapFullscreen && (currentStatus === "visited" || currentStatus === "lived")) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        {/* Fullscreen Header */}
        <div className="flex items-center justify-between p-3 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{country.flag}</span>
            <div>
              <h2 className="font-bold">{country.name}</h2>
              <p className="text-xs text-muted-foreground">
                {hasLocations ? `${currentTripData.locations?.length} Orte` : "Keine Orte"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddLocationFromMap}
              className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <MapPin className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMapFullscreen(false)}
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Fullscreen Map */}
        <div className="flex-1 min-h-0">
          <CountryMap2D countryId={country.id} onAddLocation={handleAddLocationFromMap} fullscreen />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="relative p-5 pb-3">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={toggleFavorite}
            className="absolute right-14 top-3 p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Bookmark
              className={`w-5 h-5 ${currentTripData.favorite ? "fill-primary text-primary" : "text-muted-foreground"}`}
            />
          </button>

          <div className="flex items-center gap-4">
            <span className="text-5xl">{country.flag}</span>
            <div>
              <h2 className="text-xl font-bold">{country.name}</h2>
              <p className="text-sm text-muted-foreground">{country.capital}</p>
              {currentTripData.rating && currentTripData.rating > 0 && (
                <div className="flex items-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${star <= currentTripData.rating! ? "fill-primary text-primary" : "text-muted"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 max-h-[75vh] sm:max-h-[65vh] overflow-y-auto space-y-4">
          <WeatherWidget countryId={country.id} />

          {/* 2D Map mit Fullscreen-Button */}
          {(currentStatus === "visited" || currentStatus === "lived") && (
            <div className="relative">
              <CountryMap2D countryId={country.id} onAddLocation={handleAddLocationFromMap} />
              <button
                onClick={() => setIsMapFullscreen(true)}
                className="absolute top-12 right-3 p-2 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-colors shadow-md"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Status Selection */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Status auswählen</p>
            <div className="grid grid-cols-2 gap-2.5">
              {statusOptions.map((option) => {
                const Icon = option.icon
                const isSelected = currentStatus === option.status
                return (
                  <button
                    key={option.status ?? "null"}
                    onClick={() => {
                      setCountryStatus(country.id, option.status)
                      if (option.status === null) {
                        onClose()
                      }
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? `border-current ${option.color.split(" ")[1]} bg-current/10`
                        : "border-border hover:border-muted-foreground/50"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${option.color.split(" ")[0]}/20`}
                    >
                      <Icon className={`w-4 h-4 ${option.color.split(" ")[1]}`} />
                    </div>
                    <span className="font-medium text-sm">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Stats Grid - Collapsible */}
          <CollapsibleSection id="info" title="Landesinformationen" icon={Map} iconColor="text-blue-500">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-secondary rounded-xl p-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-xs">Bevölkerung</span>
                </div>
                <p className="font-semibold text-sm">{formatNumber(country.population)}</p>
              </div>
              <div className="bg-secondary rounded-xl p-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Map className="w-3.5 h-3.5" />
                  <span className="text-xs">Fläche</span>
                </div>
                <p className="font-semibold text-sm">{formatNumber(country.area)} km²</p>
              </div>
              <div className="bg-secondary rounded-xl p-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Languages className="w-3.5 h-3.5" />
                  <span className="text-xs">Sprache</span>
                </div>
                <p className="font-semibold text-sm">{country.language}</p>
              </div>
              <div className="bg-secondary rounded-xl p-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Coins className="w-3.5 h-3.5" />
                  <span className="text-xs">Währung</span>
                </div>
                <p className="font-semibold text-sm">
                  {country.currency} ({country.currencySymbol})
                </p>
              </div>
            </div>
          </CollapsibleSection>

          {/* Trip Diary - nur für besuchte/gelebte Länder */}
          {(currentStatus === "visited" || currentStatus === "lived") && (
            <>
              <div className="bg-secondary/50 rounded-xl p-4">
                {!showNotes ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">Reise-Tagebuch</h4>
                      <button
                        onClick={() => setShowNotes(true)}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        Bearbeiten
                      </button>
                    </div>
                    {currentTripData.date && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3" />
                        Besucht am {new Date(currentTripData.date).toLocaleDateString("de-DE")}
                      </p>
                    )}
                    {currentTripData.notes ? (
                      <p className="text-sm text-muted-foreground">{currentTripData.notes}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Keine Notizen vorhanden</p>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Besuchsdatum</label>
                      <input
                        type="date"
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="w-full px-3 py-2 bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Bewertung</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} onClick={() => setRating(star)} className="p-1">
                            <Star
                              className={`w-6 h-6 transition-colors ${star <= rating ? "fill-primary text-primary" : "text-muted hover:text-primary/50"}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Notizen</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Schreibe deine Erinnerungen..."
                        className="w-full px-3 py-2 bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowNotes(false)}
                        className="flex-1 py-2 px-3 bg-muted rounded-lg text-sm font-medium"
                      >
                        Abbrechen
                      </button>
                      <button
                        onClick={handleSaveNotes}
                        className="flex-1 py-2 px-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
                      >
                        Speichern
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <CollapsibleSection id="photos" title="Fotos" icon={Camera} iconColor="text-pink-500">
                <PhotoGallery countryId={country.id} />
              </CollapsibleSection>

              <LocationManager ref={locationManagerRef} countryId={country.id} countryName={country.name} />
            </>
          )}

          <CollapsibleSection id="cuisine" title="Lokale Küche" icon={UtensilsCrossed} iconColor="text-orange-500">
            <LocalCuisine countryId={country.id} />
          </CollapsibleSection>

          <CollapsibleSection id="emergency" title="Notfall & Visum" icon={MapPin} iconColor="text-red-500">
            <EmergencyInfo countryId={country.id} />
          </CollapsibleSection>

          <CollapsibleSection id="weather" title="Beste Reisezeit" icon={Calendar} iconColor="text-amber-500">
            <BestTravelTime countryId={country.id} />
          </CollapsibleSection>

          <CollapsibleSection id="currency" title="Währungsrechner" icon={Coins} iconColor="text-green-500">
            <CurrencyConverter countryId={country.id} />
          </CollapsibleSection>

          <CollapsibleSection id="phrases" title="Sprachführer" icon={Languages} iconColor="text-purple-500">
            <PhraseBook countryId={country.id} />
          </CollapsibleSection>

          {(currentStatus === "bucket-list" || !currentStatus) && <TravelTips countryId={country.id} />}
        </div>
      </div>
    </div>
  )
}
