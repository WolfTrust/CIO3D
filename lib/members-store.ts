"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Member {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  position?: string
  street?: string
  zipCode?: string
  city?: string
  country?: string
  coordinates?: [number, number] // [latitude, longitude] für Globus-Anzeige
  notes?: string
  createdAt: string
  updatedAt: string
}

export type RelationshipType = 
  | "strategic_partnership"
  | "customer_relationship"
  | "supplier_relationship"
  | "joint_venture"
  | "consulting"
  | "collaboration"
  | "investment"
  | "other"

export interface Relationship {
  id: string
  fromMemberId: string
  toMemberId: string
  type: RelationshipType
  description?: string
  createdAt: string
  updatedAt: string
}

interface MembersState {
  members: Member[]
  relationships: Relationship[]
  setMembers: (members: Member[]) => void
  setRelationships: (relationships: Relationship[]) => void
  addMember: (member: Omit<Member, "id" | "createdAt" | "updatedAt">) => void
  updateMember: (id: string, member: Partial<Omit<Member, "id" | "createdAt" | "updatedAt">>) => void
  deleteMember: (id: string) => void
  getMember: (id: string) => Member | undefined
  addRelationship: (relationship: Omit<Relationship, "id" | "createdAt" | "updatedAt">) => void
  updateRelationship: (id: string, relationship: Partial<Omit<Relationship, "id" | "createdAt" | "updatedAt">>) => void
  deleteRelationship: (id: string) => void
  getRelationshipsForMember: (memberId: string) => Relationship[]
  exportData: () => string
  importData: (data: string) => boolean
}

export const useMembersStore = create<MembersState>()(
  persist(
    (set, get) => ({
      members: [],
      relationships: [],

      setMembers: (members) => {
        set({
          members: [...members].sort((a, b) =>
            `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
          ),
        })
      },

      setRelationships: (relationships) => {
        set({ relationships: [...relationships] })
      },

      addMember: (member) => {
        const now = new Date().toISOString()
        const newMember: Member = {
          ...member,
          id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          members: [...state.members, newMember].sort((a, b) => 
            `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
          ),
        }))
      },

      updateMember: (id, updates) => {
        set((state) => ({
          members: state.members.map((member) =>
            member.id === id
              ? {
                  ...member,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : member
          ).sort((a, b) => 
            `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
          ),
        }))
      },

      deleteMember: (id) => {
        set((state) => ({
          members: state.members.filter((member) => member.id !== id),
        }))
      },

      getMember: (id) => {
        return get().members.find((member) => member.id === id)
      },

      addRelationship: (relationship) => {
        const now = new Date().toISOString()
        const newRelationship: Relationship = {
          ...relationship,
          id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          relationships: [...state.relationships, newRelationship],
        }))
      },

      updateRelationship: (id, updates) => {
        set((state) => ({
          relationships: state.relationships.map((rel) =>
            rel.id === id
              ? {
                  ...rel,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : rel
          ),
        }))
      },

      deleteRelationship: (id) => {
        set((state) => ({
          relationships: state.relationships.filter((rel) => rel.id !== id),
        }))
      },

      getRelationshipsForMember: (memberId) => {
        return get().relationships.filter(
          (rel) => rel.fromMemberId === memberId || rel.toMemberId === memberId
        )
      },

      exportData: () => {
        const state = get()
        return JSON.stringify({
          members: state.members,
          relationships: state.relationships,
          exportDate: new Date().toISOString(),
        }, null, 2)
      },

      importData: (data: string) => {
        try {
          const parsed = JSON.parse(data)
          if (Array.isArray(parsed.members)) {
            set({ 
              members: parsed.members,
              relationships: Array.isArray(parsed.relationships) ? parsed.relationships : [],
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
      name: "cio-venture-members",
    },
  ),
)
