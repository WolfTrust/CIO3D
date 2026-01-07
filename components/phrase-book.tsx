"use client"

import { useState } from "react"
import { MessageCircle, Volume2, Copy, Check } from "lucide-react"

interface PhraseBookProps {
  countryId: string
}

interface Phrase {
  german: string
  local: string
  pronunciation?: string
}

// Basic phrases by country
const PHRASES: Record<string, { language: string; phrases: Phrase[] }> = {
  fr: {
    language: "Französisch",
    phrases: [
      { german: "Hallo", local: "Bonjour", pronunciation: "Bon-schur" },
      { german: "Danke", local: "Merci", pronunciation: "Mär-si" },
      { german: "Bitte", local: "S'il vous plaît", pronunciation: "Sil wu pläh" },
      { german: "Ja / Nein", local: "Oui / Non", pronunciation: "Wi / Non" },
      { german: "Entschuldigung", local: "Excusez-moi", pronunciation: "Ex-küseh-mwa" },
      { german: "Wie viel kostet das?", local: "Combien ça coûte?", pronunciation: "Kom-bjän sa kut" },
      { german: "Wo ist...?", local: "Où est...?", pronunciation: "U ä" },
      { german: "Ich verstehe nicht", local: "Je ne comprends pas", pronunciation: "Schö nö kom-pron pa" },
    ],
  },
  es: {
    language: "Spanisch",
    phrases: [
      { german: "Hallo", local: "Hola", pronunciation: "Oh-la" },
      { german: "Danke", local: "Gracias", pronunciation: "Gra-sjas" },
      { german: "Bitte", local: "Por favor", pronunciation: "Por fa-wor" },
      { german: "Ja / Nein", local: "Sí / No", pronunciation: "Si / No" },
      { german: "Entschuldigung", local: "Perdón", pronunciation: "Pär-don" },
      { german: "Wie viel kostet das?", local: "¿Cuánto cuesta?", pronunciation: "Kwan-to kwes-ta" },
      { german: "Wo ist...?", local: "¿Dónde está...?", pronunciation: "Don-dä äs-ta" },
      { german: "Ich verstehe nicht", local: "No entiendo", pronunciation: "No än-tjän-do" },
    ],
  },
  it: {
    language: "Italienisch",
    phrases: [
      { german: "Hallo", local: "Ciao / Buongiorno", pronunciation: "Tschau / Buon-dschor-no" },
      { german: "Danke", local: "Grazie", pronunciation: "Gra-tsjä" },
      { german: "Bitte", local: "Per favore", pronunciation: "Pär fa-wo-rä" },
      { german: "Ja / Nein", local: "Sì / No", pronunciation: "Si / No" },
      { german: "Entschuldigung", local: "Scusi", pronunciation: "Sku-si" },
      { german: "Wie viel kostet das?", local: "Quanto costa?", pronunciation: "Kwan-to kos-ta" },
      { german: "Wo ist...?", local: "Dov'è...?", pronunciation: "Do-wä" },
      { german: "Ich verstehe nicht", local: "Non capisco", pronunciation: "Non ka-pis-ko" },
    ],
  },
  jp: {
    language: "Japanisch",
    phrases: [
      { german: "Hallo", local: "こんにちは (Konnichiwa)", pronunciation: "Kon-ni-tschi-wa" },
      { german: "Danke", local: "ありがとう (Arigatō)", pronunciation: "A-ri-ga-toh" },
      { german: "Bitte", local: "お願いします (Onegaishimasu)", pronunciation: "O-ne-gai-schi-mas" },
      { german: "Ja / Nein", local: "はい / いいえ (Hai / Iie)", pronunciation: "Hai / I-i-ä" },
      { german: "Entschuldigung", local: "すみません (Sumimasen)", pronunciation: "Su-mi-ma-sän" },
      { german: "Wie viel kostet das?", local: "いくらですか (Ikura desu ka)", pronunciation: "I-ku-ra des-ka" },
      { german: "Wo ist...?", local: "どこですか (Doko desu ka)", pronunciation: "Do-ko des-ka" },
      { german: "Ich verstehe nicht", local: "分かりません (Wakarimasen)", pronunciation: "Wa-ka-ri-ma-sän" },
    ],
  },
  th: {
    language: "Thailändisch",
    phrases: [
      { german: "Hallo", local: "สวัสดี (Sawatdi)", pronunciation: "Sa-wat-di" },
      { german: "Danke", local: "ขอบคุณ (Khop khun)", pronunciation: "Kob-kun" },
      { german: "Ja / Nein", local: "ใช่ / ไม่ (Chai / Mai)", pronunciation: "Tschai / Mai" },
      { german: "Wie viel kostet das?", local: "ราคาเท่าไหร่ (Raka taorai)", pronunciation: "Ra-ka tau-rai" },
      { german: "Köstlich", local: "อร่อย (Aroi)", pronunciation: "A-roi" },
    ],
  },
  pt: {
    language: "Portugiesisch",
    phrases: [
      { german: "Hallo", local: "Olá", pronunciation: "O-la" },
      { german: "Danke", local: "Obrigado/a", pronunciation: "O-bri-ga-do" },
      { german: "Bitte", local: "Por favor", pronunciation: "Por fa-wor" },
      { german: "Ja / Nein", local: "Sim / Não", pronunciation: "Sim / Naun" },
      { german: "Entschuldigung", local: "Desculpe", pronunciation: "Däs-kul-pä" },
    ],
  },
  default: {
    language: "Englisch",
    phrases: [
      { german: "Hallo", local: "Hello", pronunciation: "He-lou" },
      { german: "Danke", local: "Thank you", pronunciation: "Sänk ju" },
      { german: "Bitte", local: "Please", pronunciation: "Plis" },
      { german: "Ja / Nein", local: "Yes / No", pronunciation: "Jäs / Nou" },
      { german: "Entschuldigung", local: "Excuse me", pronunciation: "Äks-kjus mi" },
      { german: "Wie viel kostet das?", local: "How much is this?", pronunciation: "Hau matsch is sis" },
      { german: "Wo ist...?", local: "Where is...?", pronunciation: "Wär is" },
      { german: "Ich verstehe nicht", local: "I don't understand", pronunciation: "Ai dont andärständ" },
    ],
  },
}

export function PhraseBook({ countryId }: PhraseBookProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const phraseData = PHRASES[countryId] || PHRASES.default

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang =
        countryId === "fr"
          ? "fr-FR"
          : countryId === "es"
            ? "es-ES"
            : countryId === "it"
              ? "it-IT"
              : countryId === "jp"
                ? "ja-JP"
                : countryId === "pt"
                  ? "pt-PT"
                  : "en-US"
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-purple-500" />
        Sprachführer ({phraseData.language})
      </h4>

      <div className="space-y-2">
        {phraseData.phrases.map((phrase, idx) => (
          <div key={idx} className="bg-secondary/50 rounded-lg p-2.5 flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{phrase.german}</p>
              <p className="font-medium text-sm">{phrase.local}</p>
              {phrase.pronunciation && <p className="text-xs text-primary/70 italic">[{phrase.pronunciation}]</p>}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => handleSpeak(phrase.local)}
                className="p-1.5 rounded-lg bg-background/50 hover:bg-background transition-colors"
                title="Vorlesen"
              >
                <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button
                onClick={() => handleCopy(phrase.local, idx)}
                className="p-1.5 rounded-lg bg-background/50 hover:bg-background transition-colors"
                title="Kopieren"
              >
                {copiedIndex === idx ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
