#!/bin/bash
cd "$(dirname "$0")"
export NODE_TLS_REJECT_UNAUTHORIZED=0
echo "Starte Next.js Server..."
echo "Der Server wird auf http://localhost:3000 verfügbar sein"
echo "Öffne http://localhost:3000 in Safari nach dem Start"
pnpm dev
