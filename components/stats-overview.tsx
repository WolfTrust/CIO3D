"use client"

import { useTravelStore, getStats } from "@/lib/travel-store"
import { Globe, Plane, Heart, MapPin } from "lucide-react"
import { useMemo } from "react"

export function StatsOverview() {
  const travels = useTravelStore((state) => state.travels)

  const stats = useMemo(() => getStats(travels), [travels])

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      <div className="col-span-2 bg-card rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-muted-foreground text-sm">Weltkarte</p>
            <h2 className="text-4xl font-bold text-primary">{stats.percentage}%</h2>
            <p className="text-muted-foreground text-sm">der Welt bereist</p>
          </div>
          <div className="w-20 h-20 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
            <svg className="absolute w-20 h-20 -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-primary"
                strokeDasharray={`${(stats.percentage / 100) * 226} 226`}
                strokeLinecap="round"
              />
            </svg>
            <Globe className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-chart-2 mb-1">
              <Plane className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold">{stats.visited}</p>
            <p className="text-xs text-muted-foreground">Besucht</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-chart-3 mb-1">
              <Heart className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold">{stats.lived}</p>
            <p className="text-xs text-muted-foreground">Gelebt</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-chart-1 mb-1">
              <MapPin className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold">{stats.bucketList}</p>
            <p className="text-xs text-muted-foreground">Bucket List</p>
          </div>
        </div>
      </div>

      {stats.continentStats.map((continent) => (
        <div key={continent.id} className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">{continent.name}</p>
            <span className="text-xs text-muted-foreground">
              {continent.visited}/{continent.total}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${continent.percentage}%` }}
            />
          </div>
          <p className="text-right text-xs text-muted-foreground mt-1">{continent.percentage}%</p>
        </div>
      ))}
    </div>
  )
}
