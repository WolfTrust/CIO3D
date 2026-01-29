"use client"

import { useTravelStore, getStats } from "@/lib/travel-store"
import { useState, useMemo, useEffect } from "react"
import { Target, Plus, Trash2, Trophy, TrendingUp, Check } from "lucide-react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Goal {
  id: string
  title: string
  target: number
  year: number
  createdAt: string
}

interface GoalsState {
  goals: Goal[]
  addGoal: (goal: Omit<Goal, "id" | "createdAt">) => void
  removeGoal: (id: string) => void
}

const useGoalsStore = create<GoalsState>()(
  persist(
    (set) => ({
      goals: [],
      addGoal: (goal) =>
        set((state) => ({
          goals: [
            ...state.goals,
            {
              ...goal,
              id: Math.random().toString(36).substr(2, 9),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      removeGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),
    }),
    { name: "cio-venture-goals" },
  ),
)

export function TravelGoals() {
  const travels = useTravelStore((state) => state.travels)
  const tripData = useTravelStore((state) => state.tripData)
  const goals = useGoalsStore((state) => state.goals)
  const addGoal = useGoalsStore((state) => state.addGoal)
  const removeGoal = useGoalsStore((state) => state.removeGoal)

  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoalTitle, setNewGoalTitle] = useState("")
  const [newGoalTarget, setNewGoalTarget] = useState(5)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const stats = useMemo(() => getStats(travels), [travels])
  const currentYear = new Date().getFullYear()

  const countriesThisYear = useMemo(() => {
    return Object.entries(tripData).filter(([_, data]) => {
      if (!data.date) return false
      return new Date(data.date).getFullYear() === currentYear
    }).length
  }, [tripData, currentYear])

  const handleAddGoal = () => {
    if (newGoalTitle.trim()) {
      addGoal({
        title: newGoalTitle,
        target: newGoalTarget,
        year: currentYear,
      })
      setNewGoalTitle("")
      setNewGoalTarget(5)
      setShowAddGoal(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Reise-Ziele {currentYear}
        </h3>
        <button
          onClick={() => setShowAddGoal(true)}
          className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Dieses Jahr</span>
          </div>
          <p className="text-2xl font-bold">{countriesThisYear}</p>
          <p className="text-xs text-muted-foreground">Länder besucht</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Trophy className="w-4 h-4" />
            <span className="text-xs">Gesamt</span>
          </div>
          <p className="text-2xl font-bold">{stats.visited}</p>
          <p className="text-xs text-muted-foreground">von {stats.total} Ländern</p>
        </div>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <Target className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Noch keine Ziele gesetzt</p>
          <button onClick={() => setShowAddGoal(true)} className="mt-3 text-sm text-primary hover:underline">
            Erstes Ziel erstellen
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => {
            const progress = Math.min(countriesThisYear, goal.target)
            const percentage = (progress / goal.target) * 100
            const isComplete = progress >= goal.target

            return (
              <div
                key={goal.id}
                className={`bg-card border rounded-xl p-4 ${isComplete ? "border-primary/50 bg-primary/5" : "border-border"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isComplete && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <span className="font-medium">{goal.title}</span>
                  </div>
                  <button
                    onClick={() => removeGoal(goal.id)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Fortschritt</span>
                  <span>
                    {progress}/{goal.target}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isComplete ? "bg-primary" : "bg-primary/60"}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowAddGoal(false)} />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Neues Reise-Ziel</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Titel</label>
                <input
                  type="text"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="z.B. Europa erkunden"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Anzahl Länder</label>
                <input
                  type="number"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(Number(e.target.value))}
                  min={1}
                  max={50}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1 py-2 px-3 bg-muted rounded-lg text-sm font-medium"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleAddGoal}
                  className="flex-1 py-2 px-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
                >
                  Erstellen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
