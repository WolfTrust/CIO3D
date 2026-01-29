import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CIO-Venture - Deine Reise-Weltkarte",
  description:
    "Die ultimative Reise-Tracking App. Markiere besuchte Länder, plane deine Bucket List und visualisiere deine Weltreise auf einem interaktiven 3D-Globus.",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CIO-Venture",
  },
  icons: {
    icon: [
      { url: "/icon-192.jpg", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.jpg", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon.jpg",
  },
  openGraph: {
    title: "CIO-Venture - Deine Reise-Weltkarte",
    description: "Markiere besuchte Länder, plane deine Bucket List und visualisiere deine Weltreise.",
    type: "website",
    locale: "de_DE",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className="bg-background" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/apple-icon.jpg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans antialiased overscroll-none">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
