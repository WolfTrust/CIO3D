import type { Event } from "./events-store"

export const initialEvents: Omit<Event, "id" | "createdAt" | "updatedAt">[] = [
  {
    title: "Strategietagung 2024 - Paris",
    description: "Jährliche Strategietagung für Führungskräfte. Diskussion über zukünftige Geschäftsstrategien, Marktentwicklung und Innovationen.",
    city: "Paris",
    country: "FR",
    coordinates: [48.8566, 2.3522],
    startDate: new Date(2024, 5, 15).toISOString(), // 15. Juni 2024
    endDate: new Date(2024, 5, 17).toISOString(), // 17. Juni 2024
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
    maxParticipants: 150,
    category: "strategic",
    status: "upcoming",
  },
  {
    title: "London Business Summit 2024",
    description: "Internationales Business Summit mit führenden Experten aus verschiedenen Branchen. Networking, Keynotes und Workshops.",
    city: "London",
    country: "GB",
    coordinates: [51.5074, -0.1278],
    startDate: new Date(2024, 7, 20).toISOString(), // 20. August 2024
    endDate: new Date(2024, 7, 22).toISOString(), // 22. August 2024
    imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop",
    maxParticipants: 200,
    category: "conference",
    status: "upcoming",
  },
  {
    title: "New York Innovation Conference",
    description: "Konferenz über Innovation, Technologie und digitale Transformation. Präsentation neuester Trends und Best Practices.",
    city: "New York",
    country: "US",
    coordinates: [40.7128, -74.0060],
    startDate: new Date(2024, 9, 10).toISOString(), // 10. Oktober 2024
    endDate: new Date(2024, 9, 12).toISOString(), // 12. Oktober 2024
    imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop",
    maxParticipants: 300,
    category: "conference",
    status: "upcoming",
  },
]
