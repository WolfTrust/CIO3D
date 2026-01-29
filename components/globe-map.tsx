"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback, useMemo, useImperativeHandle, forwardRef } from "react"
import { useTravelStore, type TravelStatus, type TravelLocation } from "@/lib/travel-store"
import { useMembersStore } from "@/lib/members-store"
import { useEventsStore } from "@/lib/events-store"
import { countries, alpha3ToCountryId } from "@/lib/countries-data"
import * as d3 from "d3"
import * as topojson from "topojson-client"
import type { Topology, GeometryCollection } from "topojson-specification"
import { Network, Calendar, Flag, X, Users, Building2, Link2, Mail, Phone, MapPin } from "lucide-react"
import type { GeoPermissibleObjects } from "d3"
import type { GeoJSON } from "geojson"

interface GlobeMapProps {
  onCountryClick: (countryId: string) => void
  selectedCountry?: string | null // Land, für das Mitglieder/Beziehungen angezeigt werden sollen
  onEventClick?: (eventId: string) => void // Callback für Event-Klick
}

export interface GlobeMapHandle {
  flyToCountry: (countryId: string) => void
}

interface LocationPin {
  id: string
  name: string
  countryId: string
  coordinates: [number, number]
  type: TravelLocation["type"]
}

interface MemberPin {
  id: string
  name: string
  city: string
  coordinates: [number, number]
}

interface EventPin {
  id: string
  title: string
  city: string
  coordinates: [number, number]
  startDate: string
}

