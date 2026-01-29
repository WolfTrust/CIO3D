"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback, useMemo, useImperativeHandle, forwardRef } from "react"
import { useTravelStore, type TravelStatus, type TravelLocation } from "@/lib/travel-store"
import { useMembersStore, type Member, type Relationship } from "@/lib/members-store"
import { useEventsStore } from "@/lib/events-store"
import { countries } from "@/lib/countries-data"
import { Network, Calendar, Flag, X, Users, Building2, Link2, Mail, Phone, MapPin } from "lucide-react"

// Set Cesium base URL for assets (wird im Browser gesetzt)
if (typeof window !== "undefined") {
  ;(window as any).CESIUM_BASE_URL = "/cesium"
}

interface GlobeMapProps {
  onCountryClick: (countryId: string) => void
  selectedCountry?: string | null
  onEventClick?: (eventId: string) => void
}

export interface GlobeMapHandle {
  flyToCountry: (countryId: string) => void
}

interface LocationPin {
  id: string
  name: string
  countryId: string
  coordinates: [number, number] // [latitude, longitude]
  type: TravelLocation["type"]
}

interface MemberPin {
  id: string
  name: string
  city: string
  coordinates: [number, number] // [latitude, longitude]
}

interface EventPin {
  id: string
  title: string
  city: string
  countryId: string
  coordinates: [number, number] // [latitude, longitude]
  startDate: string
}

