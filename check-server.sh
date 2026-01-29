#!/bin/bash
# Script zum Prüfen, ob der Server läuft

echo "Prüfe Server-Status..."
echo ""

# Prüfe ob Port 3000 belegt ist
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
  echo "✓ Port 3000 ist belegt (Server läuft wahrscheinlich)"
  echo ""
  echo "Prozesse auf Port 3000:"
  lsof -i :3000
  echo ""
  
  # Teste HTTP-Verbindung
  echo "Teste HTTP-Verbindung..."
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
  
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
    echo "✓ Server antwortet mit HTTP $HTTP_CODE"
    echo ""
    echo "🌐 Öffnen Sie http://localhost:3000 in Safari"
  else
    echo "⚠️  Server antwortet mit HTTP $HTTP_CODE (erwartet: 200)"
    echo "   Der Server kompiliert möglicherweise noch..."
  fi
else
  echo "✗ Port 3000 ist nicht belegt"
  echo "   Der Server läuft nicht. Bitte starten Sie ihn mit:"
  echo "   ./restart-server.sh"
fi
