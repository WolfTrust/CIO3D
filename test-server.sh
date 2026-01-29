#!/bin/bash
# Test-Script zum Starten des Servers und Anzeigen der Ausgabe

cd "$(dirname "$0")"

echo "=========================================="
echo "Starte Next.js Development Server"
echo "=========================================="
echo ""

# Lösche Build-Cache
echo "Lösche Build-Cache..."
rm -rf .next
echo "✓ Cache gelöscht"
echo ""

# Prüfe ob node_modules existiert
if [ ! -d "node_modules" ]; then
  echo "⚠️  node_modules nicht gefunden. Installiere Dependencies..."
  pnpm install
fi

echo "Starte Server..."
echo "Bitte warten Sie, bis 'Ready' angezeigt wird..."
echo ""

# Starte Server und zeige Ausgabe
pnpm dev
