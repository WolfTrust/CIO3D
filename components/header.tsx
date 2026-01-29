"use client"

import { Globe, Map, BarChart3, Trophy, ListTodo, Clock, Settings, Search, Share2, Compass, Users, Calendar } from "lucide-react"

interface HeaderProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onSearchClick?: () => void
  onShareClick?: () => void
}

export function Header({ activeTab, onTabChange, onSearchClick, onShareClick }: HeaderProps) {
  const tabs = [
    { id: "map", label: "Map", icon: Map },
    { id: "members", label: "Members", icon: Users },
    { id: "events", label: "Events", icon: Calendar },
    { id: "explore", label: "Entdecken", icon: Compass },
    { id: "countries", label: "Länder", icon: Globe },
    { id: "timeline", label: "Timeline", icon: Clock },
    { id: "stats", label: "Stats", icon: BarChart3 },
    { id: "bucket", label: "Liste", icon: ListTodo },
    { id: "achievements", label: "Erfolge", icon: Trophy },
    { id: "settings", label: "Mehr", icon: Settings },
  ]

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg hidden sm:block">CIO-Venture</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSearchClick}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Suche"
          >
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            onClick={onShareClick}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Teilen"
          >
            <Share2 className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <nav className="flex border-t border-border overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 min-w-[60px] flex flex-col items-center gap-1 py-2.5 px-1.5 text-[10px] transition-colors ${
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </header>
  )
}
