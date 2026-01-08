// Bekannte Städte mit Koordinaten für Auto-Vervollständigung
export interface CityData {
  name: string
  country: string
  coordinates: [number, number] // [lat, lng]
}

export const knownCities: CityData[] = [
  // Deutschland
  { name: "Berlin", country: "de", coordinates: [52.52, 13.405] },
  { name: "München", country: "de", coordinates: [48.1351, 11.582] },
  { name: "Hamburg", country: "de", coordinates: [53.5511, 9.9937] },
  { name: "Frankfurt", country: "de", coordinates: [50.1109, 8.6821] },
  { name: "Köln", country: "de", coordinates: [50.9375, 6.9603] },
  { name: "Stuttgart", country: "de", coordinates: [48.7758, 9.1829] },
  { name: "Düsseldorf", country: "de", coordinates: [51.2277, 6.7735] },
  { name: "Leipzig", country: "de", coordinates: [51.3397, 12.3731] },
  { name: "Dresden", country: "de", coordinates: [51.0504, 13.7373] },
  { name: "Nürnberg", country: "de", coordinates: [49.4521, 11.0767] },

  // Frankreich
  { name: "Paris", country: "fr", coordinates: [48.8566, 2.3522] },
  { name: "Marseille", country: "fr", coordinates: [43.2965, 5.3698] },
  { name: "Lyon", country: "fr", coordinates: [45.764, 4.8357] },
  { name: "Nizza", country: "fr", coordinates: [43.7102, 7.262] },
  { name: "Bordeaux", country: "fr", coordinates: [44.8378, -0.5792] },
  { name: "Straßburg", country: "fr", coordinates: [48.5734, 7.7521] },

  // Italien
  { name: "Rom", country: "it", coordinates: [41.9028, 12.4964] },
  { name: "Mailand", country: "it", coordinates: [45.4642, 9.19] },
  { name: "Venedig", country: "it", coordinates: [45.4408, 12.3155] },
  { name: "Florenz", country: "it", coordinates: [43.7696, 11.2558] },
  { name: "Neapel", country: "it", coordinates: [40.8518, 14.2681] },
  { name: "Turin", country: "it", coordinates: [45.0703, 7.6869] },

  // Spanien
  { name: "Madrid", country: "es", coordinates: [40.4168, -3.7038] },
  { name: "Barcelona", country: "es", coordinates: [41.3851, 2.1734] },
  { name: "Valencia", country: "es", coordinates: [39.4699, -0.3763] },
  { name: "Sevilla", country: "es", coordinates: [37.3891, -5.9845] },
  { name: "Málaga", country: "es", coordinates: [36.7213, -4.4217] },
  { name: "Palma de Mallorca", country: "es", coordinates: [39.5696, 2.6502] },

  // UK
  { name: "London", country: "gb", coordinates: [51.5074, -0.1278] },
  { name: "Manchester", country: "gb", coordinates: [53.4808, -2.2426] },
  { name: "Birmingham", country: "gb", coordinates: [52.4862, -1.8904] },
  { name: "Edinburgh", country: "gb", coordinates: [55.9533, -3.1883] },
  { name: "Glasgow", country: "gb", coordinates: [55.8642, -4.2518] },
  { name: "Liverpool", country: "gb", coordinates: [53.4084, -2.9916] },

  // USA
  { name: "New York", country: "us", coordinates: [40.7128, -74.006] },
  { name: "Los Angeles", country: "us", coordinates: [34.0522, -118.2437] },
  { name: "Chicago", country: "us", coordinates: [41.8781, -87.6298] },
  { name: "Miami", country: "us", coordinates: [25.7617, -80.1918] },
  { name: "San Francisco", country: "us", coordinates: [37.7749, -122.4194] },
  { name: "Las Vegas", country: "us", coordinates: [36.1699, -115.1398] },
  { name: "Washington D.C.", country: "us", coordinates: [38.9072, -77.0369] },
  { name: "Boston", country: "us", coordinates: [42.3601, -71.0589] },
  { name: "Seattle", country: "us", coordinates: [47.6062, -122.3321] },
  { name: "Hawaii - Honolulu", country: "us", coordinates: [21.3069, -157.8583] },

  // Asien
  { name: "Tokio", country: "jp", coordinates: [35.6762, 139.6503] },
  { name: "Kyoto", country: "jp", coordinates: [35.0116, 135.7681] },
  { name: "Osaka", country: "jp", coordinates: [34.6937, 135.5023] },
  { name: "Bangkok", country: "th", coordinates: [13.7563, 100.5018] },
  { name: "Phuket", country: "th", coordinates: [7.8804, 98.3923] },
  { name: "Singapur", country: "sg", coordinates: [1.3521, 103.8198] },
  { name: "Hongkong", country: "hk", coordinates: [22.3193, 114.1694] },
  { name: "Shanghai", country: "cn", coordinates: [31.2304, 121.4737] },
  { name: "Peking", country: "cn", coordinates: [39.9042, 116.4074] },
  { name: "Seoul", country: "kr", coordinates: [37.5665, 126.978] },
  { name: "Dubai", country: "ae", coordinates: [25.2048, 55.2708] },
  { name: "Abu Dhabi", country: "ae", coordinates: [24.4539, 54.3773] },
  { name: "Mumbai", country: "in", coordinates: [19.076, 72.8777] },
  { name: "Delhi", country: "in", coordinates: [28.6139, 77.209] },
  { name: "Bali - Denpasar", country: "id", coordinates: [-8.4095, 115.1889] },

  // Australien & Ozeanien
  { name: "Sydney", country: "au", coordinates: [-33.8688, 151.2093] },
  { name: "Melbourne", country: "au", coordinates: [-37.8136, 144.9631] },
  { name: "Brisbane", country: "au", coordinates: [-27.4698, 153.0251] },
  { name: "Auckland", country: "nz", coordinates: [-36.8509, 174.7645] },

  // Südamerika
  { name: "Rio de Janeiro", country: "br", coordinates: [-22.9068, -43.1729] },
  { name: "São Paulo", country: "br", coordinates: [-23.5505, -46.6333] },
  { name: "Buenos Aires", country: "ar", coordinates: [-34.6037, -58.3816] },
  { name: "Lima", country: "pe", coordinates: [-12.0464, -77.0428] },
  { name: "Bogotá", country: "co", coordinates: [4.711, -74.0721] },
  { name: "Santiago", country: "cl", coordinates: [-33.4489, -70.6693] },

  // Afrika
  { name: "Kapstadt", country: "za", coordinates: [-33.9249, 18.4241] },
  { name: "Johannesburg", country: "za", coordinates: [-26.2041, 28.0473] },
  { name: "Kairo", country: "eg", coordinates: [30.0444, 31.2357] },
  { name: "Marrakesch", country: "ma", coordinates: [31.6295, -7.9811] },
  { name: "Nairobi", country: "ke", coordinates: [-1.2921, 36.8219] },

  // Europa weitere
  { name: "Amsterdam", country: "nl", coordinates: [52.3676, 4.9041] },
  { name: "Brüssel", country: "be", coordinates: [50.8503, 4.3517] },
  { name: "Wien", country: "at", coordinates: [48.2082, 16.3738] },
  { name: "Salzburg", country: "at", coordinates: [47.8095, 13.055] },
  { name: "Zürich", country: "ch", coordinates: [47.3769, 8.5417] },
  { name: "Genf", country: "ch", coordinates: [46.2044, 6.1432] },
  { name: "Prag", country: "cz", coordinates: [50.0755, 14.4378] },
  { name: "Budapest", country: "hu", coordinates: [47.4979, 19.0402] },
  { name: "Warschau", country: "pl", coordinates: [52.2297, 21.0122] },
  { name: "Krakau", country: "pl", coordinates: [50.0647, 19.945] },
  { name: "Kopenhagen", country: "dk", coordinates: [55.6761, 12.5683] },
  { name: "Stockholm", country: "se", coordinates: [59.3293, 18.0686] },
  { name: "Oslo", country: "no", coordinates: [59.9139, 10.7522] },
  { name: "Helsinki", country: "fi", coordinates: [60.1699, 24.9384] },
  { name: "Reykjavik", country: "is", coordinates: [64.1466, -21.9426] },
  { name: "Dublin", country: "ie", coordinates: [53.3498, -6.2603] },
  { name: "Lissabon", country: "pt", coordinates: [38.7223, -9.1393] },
  { name: "Porto", country: "pt", coordinates: [41.1579, -8.6291] },
  { name: "Athen", country: "gr", coordinates: [37.9838, 23.7275] },
  { name: "Santorini", country: "gr", coordinates: [36.3932, 25.4615] },
  { name: "Istanbul", country: "tr", coordinates: [41.0082, 28.9784] },
  { name: "Dubrovnik", country: "hr", coordinates: [42.6507, 18.0944] },
  { name: "Split", country: "hr", coordinates: [43.5081, 16.4402] },
  { name: "Moskau", country: "ru", coordinates: [55.7558, 37.6173] },
  { name: "St. Petersburg", country: "ru", coordinates: [59.9311, 30.3609] },
]

export function findCityByName(name: string, countryId?: string): CityData | undefined {
  const normalizedName = name.toLowerCase().trim()
  return knownCities.find((city) => {
    const matches = city.name.toLowerCase() === normalizedName
    if (countryId) {
      return matches && city.country === countryId
    }
    return matches
  })
}

export function searchCities(query: string, countryId?: string): CityData[] {
  if (!query || query.length < 2) return []
  const normalizedQuery = query.toLowerCase().trim()
  return knownCities
    .filter((city) => {
      const nameMatches = city.name.toLowerCase().includes(normalizedQuery)
      if (countryId) {
        return nameMatches && city.country === countryId
      }
      return nameMatches
    })
    .slice(0, 8)
}
