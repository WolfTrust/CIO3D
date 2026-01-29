#!/bin/bash
# Script zum Kopieren der CesiumJS Assets

cd "$(dirname "$0")"

echo "Kopiere CesiumJS Assets..."

# Prüfe ob node_modules/cesium existiert
if [ ! -d "node_modules/cesium" ]; then
  echo "Fehler: CesiumJS ist nicht installiert. Bitte führen Sie 'pnpm install' aus."
  exit 1
fi

# Erstelle public/cesium Verzeichnis falls es nicht existiert
mkdir -p public/cesium

# Kopiere Cesium Assets
if [ -d "node_modules/cesium/Build/Cesium" ]; then
  echo "Kopiere Cesium Build-Dateien..."
  cp -r node_modules/cesium/Build/Cesium/* public/cesium/
  echo "✓ CesiumJS Assets erfolgreich kopiert!"
else
  echo "Fehler: Cesium Build-Verzeichnis nicht gefunden."
  exit 1
fi

echo "Fertig! Die CesiumJS Assets sind jetzt in public/cesium verfügbar."
