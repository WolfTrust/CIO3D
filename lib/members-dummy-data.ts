import { knownCities } from "./city-coordinates"
import type { Member, Relationship, RelationshipType } from "./members-store"

// Zufällige Namen für Dummy-Daten
const firstNames = [
  "Max", "Anna", "Thomas", "Sarah", "Michael", "Julia", "Andreas", "Lisa", "Stefan", "Maria",
  "Christian", "Nicole", "Daniel", "Jessica", "Markus", "Jennifer", "Sebastian", "Melanie", "Alexander", "Nadine",
  "David", "Kathrin", "Jan", "Stephanie", "Florian", "Vanessa", "Tobias", "Nina", "Benjamin", "Laura",
  "Matthias", "Christina", "Simon", "Sabrina", "Philipp", "Carolin", "Martin", "Julia", "Oliver", "Sandra",
  "Patrick", "Katrin", "Nico", "Annika", "Kevin", "Franziska", "Lukas", "Miriam", "Felix", "Julia",
  "Jonas", "Sophie", "Tim", "Lisa", "Fabian", "Marie", "Marcel", "Clara", "Dominik", "Emma",
  "Julian", "Hannah", "Robin", "Lea", "Timo", "Lena", "Marco", "Michelle", "Dennis", "Julia",
  "Sven", "Anna", "Björn", "Katharina", "Nils", "Isabel", "Henrik", "Natalie", "Finn", "Amelie",
  "Lennart", "Charlotte", "Emil", "Luisa", "Noah", "Mia", "Elias", "Emily", "Anton", "Lilly"
]

const lastNames = [
  "Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann",
  "Schäfer", "Koch", "Bauer", "Richter", "Klein", "Wolf", "Schröder", "Neumann", "Schwarz", "Zimmermann",
  "Braun", "Krüger", "Hofmann", "Hartmann", "Lange", "Schmitt", "Werner", "Schmitz", "Krause", "Meier",
  "Lehmann", "Schmid", "Schulze", "Maier", "Köhler", "Herrmann", "König", "Walter", "Huber", "Mayer",
  "Peters", "Fuchs", "Lang", "Scholz", "Möller", "Weiß", "Jung", "Hahn", "Schubert", "Vogel",
  "Friedrich", "Keller", "Günther", "Berger", "Winkler", "Lorenz", "Baumann", "Franke", "Albrecht", "Ott",
  "Graf", "Roth", "Beck", "Ludwig", "Simon", "Böhm", "Winter", "Kraus", "Martin", "Schumacher"
]

const companies = [
  "Tech Solutions GmbH", "Innovation Partners AG", "Digital Ventures", "Global Consulting", "Strategic Advisors",
  "Business Excellence", "Future Systems", "Enterprise Solutions", "Smart Technologies", "Advanced Analytics",
  "Cloud Services", "Data Insights", "Market Leaders", "Growth Partners", "Value Creation",
  "Strategic Ventures", "Innovation Hub", "Digital Transformation", "Business Intelligence", "Tech Innovations",
  "Global Networks", "Strategic Alliances", "Business Partners", "Innovation Labs", "Digital Solutions",
  "Enterprise Partners", "Growth Ventures", "Strategic Consulting", "Tech Partners", "Business Solutions"
]

const positions = [
  "CEO", "CTO", "CFO", "Managing Director", "VP Sales", "VP Marketing", "Head of Strategy", "Business Development Manager",
  "Sales Director", "Marketing Director", "Operations Manager", "Project Manager", "Consultant", "Senior Consultant",
  "Account Manager", "Key Account Manager", "Regional Manager", "Country Manager", "Product Manager", "Innovation Manager"
]

// Erstelle 80 Dummy-Mitglieder (Beispiel für DB-Seed und lokale Nutzung)
export function generateDummyMembers(): Member[] {
  const members: Member[] = []
  const usedCities = new Set<string>()
  
  // Stelle sicher, dass wir verschiedene Städte verwenden
  const availableCities = [...knownCities]
  console.log("Verfügbare Städte:", availableCities.length)
  
  // Mische die Städte zufällig
  const shuffledCities = [...availableCities].sort(() => Math.random() - 0.5)
  
  for (let i = 0; i < 80; i++) {
    // Verwende verschiedene Städte, wenn möglich
    let selectedCity = shuffledCities[i % shuffledCities.length]
    
    // Versuche eine noch nicht verwendete Stadt zu finden
    if (usedCities.has(`${selectedCity.name}_${selectedCity.country}`)) {
      const unusedCity = shuffledCities.find(c => !usedCities.has(`${c.name}_${c.country}`))
      if (unusedCity) {
        selectedCity = unusedCity
      }
    }
    
    usedCities.add(`${selectedCity.name}_${selectedCity.country}`)
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const company = companies[Math.floor(Math.random() * companies.length)]
    const position = positions[Math.floor(Math.random() * positions.length)]
    
    const now = new Date()
    const createdAt = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    
    const member: Member = {
      id: `member_dummy_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: `+49 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
      company,
      position,
      city: selectedCity.name,
      country: selectedCity.country.toLowerCase(),
      coordinates: selectedCity.coordinates,
      notes: `Dummy-Mitglied erstellt für ${selectedCity.name}`,
      createdAt,
      updatedAt: createdAt,
    }
    
    members.push(member)
  }
  
  console.log("Generierte Mitglieder:", members.length)
  return members
}

