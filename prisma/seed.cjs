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

// ---- 80 Members + Beziehungen (Beispieldaten) ----
const SEED_CITIES = [
  { name: "Berlin", country: "de", lat: 52.52, lng: 13.405 },
  { name: "München", country: "de", lat: 48.1351, lng: 11.582 },
  { name: "Hamburg", country: "de", lat: 53.5511, lng: 9.9937 },
  { name: "Frankfurt", country: "de", lat: 50.1109, lng: 8.6821 },
  { name: "Köln", country: "de", lat: 50.9375, lng: 6.9603 },
  { name: "Stuttgart", country: "de", lat: 48.7758, lng: 9.1829 },
  { name: "Düsseldorf", country: "de", lat: 51.2277, lng: 6.7735 },
  { name: "Paris", country: "fr", lat: 48.8566, lng: 2.3522 },
  { name: "London", country: "gb", lat: 51.5074, lng: -0.1278 },
  { name: "New York", country: "us", lat: 40.7128, lng: -74.006 },
  { name: "Madrid", country: "es", lat: 40.4168, lng: -3.7038 },
  { name: "Rom", country: "it", lat: 41.9028, lng: 12.4964 },
  { name: "Amsterdam", country: "nl", lat: 52.3676, lng: 4.9041 },
  { name: "Wien", country: "at", lat: 48.2082, lng: 16.3738 },
  { name: "Zürich", country: "ch", lat: 47.3769, lng: 8.5417 },
  { name: "Stockholm", country: "se", lat: 59.3293, lng: 18.0686 },
  { name: "Leipzig", country: "de", lat: 51.3397, lng: 12.3731 },
  { name: "Dresden", country: "de", lat: 51.0504, lng: 13.7373 },
  { name: "Marseille", country: "fr", lat: 43.2965, lng: 5.3698 },
  { name: "Lyon", country: "fr", lat: 45.764, lng: 4.8357 },
  { name: "Mailand", country: "it", lat: 45.4642, lng: 9.19 },
  { name: "Barcelona", country: "es", lat: 41.3851, lng: 2.1734 },
  { name: "Manchester", country: "gb", lat: 53.4808, lng: -2.2426 },
  { name: "Chicago", country: "us", lat: 41.8781, lng: -87.6298 },
  { name: "San Francisco", country: "us", lat: 37.7749, lng: -122.4194 },
  { name: "Boston", country: "us", lat: 42.3601, lng: -71.0589 },
  { name: "Tokio", country: "jp", lat: 35.6762, lng: 139.6503 },
  { name: "Singapur", country: "sg", lat: 1.3521, lng: 103.8198 },
  { name: "Sydney", country: "au", lat: -33.8688, lng: 151.2093 },
  { name: "Prag", country: "cz", lat: 50.0755, lng: 14.4378 },
  { name: "Budapest", country: "hu", lat: 47.4979, lng: 19.0402 },
  { name: "Kopenhagen", country: "dk", lat: 55.6761, lng: 12.5683 },
  { name: "Oslo", country: "no", lat: 59.9139, lng: 10.7522 },
  { name: "Brüssel", country: "be", lat: 50.8503, lng: 4.3517 },
  { name: "Lissabon", country: "pt", lat: 38.7223, lng: -9.1393 },
  { name: "Dublin", country: "ie", lat: 53.3498, lng: -6.2603 },
  { name: "Warschau", country: "pl", lat: 52.2297, lng: 21.0122 },
  { name: "Helsinki", country: "fi", lat: 60.1699, lng: 24.9384 },
  { name: "Dubai", country: "ae", lat: 25.2048, lng: 55.2708 },
  { name: "Mumbai", country: "in", lat: 19.076, lng: 72.8777 },
]
const FIRST_NAMES = ["Max", "Anna", "Thomas", "Sarah", "Michael", "Julia", "Andreas", "Lisa", "Stefan", "Maria", "Christian", "Nicole", "Daniel", "Jessica", "Markus", "Jennifer", "Sebastian", "Melanie", "Alexander", "Nadine", "David", "Kathrin", "Jan", "Stephanie", "Florian", "Vanessa", "Tobias", "Nina", "Benjamin", "Laura", "Matthias", "Christina", "Simon", "Sabrina", "Philipp", "Carolin", "Martin", "Oliver", "Patrick", "Katrin"]
const LAST_NAMES = ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Schäfer", "Koch", "Bauer", "Richter", "Klein", "Wolf", "Schröder", "Neumann", "Braun", "Krüger", "Hartmann", "Lange", "Schmitt", "Werner", "Schwarz", "Zimmermann", "Huber", "Mayer", "Peters", "Fuchs", "Lang", "Scholz", "Weiß", "Jung", "Hahn", "Vogel", "Friedrich", "Keller", "Berger", "Winkler"]
const COMPANIES = ["Tech Solutions GmbH", "Innovation Partners AG", "Digital Ventures", "Global Consulting", "Strategic Advisors", "Business Excellence", "Future Systems", "Enterprise Solutions", "Smart Technologies", "Advanced Analytics", "Cloud Services", "Data Insights", "Market Leaders", "Growth Partners", "Strategic Ventures", "Innovation Hub", "Digital Transformation", "Business Intelligence", "Tech Innovations", "Global Networks"]
const POSITIONS = ["CEO", "CTO", "CFO", "Managing Director", "VP Sales", "VP Marketing", "Head of Strategy", "Business Development Manager", "Sales Director", "Marketing Director", "Operations Manager", "Project Manager", "Consultant", "Senior Consultant", "Account Manager", "Key Account Manager", "Regional Manager", "Country Manager", "Product Manager", "Innovation Manager"]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateMemberRows(n) {
  const rows = []
  for (let i = 0; i < n; i++) {
    const city = SEED_CITIES[i % SEED_CITIES.length]
    const firstName = pick(FIRST_NAMES)
    const lastName = pick(LAST_NAMES)
    const company = pick(COMPANIES)
    const position = pick(POSITIONS)
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, "")}.com`
    const phone = `+49 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`
    rows.push({
      firstName,
      lastName,
      email,
      phone,
      company,
      position,
      city: city.name,
      country: city.country,
      latitude: city.lat,
      longitude: city.lng,
      notes: `Beispiel-Mitglied für ${city.name}`,
    })
  }
  return rows
}

const REL_TYPES = ["strategic_partnership", "customer_relationship", "supplier_relationship", "joint_venture", "consulting", "collaboration", "investment", "other"]
const REL_DESCS = {
  strategic_partnership: ["Langfristige strategische Zusammenarbeit", "Gemeinsame Marktentwicklung", "Technologie-Partnerschaft"],
  customer_relationship: ["Hauptkunde", "Wiederkehrender Kunde", "VIP-Kunde"],
  supplier_relationship: ["Hauptlieferant", "Strategischer Lieferant", "Qualitätspartner"],
  joint_venture: ["Gemeinsames Projekt", "Joint Venture Projekt", "Kooperationsprojekt"],
  consulting: ["Beratungsprojekt", "Strategieberatung", "Technische Beratung"],
  collaboration: ["Forschungszusammenarbeit", "Entwicklungsprojekt", "Innovationspartnerschaft"],
  investment: ["Investor", "Beteiligung", "Finanzierung"],
  other: ["Geschäftskontakt", "Netzwerk", "Branchenkontakt"],
}

function generateRelationshipRows(memberIds) {
  const rels = []
  const n = memberIds.length
  for (let i = 0; i < n; i++) {
    const fromId = memberIds[i]
    let toId = memberIds[Math.floor(Math.random() * n)]
    while (toId === fromId) toId = memberIds[Math.floor(Math.random() * n)]
    const type = pick(REL_TYPES)
    const descs = REL_DESCS[type]
    rels.push({ fromMemberId: fromId, toMemberId: toId, type, description: pick(descs) })
  }
  for (let i = 0; i < 80; i++) {
    const fromId = memberIds[Math.floor(Math.random() * n)]
    let toId = memberIds[Math.floor(Math.random() * n)]
    if (fromId === toId) continue
    const exists = rels.some((r) => (r.fromMemberId === fromId && r.toMemberId === toId) || (r.fromMemberId === toId && r.toMemberId === fromId))
    if (!exists) {
      const type = pick(REL_TYPES)
      const descs = REL_DESCS[type]
      rels.push({ fromMemberId: fromId, toMemberId: toId, type, description: pick(descs) })
    }
  }
  return rels
}

async function seedMembersAndRelationships() {
  const memberCount = await prisma.member.count()
  if (memberCount > 0) {
    console.log(`Entferne ${memberCount} Member und Beziehungen...`)
    await prisma.relationship.deleteMany({})
    await prisma.member.deleteMany({})
  }
  const memberRows = generateMemberRows(80)
  const memberIds = []
  for (const row of memberRows) {
    const m = await prisma.member.create({ data: row })
    memberIds.push(m.id)
  }
  console.log(`Erfolgreich 80 Members in die Datenbank geladen.`)
  const relRows = generateRelationshipRows(memberIds)
  await prisma.relationship.createMany({ data: relRows })
  console.log(`Erfolgreich ${relRows.length} Beziehungen in die Datenbank geladen.`)
}

async function main() {
  const count = await prisma.event.count()
  if (count > 0) {
    console.log(`Entferne ${count} bestehende Event(s)...`)
    await prisma.event.deleteMany({})
  }
  await prisma.event.createMany({ data: initialEvents })
  console.log(`Erfolgreich ${initialEvents.length} CIO Ventures 2026 Events in die Datenbank geladen.`)
  await seedMembersAndRelationships()
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
