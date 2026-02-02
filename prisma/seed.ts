/**
 * Einmaliges Laden der bestehenden Event-Daten (mit Bildern) in die Datenbank.
 * Ausführung: pnpm db:seed (oder pnpm prisma db seed)
 */
import "dotenv/config"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local", override: true })

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Set it in .env.local or environment.")
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const initialEvents = [
  {
    title: "Strategietagung 2024 - Paris",
    description:
      "Jährliche Strategietagung für Führungskräfte. Diskussion über zukünftige Geschäftsstrategien, Marktentwicklung und Innovationen.",
    city: "Paris",
    country: "FR",
    latitude: 48.8566,
    longitude: 2.3522,
    startDate: new Date(2024, 5, 15),
    endDate: new Date(2024, 5, 17),
    imageUrl:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
    maxParticipants: 150,
    category: "strategic",
    status: "upcoming",
  },
  {
    title: "London Business Summit 2024",
    description:
      "Internationales Business Summit mit führenden Experten aus verschiedenen Branchen. Networking, Keynotes und Workshops.",
    city: "London",
    country: "GB",
    latitude: 51.5074,
    longitude: -0.1278,
    startDate: new Date(2024, 7, 20),
    endDate: new Date(2024, 7, 22),
    imageUrl:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop",
    maxParticipants: 200,
    category: "conference",
    status: "upcoming",
  },
  {
    title: "New York Innovation Conference",
    description:
      "Konferenz über Innovation, Technologie und digitale Transformation. Präsentation neuester Trends und Best Practices.",
    city: "New York",
    country: "US",
    latitude: 40.7128,
    longitude: -74.006,
    startDate: new Date(2024, 9, 10),
    endDate: new Date(2024, 9, 12),
    imageUrl:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop",
    maxParticipants: 300,
    category: "conference",
    status: "upcoming",
  },
]

async function main() {
  const count = await prisma.event.count()
  if (count > 0) {
    console.log(`Datenbank enthält bereits ${count} Event(s). Überspringe Seed.`)
    return
  }
  await prisma.event.createMany({ data: initialEvents })
  console.log(`Erfolgreich ${initialEvents.length} Events mit Bildern in die Datenbank geladen.`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
