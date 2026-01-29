#!/bin/bash
cd "$(dirname "$0")"
export NODE_TLS_REJECT_UNAUTHORIZED=0
echo "Starte Next.js Server auf localhost:3000..."
echo "Öffne http://localhost:3000 in Safari"
pnpm dev