// Erstelle Dummy-Beziehungen zwischen Mitgliedern
export function generateDummyRelationships(memberIds: string[]): Relationship[] {
  const relationships: Relationship[] = []
  const relationshipTypes: RelationshipType[] = [
    "strategic_partnership",
    "customer_relationship",
    "supplier_relationship",
    "joint_venture",
    "consulting",
    "collaboration",
    "investment",
    "other"
  ]
  
  const relationshipDescriptions: Record<RelationshipType, string[]> = {
    strategic_partnership: ["Langfristige strategische Zusammenarbeit", "Gemeinsame Marktentwicklung", "Technologie-Partnerschaft"],
    customer_relationship: ["Hauptkunde", "Wiederkehrender Kunde", "VIP-Kunde"],
    supplier_relationship: ["Hauptlieferant", "Strategischer Lieferant", "Qualitätspartner"],
    joint_venture: ["Gemeinsames Projekt", "Joint Venture Projekt", "Kooperationsprojekt"],
    consulting: ["Beratungsprojekt", "Strategieberatung", "Technische Beratung"],
    collaboration: ["Forschungszusammenarbeit", "Entwicklungsprojekt", "Innovationspartnerschaft"],
    investment: ["Investor", "Beteiligung", "Finanzierung"],
    other: ["Geschäftskontakt", "Netzwerk", "Branchenkontakt"]
  }
  
  // Stelle sicher, dass jedes Mitglied mindestens eine Beziehung hat
  const usedMembers = new Set<string>()
  const availableMembers = [...memberIds]
  
  // Phase 1: Jedes Mitglied bekommt mindestens eine Beziehung
  for (let i = 0; i < memberIds.length; i++) {
    const fromMemberId = memberIds[i]
    let toMemberId: string
    
    // Finde ein Mitglied, mit dem noch keine Beziehung besteht
    const possiblePartners = availableMembers.filter(id => id !== fromMemberId)
    if (possiblePartners.length > 0) {
      toMemberId = possiblePartners[Math.floor(Math.random() * possiblePartners.length)]
    } else {
      // Fallback: Nimm ein zufälliges anderes Mitglied
      let toIndex = Math.floor(Math.random() * memberIds.length)
      while (toIndex === i) {
        toIndex = Math.floor(Math.random() * memberIds.length)
      }
      toMemberId = memberIds[toIndex]
    }
    
    const type = relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)]
    const descriptions = relationshipDescriptions[type]
    const description = descriptions[Math.floor(Math.random() * descriptions.length)]
    
    const now = new Date()
    const createdAt = new Date(now.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString()
    
    relationships.push({
      id: `rel_dummy_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
      fromMemberId,
      toMemberId,
      type,
      description,
      createdAt,
      updatedAt: createdAt,
    })
    
    usedMembers.add(fromMemberId)
  }
  
  // Phase 2: Füge zusätzliche zufällige Beziehungen hinzu (ca. 80 weitere)
  for (let i = 0; i < 80; i++) {
    const fromIndex = Math.floor(Math.random() * memberIds.length)
    let toIndex = Math.floor(Math.random() * memberIds.length)
    
    // Stelle sicher, dass from und to unterschiedlich sind
    while (toIndex === fromIndex) {
      toIndex = Math.floor(Math.random() * memberIds.length)
    }
    
    const fromMemberId = memberIds[fromIndex]
    const toMemberId = memberIds[toIndex]
    
    // Prüfe, ob diese Beziehung bereits existiert
    const exists = relationships.some(
      rel => 
        (rel.fromMemberId === fromMemberId && rel.toMemberId === toMemberId) ||
        (rel.fromMemberId === toMemberId && rel.toMemberId === fromMemberId)
    )
    
    if (!exists) {
      const type = relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)]
      const descriptions = relationshipDescriptions[type]
      const description = descriptions[Math.floor(Math.random() * descriptions.length)]
      
      const now = new Date()
      const createdAt = new Date(now.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString()
      
      relationships.push({
        id: `rel_dummy_${Date.now()}_${memberIds.length + i}_${Math.random().toString(36).substr(2, 9)}`,
        fromMemberId,
        toMemberId,
        type,
        description,
        createdAt,
        updatedAt: createdAt,
      })
    }
  }
  
  return relationships
}
