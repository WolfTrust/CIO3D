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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const relationship = await prisma.relationship.findUnique({ where: { id } })
    if (!relationship) {
      return NextResponse.json({ error: "Beziehung nicht gefunden." }, { status: 404 })
    }
    return NextResponse.json(toApiRelationship(relationship))
  } catch (error) {
    console.error("GET /api/relationships/[id]:", error)
    return NextResponse.json(
      { error: "Beziehung konnte nicht geladen werden." },
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
    const existing = await prisma.relationship.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Beziehung nicht gefunden." }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (body.fromMemberId != null) data.fromMemberId = body.fromMemberId
    if (body.toMemberId != null) data.toMemberId = body.toMemberId
    if (body.type != null) data.type = body.type
    if (body.description !== undefined) data.description = body.description ?? null

    const relationship = await prisma.relationship.update({
      where: { id },
      data: data as Parameters<typeof prisma.relationship.update>[0]["data"],
    })
    return NextResponse.json(toApiRelationship(relationship))
  } catch (error) {
    console.error("PATCH /api/relationships/[id]:", error)
    return NextResponse.json(
      { error: "Beziehung konnte nicht aktualisiert werden." },
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
    await prisma.relationship.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/relationships/[id]:", error)
    const message = error instanceof Error ? error.message : ""
    if (message.includes("Record to delete does not exist")) {
      return NextResponse.json({ error: "Beziehung nicht gefunden." }, { status: 404 })
    }
    return NextResponse.json(
      { error: "Beziehung konnte nicht gelöscht werden." },
      { status: 500 }
    )
  }
}
