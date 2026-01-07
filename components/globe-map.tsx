"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback, useMemo, useImperativeHandle, forwardRef } from "react"
import { useTravelStore, type TravelStatus } from "@/lib/travel-store"
import { countries, alpha3ToCountryId } from "@/lib/countries-data"
import * as d3 from "d3"
import * as topojson from "topojson-client"
import type { Topology, GeometryCollection } from "topojson-specification"
import type { GeoPermissibleObjects } from "d3"

interface GlobeMapProps {
  onCountryClick: (countryId: string) => void
}

export interface GlobeMapHandle {
  flyToCountry: (countryId: string) => void
}

export const GlobeMap = forwardRef<GlobeMapHandle, GlobeMapProps>(function GlobeMap({ onCountryClick }, ref) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [geoData, setGeoData] = useState<GeoPermissibleObjects | null>(null)
  const [rotation, setRotation] = useState<[number, number, number]>([0, -20, 0])
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)

  const velocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const lastPosRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const dragStart = useRef<{ x: number; y: number; rotation: [number, number, number] } | null>(null)
  const animationRef = useRef<number | null>(null)
  const autoRotateRef = useRef<number | null>(null)
  const flyAnimationRef = useRef<number | null>(null)

  const travels = useTravelStore((state) => state.travels)

  // Load world GeoJSON data
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((res) => res.json())
      .then((topology: Topology<{ countries: GeometryCollection }>) => {
        const geo = topojson.feature(topology, topology.objects.countries) as unknown as GeoPermissibleObjects
        setGeoData(geo)
      })
      .catch(console.error)
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

  const flyToCountry = useCallback(
    (countryId: string) => {
      const country = countries.find((c) => c.id === countryId)
      if (!country || !country.coordinates) return

      if (autoRotateRef.current) cancelAnimationFrame(autoRotateRef.current)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (flyAnimationRef.current) cancelAnimationFrame(flyAnimationRef.current)
      velocityRef.current = { x: 0, y: 0 }

      const targetLon = -country.coordinates[0]
      const targetLat = -country.coordinates[1]
      const startRotation = [...rotation] as [number, number, number]
      const startTime = Date.now()
      const duration = 1500

      const animate = () => {
        const elapsed = Date.now() - startTime
        const t = Math.min(elapsed / duration, 1)
        const easeT = 1 - Math.pow(1 - t, 3)

        const newRotation: [number, number, number] = [
          startRotation[0] + (targetLon - startRotation[0]) * easeT,
          startRotation[1] + (targetLat - startRotation[1]) * easeT,
          0,
        ]
        setRotation(newRotation)

        if (t < 1) {
          flyAnimationRef.current = requestAnimationFrame(animate)
        }
      }
      flyAnimationRef.current = requestAnimationFrame(animate)
    },
    [rotation],
  )

  useImperativeHandle(ref, () => ({ flyToCountry }), [flyToCountry])

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

  useEffect(() => {
    if (!isDragging && velocityRef.current.x === 0 && velocityRef.current.y === 0) {
      const autoRotate = () => {
        setRotation((prev) => [(prev[0] + 0.15) % 360, prev[1], prev[2]])
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
  }, [isDragging])

  useEffect(() => {
    if (!isDragging && (Math.abs(velocityRef.current.x) > 0.1 || Math.abs(velocityRef.current.y) > 0.1)) {
      const animate = () => {
        velocityRef.current.x *= 0.95
        velocityRef.current.y *= 0.95

        setRotation((prev) => [
          prev[0] + velocityRef.current.x,
          Math.max(-90, Math.min(90, prev[1] - velocityRef.current.y)),
          0,
        ])

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
  }, [isDragging])

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
      dragStart.current = { x: point.clientX, y: point.clientY, rotation: [...rotation] as [number, number, number] }
      lastPosRef.current = { x: point.clientX, y: point.clientY, time: Date.now() }
      setIsDragging(true)
    },
    [rotation],
  )

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
      setRotation(newRotation)
    },
    [isDragging],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    dragStart.current = null
    lastPosRef.current = null
  }, [])

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

  useEffect(() => {
    if (!geoData || !svgRef.current || !containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight
    const size = Math.min(width, height)

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const defs = svg.append("defs")

    const oceanGradient = defs.append("radialGradient").attr("id", "ocean-gradient").attr("cx", "30%").attr("cy", "30%")
    oceanGradient.append("stop").attr("offset", "0%").attr("stop-color", "#1e4976")
    oceanGradient.append("stop").attr("offset", "50%").attr("stop-color", "#0d3a5f")
    oceanGradient.append("stop").attr("offset", "100%").attr("stop-color", "#061829")

    const glowFilter = defs
      .append("filter")
      .attr("id", "globe-glow")
      .attr("x", "-100%")
      .attr("y", "-100%")
      .attr("width", "300%")
      .attr("height", "300%")
    glowFilter.append("feGaussianBlur").attr("stdDeviation", "12").attr("result", "blur")
    glowFilter.append("feComposite").attr("in", "SourceGraphic").attr("in2", "blur").attr("operator", "over")

    const atmosphereGradient = defs
      .append("radialGradient")
      .attr("id", "atmosphere-gradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
    atmosphereGradient.append("stop").attr("offset", "80%").attr("stop-color", "#3b82f6").attr("stop-opacity", "0")
    atmosphereGradient.append("stop").attr("offset", "88%").attr("stop-color", "#60a5fa").attr("stop-opacity", "0.15")
    atmosphereGradient.append("stop").attr("offset", "95%").attr("stop-color", "#93c5fd").attr("stop-opacity", "0.25")
    atmosphereGradient.append("stop").attr("offset", "100%").attr("stop-color", "#bfdbfe").attr("stop-opacity", "0.4")

    const projection = d3
      .geoOrthographic()
      .scale(size / 2.05)
      .translate([width / 2, height / 2])
      .rotate(rotation)
      .clipAngle(90)

    const path = d3.geoPath().projection(projection)

    svg
      .append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", size / 2 + 25)
      .attr("fill", "url(#atmosphere-gradient)")
      .attr("pointer-events", "none")

    // Globus-Basis
    svg
      .append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", size / 2.05)
      .attr("fill", "url(#ocean-gradient)")
      .attr("filter", "url(#globe-glow)")

    // Graticule
    const graticule = d3.geoGraticule()
    svg
      .append("path")
      .datum(graticule())
      .attr("d", path as unknown as string)
      .attr("fill", "none")
      .attr("stroke", "#1e3a5f")
      .attr("stroke-width", 0.4)
      .attr("stroke-opacity", 0.5)

    // Länder
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
        return getStatusColor(status)
      })
      .attr("stroke", "#1f2937")
      .attr("stroke-width", 0.5)
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

    // Lichtreflektion
    const reflectionGradient = defs
      .append("radialGradient")
      .attr("id", "reflection-gradient")
      .attr("cx", "35%")
      .attr("cy", "25%")
    reflectionGradient.append("stop").attr("offset", "0%").attr("stop-color", "#ffffff").attr("stop-opacity", "0.12")
    reflectionGradient.append("stop").attr("offset", "40%").attr("stop-color", "#ffffff").attr("stop-opacity", "0.04")
    reflectionGradient.append("stop").attr("offset", "100%").attr("stop-color", "#ffffff").attr("stop-opacity", "0")

    svg
      .append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", size / 2.05)
      .attr("fill", "url(#reflection-gradient)")
      .attr("pointer-events", "none")
  }, [
    geoData,
    rotation,
    travels,
    numericToAlpha3,
    getCountryStatus,
    getStatusColor,
    handleCountryHover,
    handleCountryClickInternal,
  ])

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

        {/* Hover-Tooltip */}
        {hoveredCountryData && (
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
        </div>
      </div>
    </div>
  )
})
