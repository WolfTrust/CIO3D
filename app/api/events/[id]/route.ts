import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { Event as ApiEvent } from "@/lib/events-store"

function toApiEvent(e: {
  id: string
  title: string
  description: string
  city: string
  country: string
  latitude: number
  longitude: number
  startDate: Date
  endDate: Date
  imageUrl: string | null
  maxParticipants: number | null
  category: string
  status: string
  createdAt: Date
  updatedAt: Date
}): ApiEvent {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    city: e.city,
    country: e.country,
    coordinates: [e.latitude, e.longitude],
    startDate: e.startDate.toISOString(),
    endDate: e.endDate.toISOString(),
    imageUrl: e.imageUrl ?? undefined,
    maxParticipants: e.maxParticipants ?? undefined,
    category: e.category as ApiEvent["category"],
    status: e.status as ApiEvent["status"],
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const event = await prisma.event.findUnique({ where: { id } })
    if (!event) {
      return NextResponse.json({ error: "Event nicht gefunden." }, { status: 404 })
    }
    return NextResponse.json(toApiEvent(event))
  } catch (error) {
    console.error("GET /api/events/[id]:", error)
    return NextResponse.json(
      { error: "Event konnte nicht geladen werden." },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const existing = await prisma.event.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Event nicht gefunden." }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (body.title != null) data.title = body.title
    if (body.description != null) data.description = body.description
    if (body.city != null) data.city = body.city
    if (body.country != null) data.country = body.country
    if (body.coordinates != null) {
      data.latitude = body.coordinates[0]
      data.longitude = body.coordinates[1]
    }
    if (body.startDate != null) data.startDate = new Date(body.startDate)
    if (body.endDate != null) data.endDate = new Date(body.endDate)
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl ?? null
    if (body.maxParticipants !== undefined) data.maxParticipants = body.maxParticipants ?? null
    if (body.category != null) data.category = body.category
    if (body.status != null) data.status = body.status

    const event = await prisma.event.update({
      where: { id },
      data: data as Parameters<typeof prisma.event.update>[0]["data"],
    })
    return NextResponse.json(toApiEvent(event))
  } catch (error) {
    console.error("PATCH /api/events/[id]:", error)
    return NextResponse.json(
      { error: "Event konnte nicht aktualisiert werden." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.event.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/events/[id]:", error)
    const message = error instanceof Error ? error.message : ""
    if (message.includes("Record to delete does not exist")) {
      return NextResponse.json({ error: "Event nicht gefunden." }, { status: 404 })
    }
    return NextResponse.json(
      { error: "Event konnte nicht gelöscht werden." },
      { status: 500 }
    )
  }
}
