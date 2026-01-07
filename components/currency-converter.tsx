"use client"

import { useState, useEffect } from "react"
import { ArrowRightLeft, RefreshCw } from "lucide-react"
import { countries } from "@/lib/countries-data"

interface CurrencyConverterProps {
  countryId: string
}

// Simplified exchange rates (EUR base)
const EXCHANGE_RATES: Record<string, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.86,
  CHF: 0.95,
  JPY: 162.5,
  THB: 38.5,
  AUD: 1.65,
  CAD: 1.47,
  CNY: 7.82,
  INR: 90.2,
  BRL: 5.35,
  MXN: 18.5,
  KRW: 1420,
  SEK: 11.4,
  NOK: 11.6,
  DKK: 7.46,
  PLN: 4.32,
  CZK: 25.2,
  HUF: 392,
  TRY: 34.8,
  RUB: 98,
  ZAR: 19.8,
  NZD: 1.78,
  SGD: 1.45,
  HKD: 8.45,
  AED: 3.97,
  SAR: 4.05,
  EGP: 52.5,
  MAD: 10.8,
  VND: 26500,
  IDR: 17100,
  MYR: 5.05,
  PHP: 61.2,
}

// Map country currencies to codes
const COUNTRY_CURRENCY_CODES: Record<string, string> = {
  de: "EUR",
  at: "EUR",
  fr: "EUR",
  es: "EUR",
  it: "EUR",
  pt: "EUR",
  nl: "EUR",
  be: "EUR",
  gr: "EUR",
  fi: "EUR",
  ie: "EUR",
  ee: "EUR",
  lv: "EUR",
  lt: "EUR",
  sk: "EUR",
  si: "EUR",
  mt: "EUR",
  cy: "EUR",
  lu: "EUR",
  us: "USD",
  gb: "GBP",
  ch: "CHF",
  jp: "JPY",
  th: "THB",
  au: "AUD",
  ca: "CAD",
  cn: "CNY",
  in: "INR",
  br: "BRL",
  mx: "MXN",
  kr: "KRW",
  se: "SEK",
  no: "NOK",
  dk: "DKK",
  pl: "PLN",
  cz: "CZK",
  hu: "HUF",
  tr: "TRY",
  ru: "RUB",
  za: "ZAR",
  nz: "NZD",
  sg: "SGD",
  hk: "HKD",
  ae: "AED",
  sa: "SAR",
  eg: "EGP",
  ma: "MAD",
  vn: "VND",
  id: "IDR",
  my: "MYR",
  ph: "PHP",
}

export function CurrencyConverter({ countryId }: CurrencyConverterProps) {
  const country = countries.find((c) => c.id === countryId)
  const [amount, setAmount] = useState("100")
  const [fromCurrency, setFromCurrency] = useState("EUR")
  const [toCurrency, setToCurrency] = useState(COUNTRY_CURRENCY_CODES[countryId] || "USD")
  const [result, setResult] = useState<number | null>(null)

  useEffect(() => {
    const targetCurrency = COUNTRY_CURRENCY_CODES[countryId] || "USD"
    setToCurrency(targetCurrency)
  }, [countryId])

  useEffect(() => {
    if (!amount || isNaN(Number(amount))) {
      setResult(null)
      return
    }

    const fromRate = EXCHANGE_RATES[fromCurrency] || 1
    const toRate = EXCHANGE_RATES[toCurrency] || 1
    const converted = (Number(amount) / fromRate) * toRate
    setResult(converted)
  }, [amount, fromCurrency, toCurrency])

  const handleSwap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const formatResult = (value: number) => {
    if (value >= 1000) {
      return value.toLocaleString("de-DE", { maximumFractionDigits: 0 })
    }
    return value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  if (!country) return null

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <RefreshCw className="w-4 h-4 text-blue-500" />
        Währungsrechner
      </h4>

      <div className="bg-secondary/50 rounded-xl p-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Betrag</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full mt-1 p-2 bg-background rounded-lg text-sm border-0"
              placeholder="100"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Von</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full mt-1 p-2 bg-background rounded-lg text-sm border-0"
            >
              {Object.keys(EXCHANGE_RATES).map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSwap}
            className="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Ergebnis</label>
            <div className="mt-1 p-2 bg-background rounded-lg">
              <span className="text-lg font-bold">{result !== null ? formatResult(result) : "—"}</span>
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Nach</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full mt-1 p-2 bg-background rounded-lg text-sm border-0"
            >
              {Object.keys(EXCHANGE_RATES).map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">Kurse sind Richtwerte und können abweichen</p>
      </div>
    </div>
  )
}
