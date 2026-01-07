"use client"

import { useState } from "react"
import { UtensilsCrossed, ChefHat, Star } from "lucide-react"
import { countries } from "@/lib/countries-data"

interface LocalCuisineProps {
  countryId: string
}

const cuisineData: Record<
  string,
  { dishes: { name: string; description: string; type: string }[]; specialties: string[] }
> = {
  de: {
    dishes: [
      { name: "Schnitzel", description: "Paniertes Kalbfleisch, knusprig gebraten", type: "Hauptgericht" },
      { name: "Bratwurst", description: "Gegrillte Wurst mit Sauerkraut", type: "Hauptgericht" },
      { name: "Brezel", description: "Salziges Laugengebäck", type: "Snack" },
      { name: "Schwarzwälder Kirschtorte", description: "Schokoladentorte mit Kirschen", type: "Dessert" },
    ],
    specialties: ["Bier", "Riesling", "Lebkuchen"],
  },
  fr: {
    dishes: [
      { name: "Croissant", description: "Buttrige Blätterteigtasche", type: "Frühstück" },
      { name: "Coq au Vin", description: "Huhn in Rotweinsauce", type: "Hauptgericht" },
      { name: "Crème Brûlée", description: "Karamellisierte Vanillecreme", type: "Dessert" },
      { name: "Bouillabaisse", description: "Provenzalische Fischsuppe", type: "Suppe" },
    ],
    specialties: ["Champagner", "Käse", "Baguette"],
  },
  it: {
    dishes: [
      { name: "Pizza Margherita", description: "Tomate, Mozzarella, Basilikum", type: "Hauptgericht" },
      { name: "Pasta Carbonara", description: "Spaghetti mit Ei, Pecorino, Guanciale", type: "Hauptgericht" },
      { name: "Tiramisu", description: "Kaffee-Mascarpone-Dessert", type: "Dessert" },
      { name: "Risotto", description: "Cremiger Reis mit Parmesan", type: "Hauptgericht" },
    ],
    specialties: ["Espresso", "Gelato", "Prosciutto"],
  },
  es: {
    dishes: [
      { name: "Paella", description: "Safranreis mit Meeresfrüchten", type: "Hauptgericht" },
      { name: "Tapas", description: "Kleine Appetithäppchen", type: "Vorspeise" },
      { name: "Churros", description: "Frittiertes Spritzgebäck mit Schokolade", type: "Dessert" },
      { name: "Gazpacho", description: "Kalte Tomatensuppe", type: "Suppe" },
    ],
    specialties: ["Sangria", "Jamón Ibérico", "Manchego"],
  },
  jp: {
    dishes: [
      { name: "Sushi", description: "Roher Fisch auf Reis", type: "Hauptgericht" },
      { name: "Ramen", description: "Nudelsuppe mit Fleisch und Ei", type: "Suppe" },
      { name: "Tempura", description: "Frittiertes Gemüse und Meeresfrüchte", type: "Vorspeise" },
      { name: "Mochi", description: "Süßer Reiskuchen", type: "Dessert" },
    ],
    specialties: ["Sake", "Matcha", "Wagyu"],
  },
  th: {
    dishes: [
      { name: "Pad Thai", description: "Gebratene Reisnudeln", type: "Hauptgericht" },
      { name: "Tom Yum", description: "Scharfe Garnelensuppe", type: "Suppe" },
      { name: "Green Curry", description: "Grünes Curry mit Kokosmilch", type: "Hauptgericht" },
      { name: "Mango Sticky Rice", description: "Klebreis mit Mango", type: "Dessert" },
    ],
    specialties: ["Thai-Eistee", "Kokoswasser", "Chili"],
  },
  us: {
    dishes: [
      { name: "Burger", description: "Rindfleisch-Patty im Brötchen", type: "Hauptgericht" },
      { name: "BBQ Ribs", description: "Gegrillte Rippchen", type: "Hauptgericht" },
      { name: "Apple Pie", description: "Amerikanischer Apfelkuchen", type: "Dessert" },
      { name: "Mac and Cheese", description: "Nudeln mit Käsesauce", type: "Beilage" },
    ],
    specialties: ["Root Beer", "Peanut Butter", "Pancakes"],
  },
  mx: {
    dishes: [
      { name: "Tacos", description: "Gefüllte Maistortillas", type: "Hauptgericht" },
      { name: "Guacamole", description: "Avocado-Dip", type: "Vorspeise" },
      { name: "Enchiladas", description: "Überbackene Tortillas", type: "Hauptgericht" },
      { name: "Churros", description: "Zimtzucker-Spritzgebäck", type: "Dessert" },
    ],
    specialties: ["Tequila", "Mezcal", "Horchata"],
  },
  in: {
    dishes: [
      { name: "Curry", description: "Würziges Schmorgericht", type: "Hauptgericht" },
      { name: "Naan", description: "Fladenbrot aus dem Tandoor", type: "Beilage" },
      { name: "Biryani", description: "Gewürzreis mit Fleisch", type: "Hauptgericht" },
      { name: "Samosa", description: "Gefüllte Teigtaschen", type: "Snack" },
    ],
    specialties: ["Chai", "Lassi", "Mango-Chutney"],
  },
  gr: {
    dishes: [
      { name: "Gyros", description: "Gegrilltes Fleisch im Fladenbrot", type: "Hauptgericht" },
      { name: "Moussaka", description: "Auberginen-Auflauf", type: "Hauptgericht" },
      { name: "Tzatziki", description: "Joghurt-Gurken-Dip", type: "Vorspeise" },
      { name: "Baklava", description: "Honig-Nuss-Gebäck", type: "Dessert" },
    ],
    specialties: ["Ouzo", "Feta", "Olivenöl"],
  },
}

// Default für Länder ohne spezifische Daten
const defaultCuisine = {
  dishes: [
    { name: "Lokales Hauptgericht", description: "Traditionelles Gericht der Region", type: "Hauptgericht" },
    { name: "Streetfood", description: "Beliebter Snack von Straßenhändlern", type: "Snack" },
  ],
  specialties: ["Lokale Spezialität", "Regionales Getränk"],
}

export function LocalCuisine({ countryId }: LocalCuisineProps) {
  const country = countries.find((c) => c.id === countryId)
  const cuisine = cuisineData[countryId] || defaultCuisine
  const [activeTab, setActiveTab] = useState<"dishes" | "specialties">("dishes")

  if (!country) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <UtensilsCrossed className="w-4 h-4 text-orange-500" />
        <span>Lokale Küche</span>
      </div>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setActiveTab("dishes")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "dishes" ? "bg-primary text-primary-foreground" : "bg-secondary"
          }`}
        >
          Gerichte
        </button>
        <button
          onClick={() => setActiveTab("specialties")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "specialties" ? "bg-primary text-primary-foreground" : "bg-secondary"
          }`}
        >
          Spezialitäten
        </button>
      </div>

      {activeTab === "dishes" ? (
        <div className="space-y-2">
          {cuisine.dishes.map((dish, index) => (
            <div key={index} className="bg-secondary/50 rounded-xl p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-3.5 h-3.5 text-orange-500" />
                    <span className="font-medium text-sm">{dish.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{dish.description}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-secondary rounded-full">{dish.type}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {cuisine.specialties.map((specialty, index) => (
            <div key={index} className="flex items-center gap-1.5 px-3 py-2 bg-secondary/50 rounded-lg">
              <Star className="w-3 h-3 text-amber-500" />
              <span className="text-sm">{specialty}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
