"use client"

import { useEffect } from "react"
import { useMembersStore } from "@/lib/members-store"

/** Lädt Members und Relationships von der API (PostgreSQL) und schreibt sie in den Store. Bei Fehler (kein DB) bleibt der lokale Stand. */
export function MembersHydration() {
  const setMembers = useMembersStore((state) => state.setMembers)
  const setRelationships = useMembersStore((state) => state.setRelationships)

  useEffect(() => {
    Promise.all([fetch("/api/members"), fetch("/api/relationships")])
      .then(([membersRes, relationshipsRes]) => {
        if (!membersRes.ok || !relationshipsRes.ok) return
        return Promise.all([membersRes.json(), relationshipsRes.json()])
      })
      .then((result) => {
        if (!result) return
        const [members, relationships] = result
        if (Array.isArray(members)) setMembers(members)
        if (Array.isArray(relationships)) setRelationships(relationships)
      })
      .catch(() => {
        // Kein DB / API-Fehler: lokalen Store (localStorage) unverändert lassen
      })
  }, [setMembers, setRelationships])

  return null
}
