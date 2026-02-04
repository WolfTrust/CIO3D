"use client"

import dynamic from "next/dynamic"

// Nur im Browser laden – vermeidet Internal Server Error; Ladezustand mit Inline-Styles, damit er immer sichtbar ist
const HomeContent = dynamic(
  () => import("@/components/home-content").then((m) => ({ default: m.HomeContent })),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          background: "#0d0d12",
          color: "#94a3b8",
          padding: "1.5rem",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p style={{ fontSize: "1.25rem" }}>Lade CIO-Venture …</p>
        <p style={{ fontSize: "0.875rem", opacity: 0.8 }}>
          Falls nichts passiert: F12 → Konsole prüfen oder Seite neu laden (F5).
        </p>
      </div>
    ),
  }
)

export default function Home() {
  return <HomeContent />
}
