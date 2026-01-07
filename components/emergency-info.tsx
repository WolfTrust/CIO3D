"use client"

import { Phone, Building2, Shield, CreditCard, AlertTriangle, Globe, ChevronRight } from "lucide-react"
import { countries } from "@/lib/countries-data"

interface EmergencyInfoProps {
  countryId: string
}

// Emergency numbers by country (simplified dataset)
const EMERGENCY_DATA: Record<string, { police: string; ambulance: string; fire: string; embassy?: string }> = {
  de: { police: "110", ambulance: "112", fire: "112" },
  at: { police: "133", ambulance: "144", fire: "122" },
  ch: { police: "117", ambulance: "144", fire: "118" },
  fr: { police: "17", ambulance: "15", fire: "18" },
  es: { police: "091", ambulance: "061", fire: "080" },
  it: { police: "113", ambulance: "118", fire: "115" },
  gb: { police: "999", ambulance: "999", fire: "999" },
  us: { police: "911", ambulance: "911", fire: "911" },
  jp: { police: "110", ambulance: "119", fire: "119" },
  au: { police: "000", ambulance: "000", fire: "000" },
  th: { police: "191", ambulance: "1669", fire: "199" },
  default: { police: "112", ambulance: "112", fire: "112" },
}

// Visa requirements for German citizens (simplified)
const VISA_INFO: Record<string, { required: boolean; duration?: string; note?: string }> = {
  de: { required: false, note: "Heimatland" },
  at: { required: false, duration: "Unbegrenzt (EU)" },
  ch: { required: false, duration: "90 Tage" },
  fr: { required: false, duration: "Unbegrenzt (EU)" },
  es: { required: false, duration: "Unbegrenzt (EU)" },
  it: { required: false, duration: "Unbegrenzt (EU)" },
  gb: { required: false, duration: "6 Monate (Tourist)" },
  us: { required: true, duration: "ESTA erforderlich", note: "Online beantragen vor Reise" },
  jp: { required: false, duration: "90 Tage" },
  au: { required: true, duration: "eVisitor", note: "Online beantragen" },
  th: { required: false, duration: "30 Tage" },
  default: { required: true, note: "Bitte vor Reise prüfen" },
}

export function EmergencyInfo({ countryId }: EmergencyInfoProps) {
  const country = countries.find((c) => c.id === countryId)
  if (!country) return null

  const emergency = EMERGENCY_DATA[countryId] || EMERGENCY_DATA.default
  const visa = VISA_INFO[countryId] || VISA_INFO.default

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Shield className="w-4 h-4 text-red-500" />
        Notfall & Reiseinfos
      </h4>

      {/* Emergency Numbers */}
      <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20">
        <p className="text-xs text-red-400 mb-2 font-medium">Notrufnummern</p>
        <div className="grid grid-cols-3 gap-2">
          <a href={`tel:${emergency.police}`} className="flex flex-col items-center p-2 bg-background/50 rounded-lg">
            <Phone className="w-4 h-4 text-blue-500 mb-1" />
            <span className="text-xs text-muted-foreground">Polizei</span>
            <span className="text-sm font-bold">{emergency.police}</span>
          </a>
          <a href={`tel:${emergency.ambulance}`} className="flex flex-col items-center p-2 bg-background/50 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-500 mb-1" />
            <span className="text-xs text-muted-foreground">Notarzt</span>
            <span className="text-sm font-bold">{emergency.ambulance}</span>
          </a>
          <a href={`tel:${emergency.fire}`} className="flex flex-col items-center p-2 bg-background/50 rounded-lg">
            <Building2 className="w-4 h-4 text-orange-500 mb-1" />
            <span className="text-xs text-muted-foreground">Feuer</span>
            <span className="text-sm font-bold">{emergency.fire}</span>
          </a>
        </div>
      </div>

      {/* Visa Info */}
      <div className="bg-secondary/50 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs font-medium">Visum (für DE-Bürger)</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                visa.required ? "bg-amber-500/20 text-amber-500" : "bg-green-500/20 text-green-500"
              }`}
            >
              {visa.required ? "Visum erforderlich" : "Visumfrei"}
            </span>
            {visa.duration && <p className="text-xs text-muted-foreground mt-1">{visa.duration}</p>}
            {visa.note && <p className="text-xs text-muted-foreground">{visa.note}</p>}
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Currency */}
      <div className="bg-secondary/50 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs font-medium">Landesinformationen</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Währung:</span>
            <span className="ml-1">{country.currency}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Sprache:</span>
            <span className="ml-1">{country.language}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
