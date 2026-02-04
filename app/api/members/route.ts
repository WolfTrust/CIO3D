import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { Member as ApiMember } from "@/lib/members-store"

function toApiMember(m: {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  company: string | null
  position: string | null
  street: string | null
  zipCode: string | null
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}): ApiMember {
  return {
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    email: m.email ?? undefined,
    phone: m.phone ?? undefined,
    company: m.company ?? undefined,
    position: m.position ?? undefined,
    street: m.street ?? undefined,
    zipCode: m.zipCode ?? undefined,
    city: m.city ?? undefined,
    country: m.country ?? undefined,
    coordinates: m.latitude != null && m.longitude != null ? [m.latitude, m.longitude] : undefined,
    notes: m.notes ?? undefined,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }
}

export async function GET() {
  if (!prisma) {
    return NextResponse.json([])
  }
  try {
    const members = await prisma.member.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    })
    return NextResponse.json(members.map(toApiMember))
  } catch (error) {
    console.error("GET /api/members:", error)
    return NextResponse.json(
      { error: "Members konnten nicht geladen werden." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  if (!prisma) {
    return NextResponse.json({ error: "Datenbank nicht verfügbar." }, { status: 503 })
  }
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      position,
      street,
      zipCode,
      city,
      country,
      coordinates,
      notes,
    } = body as Omit<ApiMember, "id" | "createdAt" | "updatedAt">

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "Vorname und Nachname sind Pflicht." },
        { status: 400 }
      )
    }

    const latitude = coordinates?.[0] ?? null
    const longitude = coordinates?.[1] ?? null

    const member = await prisma.member.create({
      data: {
        firstName,
        lastName,
        email: email ?? null,
        phone: phone ?? null,
        company: company ?? null,
        position: position ?? null,
        street: street ?? null,
        zipCode: zipCode ?? null,
        city: city ?? null,
        country: country ?? null,
        latitude,
        longitude,
        notes: notes ?? null,
      },
    })
    return NextResponse.json(toApiMember(member))
  } catch (error) {
    console.error("POST /api/members:", error)
    return NextResponse.json(
      { error: "Member konnte nicht erstellt werden." },
      { status: 500 }
    )
  }
}
