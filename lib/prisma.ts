import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | null }

function createPrisma(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    if (process.env.NODE_ENV === "development") {
      console.warn("DATABASE_URL nicht gesetzt – API liefert leere Daten, App läuft ohne DB.")
    }
    return null
  }
  try {
    const adapter = new PrismaPg({ connectionString })
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    })
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Prisma-Initialisierung fehlgeschlagen – App läuft ohne DB:", e)
    }
    return null
  }
}

export const prisma: PrismaClient | null = globalForPrisma.prisma ?? createPrisma()
if (process.env.NODE_ENV !== "production" && prisma) globalForPrisma.prisma = prisma
