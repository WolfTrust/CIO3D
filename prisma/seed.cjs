/**
 * CIO Ventures 2026 – Eventübersicht.
 * Lädt alle Events (mit Bildern) in die Datenbank. Bestehende Einträge werden ersetzt.
 * Ausführung: pnpm db:seed (oder pnpm prisma db seed)
 */
require("dotenv").config({ path: ".env.local" })
const { PrismaPg } = require("@prisma/adapter-pg")
const { PrismaClient } = require("@prisma/client")

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Set it in .env.local or environment.")
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

// Bilder für Paris, London, New York wie bisher; übrige Städte mit passenden Unsplash-Bildern
const CIO_VENTURES_2026 = [
  { date: [2026, 0, 27], end: [2026, 0, 27], city: "Paris", country: "FR", title: "CIO Ventures – Paris", desc: "France", lat: 48.8566, lng: 2.3522, img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop" },
  { date: [2026, 1, 19], end: [2026, 1, 19], city: "Hamburg", country: "DE", title: "CIO Ventures – Hamburg", desc: "Germany – IT Strategy Days (Marquee)", lat: 53.5511, lng: 9.9937, img: "https://images.unsplash.com/photo-1569025743873-ea3e9ce9c862?w=800&h=600&fit=crop" },
  { date: [2026, 1, 26], end: [2026, 1, 26], city: "Zurich", country: "CH", title: "CIO Ventures – Zurich", desc: "Switzerland (Marquee)", lat: 47.3769, lng: 8.5417, img: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&h=600&fit=crop" },
  { date: [2026, 2, 5], end: [2026, 2, 5], city: "Munich", country: "DE", title: "CIO Ventures – Munich", desc: "Germany", lat: 48.1351, lng: 11.582, img: "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800&h=600&fit=crop" },
  { date: [2026, 2, 12], end: [2026, 2, 12], city: "New York", country: "US", title: "CIO Ventures – New York", desc: "USA", lat: 40.7128, lng: -74.006, img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop" },
  { date: [2026, 3, 9], end: [2026, 3, 9], city: "Düsseldorf", country: "DE", title: "CIO Ventures – Düsseldorf", desc: "Germany", lat: 51.2277, lng: 6.7735, img: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&h=600&fit=crop" },
  { date: [2026, 3, 21], end: [2026, 3, 21], city: "Milan", country: "IT", title: "CIO Ventures – Milan", desc: "Italy", lat: 45.4642, lng: 9.19, img: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800&h=600&fit=crop" },
  { date: [2026, 3, 23], end: [2026, 3, 23], city: "London", country: "GB", title: "CIO Ventures – London", desc: "UK", lat: 51.5074, lng: -0.1278, img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop" },
  { date: [2026, 4, 7], end: [2026, 4, 7], city: "Palo Alto", country: "US", title: "CIO Ventures – Palo Alto", desc: "USA – Marquee Event @NVIDIA", lat: 37.4419, lng: -122.143, img: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop" },
  { date: [2026, 4, 14], end: [2026, 4, 14], city: "Madrid", country: "ES", title: "CIO Ventures – Madrid", desc: "Spain", lat: 40.4168, lng: -3.7038, img: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop" },
  { date: [2026, 4, 21], end: [2026, 4, 22], city: "Eltville am Rhein", country: "DE", title: "CIO Ventures – Eltville am Rhein", desc: "Germany – Marquee Event", lat: 50.0264, lng: 8.117, img: "https://images.unsplash.com/photo-1461360370896-922f1ef1e42a?w=800&h=600&fit=crop" },
  { date: [2026, 4, 28], end: [2026, 4, 28], city: "Stockholm", country: "SE", title: "CIO Ventures – Stockholm", desc: "Sweden", lat: 59.3293, lng: 18.0686, img: "https://images.unsplash.com/photo-1508189860359-777d945909ef?w=800&h=600&fit=crop" },
  { date: [2026, 5, 4], end: [2026, 5, 4], city: "Amsterdam", country: "NL", title: "CIO Ventures – Amsterdam", desc: "Netherlands", lat: 52.3676, lng: 4.9041, img: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=600&fit=crop" },
  { date: [2026, 6, 4], end: [2026, 6, 4], city: "Berlin", country: "DE", title: "CIO Ventures – Berlin", desc: "Germany – Marquee Event", lat: 52.52, lng: 13.405, img: "https://images.unsplash.com/photo-1560930950-5cc20e80e122?w=800&h=600&fit=crop" },
  { date: [2026, 7, 25], end: [2026, 7, 25], city: "Zurich", country: "CH", title: "CIO Ventures – Zurich", desc: "Switzerland", lat: 47.3769, lng: 8.5417, img: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&h=600&fit=crop" },
  { date: [2026, 7, 27], end: [2026, 7, 27], city: "Hamburg", country: "DE", title: "CIO Ventures – Hamburg", desc: "Germany", lat: 53.5511, lng: 9.9937, img: "https://images.unsplash.com/photo-1569025743873-ea3e9ce9c862?w=800&h=600&fit=crop" },
  { date: [2026, 8, 8], end: [2026, 8, 8], city: "Dallas", country: "US", title: "CIO Ventures – Dallas", desc: "USA", lat: 32.7767, lng: -96.797, img: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&h=600&fit=crop" },
  { date: [2026, 8, 15], end: [2026, 8, 15], city: "Stuttgart", country: "DE", title: "CIO Ventures – Stuttgart", desc: "Germany", lat: 48.7758, lng: 9.1829, img: "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&h=600&fit=crop" },
  { date: [2026, 8, 24], end: [2026, 8, 24], city: "Amsterdam", country: "NL", title: "CIO Ventures – Amsterdam", desc: "Netherlands", lat: 52.3676, lng: 4.9041, img: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=600&fit=crop" },
  { date: [2026, 8, 29], end: [2026, 8, 29], city: "Munich", country: "DE", title: "CIO Ventures – Oktoberfest", desc: "Germany", lat: 48.1351, lng: 11.582, img: "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800&h=600&fit=crop" },
  { date: [2026, 9, 8], end: [2026, 9, 8], city: "Frankfurt", country: "DE", title: "CIO Ventures – Frankfurt", desc: "Germany", lat: 50.1109, lng: 8.6821, img: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?w=800&h=600&fit=crop" },
  { date: [2026, 9, 25], end: [2026, 9, 25], city: "Milan", country: "IT", title: "CIO Ventures – Milan", desc: "Italy", lat: 45.4642, lng: 9.19, img: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800&h=600&fit=crop" },
  { date: [2026, 9, 30], end: [2026, 9, 30], city: "London", country: "GB", title: "CIO Ventures – London", desc: "UK", lat: 51.5074, lng: -0.1278, img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop" },
  { date: [2026, 10, 6], end: [2026, 10, 6], city: "Paris", country: "FR", title: "CIO Ventures – Paris", desc: "France", lat: 48.8566, lng: 2.3522, img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop" },
  { date: [2026, 10, 18], end: [2026, 10, 18], city: "Boston", country: "US", title: "CIO Ventures – Boston", desc: "USA", lat: 42.3601, lng: -71.0589, img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=600&fit=crop" },
  { date: [2026, 10, 20], end: [2026, 10, 20], city: "New York", country: "US", title: "CIO Ventures – New York City", desc: "USA", lat: 40.7128, lng: -74.006, img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop" },
  { date: [2026, 11, 1], end: [2026, 11, 1], city: "Vienna", country: "AT", title: "CIO Ventures – Vienna", desc: "Austria", lat: 48.2082, lng: 16.3738, img: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&h=600&fit=crop" },
  { date: [2026, 11, 3], end: [2026, 11, 3], city: "Rome", country: "IT", title: "CIO Ventures – Rome", desc: "Italy", lat: 41.9028, lng: 12.4964, img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop" },
  { date: [2026, 11, 8], end: [2026, 11, 8], city: "Munich", country: "DE", title: "CIO Ventures – Munich", desc: "Germany – Marquee Event", lat: 48.1351, lng: 11.582, img: "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800&h=600&fit=crop" },
]

function toEvent(row) {
  const [y, m, d] = row.date
  const [ey, em, ed] = row.end
  return {
    title: row.title,
    description: row.desc,
    city: row.city,
    country: row.country,
    latitude: row.lat,
    longitude: row.lng,
    startDate: new Date(y, m, d),
    endDate: new Date(ey, em, ed),
    imageUrl: row.img,
    maxParticipants: null,
    category: "conference",
    status: "upcoming",
  }
}

const initialEvents = CIO_VENTURES_2026.map(toEvent)

async function main() {
  const count = await prisma.event.count()
  if (count > 0) {
    console.log(`Entferne ${count} bestehende Event(s)...`)
    await prisma.event.deleteMany({})
  }
  await prisma.event.createMany({ data: initialEvents })
  console.log(`Erfolgreich ${initialEvents.length} CIO Ventures 2026 Events in die Datenbank geladen.`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
