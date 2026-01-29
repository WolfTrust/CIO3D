#!/bin/bash
# Script zum Neustarten des Servers mit vollständiger Ausgabe

cd "$(dirname "$0")"

echo "=========================================="
echo "CIO-Venture Server Neustart"
echo "=========================================="
echo ""

# Beende alle laufenden Server-Prozesse
echo "🛑 Beende laufende Server-Prozesse..."
pkill -f "next dev" 2>/dev/null
pkill -f "node.*next" 2>/dev/null
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null
sleep 2
echo "✓ Fertig"
echo ""

# Lösche Build-Cache
echo "🧹 Lösche Build-Cache..."
rm -rf .next
echo "✓ Fertig"
echo ""

# Prüfe Dependencies
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/next" ]; then
  echo "⚠️  Dependencies nicht vollständig installiert. Installiere Dependencies..."
  pnpm install --no-frozen-lockfile
  echo ""
  
  # Prüfe ob Next.js jetzt verfügbar ist
  if [ ! -f "node_modules/.bin/next" ]; then
    echo "❌ Fehler: Next.js konnte nicht installiert werden!"
    echo "Bitte führen Sie manuell aus: pnpm install --no-frozen-lockfile"
    exit 1
  fi
  echo "✓ Dependencies installiert"
  echo ""
fi

echo "🚀 Starte Next.js Development Server..."
echo "📡 Server wird auf http://localhost:3000 verfügbar sein"
echo ""
echo "Drücken Sie Ctrl+C zum Beenden"
echo "=========================================="
echo ""

# Starte Server im Vordergrund (damit Sie die Ausgabe sehen)
pnpm dev
