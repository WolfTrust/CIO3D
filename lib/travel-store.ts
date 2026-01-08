"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { countries, continents, achievements, type Country } from "./countries-data"

export type TravelStatus = "visited" | "bucket-list" | "lived" | null

export interface TravelLocation {
  id: string
  name: string
  type: "city" | "landmark" | "nature" | "beach" | "mountain" | "other"
  date?: string
  notes?: string
  rating?: number
  favorite?: boolean
  coordinates?: [number, number] // [latitude, longitude]
}

export interface TripData {
  date?: string
  notes?: string
  rating?: number
  photos?: string[]
  favorite?: boolean
  locations?: TravelLocation[]
}

interface TravelState {
  travels: Record<string, TravelStatus>
  tripData: Record<string, TripData>
  recentlyViewed: string[]
  setCountryStatus: (countryId: string, status: TravelStatus) => void
  updateTripData: (countryId: string, data: Partial<TripData>) => void
  addLocation: (countryId: string, location: Omit<TravelLocation, "id">) => void
  updateLocation: (countryId: string, locationId: string, data: Partial<TravelLocation>) => void
  deleteLocation: (countryId: string, locationId: string) => void
  addToRecentlyViewed: (countryId: string) => void
  exportData: () => string
  importData: (data: string) => boolean
}

export const useTravelStore = create<TravelState>()(
  persist(
    (set, get) => ({
      travels: {},
      tripData: {},
      recentlyViewed: [],

      setCountryStatus: (countryId: string, status: TravelStatus) => {
        set((state) => ({
          travels: {
            ...state.travels,
            [countryId]: status,
          },
        }))
      },

      updateTripData: (countryId: string, data: Partial<TripData>) => {
        set((state) => ({
          tripData: {
            ...state.tripData,
            [countryId]: {
              ...state.tripData[countryId],
              ...data,
            },
          },
        }))
      },

      addLocation: (countryId: string, location: Omit<TravelLocation, "id">) => {
        const id = `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        set((state) => {
          const currentLocations = state.tripData[countryId]?.locations || []
          return {
            tripData: {
              ...state.tripData,
              [countryId]: {
                ...state.tripData[countryId],
                locations: [...currentLocations, { ...location, id }],
              },
            },
          }
        })
      },

      updateLocation: (countryId: string, locationId: string, data: Partial<TravelLocation>) => {
        set((state) => {
          const currentLocations = state.tripData[countryId]?.locations || []
          return {
            tripData: {
              ...state.tripData,
              [countryId]: {
                ...state.tripData[countryId],
                locations: currentLocations.map((loc) => (loc.id === locationId ? { ...loc, ...data } : loc)),
              },
            },
          }
        })
      },

      deleteLocation: (countryId: string, locationId: string) => {
        set((state) => {
          const currentLocations = state.tripData[countryId]?.locations || []
          return {
            tripData: {
              ...state.tripData,
              [countryId]: {
                ...state.tripData[countryId],
                locations: currentLocations.filter((loc) => loc.id !== locationId),
              },
            },
          }
        })
      },

      addToRecentlyViewed: (countryId: string) => {
        set((state) => {
          const filtered = state.recentlyViewed.filter((id) => id !== countryId)
          return {
            recentlyViewed: [countryId, ...filtered].slice(0, 10),
          }
        })
      },

      exportData: () => {
        const state = get()
        return JSON.stringify({
          travels: state.travels,
          tripData: state.tripData,
          exportDate: new Date().toISOString(),
        })
      },

      importData: (data: string) => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.travels) {
            set({
              travels: parsed.travels,
              tripData: parsed.tripData || {},
            })
            return true
          }
          return false
        } catch {
          return false
        }
      },
    }),
    {
      name: "wanderlust-travels",
    },
  ),
)

// Helper functions - use these outside of React or with useMemo
export function getVisitedCountries(travels: Record<string, TravelStatus>): Country[] {
  return countries.filter((c) => travels[c.id] === "visited" || travels[c.id] === "lived")
}

export function getBucketListCountries(travels: Record<string, TravelStatus>): Country[] {
  return countries.filter((c) => travels[c.id] === "bucket-list")
}

export function getLivedCountries(travels: Record<string, TravelStatus>): Country[] {
  return countries.filter((c) => travels[c.id] === "lived")
}

export function getStats(travels: Record<string, TravelStatus>) {
  const visited = Object.values(travels).filter((s) => s === "visited" || s === "lived").length
  const bucketList = Object.values(travels).filter((s) => s === "bucket-list").length
  const lived = Object.values(travels).filter((s) => s === "lived").length
  const total = countries.length

  const continentStats = continents.map((continent) => {
    const continentCountries = countries.filter((c) => c.continent === continent.id)
    const visitedInContinent = continentCountries.filter(
      (c) => travels[c.id] === "visited" || travels[c.id] === "lived",
    ).length
    return {
      id: continent.id,
      name: continent.name,
      visited: visitedInContinent,
      total: continentCountries.length,
      percentage: Math.round((visitedInContinent / continentCountries.length) * 100),
    }
  })

  return {
    visited,
    bucketList,
    lived,
    total,
    percentage: Math.round((visited / total) * 100),
    continentStats,
  }
}

export function getUnlockedAchievements(travels: Record<string, TravelStatus>) {
  const visited = Object.values(travels).filter((s) => s === "visited" || s === "lived").length

  return achievements.filter((achievement) => {
    if (achievement.continent) {
      const continentCountries = countries.filter((c) => c.continent === achievement.continent)
      const visitedInContinent = continentCountries.filter(
        (c) => travels[c.id] === "visited" || travels[c.id] === "lived",
      ).length
      return visitedInContinent >= achievement.requirement
    }
    return visited >= achievement.requirement
  })
}
