"use client"

import { useState, useRef, useCallback, useEffect, lazy, Suspense } from "react"
import { Header } from "@/components/header"
import { Globe as GlobeIcon, Map } from "lucide-react"
// Dynamische Imports für beide Globe-Komponenten
const GlobeMapD3 = lazy(() => import("@/components/globe-map").then(m => ({ default: m.GlobeMap })))
const GlobeMapCesium = lazy(() => import("@/components/globe-map-cesium").then(m => ({ default: m.GlobeMap })))

// Import Types (beide Komponenten haben das gleiche Interface)
import type { GlobeMapHandle } from "@/components/globe-map"
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
import { QuickAddButton } from "@/components/quick-add-button"
import { Onboarding } from "@/components/onboarding"
import { OfflineIndicator } from "@/components/offline-indicator"
import { Members } from "@/components/members"
import { Events } from "@/components/events"
import { EventsAdmin } from "@/components/events-admin"

export function HomeContent() {
  const [activeTab, setActiveTab] = useState("map")
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [showEventsAdmin, setShowEventsAdmin] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [isYearInReviewOpen, setIsYearInReviewOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [useCesiumGlobe, setUseCesiumGlobe] = useState(false) // Toggle für CesiumJS vs D3.js
  const globeRef = useRef<GlobeMapHandle>(null)

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("cio-venture-onboarding-complete")
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
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
    setTimeout(() => {
      globeRef.current?.flyToCountry(countryId)
      setTimeout(() => {
        setSelectedCountry(countryId)
      }, 1600)
    }, 100)
  }, [])

  const handleStartExploring = useCallback(() => {
    setShowWelcome(false)
    setIsSearchOpen(true)
  }, [])

  const handleWelcomeCountryClick = useCallback((countryId: string) => {
    setShowWelcome(false)
    setTimeout(() => {
      globeRef.current?.flyToCountry(countryId)
      setTimeout(() => {
        setSelectedCountry(countryId)
      }, 1600)
    }, 100)
  }, [])

  const handleExploreCountrySelect = useCallback((countryId: string) => {
    setSelectedCountry(countryId)
  }, [])

  const handleQuickAdd = useCallback((countryId: string) => {
    setActiveTab("map")
    setShowWelcome(false)
    setTimeout(() => {
      globeRef.current?.flyToCountry(countryId)
    }, 100)
  }, [])

  const handleEventClick = useCallback((eventId: string) => {
    setSelectedEventId(eventId)
    setActiveTab("events")
  }, [])

  return (
    <main className="min-h-screen flex flex-col bg-background">
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
            {/* Toggle-Button für Globe-Ansicht */}
            <div className="absolute top-3 right-3 z-30">
              <button
                onClick={() => setUseCesiumGlobe(!useCesiumGlobe)}
                className="px-4 py-2 rounded-lg backdrop-blur-md border bg-card/95 text-foreground border-border hover:bg-accent transition-colors shadow-lg flex items-center gap-2"
                title={useCesiumGlobe ? "Zu D3.js Globe wechseln" : "Zu CesiumJS Globe wechseln"}
              >
                {useCesiumGlobe ? (
                  <>
                    <Map className="w-4 h-4" />
                    <span className="text-sm font-medium">D3.js Globe</span>
                  </>
                ) : (
                  <>
                    <GlobeIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">CesiumJS Globe</span>
                  </>
                )}
              </button>
            </div>

            {/* Dynamische Globe-Komponente */}
            <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center bg-background"><div className="text-muted-foreground">Lade Globe...</div></div>}>
              {useCesiumGlobe ? (
                <GlobeMapCesium
                  ref={globeRef}
                  onCountryClick={handleCountryClick}
                  selectedCountry={selectedCountry}
                  onEventClick={handleEventClick}
                />
              ) : (
                <GlobeMapD3
                  ref={globeRef}
                  onCountryClick={handleCountryClick}
                  selectedCountry={selectedCountry}
                  onEventClick={handleEventClick}
                />
              )}
            </Suspense>

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
              <Events selectedEventId={selectedEventId} onEventSelect={setSelectedEventId} />
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
        {activeTab === "settings" && <Settings onOpenYearInReview={() => setIsYearInReviewOpen(true)} />}

        <SearchCountries
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectCountry={handleSearchSelect}
        />
      </div>


      <ShareCard isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />

      <YearInReview isOpen={isYearInReviewOpen} onClose={() => setIsYearInReviewOpen(false)} />

      <AchievementToast />

      <QuickAddButton onCountryAdded={handleQuickAdd} />
    </main>
  )
}
