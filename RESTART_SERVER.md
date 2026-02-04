# Server Neustart - Anleitung

## Prozesse beenden und Server neu starten

### 1. Alle Node/Next.js Prozesse beenden:

**Im Terminal (macOS/Linux):**
```bash
# Finde alle laufenden Node-Prozesse
ps aux | grep -E "node|next|npm|pnpm" | grep -v grep

# Beende alle Next.js Prozesse
pkill -f "next"
pkill -f "node.*dev"
pkill -f "pnpm.*dev"

# Oder manuell beenden (falls pkill nicht funktioniert):
# Finde die Prozess-ID (PID):
lsof -ti:3000

# Beende den Prozess:
kill -9 <PID>
```

**Oder im Activity Monitor (macOS):**
- Öffne Activity Monitor
- Suche nach "node" oder "next"
- Beende alle Prozesse

### 2. Memory freigeben:

```bash
# Sync Memory
sync

# Optional: Cache leeren (falls nötig)
rm -rf .next
```

### 3. Server neu starten:

```bash
cd /Users/wolfgangfendel/Sourcen/CIO3D/CIO3D
pnpm dev
```

## Problem: "tiles loading" aber nichts passiert

**Ursache:** Zu viele gleichzeitige Tile-Requests führen zu Memory-Leak

**Fix:** 
- Tile-Cache reduziert auf 100 (statt 698)
- Preloading deaktiviert
- Debug-Logging reduziert (nur alle 100ms)

**Wenn Problem weiterhin besteht:**
1. Browser-Cache leeren (Cmd+Shift+R)
2. Browser-Tab schließen und neu öffnen
3. Safe Mode aktivieren (in globe-map-cesium.tsx: `SAFE_MODE = true`)
