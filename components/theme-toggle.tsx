"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem("cio-venture-theme")
    if (saved) {
      setIsDark(saved === "dark")
      document.documentElement.classList.toggle("light", saved === "light")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark"
    setIsDark(!isDark)
    document.documentElement.classList.toggle("light", !isDark)
    localStorage.setItem("cio-venture-theme", newTheme)
  }

  return (
    <Button variant="outline" size="sm" onClick={toggleTheme} className="w-full justify-start gap-3 bg-transparent">
      {isDark ? (
        <>
          <Moon className="w-4 h-4" />
          Dunkles Design
        </>
      ) : (
        <>
          <Sun className="w-4 h-4" />
          Helles Design
        </>
      )}
    </Button>
  )
}
