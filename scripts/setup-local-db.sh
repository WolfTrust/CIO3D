#!/usr/bin/env bash
# Lokale PostgreSQL-DB einrichten: PATH setzen, DB anlegen (falls nötig), Schema + Seed ausführen.
set -e
cd "$(dirname "$0")/.."
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
createdb ciodb 2>/dev/null || true
pnpm db:push
pnpm db:seed
echo "Lokale DB bereit: ciodb (Events, Members, Beziehungen)."
