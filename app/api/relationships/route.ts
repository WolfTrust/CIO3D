import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { Relationship as ApiRelationship } from "@/lib/members-store"

function toApiRelationship(r: {
  id: string
  fromMemberId: string
  toMemberId: string
  type: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}): ApiRelationship {
  return {
    id: r.id,
    fromMemberId: r.fromMemberId,
    toMemberId: r.toMemberId,
    type: r.type as ApiRelationship["type"],
    description: r.description ?? undefined,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }
}

export async function GET() {
  if (!prisma) {
    return NextResponse.json([])
  }
  try {
    const relationships = await prisma.relationship.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(relationships.map(toApiRelationship))
  } catch (error) {
    console.error("GET /api/relationships:", error)
    return NextResponse.json(
      { error: "Beziehungen konnten nicht geladen werden." },
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
    const { fromMemberId, toMemberId, type, description } = body as Omit<
      ApiRelationship,
      "id" | "createdAt" | "updatedAt"
    >

    if (!fromMemberId || !toMemberId || !type) {
      return NextResponse.json(
        { error: "fromMemberId, toMemberId und type sind Pflicht." },
        { status: 400 }
      )
    }
    if (fromMemberId === toMemberId) {
      return NextResponse.json(
        { error: "fromMemberId und toMemberId müssen unterschiedlich sein." },
        { status: 400 }
      )
    }

    const relationship = await prisma.relationship.create({
      data: {
        fromMemberId,
        toMemberId,
        type,
        description: description ?? null,
      },
    })
    return NextResponse.json(toApiRelationship(relationship))
  } catch (error) {
    console.error("POST /api/relationships:", error)
    return NextResponse.json(
      { error: "Beziehung konnte nicht erstellt werden." },
      { status: 500 }
    )
  }
}