export const GlobeMap = forwardRef<GlobeMapHandle, GlobeMapProps>(function GlobeMap({ onCountryClick, selectedCountry, onEventClick }, ref) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [geoData, setGeoData] = useState<GeoPermissibleObjects | null>(null)
  const [rotation, setRotation] = useState<[number, number, number]>([0, -20, 0])
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [hoveredPin, setHoveredPin] = useState<LocationPin | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1) // Zoom-Faktor: 1 = normal, größer = reingzoomt
  const [targetRotation, setTargetRotation] = useState<[number, number, number] | null>(null) // Für Animation zum Land
  const [zoomedCountry, setZoomedCountry] = useState<string | null>(null) // Land, auf das gezoomt wurde
  const [centerPoint, setCenterPoint] = useState<[number, number] | null>(null) // Mausposition für Zoom-Zentrierung
  const [selectedRelationshipTypes, setSelectedRelationshipTypes] = useState<string[]>([
    "strategic_partnership",
    "customer_relationship",
    "supplier_relationship",
    "joint_venture",
    "consulting",
    "collaboration",
    "investment",
    "other",
  ]) // Ausgewählte Beziehungstypen (leer = alle anzeigen)

  const velocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const lastPosRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const dragStart = useRef<{ x: number; y: number; rotation: [number, number, number] } | null>(null)
  const animationRef = useRef<number | null>(null)
  const autoRotateRef = useRef<number | null>(null)
  const flyAnimationRef = useRef<number | null>(null)

  const travels = useTravelStore((state) => state.travels)
  const tripData = useTravelStore((state) => state.tripData)
  const members = useMembersStore((state) => state.members)
  const relationships = useMembersStore((state) => state.relationships)
  const events = useEventsStore((state) => state.events)
  const getUpcomingEvents = useEventsStore((state) => state.getUpcomingEvents)
  const [showRelationships, setShowRelationships] = useState(false)
  const [showEvents, setShowEvents] = useState(false)
  const [showMembers, setShowMembers] = useState(true) // Member-Pins anzeigen (standardmäßig an)
  const [hoveredEvent, setHoveredEvent] = useState<EventPin | null>(null)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null) // Ausgewähltes Mitglied
  const [globeStyle, setGlobeStyle] = useState<"styled" | "standard">("styled") // Globus-Darstellung: stilisierte oder Standard
  const rotationRef = useRef<[number, number, number]>(rotation) // Ref für Performance-Optimierung
  const renderRequestRef = useRef<number | null>(null) // Ref für requestAnimationFrame

  const locationPins = useMemo((): LocationPin[] => {
    const pins: LocationPin[] = []
    Object.entries(tripData).forEach(([countryId, data]) => {
      if (data.locations) {
        data.locations.forEach((loc) => {
          if (loc.coordinates) {
            pins.push({
              id: loc.id,
              name: loc.name,
              countryId,
              coordinates: loc.coordinates,
              type: loc.type,
            })
          }
        })
      }
    })
    return pins
  }, [tripData])

  // Member pins - leuchtende Punkte für Mitglieder-Städte
  // Wenn selectedCountry gesetzt ist, zeige nur Mitglieder in diesem Land
  // Wenn selectedMemberId gesetzt ist, zeige nur diesen Member
  const memberPins = useMemo((): MemberPin[] => {
    // Wenn showMembers false ist, zeige keine Member (außer wenn selectedMemberId gesetzt ist)
    if (!showMembers && !selectedMemberId) return []
    
    let filteredMembers = members.filter((member) => member.coordinates && member.city)
    
    // Wenn ein Member ausgewählt ist, zeige nur diesen
    if (selectedMemberId) {
      filteredMembers = filteredMembers.filter((member) => member.id === selectedMemberId)
    } else {
      // Filtere nach Land, wenn selectedCountry gesetzt ist
      // Country-ID ist bereits der 2-Letter-Code (z.B. "de"), genau wie in member.country gespeichert
      if (selectedCountry) {
        const countryCode = selectedCountry.toLowerCase()
        filteredMembers = filteredMembers.filter(
          (member) => member.country?.toLowerCase() === countryCode
        )
      }
    }
    
    return filteredMembers.map((member) => ({
      id: member.id,
      name: `${member.firstName} ${member.lastName}`,
      city: member.city!,
      coordinates: member.coordinates!,
    }))
  }, [members, selectedCountry, selectedMemberId, showMembers])

  // Event-Pins für Upcoming Events
  const eventPins = useMemo((): EventPin[] => {
    // Wenn showEvents false ist, zeige keine Events
    if (!showEvents) return []
    
    const upcomingEvents = getUpcomingEvents()
    console.log("Upcoming Events:", upcomingEvents.length, upcomingEvents)
    
    let filteredEvents = upcomingEvents.filter((event) => {
      const hasCoords = event.coordinates && event.coordinates.length === 2
      if (!hasCoords) {
        console.warn("Event ohne Koordinaten:", event.title, event.city)
        return false
      }
      return true
    })
    
    // Filtere nach Land, wenn selectedCountry gesetzt ist
    if (selectedCountry) {
      const countryCode = selectedCountry.toLowerCase()
      filteredEvents = filteredEvents.filter(
        (event) => event.country?.toLowerCase() === countryCode
      )
    }
    
    const pins = filteredEvents.map((event) => ({
      id: event.id,
      title: event.title,
      city: event.city,
      coordinates: event.coordinates!,
      startDate: event.startDate,
    }))
    console.log("Event Pins:", pins.length, pins)
    return pins
  }, [showEvents, events, selectedCountry, getUpcomingEvents])

  // Gefilterte Beziehungen basierend auf ausgewählten Typen (Performance-Optimierung)
  // Wenn selectedCountry gesetzt ist, zeige nur Beziehungen zwischen Mitgliedern in diesem Land
  // Wenn selectedMemberId gesetzt ist, zeige nur Beziehungen für diesen Member
  const filteredRelationships = useMemo(() => {
    // Wenn showRelationships false ist, zeige keine Beziehungen (außer wenn selectedMemberId gesetzt ist)
    if (!showRelationships && !selectedMemberId) return []
    
    let filtered = relationships
    
    // Wenn ein Member ausgewählt ist, zeige nur seine Beziehungen
    if (selectedMemberId) {
      filtered = filtered.filter(
        (rel) => rel.fromMemberId === selectedMemberId || rel.toMemberId === selectedMemberId
      )
    } else {
      // Filtere nach Land, wenn selectedCountry gesetzt ist
      // Country-ID ist bereits der 2-Letter-Code (z.B. "de"), genau wie in member.country gespeichert
      if (selectedCountry) {
        const countryCode = selectedCountry.toLowerCase()
        const countryMemberIds = new Set(
          members
            .filter(m => m.country?.toLowerCase() === countryCode)
            .map(m => m.id)
        )
        filtered = filtered.filter(
          (rel) => countryMemberIds.has(rel.fromMemberId) && countryMemberIds.has(rel.toMemberId)
        )
      }
    }
    
    // Filtere nach ausgewählten Typen (nur wenn showRelationships aktiv ist oder selectedCountry gesetzt ist)
    if ((showRelationships || selectedCountry || selectedMemberId) && selectedRelationshipTypes.length > 0) {
      filtered = filtered.filter((rel) => selectedRelationshipTypes.includes(rel.type))
    }
    
    return filtered
  }, [relationships, showRelationships, selectedRelationshipTypes, selectedCountry, selectedMemberId, members])

  // Load world GeoJSON data
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((topology: Topology<{ countries: GeometryCollection }>) => {
        const geo = topojson.feature(topology, topology.objects.countries) as unknown as GeoPermissibleObjects
        setGeoData(geo)
      })
      .catch((error) => {
        console.error("Fehler beim Laden der GeoJSON-Daten:", error)
        // Versuche alternativen CDN
        fetch("https://unpkg.com/world-atlas@2/countries-110m.json")
          .then((res) => res.json())
          .then((topology: Topology<{ countries: GeometryCollection }>) => {
            const geo = topojson.feature(topology, topology.objects.countries) as unknown as GeoPermissibleObjects
            setGeoData(geo)
          })
          .catch((err) => {
            console.error("Auch alternativer CDN fehlgeschlagen:", err)
          })
      })
  }, [])

  // Country ID mapping from Natural Earth numeric IDs
  const numericToAlpha3: Record<string, string> = useMemo(
    () => ({
      "004": "AFG",
      "008": "ALB",
      "012": "DZA",
      "020": "AND",
      "024": "AGO",
      "028": "ATG",
      "032": "ARG",
      "036": "AUS",
      "040": "AUT",
      "044": "BHS",
      "048": "BHR",
      "050": "BGD",
      "051": "ARM",
      "052": "BRB",
      "056": "BEL",
      "064": "BTN",
      "068": "BOL",
      "070": "BIH",
      "072": "BWA",
      "076": "BRA",
      "084": "BLZ",
      "090": "SLB",
      "096": "BRN",
      "100": "BGR",
      "104": "MMR",
      "108": "BDI",
      "112": "BLR",
      "116": "KHM",
      "120": "CMR",
      "124": "CAN",
      "132": "CPV",
      "140": "CAF",
      "144": "LKA",
      "148": "TCD",
      "152": "CHL",
      "156": "CHN",
      "158": "TWN",
      "170": "COL",
      "174": "COM",
      "178": "COG",
      "180": "COD",
      "188": "CRI",
      "191": "HRV",
      "192": "CUB",
      "196": "CYP",
      "203": "CZE",
      "204": "BEN",
      "208": "DNK",
      "212": "DMA",
      "214": "DOM",
      "218": "ECU",
      "222": "SLV",
      "226": "GNQ",
      "231": "ETH",
      "232": "ERI",
      "233": "EST",
      "242": "FJI",
      "246": "FIN",
      "250": "FRA",
      "262": "DJI",
      "266": "GAB",
      "268": "GEO",
      "270": "GMB",
      "275": "PSE",
      "276": "DEU",
      "288": "GHA",
      "300": "GRC",
      "308": "GRD",
      "320": "GTM",
      "324": "GIN",
      "328": "GUY",
      "332": "HTI",
      "340": "HND",
      "348": "HUN",
      "352": "ISL",
      "356": "IND",
      "360": "IDN",
      "364": "IRN",
      "368": "IRQ",
      "372": "IRL",
      "376": "ISR",
      "380": "ITA",
      "384": "CIV",
      "388": "JAM",
      "392": "JPN",
      "398": "KAZ",
      "400": "JOR",
      "404": "KEN",
      "408": "PRK",
      "410": "KOR",
      "414": "KWT",
      "417": "KGZ",
      "418": "LAO",
      "422": "LBN",
      "426": "LSO",
      "428": "LVA",
      "430": "LBR",
      "434": "LBY",
      "440": "LTU",
      "442": "LUX",
      "450": "MDG",
      "454": "MWI",
      "458": "MYS",
      "462": "MDV",
      "466": "MLI",
      "470": "MLT",
      "478": "MRT",
      "480": "MUS",
      "484": "MEX",
      "492": "MCO",
      "496": "MNG",
      "498": "MDA",
      "499": "MNE",
      "504": "MAR",
      "508": "MOZ",
      "512": "OMN",
      "516": "NAM",
      "524": "NPL",
      "528": "NLD",
      "540": "NCL",
      "548": "VUT",
      "554": "NZL",
      "558": "NIC",
      "562": "NER",
      "566": "NGA",
      "578": "NOR",
      "586": "PAK",
      "591": "PAN",
      "598": "PNG",
      "600": "PRY",
      "604": "PER",
      "608": "PHL",
      "616": "POL",
      "620": "PRT",
      "624": "GNB",
      "626": "TLS",
      "634": "QAT",
      "642": "ROU",
      "643": "RUS",
      "646": "RWA",
      "682": "SAU",
      "686": "SEN",
      "688": "SRB",
      "694": "SLE",
      "702": "SGP",
      "703": "SVK",
      "704": "VNM",
      "705": "SVN",
      "706": "SOM",
      "710": "ZAF",
      "716": "ZWE",
      "724": "ESP",
      "728": "SSD",
      "729": "SDN",
      "732": "ESH",
      "740": "SUR",
      "748": "SWZ",
      "752": "SWE",
      "756": "CHE",
      "760": "SYR",
      "762": "TJK",
      "764": "THA",
      "768": "TGO",
      "776": "TON",
      "780": "TTO",
      "784": "ARE",
      "788": "TUN",
      "792": "TUR",
      "795": "TKM",
      "800": "UGA",
      "804": "UKR",
      "807": "MKD",
      "818": "EGY",
      "826": "GBR",
      "834": "TZA",
      "840": "USA",
      "854": "BFA",
      "858": "URY",
      "860": "UZB",
      "862": "VEN",
      "882": "WSM",
      "887": "YEM",
      "894": "ZMB",
    }),
    [],
  )

  // Fly-to Funktion mit Zoom (Google Earth-ähnlich)
  const flyToCountry = useCallback(
    (countryId: string, targetZoom: number = 3.5) => {
      if (flyAnimationRef.current) {
        cancelAnimationFrame(flyAnimationRef.current)
        flyAnimationRef.current = null
      }
      velocityRef.current = { x: 0, y: 0 }

      const country = countries.find((c) => c.id === countryId)
      if (!country || !country.coordinates) {
        console.warn("Land nicht gefunden:", countryId)
        return
      }

      const targetLon = -country.coordinates[1]
      const targetLat = -country.coordinates[0]
      const startRotation = [...rotation] as [number, number, number]
      const startZoom = zoomLevel
      const startTime = Date.now()
      const duration = 2500 // Längere Animation für besseren Effekt

      // Setze das gezoomte Land sofort
      setZoomedCountry(countryId)
      setTargetRotation([targetLon, targetLat, 0])

      const animate = () => {
        const elapsed = Date.now() - startTime
        const t = Math.min(elapsed / duration, 1)
        
        // Verbesserte Easing-Funktion: Ease-in-out-cubic für natürlichere Bewegung
        const easeT = t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2

        // Interpoliere Rotation mit kürzerer Distanz (kürzester Weg)
        let deltaLon = targetLon - startRotation[0]
        let deltaLat = targetLat - startRotation[1]
        
        // Normalisiere Winkel-Differenz für kürzesten Weg
        while (deltaLon > 180) deltaLon -= 360
        while (deltaLon < -180) deltaLon += 360
        while (deltaLat > 180) deltaLat -= 360
        while (deltaLat < -180) deltaLat += 360

        const newRotation: [number, number, number] = [
          startRotation[0] + deltaLon * easeT,
          startRotation[1] + deltaLat * easeT,
          0,
        ]
        setRotation(newRotation)

        // Interpoliere Zoom mit beschleunigter Kurve
        const newZoom = startZoom + (targetZoom - startZoom) * easeT
        setZoomLevel(newZoom)

        if (t < 1) {
          flyAnimationRef.current = requestAnimationFrame(animate)
        } else {
          // Animation abgeschlossen - setze finale Werte
          setRotation([targetLon, targetLat, 0])
          setZoomLevel(targetZoom)
          setTargetRotation(null)
          if (flyAnimationRef.current) {
            cancelAnimationFrame(flyAnimationRef.current)
            flyAnimationRef.current = null
          }
        }
      }

      flyAnimationRef.current = requestAnimationFrame(animate)
    },
    [rotation, zoomLevel, countries],
  )

  useImperativeHandle(ref, () => ({
    flyToCountry: (countryId: string) => {
      flyToCountry(countryId, 3.5) // Starker Zoom für bessere Sichtbarkeit
    },
  }), [flyToCountry])

  const getCountryStatus = useCallback(
    (alpha3: string): TravelStatus => {
      const countryId = alpha3ToCountryId[alpha3]
      if (countryId) {
        return travels[countryId] || null
      }
      return null
    },
    [travels],
  )

  const getStatusColor = useCallback((status: TravelStatus): string => {
    switch (status) {
      case "visited":
        return "#22c55e"
      case "lived":
        return "#eab308"
      case "bucket-list":
        return "#3b82f6"
      default:
        return "#374151"
    }
  }, [])

  const getPinColor = useCallback((type: TravelLocation["type"]): string => {
    switch (type) {
      case "city":
        return "#ef4444" // red
      case "landmark":
        return "#f97316" // orange
      case "nature":
        return "#22c55e" // green
      case "beach":
        return "#06b6d4" // cyan
      case "mountain":
        return "#8b5cf6" // purple
      default:
        return "#ec4899" // pink
    }
  }, [])

  // Farben für Beziehungstypen
  const getRelationshipColor = useCallback((type: string): string => {
    switch (type) {
      case "strategic_partnership":
        return "#22c55e" // grün
      case "customer_relationship":
        return "#3b82f6" // blau
      case "supplier_relationship":
        return "#f59e0b" // orange
      case "joint_venture":
        return "#8b5cf6" // lila
      case "consulting":
        return "#06b6d4" // cyan
      case "collaboration":
        return "#ec4899" // pink
      case "investment":
        return "#ef4444" // rot
      case "other":
        return "#6b7280" // grau
      default:
        return "#6b7280"
    }
  }, [])

  const getRelationshipLabel = useCallback((type: string): string => {
    switch (type) {
      case "strategic_partnership":
        return "Strategische Partnerschaft"
      case "customer_relationship":
        return "Kundenbeziehung"
      case "supplier_relationship":
        return "Lieferantenbeziehung"
      case "joint_venture":
        return "Joint Venture"
      case "consulting":
        return "Beratung"
      case "collaboration":
        return "Zusammenarbeit"
      case "investment":
        return "Investition"
      case "other":
        return "Sonstiges"
      default:
        return "Unbekannt"
    }
  }, [])

  useEffect(() => {
    if (!isDragging && velocityRef.current.x === 0 && velocityRef.current.y === 0) {
      const autoRotate = () => {
        const newRotation: [number, number, number] = [
          (rotationRef.current[0] + 0.15) % 360,
          rotationRef.current[1],
          rotationRef.current[2],
        ]
        updateRotation(newRotation)
        autoRotateRef.current = requestAnimationFrame(autoRotate)
      }

      const timeout = setTimeout(() => {
        autoRotateRef.current = requestAnimationFrame(autoRotate)
      }, 3000)

      return () => {
        clearTimeout(timeout)
        if (autoRotateRef.current) cancelAnimationFrame(autoRotateRef.current)
      }
    }
  }, [isDragging, updateRotation])

  useEffect(() => {
    if (!isDragging && (Math.abs(velocityRef.current.x) > 0.1 || Math.abs(velocityRef.current.y) > 0.1)) {
      const animate = () => {
        velocityRef.current.x *= 0.95
        velocityRef.current.y *= 0.95

        const newRotation: [number, number, number] = [
          rotationRef.current[0] + velocityRef.current.x,
          Math.max(-90, Math.min(90, rotationRef.current[1] - velocityRef.current.y)),
          0,
        ]
        updateRotation(newRotation)

        if (Math.abs(velocityRef.current.x) > 0.1 || Math.abs(velocityRef.current.y) > 0.1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          velocityRef.current = { x: 0, y: 0 }
        }
      }
      animationRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isDragging, updateRotation])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      if (autoRotateRef.current) {
        cancelAnimationFrame(autoRotateRef.current)
        autoRotateRef.current = null
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      if (flyAnimationRef.current) {
        cancelAnimationFrame(flyAnimationRef.current)
        flyAnimationRef.current = null
      }
      velocityRef.current = { x: 0, y: 0 }

      const point = "touches" in e ? e.touches[0] : e
      dragStart.current = { x: point.clientX, y: point.clientY, rotation: [...rotationRef.current] as [number, number, number] }
      lastPosRef.current = { x: point.clientX, y: point.clientY, time: Date.now() }
      setIsDragging(true)
    },
    [],
  )

  // Performance-optimierte Rotation mit requestAnimationFrame
  const updateRotation = useCallback((newRotation: [number, number, number]) => {
    rotationRef.current = newRotation
    if (renderRequestRef.current === null) {
      renderRequestRef.current = requestAnimationFrame(() => {
        setRotation(rotationRef.current)
        renderRequestRef.current = null
      })
    }
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging || !dragStart.current) return
      const point = "touches" in e ? e.touches[0] : e
      const dx = point.clientX - dragStart.current.x
      const dy = point.clientY - dragStart.current.y

      if (lastPosRef.current) {
        const dt = Math.max(1, Date.now() - lastPosRef.current.time)
        velocityRef.current = {
          x: ((point.clientX - lastPosRef.current.x) / dt) * 16 * 0.3,
          y: ((point.clientY - lastPosRef.current.y) / dt) * 16 * 0.3,
        }
      }
      lastPosRef.current = { x: point.clientX, y: point.clientY, time: Date.now() }

      const sensitivity = 0.3
      const newRotation: [number, number, number] = [
        dragStart.current.rotation[0] + dx * sensitivity,
        Math.max(-90, Math.min(90, dragStart.current.rotation[1] - dy * sensitivity)),
        0,
      ]
      updateRotation(newRotation)
    },
    [isDragging, updateRotation],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    dragStart.current = null
    lastPosRef.current = null
  }, [])

  // Keyboard-Zoom-Handler (Google Earth-ähnlich)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Plus-Taste oder = Taste
      if (e.key === "+" || e.key === "=" || (e.key === "+" && !e.shiftKey)) {
        e.preventDefault()
        const newZoom = Math.min(10, zoomLevel * 1.1)
        
        // Wenn Zoom-Level über 2.5 geht, setze gezoomtes Land
        if (newZoom >= 2.5 && !zoomedCountry) {
          const centerLon = -rotation[0]
          const centerLat = -rotation[1]
          
          let closestCountry: string | null = null
          let minDistance = Infinity
          
          countries.forEach((country) => {
            const distance = Math.sqrt(
              Math.pow(country.coordinates[1] - centerLon, 2) +
              Math.pow(country.coordinates[0] - centerLat, 2)
            )
            if (distance < minDistance) {
              minDistance = distance
              closestCountry = country.id
            }
          })
          
          if (closestCountry) {
            setZoomedCountry(closestCountry)
          }
        }
        
        setZoomLevel(newZoom)
      }
      // Minus-Taste oder - Taste
      else if (e.key === "-" || e.key === "_" || (e.key === "-" && !e.shiftKey)) {
        e.preventDefault()
        const newZoom = Math.max(0.5, zoomLevel * 0.9)
        
        // Wenn Zoom-Level unter 2.5 geht, zurücksetzen
        if (newZoom < 2.5 && zoomedCountry) {
          setZoomedCountry(null)
        }
        
        setZoomLevel(newZoom)
      }
      // Escape: Zurücksetzen
      else if (e.key === "Escape") {
        e.preventDefault()
        setZoomLevel(1)
        setTargetRotation(null)
        setRotation([0, -20, 0])
        setZoomedCountry(null)
        setCenterPoint(null)
      }
    },
    [zoomLevel, rotation, zoomedCountry, countries],
  )

  // Keyboard-Event-Listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  const handleCountryHover = useCallback((alpha3: string | null) => {
    if (alpha3) {
      const countryId = alpha3ToCountryId[alpha3]
      setHoveredCountry(countryId || null)
    } else {
      setHoveredCountry(null)
    }
  }, [])

  const handleCountryClickInternal = useCallback(
    (numericId: string) => {
      const alpha3 = numericToAlpha3[numericId]
      if (alpha3) {
        const countryId = alpha3ToCountryId[alpha3]
        if (countryId) onCountryClick(countryId)
      }
    },
    [numericToAlpha3, onCountryClick],
  )

  const hoveredCountryData = useMemo(() => {
    if (!hoveredCountry) return null
    return countries.find((c) => c.id === hoveredCountry)
  }, [hoveredCountry])

  // Update rotationRef when rotation changes
  useEffect(() => {
    rotationRef.current = rotation
  }, [rotation])

  useEffect(() => {
    if (!geoData || !svgRef.current || !containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight
    const size = Math.min(width, height)
    
    // Diese Variablen werden in den Dependencies benötigt
    const baseScale = size / 2.05

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const defs = svg.append("defs")

    // Ocean gradient - unterschiedlich für stilisierte und Standard-Darstellung
    const oceanGradient = defs.append("radialGradient").attr("id", "ocean-gradient").attr("cx", "30%").attr("cy", "30%")
    if (globeStyle === "standard") {
      // Standard-Globus: Einfache blaue Farben
      oceanGradient.append("stop").attr("offset", "0%").attr("stop-color", "#4a90e2")
      oceanGradient.append("stop").attr("offset", "50%").attr("stop-color", "#357abd")
      oceanGradient.append("stop").attr("offset", "100%").attr("stop-color", "#1e3a5f")
    } else {
      // Stilisierte Darstellung: Dunklere, dramatischere Farben
      oceanGradient.append("stop").attr("offset", "0%").attr("stop-color", "#1e4976")
      oceanGradient.append("stop").attr("offset", "50%").attr("stop-color", "#0d3a5f")
      oceanGradient.append("stop").attr("offset", "100%").attr("stop-color", "#061829")
    }

    // Glow filter - nur bei stilisierter Darstellung
    if (globeStyle === "styled") {
      const glowFilter = defs
        .append("filter")
        .attr("id", "globe-glow")
        .attr("x", "-100%")
        .attr("y", "-100%")
        .attr("width", "300%")
        .attr("height", "300%")
      glowFilter.append("feGaussianBlur").attr("stdDeviation", "12").attr("result", "blur")
      glowFilter.append("feComposite").attr("in", "SourceGraphic").attr("in2", "blur").attr("operator", "over")
    }

    // Atmosphere gradient - unterschiedlich für stilisierte und Standard-Darstellung
    const atmosphereGradient = defs
      .append("radialGradient")
      .attr("id", "atmosphere-gradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
    if (globeStyle === "standard") {
      // Standard-Globus: Subtile Atmosphäre
      atmosphereGradient.append("stop").attr("offset", "90%").attr("stop-color", "#87ceeb").attr("stop-opacity", "0")
      atmosphereGradient.append("stop").attr("offset", "95%").attr("stop-color", "#b0e0e6").attr("stop-opacity", "0.1")
      atmosphereGradient.append("stop").attr("offset", "100%").attr("stop-color", "#e0f2fe").attr("stop-opacity", "0.2")
    } else {
      // Stilisierte Darstellung: Dramatischere Atmosphäre
      atmosphereGradient.append("stop").attr("offset", "80%").attr("stop-color", "#3b82f6").attr("stop-opacity", "0")
      atmosphereGradient.append("stop").attr("offset", "88%").attr("stop-color", "#60a5fa").attr("stop-opacity", "0.15")
      atmosphereGradient.append("stop").attr("offset", "95%").attr("stop-color", "#93c5fd").attr("stop-opacity", "0.25")
      atmosphereGradient.append("stop").attr("offset", "100%").attr("stop-color", "#bfdbfe").attr("stop-opacity", "0.4")
    }

    const pinShadow = defs
      .append("filter")
      .attr("id", "pin-shadow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%")
    pinShadow
      .append("feDropShadow")
      .attr("dx", "0")
      .attr("dy", "2")
      .attr("stdDeviation", "2")
      .attr("flood-color", "#000")
      .attr("flood-opacity", "0.5")

    // Verwende rotationRef für bessere Performance beim Drehen
    const currentRotation = targetRotation || rotationRef.current
    
    // Google Earth-ähnliches Verhalten: Bei Zoom-Level > 2.5 wechseln wir zur flachen Ansicht
    // Zwischen 1 und 2.5: Globus wird größer (orthographisch)
    // Ab 2.5: Flache Mercator-Projektion
    const useFlatProjection = zoomLevel >= 2.5
    
    // Interpolations-Faktor für sanften Übergang (0 = Globus, 1 = flache Karte)
    const transitionFactor = useFlatProjection ? 1 : Math.max(0, (zoomLevel - 1.5) / 1.0)
    
    // Google Earth-ähnliche Projektion: Sanfter Übergang von 3D zu 2D
    let projection: d3.GeoProjection
    
    if (useFlatProjection) {
      // Flache Mercator-Projektion für hohen Zoom-Level
      if (zoomedCountry) {
        // Finde das GeoJSON-Feature für das gezoomte Land
        const countryFeature = (geoData as { features: Array<{ id: string; properties: Record<string, unknown> }> }).features.find(
          (f) => {
            const alpha3 = numericToAlpha3[f.id]
            return alpha3 && alpha3ToCountryId[alpha3] === zoomedCountry
          }
        )
        
        if (countryFeature) {
          // Verwende fitSize wie in CountryMap2D für automatisches Zoomen auf das Land
          const countryGeoJson = countryFeature as GeoJSON.Feature
          // Berechne einen dynamischen Scale-Faktor basierend auf Zoom-Level
          // Bei Zoom 2.5 = 1.0, bei Zoom 3.5 = 1.4, bei Zoom 5.0 = 2.0
          const zoomFactor = 0.7 + (zoomLevel - 2.5) * 0.3 // Skaliert von 0.7 bis ~1.5
          const scaleFactor = Math.min(1.2, zoomFactor)
          
          // Erstelle eine Basis-Projektion mit fitSize
          const baseProjection = d3
            .geoMercator()
            .fitSize([width * scaleFactor, height * scaleFactor], countryGeoJson)
          
          // Skaliere zusätzlich basierend auf Zoom-Level
          const baseScale = baseProjection.scale()
          const adjustedScale = baseScale * (1 + (zoomLevel - 2.5) * 0.2)
          
          projection = d3
            .geoMercator()
            .scale(adjustedScale)
            .translate([width / 2, height / 2])
          
          const centroid = d3.geoCentroid(countryGeoJson)
          projection.center(centroid)
        } else {
          // Fallback: Zentriere auf Koordinaten des Landes
          const country = countries.find((c) => c.id === zoomedCountry)
          if (country) {
            const mercatorScale = (baseScale * zoomLevel) / (Math.PI * 2) * 2
            projection = d3
              .geoMercator()
              .scale(mercatorScale)
              .translate([width / 2, height / 2])
              .center([country.coordinates[1], country.coordinates[0]])
          } else {
            // Fallback zu orthographisch
            projection = d3
              .geoOrthographic()
              .scale(baseScale * Math.min(zoomLevel, 2.4))
              .translate([width / 2, height / 2])
              .rotate(currentRotation)
              .clipAngle(90)
          }
        }
      } else {
        // Kein spezifisches Land - verwende aktuelle Rotation
        const centerLon = -currentRotation[0]
        const centerLat = -currentRotation[1]
        const mercatorScale = (baseScale * zoomLevel) / (Math.PI * 2) * 2
        
        projection = d3
          .geoMercator()
          .scale(mercatorScale)
          .translate([width / 2, height / 2])
          .center([centerLon, centerLat])
      }
    } else {
      // Orthographische Projektion für Globus-Ansicht
      // Scale wird allmählich erhöht bis zum Übergang
      const globeScale = baseScale * Math.min(zoomLevel, 2.4)
      
      projection = d3
        .geoOrthographic()
        .scale(globeScale)
        .translate([width / 2, height / 2])
        .rotate(currentRotation)
        .clipAngle(90)
    }

    const path = d3.geoPath().projection(projection)

    svg
      .append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", size / 2 + 25)
      .attr("fill", "url(#atmosphere-gradient)")
      .attr("pointer-events", "none")

    // Globus-Basis mit sanfter Transition
    const globeOpacity = 1 - transitionFactor
    const flatOpacity = transitionFactor
    
    // Globus-Kreis (wird bei Zoom ausgeblendet)
    const globeCircle = svg
      .append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", size / 2.05)
      .attr("fill", "url(#ocean-gradient)")
      .attr("filter", globeStyle === "styled" ? "url(#globe-glow)" : null)
      .attr("opacity", globeOpacity)
      .style("pointer-events", useFlatProjection ? "none" : "auto")
    
    // Flacher Hintergrund (wird bei Zoom eingeblendet)
    const flatBackground = svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#ocean-gradient)")
      .attr("opacity", flatOpacity)
    flatBackground.lower()

    // Graticule mit sanfter Transition - nur bei Standard-Globus oder stilisierter Darstellung
    if (globeStyle === "standard" || globeOpacity > 0.3) {
      const graticule = d3.geoGraticule()
      svg
        .append("path")
        .datum(graticule())
        .attr("d", path as unknown as string)
        .attr("fill", "none")
        .attr("stroke", globeStyle === "standard" ? "#3b82f6" : "#1e3a5f")
        .attr("stroke-width", globeStyle === "standard" ? 0.3 : 0.4 * (1 - transitionFactor))
        .attr("stroke-opacity", globeStyle === "standard" ? 0.3 : 0.5 * globeOpacity)
    }

    // Länder - alle werden angezeigt, aber bei flacher Ansicht werden nur relevante hervorgehoben
    const features = (geoData as { features: Array<{ id: string; properties: Record<string, unknown> }> }).features
    
    svg
      .selectAll("path.country")
      .data(features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path as unknown as (d: unknown) => string)
      .attr("fill", (d: { id: string }) => {
        const alpha3 = numericToAlpha3[d.id]
        const status = alpha3 ? getCountryStatus(alpha3) : null
        if (globeStyle === "standard") {
          // Standard-Globus: Einfache Farben
          if (status === "visited") return "#4ade80" // helleres Grün
          if (status === "lived") return "#fbbf24" // helleres Gelb
          if (status === "bucket-list") return "#60a5fa" // helleres Blau
          return "#64748b" // neutrales Grau
        }
        return getStatusColor(status)
      })
      .attr("stroke", (d: { id: string }) => {
        const alpha3 = numericToAlpha3[d.id]
        const countryId = alpha3 ? alpha3ToCountryId[alpha3] : null
        // Bei flacher Ansicht: gezoomtes Land hat dickeren Rahmen
        if (useFlatProjection && countryId === zoomedCountry) {
          return "#fbbf24"
        }
        return "#1f2937"
      })
      .attr("stroke-width", (d: { id: string }) => {
        const alpha3 = numericToAlpha3[d.id]
        const countryId = alpha3 ? alpha3ToCountryId[alpha3] : null
        if (useFlatProjection && countryId === zoomedCountry) {
          return 2
        }
        return 0.5
      })
      .attr("opacity", (d: { id: string }) => {
        // Bei flacher Ansicht: andere Länder etwas transparent
        if (useFlatProjection) {
          const alpha3 = numericToAlpha3[d.id]
          const countryId = alpha3 ? alpha3ToCountryId[alpha3] : null
          return countryId === zoomedCountry ? 1 : 0.6
        }
        return 1
      })
      .style("cursor", (d: { id: string }) => {
        const alpha3 = numericToAlpha3[d.id]
        return alpha3 && alpha3ToCountryId[alpha3] ? "pointer" : "default"
      })
      .style("transition", "fill 0.2s ease")
      .on("mouseenter", function (event: MouseEvent, d: { id: string }) {
        const alpha3 = numericToAlpha3[d.id]
        if (alpha3) {
          handleCountryHover(alpha3)
          d3.select(this).attr("stroke", "#fbbf24").attr("stroke-width", 2.5).raise()
        }
      })
      .on("mouseleave", function () {
        handleCountryHover(null)
        d3.select(this).attr("stroke", "#1f2937").attr("stroke-width", 0.5)
      })
      .on("click", (event: MouseEvent, d: { id: string }) => {
        event.stopPropagation()
        handleCountryClickInternal(d.id)
      })
      .on("dblclick", (event: MouseEvent, d: { id: string }) => {
        event.stopPropagation()
        event.preventDefault()
        // Reinzoomen auf das Land (Google Earth-ähnlich)
        const alpha3 = numericToAlpha3[d.id]
        if (alpha3) {
          const countryId = alpha3ToCountryId[alpha3]
          if (countryId) {
            const country = countries.find((c) => c.id === countryId)
            if (country && country.coordinates) {
              // Smooth fly-to mit starkem Zoom (3.5 für flache Ansicht)
              flyToCountry(countryId, 3.5)
            }
          }
        }
      })

    const pinsGroup = svg.append("g").attr("class", "pins")

    locationPins.forEach((pin) => {
      // Convert lat/lng to x/y using projection
      // D3 expects [longitude, latitude]
      const projected = projection([pin.coordinates[1], pin.coordinates[0]])

      if (projected) {
        const [x, y] = projected

        // Check if point is on visible side (nur bei Globus-Ansicht)
        let isVisible = true
        if (!useFlatProjection) {
          const distance = d3.geoDistance([pin.coordinates[1], pin.coordinates[0]], [-currentRotation[0], -currentRotation[1]])
          isVisible = distance < Math.PI / 2
        }

        if (isVisible) {
          const pinGroup = pinsGroup
            .append("g")
            .attr("class", "pin")
            .attr("transform", `translate(${x}, ${y})`)
            .style("cursor", "pointer")
            .attr("filter", "url(#pin-shadow)")

          // Pin shape (teardrop/marker style)
          pinGroup
            .append("path")
            .attr("d", "M0,-12 C-4,-12 -6,-8 -6,-5 C-6,0 0,6 0,6 C0,6 6,0 6,-5 C6,-8 4,-12 0,-12 Z")
            .attr("fill", getPinColor(pin.type))
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)

          // Inner circle
          pinGroup.append("circle").attr("cx", 0).attr("cy", -5).attr("r", 2.5).attr("fill", "#fff")

          // Hover events
          pinGroup
            .on("mouseenter", () => {
              setHoveredPin(pin)
              pinGroup.select("path").attr("transform", "scale(1.3)").attr("fill", "#fbbf24")
            })
            .on("mouseleave", () => {
              setHoveredPin(null)
              pinGroup.select("path").attr("transform", "scale(1)").attr("fill", getPinColor(pin.type))
            })
            .on("click", (event: MouseEvent) => {
              event.stopPropagation()
              onCountryClick(pin.countryId)
            })
        }
      }
    })

    // Member pins - leuchtende Punkte für Mitglieder-Städte
    // Zeige Member-Pins wenn: showMembers true UND nicht showEvents
    // Wenn Events aktiviert sind, werden Member-Pins ausgeblendet
    const shouldShowMembers = showMembers && !showEvents
    console.log("Rendering Member-Pins - showMembers:", showMembers, "selectedCountry:", selectedCountry, "showEvents:", showEvents, "memberPins.length:", memberPins.length)
    if (shouldShowMembers) {
      const memberPinsGroup = svg.append("g").attr("class", "member-pins")

      memberPins.forEach((memberPin) => {
      const projected = projection([memberPin.coordinates[1], memberPin.coordinates[0]])

      if (projected) {
        const [x, y] = projected

        // Check if point is on visible side (nur bei Globus-Ansicht)
        let isVisible = true
        if (!useFlatProjection) {
          const distance = d3.geoDistance([memberPin.coordinates[1], memberPin.coordinates[0]], [-currentRotation[0], -currentRotation[1]])
          isVisible = distance < Math.PI / 2
        }

        if (isVisible) {
          const memberGroup = memberPinsGroup
            .append("g")
            .attr("class", "member-pin")
            .attr("transform", `translate(${x}, ${y})`)
            .style("cursor", "pointer")

          // Leuchtender äußerer Kreis mit Animation
          const glowCircle = memberGroup
            .append("circle")
            .attr("r", 0)
            .attr("fill", "#60a5fa")
            .attr("opacity", 0.4)
            .attr("filter", "url(#member-glow-filter)")

          // Animation für Pulsieren
          glowCircle
            .transition()
            .duration(2000)
            .ease(d3.easeSinInOut)
            .attr("r", 12)
            .attr("opacity", 0)
            .on("end", function repeat() {
              d3.select(this)
                .attr("r", 0)
                .attr("opacity", 0.4)
                .transition()
                .duration(2000)
                .ease(d3.easeSinInOut)
                .attr("r", 12)
                .attr("opacity", 0)
                .on("end", repeat)
            })

          // Mittelpunkt - leuchtender Punkt
          memberGroup
            .append("circle")
            .attr("r", 6)
            .attr("fill", "#3b82f6")
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 2)
            .attr("filter", "url(#member-glow-filter)")

          // Innerer weißer Punkt
          memberGroup.append("circle").attr("r", 2.5).attr("fill", "#ffffff")

          // Hover tooltip
          memberGroup
            .on("mouseenter", () => {
              memberGroup.selectAll("circle").attr("transform", "scale(1.5)")
              setHoveredPin({
                id: memberPin.id,
                name: memberPin.name,
                countryId: "",
                coordinates: memberPin.coordinates,
                type: "other",
              })
            })
            .on("mouseleave", () => {
              memberGroup.selectAll("circle").attr("transform", "scale(1)")
              setHoveredPin(null)
            })
            .on("click", (event: MouseEvent) => {
              event.stopPropagation()
              console.log("Member-Pin geklickt:", memberPin.id, memberPin.name)
              setSelectedMemberId(memberPin.id)
              // Zeige automatisch Beziehungen an, wenn ein Member ausgewählt ist
              setShowRelationships(true)
            })
        }
      }
      })
    }

    // Event-Pins mit Fahnen (nur wenn aktiviert)
    // Wenn selectedCountry gesetzt ist, zeige Events nur wenn showEvents true ist
    const shouldShowEvents = showEvents
    if (shouldShowEvents) {
      console.log("Rendering Event-Pins:", eventPins.length, "showEvents:", showEvents)
      if (eventPins.length > 0) {
        const eventsGroup = svg.append("g").attr("class", "event-pins")
        
        eventPins.forEach((eventPin) => {
          console.log("Rendering Event-Pin:", eventPin.title, eventPin.city, eventPin.coordinates)
          // Koordinaten: [latitude, longitude] -> D3 erwartet [longitude, latitude]
          const [lat, lon] = eventPin.coordinates
          console.log("Event-Pin Koordinaten:", eventPin.title, "lat:", lat, "lon:", lon)
          const projected = projection([lon, lat])
          if (!projected) {
            console.warn("Event-Pin konnte nicht projiziert werden:", eventPin.title, "coords:", [lon, lat])
            return
          }

          const [x, y] = projected
          console.log("Event-Pin projiziert:", eventPin.title, "x:", x, "y:", y)

          // Prüfe Sichtbarkeit (nur bei Globus-Ansicht)
          let isVisible = true
          if (!useFlatProjection) {
            const distance = d3.geoDistance(
              [eventPin.coordinates[1], eventPin.coordinates[0]],
              [-currentRotation[0], -currentRotation[1]]
            )
            isVisible = distance < Math.PI / 2
          }

          if (isVisible) {
            console.log("Rendering visible Event-Pin:", eventPin.title, "at", x, y)
            // Fahnen-Pin
            const flagGroup = eventsGroup
              .append("g")
              .attr("class", "event-flag")
              .attr("transform", `translate(${x},${y})`)
              .style("cursor", "pointer")
              .style("pointer-events", "all")
              .on("mouseenter", () => {
                console.log("Hover über Event-Pin:", eventPin.title)
                setHoveredEvent(eventPin)
              })
              .on("mouseleave", () => setHoveredEvent(null))
              .on("click", (event: MouseEvent) => {
                event.stopPropagation()
                console.log("Event-Fahne geklickt:", eventPin.id, eventPin.title)
                if (onEventClick) {
                  onEventClick(eventPin.id)
                }
              })

            // Fahnenmast (größer für bessere Sichtbarkeit)
            flagGroup
              .append("line")
              .attr("x1", 0)
              .attr("y1", 0)
              .attr("x2", 0)
              .attr("y2", -30)
              .attr("stroke", "#8b5a3c")
              .attr("stroke-width", 4)
              .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.7))")
              .style("opacity", 1)

            // Fahne (Dreieck - größer und auffälliger)
            const flagPoints = "0,-30 0,-50 20,-40"
            flagGroup
              .append("polygon")
              .attr("points", flagPoints)
              .attr("fill", "#ef4444")
              .attr("stroke", "#dc2626")
              .attr("stroke-width", 3)
              .style("filter", "drop-shadow(0 3px 6px rgba(0,0,0,0.5))")
              .style("opacity", 1)

            // Glow-Effekt für Fahne (größer)
            flagGroup
              .append("circle")
              .attr("cx", 0)
              .attr("cy", -30)
              .attr("r", 12)
              .attr("fill", "#ef4444")
              .attr("opacity", 0.4)
              .style("filter", "blur(6px)")
              .lower()

            // Pulsierender Punkt am Fahnenmast (größer)
            const pulseCircle = flagGroup
              .append("circle")
              .attr("cx", 0)
              .attr("cy", 0)
              .attr("r", 0)
              .attr("fill", "#ef4444")
              .attr("opacity", 0.8)

            pulseCircle
              .transition()
              .duration(2000)
              .ease(d3.easeSinInOut)
              .attr("r", 10)
              .attr("opacity", 0)
              .on("end", function repeat() {
                d3.select(this)
                  .attr("r", 0)
                  .attr("opacity", 0.8)
                  .transition()
                  .duration(2000)
                  .ease(d3.easeSinInOut)
                  .attr("r", 10)
                  .attr("opacity", 0)
                  .on("end", repeat)
              })
          } else {
            console.log("Event-Pin nicht sichtbar (auf Rückseite):", eventPin.title)
          }
        })
      } else {
        console.warn("Keine Event-Pins zum Rendern - eventPins.length:", eventPins.length, "events.length:", events.length)
      }
    }

    // Beziehungslinien zwischen Mitgliedern (nur wenn aktiviert)
    // Wenn selectedCountry oder selectedMemberId gesetzt ist, zeige Beziehungen nur wenn showRelationships true ist
    const shouldShowRelationships = showRelationships || selectedMemberId
    if (shouldShowRelationships && filteredRelationships.length > 0) {
      const relationshipsGroup = svg.append("g").attr("class", "relationships").attr("opacity", 1)
      
      // Erstelle Map für schnelleren Zugriff auf Mitglieder
      const membersMap = new Map(members.map(m => [m.id, m]))
      
      filteredRelationships.forEach((rel) => {
        const fromMember = membersMap.get(rel.fromMemberId)
        const toMember = membersMap.get(rel.toMemberId)
        
        if (!fromMember?.coordinates || !toMember?.coordinates) {
          return
        }
        
        // Projektion der Koordinaten
        const fromProjected = projection([fromMember.coordinates[1], fromMember.coordinates[0]])
        const toProjected = projection([toMember.coordinates[1], toMember.coordinates[0]])
        
        if (!fromProjected || !toProjected) {
          return
        }
        
        // Prüfe Sichtbarkeit (nur bei Globus-Ansicht)
        let isVisible = true
        if (!useFlatProjection) {
          const fromDistance = d3.geoDistance(
            [fromMember.coordinates[1], fromMember.coordinates[0]],
            [-currentRotation[0], -currentRotation[1]]
          )
          const toDistance = d3.geoDistance(
            [toMember.coordinates[1], toMember.coordinates[0]],
            [-currentRotation[0], -currentRotation[1]]
          )
          // Zeige Linie nur wenn beide Punkte sichtbar sind
          isVisible = fromDistance < Math.PI / 2 && toDistance < Math.PI / 2
        }
        
        if (isVisible) {
          const color = getRelationshipColor(rel.type)
          
          if (useFlatProjection) {
            // Bei flacher Projektion: Gerade Linie
            relationshipsGroup
              .append("line")
              .attr("x1", fromProjected[0])
              .attr("y1", fromProjected[1])
              .attr("x2", toProjected[0])
              .attr("y2", toProjected[1])
              .attr("stroke", color)
              .attr("stroke-width", 3)
              .attr("stroke-opacity", 0.8)
              .attr("stroke-dasharray", rel.type === "strategic_partnership" ? "0" : "6,4")
              .style("pointer-events", "none")
              .style("filter", "drop-shadow(0 0 2px rgba(0,0,0,0.5))")
              .lower()
          } else {
            // Bei Globus-Ansicht: Great Circle Arc
            const start: [number, number] = [fromMember.coordinates[1], fromMember.coordinates[0]]
            const end: [number, number] = [toMember.coordinates[1], toMember.coordinates[0]]
            
            // Erstelle eine Linie zwischen den Punkten (LineString)
            const lineData = {
              type: "LineString" as const,
              coordinates: [start, end] as [number, number][],
            }
            
            // Verwende geoPath statt geoLine (geoLine existiert nicht in d3 v7)
            const linePath = d3.geoPath().projection(projection)
            
            relationshipsGroup
              .append("path")
              .datum(lineData as GeoJSON.LineString)
              .attr("d", linePath as any)
              .attr("fill", "none")
              .attr("stroke", color)
              .attr("stroke-width", 3)
              .attr("stroke-opacity", 0.8)
              .attr("stroke-dasharray", rel.type === "strategic_partnership" ? "0" : "6,4")
              .style("pointer-events", "none")
              .style("filter", "drop-shadow(0 0 2px rgba(0,0,0,0.5))")
              .lower()
          }
        }
      })
    }


    // Glow filter für leuchtende Mitglieder-Punkte
    const memberGlowFilter = defs
      .append("filter")
      .attr("id", "member-glow-filter")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%")

    memberGlowFilter
      .append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur")

    const feMerge = memberGlowFilter.append("feMerge")
    feMerge.append("feMergeNode").attr("in", "coloredBlur")
    feMerge.append("feMergeNode").attr("in", "SourceGraphic")

    // Lichtreflektion
    const reflectionGradient = defs
      .append("radialGradient")
      .attr("id", "reflection-gradient")
      .attr("cx", "35%")
      .attr("cy", "25%")
    reflectionGradient.append("stop").attr("offset", "0%").attr("stop-color", "#ffffff").attr("stop-opacity", "0.12")
    reflectionGradient.append("stop").attr("offset", "40%").attr("stop-color", "#ffffff").attr("stop-opacity", "0.04")
    reflectionGradient.append("stop").attr("offset", "100%").attr("stop-color", "#ffffff").attr("stop-opacity", "0")

    // Lichtreflektion mit sanfter Transition
    svg
      .append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", size / 2.05)
      .attr("fill", "url(#reflection-gradient)")
      .attr("pointer-events", "none")
      .attr("opacity", globeOpacity)
  }, [
    geoData,
    rotation,
    travels,
    numericToAlpha3,
    getCountryStatus,
    getStatusColor,
    handleCountryHover,
    handleCountryClickInternal,
    locationPins,
    memberPins,
    zoomLevel,
    targetRotation,
    zoomedCountry,
    getPinColor,
    onCountryClick,
    countries,
    alpha3ToCountryId,
    flyToCountry,
    showRelationships,
    filteredRelationships,
    getRelationshipColor,
    members,
    selectedCountry,
    showEvents,
    eventPins,
    hoveredEvent,
    onEventClick,
    selectedMemberId,
    showMembers,
    globeStyle, // Add globeStyle to dependencies
  ])

  // Get selected member data
  const selectedMember = selectedMemberId ? members.find(m => m.id === selectedMemberId) : null
  const selectedMemberRelationships = selectedMemberId 
    ? relationships.filter(rel => rel.fromMemberId === selectedMemberId || rel.toMemberId === selectedMemberId)
    : []

  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden select-none touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onWheel={(e) => {
          e.preventDefault()
          
          // Google Earth-ähnliches Zoom-Verhalten
          const zoomSpeed = 0.12 // Etwas langsamer für präzisere Kontrolle
          const delta = e.deltaY > 0 ? 1 - zoomSpeed : 1 + zoomSpeed
          const newZoom = Math.max(0.5, Math.min(8, zoomLevel * delta))
          
          // Wenn Zoom-Level über 2.5 geht, finde das Land unter dem Mauszeiger oder Mitte
          if (newZoom >= 2.5 && !zoomedCountry && geoData && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            const width = rect.width
            const height = rect.height
            const size = Math.min(width, height)
            const baseScale = size / 2.05
            
            // Temporäre Projektion um zu prüfen, welches Land unter dem Mauszeiger ist
            const tempProjection = d3
              .geoOrthographic()
              .scale(baseScale * Math.min(zoomLevel, 2.4))
              .translate([width / 2, height / 2])
              .rotate(rotationRef.current)
              .clipAngle(90)
            
            // Finde nächstes Land basierend auf Rotation oder Mausposition
            const centerLon = -rotation[0]
            const centerLat = -rotation[1]
            
            let closestCountry: string | null = null
            let minDistance = Infinity
            
            const features = (geoData as { features: Array<{ id: string; properties: Record<string, unknown> }> }).features
            features.forEach((feature) => {
              const alpha3 = numericToAlpha3[feature.id]
              if (alpha3) {
                const countryId = alpha3ToCountryId[alpha3]
                if (countryId) {
                  const country = countries.find((c) => c.id === countryId)
                  if (country) {
                    const projected = tempProjection([country.coordinates[1], country.coordinates[0]])
                    if (projected) {
                      const [px, py] = projected
                      const distance = Math.sqrt(Math.pow(px - x, 2) + Math.pow(py - y, 2))
                      
                      // Bevorzuge Länder in der Nähe des Mauszeigers, aber auch in der Nähe der Rotation
                      const rotationDistance = Math.sqrt(
                        Math.pow(country.coordinates[1] - centerLon, 2) +
                        Math.pow(country.coordinates[0] - centerLat, 2)
                      )
                      const combinedDistance = distance * 0.7 + rotationDistance * 0.3
                      
                      if (combinedDistance < minDistance) {
                        minDistance = combinedDistance
                        closestCountry = countryId
                      }
                    }
                  }
                }
              }
            })
            
            if (closestCountry) {
              setZoomedCountry(closestCountry)
            }
          }
          
          // Wenn Zoom-Level unter 2.5 geht, zurücksetzen
          if (newZoom < 2.5 && zoomedCountry) {
            setZoomedCountry(null)
          }
          
          setZoomLevel(newZoom)
        }}
      >
        {/* Sternenhimmel */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(1px 1px at 20px 30px, white, transparent),
                           radial-gradient(1px 1px at 40px 70px, rgba(255,255,255,0.8), transparent),
                           radial-gradient(1px 1px at 50px 160px, rgba(255,255,255,0.6), transparent),
                           radial-gradient(1px 1px at 90px 40px, white, transparent),
                           radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.7), transparent),
                           radial-gradient(1px 1px at 160px 120px, white, transparent),
                           radial-gradient(1.5px 1.5px at 200px 50px, rgba(255,255,255,0.9), transparent),
                           radial-gradient(1px 1px at 220px 150px, white, transparent),
                           radial-gradient(1px 1px at 280px 90px, rgba(255,255,255,0.8), transparent),
                           radial-gradient(1.5px 1.5px at 320px 180px, white, transparent)`,
            backgroundSize: "350px 200px",
          }}
        />

        <svg
          ref={svgRef}
          className="w-full h-full relative z-10"
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        />

        {/* Hover-Tooltip for Event */}
        {hoveredEvent && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-md border border-primary/30 rounded-xl px-4 py-2 shadow-xl shadow-primary/10 pointer-events-none z-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500/20">
                <Flag className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-sm">{hoveredEvent.title}</p>
                <p className="text-xs text-muted-foreground">
                  {hoveredEvent.city} • {new Date(hoveredEvent.startDate).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hover-Tooltip for Country */}
        {hoveredCountryData && !hoveredPin && !hoveredEvent && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-md border border-primary/30 rounded-xl px-4 py-2 shadow-xl shadow-primary/10 pointer-events-none z-20">
            <div className="flex items-center gap-3">
              <span className="text-3xl drop-shadow-sm">{hoveredCountryData.flag}</span>
              <div>
                <p className="font-semibold text-sm">{hoveredCountryData.name}</p>
                <p className="text-xs text-muted-foreground">{hoveredCountryData.capital}</p>
              </div>
            </div>
          </div>
        )}

        {hoveredPin && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-md border border-primary/30 rounded-xl px-4 py-2 shadow-xl shadow-primary/10 pointer-events-none z-20">
            <div className="flex items-center gap-3">
              {hoveredPin.countryId ? (
                // Normale Location Pin
                <>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: getPinColor(hoveredPin.type) + "20" }}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getPinColor(hoveredPin.type) }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{hoveredPin.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {countries.find((c) => c.id === hoveredPin.countryId)?.name}
                    </p>
                  </div>
                </>
              ) : (
                // Mitglieder-Punkt (leuchtend)
                <>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500/20">
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{hoveredPin.name}</p>
                    <p className="text-xs text-muted-foreground">Mitglied</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Toggle-Buttons */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          {/* Globus-Stil Toggle */}
          <button
            onClick={() => setGlobeStyle(globeStyle === "styled" ? "standard" : "styled")}
            className={`px-3 py-2 rounded-lg backdrop-blur-md border transition-colors ${
              globeStyle === "standard"
                ? "bg-blue-500/90 text-white border-blue-400"
                : "bg-card/95 text-foreground border-border hover:bg-accent"
            }`}
            title={globeStyle === "styled" ? "Standard-Globus anzeigen" : "Stilisierte Darstellung anzeigen"}
          >
            <span className="text-sm font-medium">🌍 {globeStyle === "styled" ? "Standard" : "Stilisiert"}</span>
          </button>

          {/* Member-Toggle */}
          <button
            onClick={() => {
              setShowMembers(!showMembers)
              // Wenn Member aktiviert werden, Events deaktivieren
              if (!showMembers) {
                setShowEvents(false)
              }
            }}
            className={`px-3 py-2 rounded-lg backdrop-blur-md border transition-colors ${
              showMembers && !showEvents
                ? "bg-primary/90 text-primary-foreground border-primary"
                : "bg-card/95 text-foreground border-border hover:bg-accent"
            }`}
            title="Mitglieder anzeigen"
          >
            <Users className="w-4 h-4 inline mr-2" />
            <span className="text-sm font-medium">Mitglieder</span>
            {memberPins.length > 0 && showMembers && !showEvents && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-primary/20 text-xs">
                {memberPins.length}
              </span>
            )}
          </button>

          {/* Beziehungen-Toggle */}
          <button
            onClick={() => setShowRelationships(!showRelationships)}
            className={`px-3 py-2 rounded-lg backdrop-blur-md border transition-colors ${
              showRelationships || selectedMemberId
                ? "bg-primary/90 text-primary-foreground border-primary"
                : "bg-card/95 text-foreground border-border hover:bg-accent"
            }`}
            title="Beziehungen anzeigen"
          >
            <Network className="w-4 h-4 inline mr-2" />
            <span className="text-sm font-medium">Beziehungen</span>
            {filteredRelationships.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-primary/20 text-xs">
                {filteredRelationships.length}
              </span>
            )}
          </button>

          {/* Events-Toggle */}
          <button
            onClick={() => {
              setShowEvents(!showEvents)
              // Wenn Events aktiviert werden, Member deaktivieren
              if (!showEvents) {
                setShowMembers(false)
              }
            }}
            className={`px-3 py-2 rounded-lg backdrop-blur-md border transition-colors ${
              showEvents
                ? "bg-primary/90 text-primary-foreground border-primary"
                : "bg-card/95 text-foreground border-border hover:bg-accent"
            }`}
            title="Upcoming Events anzeigen"
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            <span className="text-sm font-medium">Events</span>
            {eventPins.length > 0 && showEvents && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-primary/20 text-xs">
                {eventPins.length}
              </span>
            )}
          </button>
          
          {(showRelationships || selectedCountry || selectedMemberId) && (
            <div className="bg-card/95 backdrop-blur-md border border-border rounded-lg p-3 space-y-2 min-w-[200px]">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Beziehungstypen:</p>
              {[
                { type: "strategic_partnership", label: "Strategische Partnerschaft" },
                { type: "customer_relationship", label: "Kundenbeziehung" },
                { type: "supplier_relationship", label: "Lieferantenbeziehung" },
                { type: "joint_venture", label: "Joint Venture" },
                { type: "consulting", label: "Beratung" },
                { type: "collaboration", label: "Zusammenarbeit" },
                { type: "investment", label: "Investition" },
                { type: "other", label: "Sonstiges" },
              ].map(({ type, label }) => {
                const isSelected = selectedRelationshipTypes.includes(type)
                return (
                  <label key={type} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // Füge Typ hinzu, wenn noch nicht vorhanden
                          if (!selectedRelationshipTypes.includes(type)) {
                            setSelectedRelationshipTypes([...selectedRelationshipTypes, type])
                          }
                        } else {
                          // Entferne Typ
                          const newTypes = selectedRelationshipTypes.filter(t => t !== type)
                          // Wenn alle entfernt wurden, aktiviere alle wieder (zeigt alle)
                          setSelectedRelationshipTypes(newTypes.length === 0 ? [
                            "strategic_partnership",
                            "customer_relationship",
                            "supplier_relationship",
                            "joint_venture",
                            "consulting",
                            "collaboration",
                            "investment",
                            "other",
                          ] : newTypes)
                        }
                      }}
                      className="rounded"
                    />
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getRelationshipColor(type) }}
                    />
                    <span>{label}</span>
                  </label>
                )
              })}
              <button
                onClick={() => {
                  const allTypes = [
                    "strategic_partnership",
                    "customer_relationship",
                    "supplier_relationship",
                    "joint_venture",
                    "consulting",
                    "collaboration",
                    "investment",
                    "other",
                  ]
                  // Wenn alle aktiviert sind, deaktiviere alle (zeigt alle)
                  // Sonst aktiviere alle
                  if (selectedRelationshipTypes.length === allTypes.length) {
                    setSelectedRelationshipTypes([])
                  } else {
                    setSelectedRelationshipTypes([...allTypes])
                  }
                }}
                className="w-full mt-2 px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded transition-colors"
              >
                {selectedRelationshipTypes.length === 8 ? "Alle deaktivieren" : "Alle aktivieren"}
              </button>
            </div>
          )}
        </div>

        {/* Zoom-Steuerung */}
        {zoomLevel > 1 && (
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
            <button
              onClick={() => {
                const newZoom = Math.max(0.5, zoomLevel * 0.8)
                if (newZoom < 2.5 && zoomedCountry) {
                  setZoomedCountry(null)
                }
                setZoomLevel(newZoom)
              }}
              className="w-8 h-8 bg-card/95 backdrop-blur-md border border-border rounded-full flex items-center justify-center hover:bg-accent transition-colors text-sm font-semibold"
              title="Rauszoomen (-)"
            >
              −
            </button>
            <button
              onClick={() => {
                setZoomLevel(1)
                setTargetRotation(null)
                setRotation([0, -20, 0])
                setZoomedCountry(null)
                setCenterPoint(null)
              }}
              className="w-8 h-8 bg-card/95 backdrop-blur-md border border-border rounded-full flex items-center justify-center hover:bg-accent transition-colors text-xs font-semibold"
              title="Zurücksetzen (Escape)"
            >
              ⌂
            </button>
            <button
              onClick={() => {
                const newZoom = Math.min(10, zoomLevel * 1.2)
                if (newZoom >= 2.5 && !zoomedCountry) {
                  const centerLon = -rotation[0]
                  const centerLat = -rotation[1]
                  let closestCountry: string | null = null
                  let minDistance = Infinity
                  countries.forEach((country) => {
                    const distance = Math.sqrt(
                      Math.pow(country.coordinates[1] - centerLon, 2) +
                      Math.pow(country.coordinates[0] - centerLat, 2)
                    )
                    if (distance < minDistance) {
                      minDistance = distance
                      closestCountry = country.id
                    }
                  })
                  if (closestCountry) setZoomedCountry(closestCountry)
                }
                setZoomLevel(newZoom)
              }}
              className="w-8 h-8 bg-card/95 backdrop-blur-md border border-border rounded-full flex items-center justify-center hover:bg-accent transition-colors text-sm font-semibold"
              title="Reinzoomen (+)"
            >
              +
            </button>
          </div>
        )}

        {/* Kompakte Legende */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 z-20">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-[10px] text-white/80">Besucht</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="text-[10px] text-white/80">Gelebt</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-[10px] text-white/80">Bucket List</span>
          </div>
          {locationPins.length > 0 && (
            <>
              <div className="w-px h-3 bg-white/30" />
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-[10px] text-white/80">{locationPins.length} Orte</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Member-Kontakte Sidebar */}
      {selectedMemberId && selectedMember && (
        <div className="absolute right-0 top-0 h-full w-80 bg-card border-l border-border shadow-lg flex flex-col z-30">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{selectedMember.firstName} {selectedMember.lastName}</h3>
              {selectedMember.company && (
                <p className="text-sm text-muted-foreground">{selectedMember.company}</p>
              )}
            </div>
            <button 
              onClick={() => setSelectedMemberId(null)} 
              className="p-1 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Member Details */}
            <div className="space-y-2">
              {selectedMember.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <a href={`mailto:${selectedMember.email}`} className="hover:text-primary transition-colors">
                    {selectedMember.email}
                  </a>
                </div>
              )}
              {selectedMember.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <a href={`tel:${selectedMember.phone}`} className="hover:text-primary transition-colors">
                    {selectedMember.phone}
                  </a>
                </div>
              )}
              {(selectedMember.city || selectedMember.country) && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">
                    {[selectedMember.city, selectedMember.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
            </div>

            {/* Beziehungen */}
            <div className="pt-4 border-t border-border">
              <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Kontakte ({selectedMemberRelationships.length})
              </h4>
              {selectedMemberRelationships.length === 0 ? (
                <p className="text-sm text-muted-foreground">Keine Beziehungen vorhanden</p>
              ) : (
                <div className="space-y-2">
                  {selectedMemberRelationships.map((rel) => {
                    const otherMemberId = rel.fromMemberId === selectedMemberId ? rel.toMemberId : rel.fromMemberId
                    const otherMember = members.find(m => m.id === otherMemberId)
                    if (!otherMember) return null

                    const relationshipTypeLabels: Record<string, string> = {
                      strategic_partnership: "🤝 Strategische Partnerschaft",
                      customer_relationship: "💰 Kundenbeziehung",
                      supplier_relationship: "📦 Lieferantenbeziehung",
                      joint_venture: "🚀 Joint Venture",
                      consulting: "💡 Beratung",
                      collaboration: "✨ Zusammenarbeit",
                      investment: "📈 Investition",
                      other: "📄 Sonstiges",
                    }

                    return (
                      <div key={rel.id} className="p-3 border rounded-lg bg-background hover:bg-accent/50 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{otherMember.firstName} {otherMember.lastName}</p>
                            {otherMember.company && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <Building2 className="w-3 h-3" />
                                <span>{otherMember.company}</span>
                              </div>
                            )}
                            {otherMember.city && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <MapPin className="w-3 h-3" />
                                <span>{otherMember.city}, {otherMember.country}</span>
                              </div>
                            )}
                            <div className="mt-2">
                              <span className="text-xs text-muted-foreground">
                                {relationshipTypeLabels[rel.type] || "Unbekannt"}
                              </span>
                              {rel.description && (
                                <p className="text-xs text-muted-foreground mt-1 italic">{rel.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