export const GlobeMap = forwardRef<GlobeMapHandle, GlobeMapProps>(function GlobeMap({ onCountryClick, selectedCountry, onEventClick }, ref) {
  const cesiumContainerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null) // Cesium.Viewer
  const [isInitialized, setIsInitialized] = useState(false)
  const [hoveredEntity, setHoveredEntity] = useState<any>(null) // Cesium.Entity
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [showRelationships, setShowRelationships] = useState(false)
  const [showEvents, setShowEvents] = useState(false)
  const [showMembers, setShowMembers] = useState(true)

  const travels = useTravelStore((state) => state.travels)
  const tripData = useTravelStore((state) => state.tripData)
  const members = useMembersStore((state) => state.members)
  const relationships = useMembersStore((state) => state.relationships)
  const events = useEventsStore((state) => state.events)
  const getUpcomingEvents = useEventsStore((state) => state.getUpcomingEvents)

  // Location pins
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

  // Member pins
  const memberPins = useMemo((): MemberPin[] => {
    if (!showMembers && !selectedMemberId) return []
    
    let filteredMembers = members.filter((member) => member.coordinates && member.city)
    
    if (selectedMemberId) {
      filteredMembers = filteredMembers.filter((member) => member.id === selectedMemberId)
    } else if (selectedCountry) {
      const countryCode = selectedCountry.toLowerCase()
      filteredMembers = filteredMembers.filter(
        (member) => member.country?.toLowerCase() === countryCode
      )
    }
    
    return filteredMembers.map((member) => ({
      id: member.id,
      name: `${member.firstName} ${member.lastName}`,
      city: member.city!,
      coordinates: member.coordinates!,
    }))
  }, [members, selectedCountry, selectedMemberId, showMembers])

  // Event pins
  const eventPins = useMemo((): EventPin[] => {
    if (!showEvents) return []
    
    const upcomingEvents = getUpcomingEvents()
    let filteredEvents = upcomingEvents.filter((event) => event.coordinates && event.coordinates.length === 2)
    
    if (selectedCountry) {
      const countryCode = selectedCountry.toLowerCase()
      filteredEvents = filteredEvents.filter(
        (event) => event.country?.toLowerCase() === countryCode
      )
    }
    
    return filteredEvents.map((event) => ({
      id: event.id,
      title: event.title,
      city: event.city,
      countryId: event.country || "",
      coordinates: event.coordinates!,
      startDate: event.startDate,
    }))
  }, [showEvents, events, selectedCountry, getUpcomingEvents])

  // Filtered relationships
  const filteredRelationships = useMemo(() => {
    if (!showRelationships && !selectedMemberId) return []
    
    let filtered = relationships
    
    if (selectedMemberId) {
      filtered = filtered.filter(
        (rel) => rel.fromMemberId === selectedMemberId || rel.toMemberId === selectedMemberId
      )
    } else if (selectedCountry) {
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
    
    return filtered
  }, [relationships, showRelationships, selectedCountry, selectedMemberId, members])

  // Initialize Cesium Viewer
  useEffect(() => {
    if (!cesiumContainerRef.current || isInitialized) return

    // Dynamisch Cesium importieren (nur im Browser)
    const initCesium = async () => {
      try {
        // Import Cesium CSS
        await import("cesium/Build/Cesium/Widgets/widgets.css")
        
        // Import Cesium
        const Cesium = await import("cesium")
        
        // Set Cesium Ion Access Token (optional - für bessere Tiles)
        // Cesium.Ion.defaultAccessToken = "YOUR_TOKEN_HERE"

        // Verwende NaturalEarthII als primären Provider (lokal verfügbar, keine CORS-Probleme)
        // Falls das nicht funktioniert, versuche OpenStreetMap
        let imageryProvider
        try {
          // Primär: NaturalEarthII (lokal in public/cesium, keine Netzwerk-Anfragen)
          imageryProvider = new Cesium.TileMapServiceImageryProvider({
            url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
          })
          console.log("✓ NaturalEarthII Imagery Provider geladen (lokal)")
        } catch (error) {
          console.warn("NaturalEarthII nicht verfügbar, versuche OpenStreetMap:", error)
          try {
            // Fallback: OpenStreetMap
            imageryProvider = Cesium.createOpenStreetMapImageryProvider({
              url: 'https://a.tile.openstreetmap.org/'
            })
            console.log("✓ OpenStreetMap Imagery Provider geladen")
          } catch (error2) {
            console.warn("OpenStreetMap nicht verfügbar, verwende ArcGIS:", error2)
            // Letzter Fallback: ArcGIS World Imagery (kostenlos, keine API Key benötigt)
            try {
              imageryProvider = new Cesium.ArcGisMapServerImageryProvider({
                url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
              })
              console.log("✓ ArcGIS World Imagery Provider geladen")
            } catch (error3) {
              console.error("Alle Imagery-Provider fehlgeschlagen:", error3)
              imageryProvider = undefined
            }
          }
        }

        const viewer = new Cesium.Viewer(cesiumContainerRef.current!, {
          terrainProvider: new Cesium.EllipsoidTerrainProvider(), // Einfacheres Terrain ohne Ion Token
          baseLayerPicker: false,
          vrButton: false,
          geocoder: false,
          homeButton: false,
          infoBox: false,
          sceneModePicker: false,
          selectionIndicator: false,
          timeline: false,
          animation: false,
          fullscreenButton: false,
          navigationHelpButton: false,
          shouldAnimate: true,
          requestRenderMode: false, // Deaktiviert für bessere Performance
          maximumRenderTimeChange: Infinity,
        })
        
        // Entferne alle Standard-Layers und füge unseren Provider hinzu
        viewer.imageryLayers.removeAll()
        
        if (imageryProvider) {
          try {
            const layer = viewer.imageryLayers.addImageryProvider(imageryProvider)
            console.log("✓ Imagery Layer hinzugefügt:", {
              provider: imageryProvider.constructor.name,
              layerCount: viewer.imageryLayers.length,
              layer: layer
            })
            
            // Stelle sicher, dass der Layer sichtbar ist
            layer.show = true
            layer.alpha = 1.0
            
            // Force render
            viewer.scene.requestRender()
          } catch (error) {
            console.error("Fehler beim Hinzufügen des Imagery Providers:", error)
          }
        } else {
          console.warn("⚠ Kein Imagery Provider verfügbar - Globus wird nur blau angezeigt")
          
          // Versuche ArcGIS als letzten Fallback
          try {
            const arcgisProvider = new Cesium.ArcGisMapServerImageryProvider({
              url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
            })
            viewer.imageryLayers.addImageryProvider(arcgisProvider)
            console.log("✓ ArcGIS Fallback hinzugefügt")
          } catch (fallbackError) {
            console.error("Auch ArcGIS Fallback fehlgeschlagen:", fallbackError)
          }
        }

          // Configure scene
          viewer.scene.globe.enableLighting = true
          viewer.scene.globe.dynamicAtmosphereLighting = true
          viewer.scene.globe.dynamicAtmosphereLightingFromSun = true
          viewer.scene.globe.showWaterEffect = true
          viewer.scene.globe.showGroundAtmosphere = true
          viewer.scene.globe.baseColor = Cesium.Color.BLUE.withAlpha(0.5)
          
          // Verbesserte Sichtbarkeit
          viewer.scene.globe.show = true
          viewer.scene.skyBox.show = true
          viewer.scene.sun.show = true
          viewer.scene.moon.show = true
          
          // Stelle sicher, dass der Viewer gerendert wird
          viewer.scene.requestRender()
          
          // Debug: Log Viewer-Status
          console.log("CesiumJS Viewer initialisiert:", {
            container: cesiumContainerRef.current?.clientWidth + "x" + cesiumContainerRef.current?.clientHeight,
            imageryLayers: viewer.imageryLayers.length,
            globeVisible: viewer.scene.globe.show
          })
          
          // Set initial camera position
          viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(0, 0, 15000000),
            orientation: {
              heading: Cesium.Math.toRadians(0),
              pitch: Cesium.Math.toRadians(-90),
              roll: 0.0,
            },
          })

          // Disable default double-click behavior
          viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)

          // Store Cesium instance in viewer for later use
          ;(viewer as any).cesium = Cesium
          viewerRef.current = viewer
          setIsInitialized(true)
      } catch (error) {
        console.error("Error initializing Cesium:", error)
        // Zeige Fehlermeldung im UI
        alert(`Fehler beim Laden von CesiumJS: ${error instanceof Error ? error.message : String(error)}\n\nBitte prüfen Sie die Browser-Konsole für Details.`)
      }
    }

    initCesium()

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
    }
  }, [isInitialized])

  // Add location pins
  useEffect(() => {
    if (!viewerRef.current || !isInitialized) return

    const viewer = viewerRef.current
    const Cesium = (viewer as any).cesium
    if (!Cesium) return
    
    const entities = viewer.entities

    // Remove existing location pins
    const existingPins = entities.values.filter(e => e.id?.startsWith("location-pin-"))
    existingPins.forEach(pin => entities.remove(pin))

    // Add new location pins
    locationPins.forEach((pin) => {
      const [lat, lon] = pin.coordinates
      const color = getPinColor(pin.type)

      entities.add({
        id: `location-pin-${pin.id}`,
        position: Cesium.Cartesian3.fromDegrees(lon, lat),
        point: {
          pixelSize: 12,
          color: Cesium.Color.fromCssColorString(color),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: pin.name,
          font: "12pt sans-serif",
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -20),
          show: false,
        },
      })
    })

    // Add click handlers
    viewer.selectedEntityChanged.addEventListener((selectedEntity) => {
      if (selectedEntity && selectedEntity.id?.startsWith("location-pin-")) {
        const pinId = selectedEntity.id.replace("location-pin-", "")
        const pin = locationPins.find(p => p.id === pinId)
        if (pin) {
          onCountryClick(pin.countryId)
        }
      }
    })

    // Add hover handlers
    viewer.cesiumWidget.canvas.addEventListener("mousemove", (event) => {
      const pickedObject = viewer.scene.pick(new Cesium.Cartesian2(event.clientX, event.clientY))
      if (pickedObject && Cesium.defined(pickedObject.id) && pickedObject.id.id?.startsWith("location-pin-")) {
        const entity = pickedObject.id as Cesium.Entity
        if (entity.label) {
          entity.label.show = true
        }
        setHoveredEntity(entity)
      } else {
        if (hoveredEntity && hoveredEntity.label) {
          hoveredEntity.label.show = false
          setHoveredEntity(null)
        }
      }
    })
  }, [locationPins, isInitialized, onCountryClick, hoveredEntity])

  // Add member pins
  useEffect(() => {
    if (!viewerRef.current || !isInitialized || !showMembers || showEvents) return

    const viewer = viewerRef.current
    const Cesium = (viewer as any).cesium
    if (!Cesium) return
    
    const entities = viewer.entities

    // Remove existing member pins
    const existingPins = entities.values.filter(e => e.id?.startsWith("member-pin-"))
    existingPins.forEach(pin => entities.remove(pin))

    // Add new member pins
    memberPins.forEach((memberPin) => {
      const [lat, lon] = memberPin.coordinates

      entities.add({
        id: `member-pin-${memberPin.id}`,
        position: Cesium.Cartesian3.fromDegrees(lon, lat, 1000),
        billboard: {
          image: createMemberPinImage(),
          width: 32,
          height: 32,
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: memberPin.name,
          font: "12pt sans-serif",
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -20),
          show: false,
        },
      })
    })

    // Update click handler
    viewer.selectedEntityChanged.addEventListener((selectedEntity) => {
      if (selectedEntity && selectedEntity.id?.startsWith("member-pin-")) {
        const memberId = selectedEntity.id.replace("member-pin-", "")
        setSelectedMemberId(memberId)
        setShowRelationships(true)
        setShowEvents(false)
      }
    })
  }, [memberPins, showMembers, showEvents, isInitialized, selectedMemberId])

  // Add event pins
  useEffect(() => {
    if (!viewerRef.current || !isInitialized || !showEvents) return

    const viewer = viewerRef.current
    const Cesium = (viewer as any).cesium
    if (!Cesium) return
    
    const entities = viewer.entities

    // Remove existing event pins
    const existingPins = entities.values.filter(e => e.id?.startsWith("event-pin-"))
    existingPins.forEach(pin => entities.remove(pin))

    // Add new event pins
    eventPins.forEach((eventPin) => {
      const [lat, lon] = eventPin.coordinates

      entities.add({
        id: `event-pin-${eventPin.id}`,
        position: Cesium.Cartesian3.fromDegrees(lon, lat, 1000),
        billboard: {
          image: createEventPinImage(),
          width: 40,
          height: 40,
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: eventPin.title,
          font: "12pt sans-serif",
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -25),
          show: false,
        },
      })
    })

    // Update click handler
    viewer.selectedEntityChanged.addEventListener((selectedEntity) => {
      if (selectedEntity && selectedEntity.id?.startsWith("event-pin-")) {
        const eventId = selectedEntity.id.replace("event-pin-", "")
        if (onEventClick) {
          onEventClick(eventId)
        }
      }
    })
  }, [eventPins, showEvents, isInitialized, onEventClick])

  // Add relationship lines
  useEffect(() => {
    if (!viewerRef.current || !isInitialized || (!showRelationships && !selectedMemberId)) return

    const viewer = viewerRef.current
    const Cesium = (viewer as any).cesium
    if (!Cesium) return
    
    const entities = viewer.entities

    // Remove existing relationship lines
    const existingLines = entities.values.filter(e => e.id?.startsWith("relationship-"))
    existingLines.forEach(line => entities.remove(line))

    // Create members map
    const membersMap = new Map(members.map(m => [m.id, m]))

    // Add relationship lines
    filteredRelationships.forEach((rel) => {
      const fromMember = membersMap.get(rel.fromMemberId)
      const toMember = membersMap.get(rel.toMemberId)

      if (fromMember?.coordinates && toMember?.coordinates) {
        const [fromLat, fromLon] = fromMember.coordinates
        const [toLat, toLon] = toMember.coordinates
        const color = getRelationshipColor(rel.type)

        entities.add({
          id: `relationship-${rel.id}`,
          polyline: {
            positions: [
              Cesium.Cartesian3.fromDegrees(fromLon, fromLat, 10000),
              Cesium.Cartesian3.fromDegrees(toLon, toLat, 10000),
            ],
            width: 3,
            material: Cesium.Color.fromCssColorString(color),
            clampToGround: false,
            arcType: Cesium.ArcType.GEODESIC,
          },
        })
      }
    })
  }, [filteredRelationships, showRelationships, selectedMemberId, members, isInitialized])

  // Helper functions
  const getPinColor = useCallback((type: TravelLocation["type"]): string => {
    switch (type) {
      case "city": return "#ef4444"
      case "landmark": return "#f97316"
      case "nature": return "#22c55e"
      case "beach": return "#06b6d4"
      case "mountain": return "#8b5cf6"
      default: return "#ec4899"
    }
  }, [])

  const getRelationshipColor = useCallback((type: string): string => {
    switch (type) {
      case "strategic_partnership": return "#22c55e"
      case "customer_relationship": return "#3b82f6"
      case "supplier_relationship": return "#f59e0b"
      case "joint_venture": return "#8b5cf6"
      case "consulting": return "#06b6d4"
      case "collaboration": return "#ec4899"
      case "investment": return "#ef4444"
      case "other": return "#6b7280"
      default: return "#6b7280"
    }
  }, [])

  // Create member pin image (blue glowing dot)
  const createMemberPinImage = useCallback(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext("2d")
    if (!ctx) return ""

    // Outer glow
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.8)")
    gradient.addColorStop(0.5, "rgba(59, 130, 246, 0.4)")
    gradient.addColorStop(1, "rgba(59, 130, 246, 0)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 32, 32)

    // Inner circle
    ctx.fillStyle = "#3b82f6"
    ctx.beginPath()
    ctx.arc(16, 16, 8, 0, Math.PI * 2)
    ctx.fill()

    // White center
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(16, 16, 4, 0, Math.PI * 2)
    ctx.fill()

    return canvas.toDataURL()
  }, [])

  // Create event pin image (flag)
  const createEventPinImage = useCallback(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 40
    canvas.height = 50
    const ctx = canvas.getContext("2d")
    if (!ctx) return ""

    // Flag pole
    ctx.fillStyle = "#8b5a3c"
    ctx.fillRect(18, 0, 4, 30)

    // Flag
    ctx.fillStyle = "#ef4444"
    ctx.beginPath()
    ctx.moveTo(22, 0)
    ctx.lineTo(22, 20)
    ctx.lineTo(38, 10)
    ctx.closePath()
    ctx.fill()

    // Glow
    const gradient = ctx.createRadialGradient(20, 0, 0, 20, 0, 15)
    gradient.addColorStop(0, "rgba(239, 68, 68, 0.6)")
    gradient.addColorStop(1, "rgba(239, 68, 68, 0)")
    ctx.fillStyle = gradient
    ctx.fillRect(5, -5, 30, 30)

    return canvas.toDataURL()
  }, [])

  // Fly to country
  const flyToCountry = useCallback((countryId: string) => {
    if (!viewerRef.current) return

    const viewer = viewerRef.current
    const Cesium = (viewer as any).cesium
    if (!Cesium) return

    const country = countries.find((c) => c.id === countryId)
    if (!country || !country.coordinates) return

    const [lat, lon] = country.coordinates
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, 500000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0.0,
      },
      duration: 2.5,
    })
  }, [])

  useImperativeHandle(ref, () => ({
    flyToCountry,
  }), [flyToCountry])

  // Get selected member data
  const selectedMember = selectedMemberId ? members.find(m => m.id === selectedMemberId) : null
  const selectedMemberRelationships = selectedMemberId 
    ? relationships.filter(rel => rel.fromMemberId === selectedMemberId || rel.toMemberId === selectedMemberId)
    : []

  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div
        ref={cesiumContainerRef}
        className="flex-1 relative overflow-hidden"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Toggle-Buttons */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
        <button
          onClick={() => {
            setShowMembers(!showMembers)
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

        <button
          onClick={() => {
            setShowEvents(!showEvents)
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
              onClick={() => {
                setSelectedMemberId(null)
                setShowRelationships(false)
              }} 
              className="p-1 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
