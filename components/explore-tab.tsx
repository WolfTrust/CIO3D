"use client"

import { TravelGoals } from "./travel-goals"
import { RandomDestination } from "./random-destination"
import { CountryQuiz } from "./country-quiz"
import { TravelDistance } from "./travel-distance"
import { TravelComparison } from "./travel-comparison"
import { TravelRecommendations } from "./travel-recommendations"
import { TravelStreak } from "./travel-streak"
import { TravelCalendar } from "./travel-calendar"
import { CountryComparison } from "./country-comparison"
import { BudgetTracker } from "./budget-tracker"
import { PackingList } from "./packing-list"
import { TripPlanner } from "./trip-planner"
import { TravelChallenges } from "./travel-challenges"
import { TravelInsights } from "./travel-insights"

interface ExploreTabProps {
  onSelectCountry: (countryId: string) => void
}

export function ExploreTab({ onSelectCountry }: ExploreTabProps) {
  return (
    <div className="p-4 space-y-6 pb-20 overflow-y-auto max-h-[calc(100vh-120px)]">
      <TravelInsights />
      <TravelStreak />
      <TravelChallenges />
      <TripPlanner />
      <BudgetTracker />
      <PackingList />
      <RandomDestination onSelectCountry={onSelectCountry} />
      <TravelRecommendations onSelectCountry={onSelectCountry} />
      <TravelCalendar onCountryClick={onSelectCountry} />
      <TravelGoals />
      <TravelComparison />
      <CountryComparison onSelectCountry={onSelectCountry} />
      <TravelDistance />
      <CountryQuiz />
    </div>
  )
}
