"use client"

import { useTravelStore, getStats, getUnlockedAchievements } from "@/lib/travel-store"
import { achievements } from "@/lib/countries-data"
import { Lock, Check } from "lucide-react"
import { useMemo } from "react"

export function Achievements() {
  const travels = useTravelStore((state) => state.travels)

  const unlockedAchievements = useMemo(() => getUnlockedAchievements(travels), [travels])
  const stats = useMemo(() => getStats(travels), [travels])

  const isUnlocked = (achievementId: string) => {
    return unlockedAchievements.some((a) => a.id === achievementId)
  }

  const getProgress = (achievement: (typeof achievements)[0]) => {
    if (achievement.continent) {
      const continentStat = stats.continentStats.find((c) => c.id === achievement.continent)
      return continentStat ? Math.min(continentStat.visited, achievement.requirement) : 0
    }
    return Math.min(stats.visited, achievement.requirement)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Erfolge</h2>
        <span className="text-sm text-muted-foreground">
          {unlockedAchievements.length}/{achievements.length} freigeschaltet
        </span>
      </div>

      <div className="space-y-3">
        {achievements.map((achievement) => {
          const unlocked = isUnlocked(achievement.id)
          const progress = getProgress(achievement)
          const progressPercent = (progress / achievement.requirement) * 100

          return (
            <div
              key={achievement.id}
              className={`relative p-4 rounded-xl border transition-all ${
                unlocked ? "bg-primary/10 border-primary/30" : "bg-card border-border"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                    unlocked ? "bg-primary/20" : "bg-muted"
                  }`}
                >
                  {unlocked ? achievement.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${unlocked ? "text-primary" : ""}`}>{achievement.name}</h3>
                    {unlocked && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>

                  {!unlocked && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Fortschritt</span>
                        <span>
                          {progress}/{achievement.requirement}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/50 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
