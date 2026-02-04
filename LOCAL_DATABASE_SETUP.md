# Lokale PostgreSQL einrichten (Option 2)

PostgreSQL ist unter `/opt/homebrew/opt/postgresql@16` installiert. Damit `psql` und `createdb` im Terminal funktionieren, muss der PATH gesetzt sein.

## 1. PostgreSQL im PATH (einmalig pro Terminal oder dauerhaft)

**Pro Terminal-Session:**
```bash
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
```

**Dauerhaft in jeder neuen Shell** (in `~/.zshrc` eintragen):
```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## 2. PostgreSQL starten (falls nicht läuft)

```bash
brew services start postgresql@16
```

## 3. Datenbank anlegen (falls noch nicht vorhanden)

```bash
createdb ciodb
```

(Verwendet deinen Mac-User als PostgreSQL-User; bei Standard-Installation ohne Passwort.)

## 4. `.env.local` anpassen

In der **Projektwurzel** in `.env.local` die lokale Datenbank-URL eintragen (oder die bestehende `DATABASE_URL` für lokale Entwicklung ersetzen):

```env
DATABASE_URL="postgresql://wolfgangfendel@localhost:5432/ciodb"
```

Mit Passwort (falls du eines gesetzt hast):

```env
DATABASE_URL="postgresql://wolfgangfendel:PASSWORT@localhost:5432/ciodb"
```

## 5. Schema anwenden und Seed ausführen

Im Projektordner:

```bash
pnpm db:push
pnpm db:seed
```

Damit werden die Tabellen (Event, Member, Relationship) angelegt und Beispieldaten (Events + 80 Members + Beziehungen) eingespielt.

## 6. App starten

```bash
pnpm dev
```

Die App nutzt dann die lokale PostgreSQL-Datenbank. Render verwendet weiter seine eigene `DATABASE_URL` aus den Umgebungsvariablen.
