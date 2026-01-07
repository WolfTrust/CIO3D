"use client"

import { useEffect, useState, useMemo } from "react"
import { Trophy, X } from "lucide-react"
import { useTravelStore, getUnlockedAchievements } from "@/lib/travel-store"
import type { achievements } from "@/lib/countries-data"

export function AchievementToast() {
  const travels = useTravelStore((state) => state.travels)
  const [shownAchievements, setShownAchievements] = useState<Set<string>>(new Set())
  const [currentToast, setCurrentToast] = useState<(typeof achievements)[0] | null>(null)

  const unlockedAchievements = useMemo(() => getUnlockedAchievements(travels), [travels])

  useEffect(() => {
    // Check for newly unlocked achievements
    const newlyUnlocked = unlockedAchievements.find((a) => !shownAchievements.has(a.id))

    if (newlyUnlocked && shownAchievements.size > 0) {
      setCurrentToast(newlyUnlocked)
      setShownAchievements((prev) => new Set([...prev, newlyUnlocked.id]))

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setCurrentToast(null)
      }, 5000)

      return () => clearTimeout(timer)
    } else if (newlyUnlocked) {
      // First render, just mark as shown without displaying
      setShownAchievements((prev) => new Set([...prev, newlyUnlocked.id]))
    }
  }, [unlockedAchievements, shownAchievements])

  // Initialize shown achievements on mount
  useEffect(() => {
    const initialShown = new Set(unlockedAchievements.map((a) => a.id))
    setShownAchievements(initialShown)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!currentToast) return null

  return (
    <div className="fixed top-20 left-4 right-4 z-50 animate-in slide-in-from-top duration-300">
      <div className="bg-gradient-to-r from-yellow-500/20 via-primary/20 to-yellow-500/20 border border-yellow-500/30 rounded-2xl p-4 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-2xl shrink-0">
            {currentToast.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-medium text-yellow-500">Erfolg freigeschaltet!</span>
            </div>
            <h4 className="font-bold truncate">{currentToast.name}</h4>
            <p className="text-xs text-muted-foreground truncate">{currentToast.description}</p>
          </div>
          <button
            onClick={() => setCurrentToast(null)}
            className="p-1.5 rounded-full hover:bg-secondary transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
