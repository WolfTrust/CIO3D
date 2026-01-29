"use client"

import { useState, useMemo } from "react"
import { Luggage, Plus, Check, Trash2, RotateCcw, ChevronDown, ChevronUp } from "lucide-react"

interface PackingItem {
  id: string
  name: string
  category: string
  packed: boolean
}

const DEFAULT_CATEGORIES = [
  {
    name: "Dokumente",
    icon: "📄",
    items: ["Reisepass", "Personalausweis", "Flugtickets", "Hotelbestätigung", "Versicherungskarte", "Führerschein"],
  },
  {
    name: "Kleidung",
    icon: "👕",
    items: ["T-Shirts", "Hosen", "Unterwäsche", "Socken", "Schlafkleidung", "Jacke", "Schuhe"],
  },
  {
    name: "Hygiene",
    icon: "🧴",
    items: ["Zahnbürste", "Zahnpasta", "Shampoo", "Duschgel", "Deo", "Sonnencreme", "Medikamente"],
  },
  {
    name: "Technik",
    icon: "📱",
    items: ["Handy", "Ladegerät", "Powerbank", "Kopfhörer", "Kamera", "Adapter"],
  },
  {
    name: "Sonstiges",
    icon: "🎒",
    items: ["Geldbeutel", "Schlüssel", "Sonnenbrille", "Buch", "Snacks", "Wasserflasche"],
  },
]

export function PackingList() {
  const [items, setItems] = useState<PackingItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cio-venture-packing")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [newItemName, setNewItemName] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Sonstiges")
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Dokumente", "Kleidung"])
  const [showTemplates, setShowTemplates] = useState(items.length === 0)

  const saveItems = (newItems: PackingItem[]) => {
    setItems(newItems)
    localStorage.setItem("cio-venture-packing", JSON.stringify(newItems))
  }

  const handleAddItem = () => {
    if (!newItemName.trim()) return

    const item: PackingItem = {
      id: `item_${Date.now()}`,
      name: newItemName.trim(),
      category: selectedCategory,
      packed: false,
    }

    saveItems([...items, item])
    setNewItemName("")
  }

  const handleToggleItem = (id: string) => {
    saveItems(items.map((item) => (item.id === id ? { ...item, packed: !item.packed } : item)))
  }

  const handleDeleteItem = (id: string) => {
    saveItems(items.filter((item) => item.id !== id))
  }

  const handleLoadTemplate = () => {
    const templateItems: PackingItem[] = []
    DEFAULT_CATEGORIES.forEach((cat) => {
      cat.items.forEach((itemName) => {
        templateItems.push({
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: itemName,
          category: cat.name,
          packed: false,
        })
      })
    })
    saveItems(templateItems)
    setShowTemplates(false)
    setExpandedCategories(DEFAULT_CATEGORIES.map((c) => c.name))
  }

  const handleReset = () => {
    saveItems(items.map((item) => ({ ...item, packed: false })))
  }

  const handleClear = () => {
    saveItems([])
    setShowTemplates(true)
  }

  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, PackingItem[]> = {}
    items.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = []
      }
      grouped[item.category].push(item)
    })
    return grouped
  }, [items])

  const packedCount = items.filter((i) => i.packed).length
  const totalCount = items.length
  const progressPercentage = totalCount > 0 ? (packedCount / totalCount) * 100 : 0

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Luggage className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">Packliste</h3>
              <p className="text-xs text-muted-foreground">
                {packedCount} von {totalCount} gepackt
              </p>
            </div>
          </div>
          {items.length > 0 && (
            <div className="flex gap-1">
              <button
                onClick={handleReset}
                className="p-2 text-muted-foreground hover:text-foreground"
                title="Zurücksetzen"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button onClick={handleClear} className="p-2 text-muted-foreground hover:text-destructive" title="Leeren">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {items.length > 0 && (
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Template suggestion */}
      {showTemplates && items.length === 0 && (
        <div className="p-4 border-b border-border bg-blue-500/5">
          <p className="text-sm mb-3">Starte mit einer Vorlage oder erstelle deine eigene Liste.</p>
          <button
            onClick={handleLoadTemplate}
            className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium"
          >
            Standard-Packliste laden
          </button>
        </div>
      )}

      {/* Add new item */}
      <div className="p-4 border-b border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            placeholder="Neuen Gegenstand hinzufügen..."
            className="flex-1 p-2 bg-secondary rounded-lg text-sm border-0"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 bg-secondary rounded-lg text-sm border-0"
          >
            {DEFAULT_CATEGORIES.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.icon}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddItem}
            disabled={!newItemName.trim()}
            className="p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Items by category */}
      <div className="max-h-80 overflow-y-auto">
        {Object.entries(itemsByCategory).map(([category, categoryItems]) => {
          const catInfo = DEFAULT_CATEGORIES.find((c) => c.name === category)
          const isExpanded = expandedCategories.includes(category)
          const packedInCategory = categoryItems.filter((i) => i.packed).length

          return (
            <div key={category} className="border-b border-border last:border-0">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-3 hover:bg-secondary/50"
              >
                <div className="flex items-center gap-2">
                  <span>{catInfo?.icon || "📦"}</span>
                  <span className="text-sm font-medium">{category}</span>
                  <span className="text-xs text-muted-foreground">
                    ({packedInCategory}/{categoryItems.length})
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-1">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                        item.packed ? "bg-green-500/10" : "bg-secondary/50"
                      }`}
                    >
                      <button
                        onClick={() => handleToggleItem(item.id)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                          item.packed ? "bg-green-500 border-green-500 text-white" : "border-muted-foreground/30"
                        }`}
                      >
                        {item.packed && <Check className="w-3 h-3" />}
                      </button>
                      <span className={`flex-1 text-sm ${item.packed ? "line-through text-muted-foreground" : ""}`}>
                        {item.name}
                      </span>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-muted-foreground hover:text-destructive opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {items.length === 0 && !showTemplates && (
        <div className="p-6 text-center text-muted-foreground">
          <Luggage className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Deine Packliste ist leer</p>
        </div>
      )}
    </div>
  )
}
