# Der Kandidat

Eine Initiativbewerbung als Zeitung: Matheo Sieben will in die KI-Einheit der Axel Springer SE.
Gestaltet nach New York Times und Wall Street Journal, mit freien Schriften und eigener Wordmark.
Jede Zahl stammt aus den eigenen Arbeitsprotokollen; Fragen beantwortet eine KI-Redaktion.

Die Ausgabe: [kandidat.matheo-sieben.de](https://kandidat.matheo-sieben.de)

Dieses Repository zeigt den Quellcode als bereinigten Stand. Entwickelt wird in einem privaten
Repository; die Zahlen in `content/daten.json` werden dort täglich nachgezogen.

## Entwickeln

```bash
npm install
cp .env.local.beispiel .env.local   # ANTHROPIC_API_KEY eintragen
npm run dev                          # http://localhost:3000
npm run build
npm run lint                         # Biome
```

Ohne Schlüssel läuft alles außer Interview und Fit Check; beide melden das höflich.

### KI ohne Schlüssel testen

`scripts/testmodell.mjs` ahmt die Messages-API nach und protokolliert, was ankommt
(Modell, Fallback-Beta, Effort, Cache-Markierung).

```bash
node scripts/testmodell.mjs
ANTHROPIC_BASE_URL=http://127.0.0.1:3199 ANTHROPIC_API_KEY=lokal npm run dev -- --port 3001
```

### Zahlen

`scripts/daten-erzeugen.py` liest lokale Protokolle von Codex und Claude Code, die Commits
der eigenen Repositories (über `gh`) und die Diktatstatistik von Wispr Flow. Es liest nur
Zeitstempel, Modellnamen, Wortzahlen und Zähler und schreibt Aggregate nach
`content/daten.json`. `scripts/entstehung-erzeugen.py` erzeugt ebenso
`content/entstehung.json` für den Block „Wie diese Bewerbung entstand“.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `content/` | Texte der Ausgabe und die erzeugten Zahlen |
| `app/` | Titelseite, Ressorts, `api/redaktion` (Claude-Streaming) |
| `components/newspaper/` | Kopf, Ressortkopf, Fuß, Icons |
| `components/grafik/` | Token-Kalender, Nutzungsverlauf, Diktat-Rennen und weitere Grafiken |
| `components/werkstatt/` | Dock, RAG-Terminal, Tipp-Terminal, Hinweis-Cursor |
| `components/ki/` | Interview, Fit Check, Antworttext mit Fundstellen |
| `components/spiele/` | Wortwahl, Der Springer |
| `lib/ki/` | Archiv (Faktenbasis), Prompts, Frequenzbremse, Gesprächszustand |

Stack: Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4,
`@anthropic-ai/sdk` mit Claude Sonnet 5.5, Biome.

Alle Bilder der Ausgabe sind KI-generiert mit ChatGPT Image 2. Eine Bewerbung, kein Produkt
der Axel Springer SE.
