"use client"

import { useEffect } from "react"
import { useEventsStore } from "@/lib/events-store"

/** Lädt Events von der API (PostgreSQL) und schreibt sie in den Store. Bei Fehler (kein DB) bleibt der lokale Stand. */
export function EventsHydration() {
  const setEvents = useEventsStore((state) => state.setEvents)

  useEffect(() => {
    fetch("/api/events")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Not ok"))))
      .then((data: Parameters<typeof setEvents>[0]) => {
        if (Array.isArray(data)) setEvents(data)
      })
      .catch(() => {
        // Kein DB / API-Fehler: lokalen Store (localStorage) unverändert lassen
      })
  }, [setEvents])

  return null
}
