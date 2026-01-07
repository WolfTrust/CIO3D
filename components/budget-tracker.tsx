"use client"

import { useState, useMemo } from "react"
import { Wallet, Plus, Trash2, TrendingUp, PieChart, X } from "lucide-react"
import { countries } from "@/lib/countries-data"
import { useTravelStore } from "@/lib/travel-store"

interface Expense {
  id: string
  countryId: string
  category: "food" | "transport" | "accommodation" | "activities" | "shopping" | "other"
  amount: number
  currency: string
  description: string
  date: string
}

const CATEGORIES = {
  food: { label: "Essen", color: "bg-orange-500", icon: "🍽️" },
  transport: { label: "Transport", color: "bg-blue-500", icon: "🚗" },
  accommodation: { label: "Unterkunft", color: "bg-purple-500", icon: "🏨" },
  activities: { label: "Aktivitäten", color: "bg-green-500", icon: "🎯" },
  shopping: { label: "Shopping", color: "bg-pink-500", icon: "🛍️" },
  other: { label: "Sonstiges", color: "bg-gray-500", icon: "📦" },
}

const CURRENCIES = [
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GBP", symbol: "£", name: "Britisches Pfund" },
  { code: "CHF", symbol: "Fr.", name: "Schweizer Franken" },
  { code: "JPY", symbol: "¥", name: "Japanischer Yen" },
  { code: "THB", symbol: "฿", name: "Thailändischer Baht" },
  { code: "AUD", symbol: "A$", name: "Australischer Dollar" },
]

export function BudgetTracker() {
  const travels = useTravelStore((state) => state.travels)
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("wanderlust-expenses")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [newExpense, setNewExpense] = useState({
    countryId: "",
    category: "food" as const,
    amount: "",
    currency: "EUR",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })

  const visitedCountries = useMemo(() => {
    return countries.filter((c) => travels[c.id] === "visited" || travels[c.id] === "lived")
  }, [travels])

  const saveExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses)
    localStorage.setItem("wanderlust-expenses", JSON.stringify(newExpenses))
  }

  const handleAddExpense = () => {
    if (!newExpense.countryId || !newExpense.amount) return

    const expense: Expense = {
      id: `exp_${Date.now()}`,
      countryId: newExpense.countryId,
      category: newExpense.category,
      amount: Number.parseFloat(newExpense.amount),
      currency: newExpense.currency,
      description: newExpense.description,
      date: newExpense.date,
    }

    saveExpenses([...expenses, expense])
    setNewExpense({
      countryId: "",
      category: "food",
      amount: "",
      currency: "EUR",
      description: "",
      date: new Date().toISOString().split("T")[0],
    })
    setIsAddingExpense(false)
  }

  const handleDeleteExpense = (id: string) => {
    saveExpenses(expenses.filter((e) => e.id !== id))
  }

  const totalByCategory = useMemo(() => {
    const totals: Record<string, number> = {}
    expenses.forEach((exp) => {
      totals[exp.category] = (totals[exp.category] || 0) + exp.amount
    })
    return totals
  }, [expenses])

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0)
  }, [expenses])

  const recentExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
  }, [expenses])

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Wallet className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold">Reisebudget</h3>
              <p className="text-xs text-muted-foreground">Verfolge deine Ausgaben</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddingExpense(true)}
            className="p-2 bg-primary text-primary-foreground rounded-lg"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Gesamtausgaben</p>
            <p className="text-2xl font-bold">€{totalExpenses.toFixed(2)}</p>
          </div>
          <TrendingUp className="w-8 h-8 text-green-500/50" />
        </div>
      </div>

      {/* Category breakdown */}
      {Object.keys(totalByCategory).length > 0 && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Nach Kategorie</span>
          </div>
          <div className="space-y-2">
            {Object.entries(totalByCategory).map(([cat, amount]) => {
              const category = CATEGORIES[cat as keyof typeof CATEGORIES]
              const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
              return (
                <div key={cat} className="flex items-center gap-2">
                  <span className="text-sm">{category.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{category.label}</span>
                      <span>€{amount.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${category.color} rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent expenses */}
      {recentExpenses.length > 0 && (
        <div className="p-4">
          <p className="text-sm font-medium mb-3">Letzte Ausgaben</p>
          <div className="space-y-2">
            {recentExpenses.map((expense) => {
              const country = countries.find((c) => c.id === expense.countryId)
              const category = CATEGORIES[expense.category]
              return (
                <div key={expense.id} className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg">
                  <span className="text-lg">{country?.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{expense.description || category.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString("de-DE")}
                    </p>
                  </div>
                  <span className="text-sm font-medium">€{expense.amount.toFixed(2)}</span>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {expenses.length === 0 && (
        <div className="p-6 text-center text-muted-foreground">
          <Wallet className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Noch keine Ausgaben erfasst</p>
        </div>
      )}

      {/* Add Expense Modal */}
      {isAddingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Ausgabe hinzufügen</h3>
              <button onClick={() => setIsAddingExpense(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Land</label>
                <select
                  value={newExpense.countryId}
                  onChange={(e) => setNewExpense({ ...newExpense, countryId: e.target.value })}
                  className="w-full mt-1 p-3 bg-secondary rounded-xl border-0 text-sm"
                >
                  <option value="">Land auswählen</option>
                  {visitedCountries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Kategorie</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <button
                      key={key}
                      onClick={() => setNewExpense({ ...newExpense, category: key as Expense["category"] })}
                      className={`p-2 rounded-lg text-xs ${
                        newExpense.category === key ? "bg-primary text-primary-foreground" : "bg-secondary"
                      }`}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground">Betrag</label>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full mt-1 p-3 bg-secondary rounded-xl border-0 text-sm"
                  />
                </div>
                <div className="w-24">
                  <label className="text-sm text-muted-foreground">Währung</label>
                  <select
                    value={newExpense.currency}
                    onChange={(e) => setNewExpense({ ...newExpense, currency: e.target.value })}
                    className="w-full mt-1 p-3 bg-secondary rounded-xl border-0 text-sm"
                  >
                    {CURRENCIES.map((cur) => (
                      <option key={cur.code} value={cur.code}>
                        {cur.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Beschreibung</label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="z.B. Abendessen im Restaurant"
                  className="w-full mt-1 p-3 bg-secondary rounded-xl border-0 text-sm"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Datum</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full mt-1 p-3 bg-secondary rounded-xl border-0 text-sm"
                />
              </div>

              <button
                onClick={handleAddExpense}
                disabled={!newExpense.countryId || !newExpense.amount}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-50"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
