/**
 * Einheitliche Koordinaten-Konvention: [latitude, longitude] (lat, lng).
 * Cesium und viele APIs erwarten (longitude, latitude) – Umrechnung erfolgt an der Anzeige.
 *
 * Diese Hilfsfunktionen korrigieren vertauschte Koordinaten (z. B. aus der DB
 * als [lng, lat] gespeichert), damit Pins nicht an falschen Orten erscheinen.
 */

/** Gültiger Breitengrad: -90 … 90, Längengrad: -180 … 180 */

function isValidLat(lat: number): boolean {
  return typeof lat === "number" && lat >= -90 && lat <= 90
}

function isValidLng(lng: number): boolean {
  return typeof lng === "number" && lng >= -180 && lng <= 180
}

/**
 * Normalisiert ein Koordinatenpaar zu [latitude, longitude].
 * Wenn die Werte vertauscht sind (z. B. Tokio als [139, 35] statt [35, 139]),
 * werden sie getauscht.
 */
export function normalizeLatLng(coords: [number, number]): [number, number] {
  const [a, b] = coords
  if (isValidLat(a) && isValidLng(b)) return [a, b]
  if (isValidLat(b) && isValidLng(a)) return [b, a]
  return [a, b]
}

/**
 * Normalisiert aus der DB gelesene latitude/longitude zu [latitude, longitude].
 * Korrigiert vertauschte Spalten (z. B. latitude=139, longitude=35 für Tokio).
 */
export function normalizeLatLngFromDb(
  latitude: number | null,
  longitude: number | null
): [number, number] | undefined {
  if (latitude == null || longitude == null) return undefined
  if (isValidLat(latitude) && isValidLng(longitude)) return [latitude, longitude]
  if (isValidLat(longitude) && isValidLng(latitude)) return [longitude, latitude]
  return [latitude, longitude]
}
