"use client"

import { useRef, useEffect, useState, useMemo, useCallback } from "react"
import * as d3 from "d3"
import * as topojson from "topojson-client"
import type { Topology, GeometryCollection } from "topojson-specification"
import { useTravelStore, type TravelLocation } from "@/lib/travel-store"
import { countries, alpha3ToCountryId } from "@/lib/countries-data"
import {
  Building2,
  Landmark,
  TreePine,
  Waves,
  Mountain,
  MoreHorizontal,
  MapPin,
  Plus,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react"
import type { GeoJSON } from "geojson"

interface CountryMap2DProps {
  countryId: string
  onAddLocation?: () => void
  fullscreen?: boolean
}

const countryIdToAlpha3: Record<string, string> = Object.fromEntries(
  Object.entries(alpha3ToCountryId).map(([alpha3, id]) => [id, alpha3]),
)

// Major cities coordinates for common countries
const majorCitiesCoordinates: Record<string, Record<string, [number, number]>> = {
  de: {
    Berlin: [13.405, 52.52],
    München: [11.582, 48.1351],
    Hamburg: [9.9937, 53.5511],
    Frankfurt: [8.6821, 50.1109],
    Köln: [6.9603, 50.9375],
    Stuttgart: [9.1829, 48.7758],
    Düsseldorf: [6.7735, 51.2277],
    Dresden: [13.7373, 51.0504],
  },
  fr: {
    Paris: [2.3522, 48.8566],
    Lyon: [4.8357, 45.764],
    Marseille: [5.3698, 43.2965],
    Bordeaux: [-0.5792, 44.8378],
    Nice: [7.2619, 43.7102],
    Strasbourg: [7.7521, 48.5734],
  },
  it: {
    Rom: [12.4964, 41.9028],
    Mailand: [9.19, 45.4642],
    Venedig: [12.3155, 45.4408],
    Florenz: [11.2558, 43.7696],
    Neapel: [14.2681, 40.8518],
  },
  es: {
    Madrid: [-3.7038, 40.4168],
    Barcelona: [2.1734, 41.3851],
    Sevilla: [-5.9845, 37.3891],
    Valencia: [-0.3763, 39.4699],
  },
  us: {
    "New York": [-74.006, 40.7128],
    "Los Angeles": [-118.2437, 34.0522],
    Chicago: [-87.6298, 41.8781],
    Miami: [-80.1918, 25.7617],
    "San Francisco": [-122.4194, 37.7749],
    "Las Vegas": [-115.1398, 36.1699],
  },
  gb: {
    London: [-0.1276, 51.5074],
    Manchester: [-2.2426, 53.4808],
    Edinburgh: [-3.1883, 55.9533],
    Liverpool: [-2.9916, 53.4084],
    Birmingham: [-1.8904, 52.4862],
  },
  jp: {
    Tokyo: [139.6917, 35.6895],
    Kyoto: [135.7681, 35.0116],
    Osaka: [135.5023, 34.6937],
    Hiroshima: [132.4596, 34.3853],
  },
  au: {
    Sydney: [151.2093, -33.8688],
    Melbourne: [144.9631, -37.8136],
    Brisbane: [153.0251, -27.4698],
    Perth: [115.8605, -31.9505],
  },
  br: {
    "Rio de Janeiro": [-43.1729, -22.9068],
    "São Paulo": [-46.6333, -23.5505],
    Salvador: [-38.5014, -12.9714],
  },
  th: {
    Bangkok: [100.5018, 13.7563],
    "Chiang Mai": [98.9853, 18.7883],
    Phuket: [98.3923, 7.8804],
  },
  mx: {
    "Mexico City": [-99.1332, 19.4326],
    Cancún: [-86.8515, 21.1619],
    Guadalajara: [-103.3496, 20.6597],
  },
  at: {
    Wien: [16.3738, 48.2082],
    Salzburg: [13.055, 47.8095],
    Innsbruck: [11.3928, 47.2692],
  },
  ch: {
    Zürich: [8.5417, 47.3769],
    Genf: [6.1432, 46.2044],
    Bern: [7.4474, 46.948],
  },
  nl: {
    Amsterdam: [4.9041, 52.3676],
    Rotterdam: [4.4777, 51.9244],
    Utrecht: [5.1214, 52.0907],
  },
  pt: {
    Lissabon: [-9.1393, 38.7223],
    Porto: [-8.6291, 41.1579],
  },
  gr: {
    Athen: [23.7275, 37.9838],
    Thessaloniki: [22.9444, 40.6401],
    Santorini: [25.4615, 36.3932],
  },
}

function getLocationIcon(type: TravelLocation["type"]) {
  switch (type) {
    case "city":
      return Building2
    case "landmark":
      return Landmark
    case "nature":
      return TreePine
    case "beach":
      return Waves
    case "mountain":
      return Mountain
    default:
      return MoreHorizontal
  }
}

function getLocationColor(type: TravelLocation["type"]) {
  switch (type) {
    case "city":
      return "#3b82f6"
    case "landmark":
      return "#eab308"
    case "nature":
      return "#22c55e"
    case "beach":
      return "#06b6d4"
    case "mountain":
      return "#8b5cf6"
    default:
      return "#6b7280"
  }
}

export function CountryMap2D({ countryId, onAddLocation, fullscreen = false }: CountryMap2DProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [countryFeature, setCountryFeature] = useState<GeoJSON.Feature | null>(null)
  const [zoom, setZoom] = useState(1)
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)

  const tripData = useTravelStore((state) => state.tripData)
  const locations = tripData[countryId]?.locations || []

  const country = useMemo(() => countries.find((c) => c.id === countryId), [countryId])
  const alpha3 = countryIdToAlpha3[countryId]

  // Numeric ID mapping for topojson
  const alpha3ToNumeric: Record<string, string> = useMemo(
    () => ({
      AFG: "004",
      ALB: "008",
      DZA: "012",
      AND: "020",
      AGO: "024",
      ATG: "028",
      ARG: "032",
      AUS: "036",
      AUT: "040",
      BHS: "044",
      BHR: "048",
      BGD: "050",
      ARM: "051",
      BRB: "052",
      BEL: "056",
      BTN: "064",
      BOL: "068",
      BIH: "070",
      BWA: "072",
      BRA: "076",
      BLZ: "084",
      SLB: "090",
      BRN: "096",
      BGR: "100",
      MMR: "104",
      BDI: "108",
      BLR: "112",
      KHM: "116",
      CMR: "120",
      CAN: "124",
      CPV: "132",
      CAF: "140",
      LKA: "144",
      TCD: "148",
      CHL: "152",
      CHN: "156",
      TWN: "158",
      COL: "170",
      COM: "174",
      COG: "178",
      COD: "180",
      CRI: "188",
      HRV: "191",
      CUB: "192",
      CYP: "196",
      CZE: "203",
      BEN: "204",
      DNK: "208",
      DMA: "212",
      DOM: "214",
      ECU: "218",
      SLV: "222",
      GNQ: "226",
      ETH: "231",
      ERI: "232",
      EST: "233",
      FJI: "242",
      FIN: "246",
      FRA: "250",
      DJI: "262",
      GAB: "266",
      GEO: "268",
      GMB: "270",
      PSE: "275",
      DEU: "276",
      GHA: "288",
      GRC: "300",
      GRD: "308",
      GTM: "320",
      GIN: "324",
      GUY: "328",
      HTI: "332",
      HND: "340",
      HUN: "348",
      ISL: "352",
      IND: "356",
      IDN: "360",
      IRN: "364",
      IRQ: "368",
      IRL: "372",
      ISR: "376",
      ITA: "380",
      CIV: "384",
      JAM: "388",
      JPN: "392",
      KAZ: "398",
      JOR: "400",
      KEN: "404",
      PRK: "408",
      KOR: "410",
      KWT: "414",
      KGZ: "417",
      LAO: "418",
      LBN: "422",
      LSO: "426",
      LVA: "428",
      LBR: "430",
      LBY: "434",
      LTU: "440",
      LUX: "442",
      MDG: "450",
      MWI: "454",
      MYS: "458",
      MDV: "462",
      MLI: "466",
      MLT: "470",
      MRT: "478",
      MUS: "480",
      MEX: "484",
      MCO: "492",
      MNG: "496",
      MDA: "498",
      MNE: "499",
      MAR: "504",
      MOZ: "508",
      OMN: "512",
      NAM: "516",
      NPL: "524",
      NLD: "528",
      NCL: "540",
      VUT: "548",
      NZL: "554",
      NIC: "558",
      NER: "562",
      NGA: "566",
      NOR: "578",
      PAK: "586",
      PAN: "591",
      PNG: "598",
      PRY: "600",
      PER: "604",
      PHL: "608",
      POL: "616",
      PRT: "620",
      GNB: "624",
      TLS: "626",
      QAT: "634",
      ROU: "642",
      RUS: "643",
      RWA: "646",
      SAU: "682",
      SEN: "686",
      SRB: "688",
      SLE: "694",
      SGP: "702",
      SVK: "703",
      VNM: "704",
      SVN: "705",
      SOM: "706",
      ZAF: "710",
      ZWE: "716",
      ESP: "724",
      SSD: "728",
      SDN: "729",
      ESH: "732",
      SUR: "740",
      SWZ: "748",
      SWE: "752",
      CHE: "756",
      SYR: "760",
      TJK: "762",
      THA: "764",
      TGO: "768",
      TON: "776",
      TTO: "780",
      ARE: "784",
      TUN: "788",
      TUR: "792",
      TKM: "795",
      UGA: "800",
      UKR: "804",
      MKD: "807",
      EGY: "818",
      GBR: "826",
      TZA: "834",
      USA: "840",
      BFA: "854",
      URY: "858",
      UZB: "860",
      VEN: "862",
      WSM: "882",
      YEM: "887",
      ZMB: "894",
    }),
    [],
  )

  // Load world GeoJSON and extract country
  useEffect(() => {
    if (!alpha3) return

    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((res) => res.json())
      .then((topology: Topology<{ countries: GeometryCollection }>) => {
        const geo = topojson.feature(topology, topology.objects.countries) as unknown as GeoJSON.FeatureCollection
        const numericId = alpha3ToNumeric[alpha3]
        const feature = geo.features.find((f: GeoJSON.Feature) => f.id === numericId)
        if (feature) {
          setCountryFeature(feature)
        }
      })
      .catch(console.error)
  }, [alpha3, alpha3ToNumeric])

  // Get location coordinates
  const getLocationCoordinates = useCallback(
    (location: TravelLocation): [number, number] | null => {
      const countryCoords = majorCitiesCoordinates[countryId]
      if (countryCoords && countryCoords[location.name]) {
        return countryCoords[location.name]
      }

      if (country?.coordinates) {
        const seed = location.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const offsetLon = ((seed % 100) / 100 - 0.5) * 3
        const offsetLat = (((seed * 7) % 100) / 100 - 0.5) * 2
        return [country.coordinates[0] + offsetLon, country.coordinates[1] + offsetLat]
      }

      return null
    },
    [countryId, country],
  )

  // Render map
  useEffect(() => {
    if (!countryFeature || !svgRef.current || !containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const defs = svg.append("defs")

    // Improved background gradient
    const bgGradient = defs.append("radialGradient").attr("id", "map-bg-gradient").attr("cx", "50%").attr("cy", "50%")
    bgGradient.append("stop").attr("offset", "0%").attr("stop-color", "#1e293b")
    bgGradient.append("stop").attr("offset", "100%").attr("stop-color", "#0f172a")

    // Improved country gradient
    const countryGradient = defs
      .append("linearGradient")
      .attr("id", "country-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%")
    countryGradient.append("stop").attr("offset", "0%").attr("stop-color", "#34d399")
    countryGradient.append("stop").attr("offset", "50%").attr("stop-color", "#22c55e")
    countryGradient.append("stop").attr("offset", "100%").attr("stop-color", "#16a34a")

    // Improved shadow
    const shadow = defs
      .append("filter")
      .attr("id", "country-shadow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%")
    shadow
      .append("feDropShadow")
      .attr("dx", "0")
      .attr("dy", "8")
      .attr("stdDeviation", "12")
      .attr("flood-color", "#22c55e")
      .attr("flood-opacity", "0.3")

    // Background
    svg.append("rect").attr("width", width).attr("height", height).attr("fill", "url(#map-bg-gradient)")

    // Larger map with more padding usage
    const scaleFactor = fullscreen ? 0.92 : 0.88
    const projection = d3
      .geoMercator()
      .fitSize([width * scaleFactor * zoom, height * scaleFactor * zoom], countryFeature)

    const centroid = d3.geoCentroid(countryFeature)
    projection.center(centroid).translate([width / 2, height / 2])

    const path = d3.geoPath().projection(projection)

    // Draw country
    svg
      .append("path")
      .datum(countryFeature)
      .attr("d", path as unknown as string)
      .attr("fill", "url(#country-gradient)")
      .attr("stroke", "#4ade80")
      .attr("stroke-width", 2.5)
      .attr("filter", "url(#country-shadow)")

    // Draw location markers
    locations.forEach((location) => {
      const coords = getLocationCoordinates(location)
      if (!coords) return

      const projected = projection(coords)
      if (!projected) return

      const [x, y] = projected
      const color = getLocationColor(location.type)
      const isHovered = hoveredLocation === location.id
      const baseSize = fullscreen ? 12 : 10

      // Marker glow
      if (isHovered) {
        svg
          .append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", baseSize * 2.5)
          .attr("fill", color)
          .attr("opacity", 0.3)
      }

      // Marker circle
      svg
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", isHovered ? baseSize * 1.5 : baseSize)
        .attr("fill", color)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2.5)
        .style("cursor", "pointer")
        .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))")
        .on("mouseenter", () => setHoveredLocation(location.id))
        .on("mouseleave", () => setHoveredLocation(null))

      // Marker label
      if (isHovered || locations.length <= 5) {
        svg
          .append("text")
          .attr("x", x)
          .attr("y", y - baseSize - 8)
          .attr("text-anchor", "middle")
          .attr("fill", "#fff")
          .attr("font-size", fullscreen ? "13px" : "11px")
          .attr("font-weight", "600")
          .attr("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.8))")
          .text(location.name)
      }
    })
  }, [countryFeature, locations, zoom, hoveredLocation, getLocationCoordinates, fullscreen])

  if (!country) return null

  return (
    <div className={`bg-secondary/50 rounded-xl overflow-hidden ${fullscreen ? "flex flex-col h-full" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{country.name}</span>
          <span className="text-2xl">{country.flag}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
            disabled={zoom >= 2}
          >
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => setZoom(1)} className="p-1.5 rounded-md hover:bg-secondary transition-colors ml-1">
            <Maximize2 className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div ref={containerRef} className={`relative overflow-hidden ${fullscreen ? "flex-1 min-h-0" : "h-56"}`}>
        <svg ref={svgRef} className="w-full h-full" />

        {/* Empty State */}
        {locations.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-background/80 backdrop-blur-sm rounded-xl px-5 py-4 text-center">
              <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">Noch keine Orte markiert</p>
              {onAddLocation && (
                <button
                  onClick={onAddLocation}
                  className="text-sm text-primary-foreground bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg flex items-center gap-2 mx-auto pointer-events-auto transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ersten Ort hinzufügen
                </button>
              )}
            </div>
          </div>
        )}

        {/* Hovered Location Info */}
        {hoveredLocation && (
          <div className="absolute bottom-3 left-3 right-3">
            {locations
              .filter((l) => l.id === hoveredLocation)
              .map((location) => {
                const Icon = getLocationIcon(location.type)
                return (
                  <div
                    key={location.id}
                    className="bg-background/95 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${getLocationColor(location.type)}30` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: getLocationColor(location.type) }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{location.name}</p>
                      {location.notes && <p className="text-xs text-muted-foreground truncate">{location.notes}</p>}
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>

      {/* Legend */}
      {locations.length > 0 && (
        <div className="flex items-center gap-3 px-3 py-2 border-t border-border/50 overflow-x-auto">
          {Array.from(new Set(locations.map((l) => l.type))).map((type) => {
            const Icon = getLocationIcon(type)
            const count = locations.filter((l) => l.type === type).length
            return (
              <div key={type} className="flex items-center gap-1.5 shrink-0">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: getLocationColor(type) }}
                >
                  <Icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs text-muted-foreground">{count}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
