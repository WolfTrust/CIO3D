"use client"

import { useState, useRef, useCallback, useEffect, lazy, Suspense } from "react"
import { Header } from "@/components/header"
// Direkter Import für D3.js (Standard)
import { GlobeMap as GlobeMapD3, type GlobeMapHandle } from "@/components/globe-map"

// Nur CesiumJS lazy laden (optional)
const GlobeMapCesium = lazy(() => 
  import("@/components/globe-map-cesium")
    .then(m => ({ default: m.GlobeMap }))
    .catch(err => {
      console.warn("CesiumJS nicht verfügbar, verwende D3.js:", err)
      // Fallback zur D3.js-Komponente wenn CesiumJS nicht verfügbar ist
      return import("@/components/globe-map").then(m => ({ default: m.GlobeMap }))
    })
)
import { CountryList } from "@/components/country-list"
import { BucketList } from "@/components/bucket-list"
import { Achievements } from "@/components/achievements"
import { Timeline } from "@/components/timeline"
import { Settings } from "@/components/settings"
import { SearchCountries } from "@/components/search-countries"
import { ShareCard } from "@/components/share-card"
import { TravelStatsCharts } from "@/components/travel-stats-charts"
import { WelcomeOverlay } from "@/components/welcome-overlay"
import { ExploreTab } from "@/components/explore-tab"
import { YearInReview } from "@/components/year-in-review"
import { AchievementToast } from "@/components/achievement-toast"
import { Onboarding } from "@/components/onboarding"
import { OfflineIndicator } from "@/components/offline-indicator"
import { Members } from "@/components/members"
import { Events } from "@/components/events"
import { EventsAdmin } from "@/components/events-admin"
import { EventsHydration } from "@/components/events-hydration"
import { MembersHydration } from "@/components/members-hydration"

export function HomeContent() {
  const [activeTab, setActiveTab] = useState("map")
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [showEventsAdmin, setShowEventsAdmin] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false) // Kein Anfangs-Fenster „Land oder Hauptstadt suchen“
  const [isYearInReviewOpen, setIsYearInReviewOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [useCesiumGlobe, setUseCesiumGlobe] = useState(true) // Cesium als Standard; Umschaltung unter Mehr → Erscheinungsbild
  const globeRef = useRef<GlobeMapHandle>(null)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]) // Für Cleanup bei Unmount
  const openedEventFromGlobeRef = useRef(false) // Back aus Event-Detail → zurück zur Globus-Ansicht

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("cio-venture-onboarding-complete")
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  // Timeout-Cleanup bei Unmount (vermeidet setState nach Unmount / offene Timer)
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => clearTimeout(id))
      timeoutsRef.current = []
    }
  }, [])

  const handleOnboardingComplete = useCallback(() => {
    localStorage.setItem("cio-venture-onboarding-complete", "true")
    setShowOnboarding(false)
  }, [])

  const handleCountryClick = useCallback((countryId: string) => {
    setSelectedCountry(countryId)
  }, [])

  const handleSearchSelect = useCallback((countryId: string) => {
    setActiveTab("map")
    const t1 = setTimeout(() => {
      globeRef.current?.flyToCountry(countryId)
      const t2 = setTimeout(() => {
        setSelectedCountry(countryId)
      }, 1600)
      timeoutsRef.current.push(t2)
    }, 100)
    timeoutsRef.current.push(t1)
  }, [])

  const handleStartExploring = useCallback(() => {
    setShowWelcome(false)
    setIsSearchOpen(true)
  }, [])

  const handleWelcomeCountryClick = useCallback((countryId: string) => {
    setShowWelcome(false)
    const t1 = setTimeout(() => {
      globeRef.current?.flyToCountry(countryId)
      const t2 = setTimeout(() => {
        setSelectedCountry(countryId)
      }, 1600)
      timeoutsRef.current.push(t2)
    }, 100)
    timeoutsRef.current.push(t1)
  }, [])

  const handleExploreCountrySelect = useCallback((countryId: string) => {
    setSelectedCountry(countryId)
  }, [])

  const handleEventClick = useCallback((eventId: string) => {
    openedEventFromGlobeRef.current = true
    setSelectedEventId(eventId)
    setActiveTab("events")
  }, [])

  const handleEventSelect = useCallback((eventId: string | null) => {
    setSelectedEventId(eventId)
    if (eventId === null && openedEventFromGlobeRef.current) {
      openedEventFromGlobeRef.current = false
      setActiveTab("map")
    }
  }, [])

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <EventsHydration />
      <MembersHydration />
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      <OfflineIndicator />

      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSearchClick={() => setIsSearchOpen(true)}
        onShareClick={() => setIsShareOpen(true)}
      />

      <div className="flex-1 overflow-hidden relative">
        {activeTab === "map" && (
          <>
            {/* Globe-Komponente (Globen-Auswahl: Mehr → Erscheinungsbild) */}
            {useCesiumGlobe ? (
              <Suspense 
                fallback={
                  <div className="absolute inset-0 flex items-center justify-center bg-background">
                    <div className="text-center">
                      <div className="text-muted-foreground mb-2">Lade CesiumJS Globe...</div>
                      <div className="text-xs text-muted-foreground">Dies kann einen Moment dauern</div>
                    </div>
                  </div>
                }
              >
                <GlobeMapCesium
                  ref={globeRef}
                  onCountryClick={handleCountryClick}
                  selectedCountry={selectedCountry}
                  onEventClick={handleEventClick}
                />
              </Suspense>
            ) : (
              <GlobeMapD3
                ref={globeRef}
                onCountryClick={handleCountryClick}
                selectedCountry={selectedCountry}
                onEventClick={handleEventClick}
              />
            )}

            {showWelcome && (
              <WelcomeOverlay onStartExploring={handleStartExploring} onCountryClick={handleWelcomeCountryClick} />
            )}
          </>
        )}
        {activeTab === "members" && <Members />}
        {activeTab === "events" && (
          showEventsAdmin ? (
            <EventsAdmin onBack={() => setShowEventsAdmin(false)} />
          ) : (
            <div className="relative h-full">
              <Events selectedEventId={selectedEventId} onEventSelect={handleEventSelect} />
              <button
                onClick={() => setShowEventsAdmin(true)}
                className="absolute top-4 right-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg z-10"
              >
                Admin
              </button>
            </div>
          )
        )}
        {activeTab === "explore" && <ExploreTab onSelectCountry={handleExploreCountrySelect} />}
        {activeTab === "countries" && <CountryList onCountryClick={handleCountryClick} />}
        {activeTab === "timeline" && <Timeline onCountryClick={handleCountryClick} />}
        {activeTab === "stats" && <TravelStatsCharts />}
        {activeTab === "bucket" && <BucketList onCountryClick={handleCountryClick} />}
        {activeTab === "achievements" && <Achievements />}
        {activeTab === "settings" && (
          <Settings
            onOpenYearInReview={() => setIsYearInReviewOpen(true)}
            useCesiumGlobe={useCesiumGlobe}
            setUseCesiumGlobe={setUseCesiumGlobe}
          />
        )}

        <SearchCountries
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectCountry={handleSearchSelect}
        />
      </div>


      <ShareCard isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />

      <YearInReview isOpen={isYearInReviewOpen} onClose={() => setIsYearInReviewOpen(false)} />

      <AchievementToast />
    </main>
  )
}
