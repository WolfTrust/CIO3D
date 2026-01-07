"use client"

import { useMemo } from "react"
import { Flame, Calendar, TrendingUp, Award } from "lucide-react"
import { useTravelStore } from "@/lib/travel-store"
import { countries } from "@/lib/countries-data"

export function TravelStreak() {
  const travels = useTravelStore((state) => state.travels)
  const tripData = useTravelStore((state) => state.tripData)

  const streakData = useMemo(() => {
    const visitedWithDates = Object.entries(tripData)
      .filter(([id, data]) => data.visitDate && travels[id])
      .map(([id, data]) => ({
        id,
        date: new Date(data.visitDate!),
        year: new Date(data.visitDate!).getFullYear(),
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())

    const currentYear = new Date().getFullYear()
    const thisYearTrips = visitedWithDates.filter((v) => v.year === currentYear)
    const lastYearTrips = visitedWithDates.filter((v) => v.year === currentYear - 1)

    // Calculate yearly streak
    const yearsWithTrips = new Set(visitedWithDates.map((v) => v.year))
    let yearStreak = 0
    for (let year = currentYear; year >= 2000; year--) {
      if (yearsWithTrips.has(year)) {
        yearStreak++
      } else {
        break
      }
    }

    // Calculate monthly streak
    const monthsWithTrips = new Set(visitedWithDates.map((v) => `${v.date.getFullYear()}-${v.date.getMonth()}`))
    let monthStreak = 0
    const now = new Date()
    for (let i = 0; i < 24; i++) {
      const checkDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}`
      if (monthsWithTrips.has(key)) {
        monthStreak++
      } else {
        break
      }
    }

    return {
      yearStreak,
      monthStreak,
      thisYearTrips: thisYearTrips.length,
      lastYearTrips: lastYearTrips.length,
      totalTrips: visitedWithDates.length,
      recentTrip: visitedWithDates[0] ? countries.find((c) => c.id === visitedWithDates[0].id) : null,
      recentDate: visitedWithDates[0]?.date,
    }
  }, [travels, tripData])

  const yearProgress = Math.min((streakData.thisYearTrips / 12) * 100, 100)

  return (
    <div className="space-y-4">
      {/* Main Streak Display */}
      <div className="bg-gradient-to-br from-orange-500/20 via-red-500/10 to-yellow-500/20 rounded-2xl p-5 border border-orange-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Reise-Streak</h3>
              <p className="text-sm text-muted-foreground">Bleib am Ball!</p>
            </div>
          </div>
          {streakData.yearStreak > 0 && (
            <div className="text-right">
              <div className="text-3xl font-bold text-orange-500">{streakData.yearStreak}</div>
              <div className="text-xs text-muted-foreground">Jahre in Folge</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Dieses Jahr</span>
            </div>
            <div className="text-2xl font-bold">{streakData.thisYearTrips}</div>
            <div className="text-xs text-muted-foreground">
              {streakData.thisYearTrips > streakData.lastYearTrips ? (
                <span className="text-green-500">
                  +{streakData.thisYearTrips - streakData.lastYearTrips} vs. letztes Jahr
                </span>
              ) : streakData.thisYearTrips < streakData.lastYearTrips ? (
                <span className="text-red-500">
                  {streakData.thisYearTrips - streakData.lastYearTrips} vs. letztes Jahr
                </span>
              ) : (
                <span>Gleich wie letztes Jahr</span>
              )}
            </div>
          </div>
          <div className="bg-background/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Monats-Streak</span>
            </div>
            <div className="text-2xl font-bold">{streakData.monthStreak}</div>
            <div className="text-xs text-muted-foreground">Monate am Stück</div>
          </div>
        </div>

        {/* Year Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted-foreground">Jahresziel: 12 Länder</span>
            <span className="font-medium">{streakData.thisYearTrips}/12</span>
          </div>
          <div className="h-2 bg-background/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all duration-500"
              style={{ width: `${yearProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Trip */}
      {streakData.recentTrip && (
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{streakData.recentTrip.flag}</span>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Letzte Reise</div>
              <div className="font-semibold">{streakData.recentTrip.name}</div>
            </div>
            {streakData.recentDate && (
              <div className="text-right">
                <div className="text-xs text-muted-foreground">
                  {streakData.recentDate.toLocaleDateString("de-DE", {
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Verdiente Badges</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {streakData.yearStreak >= 1 && (
            <div className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-full text-xs font-medium text-orange-500">
              Reisender
            </div>
          )}
          {streakData.yearStreak >= 3 && (
            <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs font-medium text-blue-500">
              Globetrotter
            </div>
          )}
          {streakData.yearStreak >= 5 && (
            <div className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-xs font-medium text-purple-500">
              Weltenbummler
            </div>
          )}
          {streakData.thisYearTrips >= 5 && (
            <div className="px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full text-xs font-medium text-green-500">
              Vielreisender
            </div>
          )}
          {streakData.monthStreak >= 6 && (
            <div className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-medium text-yellow-500">
              Dauerreisender
            </div>
          )}
          {streakData.yearStreak === 0 && streakData.monthStreak === 0 && (
            <div className="text-xs text-muted-foreground">Starte deine erste Reise!</div>
          )}
        </div>
      </div>
    </div>
  )
}
