import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { normalizeLatLngFromDb } from "@/lib/coordinates"
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
    coordinates: normalizeLatLngFromDb(m.latitude, m.longitude),
    notes: m.notes ?? undefined,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!prisma) {
    return NextResponse.json({ error: "Member nicht gefunden." }, { status: 404 })
  }
  try {
    const { id } = await params
    const member = await prisma.member.findUnique({ where: { id } })
    if (!member) {
      return NextResponse.json({ error: "Member nicht gefunden." }, { status: 404 })
    }
    return NextResponse.json(toApiMember(member))
  } catch (error) {
    console.error("GET /api/members/[id]:", error)
    return NextResponse.json(
      { error: "Member konnte nicht geladen werden." },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!prisma) {
    return NextResponse.json({ error: "Datenbank nicht verfügbar." }, { status: 503 })
  }
  try {
    const { id } = await params
    const body = await request.json()
    const existing = await prisma.member.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Member nicht gefunden." }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (body.firstName != null) data.firstName = body.firstName
    if (body.lastName != null) data.lastName = body.lastName
    if (body.email !== undefined) data.email = body.email ?? null
    if (body.phone !== undefined) data.phone = body.phone ?? null
    if (body.company !== undefined) data.company = body.company ?? null
    if (body.position !== undefined) data.position = body.position ?? null
    if (body.street !== undefined) data.street = body.street ?? null
    if (body.zipCode !== undefined) data.zipCode = body.zipCode ?? null
    if (body.city !== undefined) data.city = body.city ?? null
    if (body.country !== undefined) data.country = body.country ?? null
    if (body.coordinates != null) {
      data.latitude = body.coordinates[0] ?? null
      data.longitude = body.coordinates[1] ?? null
    }
    if (body.notes !== undefined) data.notes = body.notes ?? null

    const member = await prisma.member.update({
      where: { id },
      data: data as Parameters<typeof prisma.member.update>[0]["data"],
    })
    return NextResponse.json(toApiMember(member))
  } catch (error) {
    console.error("PATCH /api/members/[id]:", error)
    return NextResponse.json(
      { error: "Member konnte nicht aktualisiert werden." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!prisma) {
    return NextResponse.json({ error: "Datenbank nicht verfügbar." }, { status: 503 })
  }
  try {
    const { id } = await params
    await prisma.member.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/members/[id]:", error)
    const message = error instanceof Error ? error.message : ""
    if (message.includes("Record to delete does not exist")) {
      return NextResponse.json({ error: "Member nicht gefunden." }, { status: 404 })
    }
    return NextResponse.json(
      { error: "Member konnte nicht gelöscht werden." },
      { status: 500 }
    )
  }
}
