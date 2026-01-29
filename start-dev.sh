#!/bin/bash
# Einfaches Start-Script für den Development Server

cd "$(dirname "$0")"

echo "=========================================="
echo "CIO-Venture Development Server"
echo "=========================================="
echo ""

# Prüfe ob wir im richtigen Verzeichnis sind
if [ ! -f "package.json" ]; then
  echo "❌ Fehler: package.json nicht gefunden!"
  echo "Bitte führen Sie dieses Script im wanderlust-Verzeichnis aus."
  exit 1
fi

# Prüfe ob node_modules existiert
if [ ! -d "node_modules" ]; then
  echo "⚠️  node_modules nicht gefunden. Installiere Dependencies..."
  pnpm install
  echo ""
fi

# Lösche Build-Cache
echo "🧹 Lösche Build-Cache..."
rm -rf .next
echo "✓ Fertig"
echo ""

# Prüfe Port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
  echo "⚠️  Port 3000 ist bereits belegt!"
  echo "Bitte beenden Sie den anderen Prozess oder verwenden Sie einen anderen Port."
  echo ""
  echo "Belegte Prozesse:"
  lsof -i :3000
  echo ""
  read -p "Möchten Sie den Prozess beenden? (j/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Jj]$ ]]; then
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    echo "✓ Prozess beendet"
    echo ""
  else
    echo "Bitte beenden Sie den Prozess manuell oder verwenden Sie PORT=3001 pnpm dev"
    exit 1
  fi
fi

echo "🚀 Starte Next.js Development Server..."
echo "📡 Server wird auf http://localhost:3000 verfügbar sein"
echo ""
echo "Drücken Sie Ctrl+C zum Beenden"
echo "=========================================="
echo ""

# Starte Server
pnpm dev
