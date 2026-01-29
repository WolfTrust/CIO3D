"use client"

import { useEventsStore } from "@/lib/events-store"
import { Calendar, MapPin, Users, Clock, ArrowLeft, Building2, Sparkles, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"

const cityData: Record<string, {
  images: string[]
  marketingTexts: string[]
  highlights: string[]
}> = {
  "Paris": {
    images: [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1508050916680-7c0c4a0b1c0b?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1200&h=800&fit=crop",
    ],
    marketingTexts: [
      "Where Strategy Meets Elegance",
      "Experience the City of Light and Innovation",
      "Network in the Heart of European Business",
      "Transform Your Vision in the Capital of Culture",
    ],
    highlights: [
      "Iconic Eiffel Tower views",
      "World-class business districts",
      "Rich cultural heritage",
      "Culinary excellence",
    ],
  },
  "London": {
    images: [
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1529655683826-ab9d9baf4d0e?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1520986606214-8b456906c813?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1533929736458-ca588d08c8b2?w=1200&h=800&fit=crop",
    ],
    marketingTexts: [
      "Where Tradition Meets Innovation",
      "Connect with Global Leaders in the Financial Capital",
      "Shape the Future of Business in Historic London",
      "Experience Excellence in the Heart of Europe",
    ],
    highlights: [
      "Historic landmarks and modern architecture",
      "Global financial hub",
      "Diverse cultural scene",
      "Premier networking opportunities",
    ],
  },
  "New York": {
    images: [
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1522083165195-3424ed129620?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=800&fit=crop",
    ],
    marketingTexts: [
      "The City That Never Sleeps, Never Stops Innovating",
      "Join the Elite in the Capital of Opportunity",
      "Where Dreams Become Reality",
      "Experience the Pulse of Global Business",
    ],
    highlights: [
      "Iconic skyline and landmarks",
      "World's leading business center",
      "Cutting-edge innovation hub",
      "Unmatched networking potential",
    ],
  },
}

interface EventDetailProps {
  eventId: string
  onBack: () => void
}

export function EventDetail({ eventId, onBack }: EventDetailProps) {
  const event = useEventsStore((state) => state.getEvent(eventId))

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground">Event nicht gefunden</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück
        </Button>
      </div>
    )
  }

  const cityInfo = cityData[event.city] || {
    images: [event.imageUrl || "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=800&fit=crop"],
    marketingTexts: ["Join us for an unforgettable experience"],
    highlights: ["Unique networking opportunities"],
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const startFormatted = formatDate(startDate)
    const endFormatted = end.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    
    if (start.getTime() === end.getTime()) {
      return startFormatted
    }
    return `${startFormatted} - ${endFormatted}`
  }

  const categoryLabels: Record<string, string> = {
    strategic: "Strategietagung",
    networking: "Networking",
    training: "Training",
    conference: "Konferenz",
    workshop: "Workshop",
    other: "Sonstiges",
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={cityInfo.images[0]}
          alt={event.city}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=800&fit=crop"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <Button onClick={onBack} variant="secondary" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                {categoryLabels[event.category] || event.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">{event.title}</h1>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="font-semibold">{event.city}, {event.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDateRange(event.startDate, event.endDate)}</span>
              </div>
              {event.maxParticipants && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Max. {event.maxParticipants} participants</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Marketing Text Section */}
        <div className="text-center space-y-4">
          {cityInfo.marketingTexts.map((text, index) => (
            <h2
              key={index}
              className={`text-2xl md:text-3xl font-bold ${
                index === 0 ? "text-primary" : "text-foreground/80"
              }`}
            >
              {text}
            </h2>
          ))}
        </div>

        {/* Description */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            About This Event
          </h3>
          <p className="text-muted-foreground leading-relaxed">{event.description}</p>
        </div>

        {/* Highlights */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Why {event.city}?
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {cityInfo.highlights.map((highlight, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <p className="text-muted-foreground">{highlight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Image Gallery */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Discover {event.city}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cityInfo.images.slice(1).map((image, index) => (
              <div
                key={index}
                className="relative group overflow-hidden rounded-xl aspect-[4/3] cursor-pointer"
              >
                <img
                  src={image}
                  alt={`${event.city} ${index + 2}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = cityInfo.images[0]
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>

        {/* Event Details Card */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
          <h3 className="text-xl font-semibold mb-4">Event Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateRange(event.startDate, event.endDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {event.city}, {event.country}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {event.maxParticipants && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Capacity</p>
                    <p className="text-sm text-muted-foreground">
                      Maximum {event.maxParticipants} participants
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Category</p>
                  <p className="text-sm text-muted-foreground">
                    {categoryLabels[event.category] || event.category}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
