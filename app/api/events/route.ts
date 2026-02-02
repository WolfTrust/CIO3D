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

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { startDate: "asc" },
    })
    return NextResponse.json(events.map(toApiEvent))
  } catch (error) {
    console.error("GET /api/events:", error)
    return NextResponse.json(
      { error: "Events konnten nicht geladen werden." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      city,
      country,
      coordinates,
      startDate,
      endDate,
      imageUrl,
      maxParticipants,
      category,
      status,
    } = body as Omit<ApiEvent, "id" | "createdAt" | "updatedAt">

    if (!title || !description || !city || !country || !coordinates?.length || !startDate || !endDate || !category || !status) {
      return NextResponse.json(
        { error: "Fehlende Pflichtfelder." },
        { status: 400 }
      )
    }

    const [latitude, longitude] = coordinates

    const event = await prisma.event.create({
      data: {
        title,
        description,
        city,
        country,
        latitude,
        longitude,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        imageUrl: imageUrl ?? null,
        maxParticipants: maxParticipants ?? null,
        category,
        status,
      },
    })
    return NextResponse.json(toApiEvent(event))
  } catch (error) {
    console.error("POST /api/events:", error)
    return NextResponse.json(
      { error: "Event konnte nicht erstellt werden." },
      { status: 500 }
    )
  }
}
