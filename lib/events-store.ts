"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Event {
  id: string
  title: string
  description: string
  city: string
  country: string
  coordinates: [number, number] // [latitude, longitude]
  startDate: string // ISO date string
  endDate: string // ISO date string
  imageUrl?: string
  maxParticipants?: number
  category: "strategic" | "networking" | "training" | "conference" | "workshop" | "other"
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  createdAt: string
  updatedAt: string
}

interface EventsState {
  events: Event[]
  setEvents: (events: Event[]) => void
  addEvent: (event: Omit<Event, "id" | "createdAt" | "updatedAt">) => void
  addEventFromServer: (event: Event) => void
  updateEvent: (id: string, event: Partial<Omit<Event, "id" | "createdAt" | "updatedAt">>) => void
  deleteEvent: (id: string) => void
  getEvent: (id: string) => Event | undefined
  getEventsByCity: (city: string) => Event[]
  getUpcomingEvents: () => Event[]
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      events: [],

      setEvents: (events) => {
        set({
          events: [...events].sort(
            (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          ),
        })
      },

      addEventFromServer: (event) => {
        set((state) => ({
          events: [...state.events, event].sort(
            (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          ),
        }))
      },

      addEvent: (event) => {
        const now = new Date().toISOString()
        const newEvent: Event = {
          ...event,
          id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          events: [...state.events, newEvent].sort((a, b) => 
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          ),
        }))
      },

      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id
              ? {
                  ...event,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : event
          ).sort((a, b) => 
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          ),
        }))
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        }))
      },

      getEvent: (id) => {
        return get().events.find((event) => event.id === id)
      },

      getEventsByCity: (city: string) => {
        return get().events.filter((event) => 
          event.city.toLowerCase() === city.toLowerCase()
        )
      },

      getUpcomingEvents: () => {
        const now = new Date()
        // Zeige auch Events, die in der Vergangenheit liegen, aber noch nicht abgeschlossen sind
        // Oder zeige alle Events mit Status "upcoming" oder "ongoing"
        return get().events.filter((event) => 
          (event.status === "upcoming" || event.status === "ongoing") && event.status !== "cancelled"
        ).sort((a, b) => 
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )
      },
    }),
    {
      name: "cio-venture-events",
    },
  ),
)
