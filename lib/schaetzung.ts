import { daten } from "@/lib/daten";

/**
 * Hochrechnung für die Monate, in denen Protokolle fehlen.
 *
 * Gemessen sind Codex ab 22. Oktober 2025 und Claude Code ab Juli 2026
 * (Claude Code löscht seine Protokolle nach 30 Tagen); Sitzungen weiterer
 * Accounts fehlen. Für die Monate bis Juni 2026 gilt daher:
 *  - Gesamtvolumen je Monat als Annahme (`volumen`, Mio. Tokens),
 *  - Anteile nach meiner Einschätzung der Modelle im jeweiligen Monat:
 *    `claude` und `cursor` als Anteil am Gesamtvolumen, Codex der Rest.
 *    Bis Herbst 2025 lief bei Claude vor allem Sonnet, dazu viel Cursor
 *    mit dem Composer-Modell; für Cursor gibt es keine Protokolle.
 *  - gemessene Codex-Werte sind Untergrenze, Claude mindestens so viel,
 *    wie die Commits mit Claude als Co-Autor belegen.
 * Ab Juli 2026 gelten nur die gemessenen Werte.
 */
const STIMMUNG: Record<
  string,
  { claude: number; cursor?: number; volumen?: number; lage: string }
> = {
  "2025-09": {
    claude: 0.25,
    cursor: 0.25,
    volumen: 340,
    lage: "Mit GPT-5 Codex war Codex für mich klar vorn.",
  },
  "2025-10": {
    claude: 0.22,
    cursor: 0.2,
    volumen: 480,
    lage: "Codex war mein Werkzeug der Stunde; Sonnet 4.5 und Cursor Composer kamen kaum dagegen an.",
  },
  "2025-11": {
    claude: 0.25,
    cursor: 0.17,
    volumen: 680,
    lage: "GPT-5.1 Codex und Codex Max haben mich überzeugt, Opus 4.5 kam erst Ende des Monats.",
  },
  "2025-12": {
    claude: 0.57,
    cursor: 0.05,
    volumen: 880,
    lage: "Opus 4.5 hat für mich alles gedreht, über die Feiertage bin ich zu Claude Code gewechselt.",
  },
  "2026-01": {
    claude: 0.7,
    volumen: 760,
    lage: "Ich bin bei Claude Code geblieben, Codex lief nur nebenher.",
  },
  "2026-02": {
    claude: 0.4,
    volumen: 620,
    lage: "GPT-5.3 Codex hat mich begeistert, Claude hielt knapp dagegen.",
  },
  "2026-03": {
    claude: 0.6,
    volumen: 950,
    lage: "GPT-5.4 und Opus fand ich gleichauf, ich habe beides genutzt.",
  },
  "2026-04": {
    claude: 0.08,
    volumen: 1050,
    lage: "GPT-5.5 war für mich deutlich besser, fast alles lief über Codex.",
  },
  "2026-05": {
    claude: 0.6,
    volumen: 1550,
    lage: "Opus 4.7 und 4.8 haben mich bei schweren Aufgaben zurückgeholt.",
  },
  "2026-06": {
    claude: 0.4,
    volumen: 650,
    lage: "Fable 5 war zurückgezogen, also bin ich auf Codex ausgewichen.",
  },
  "2026-07": {
    claude: 0.6,
    lage: "Fable 5 kam zurück, dazu GPT-5.6 Sol: In den Wochen nach dem Start lief bei mir alles über Codex.",
  },
  "2026-08": {
    claude: 0.83,
    lage: "Mit Opus 5 bin ich zu Claude Code gewechselt.",
  },
  "2026-09": {
    claude: 0.65,
    lage: "GPT-6 Sol und Opus 5.5 kamen am selben Tag, ich habe beide im Wechsel genutzt.",
  },
  "2026-10": {
    claude: 0.95,
    lage: "Opus 5.5 ist mein Hauptmodell, ich arbeite fast nur noch mit Claude Code.",
  },
};

export type Monat = {
  monat: string;
  claude: number;
  /** Cursor mit dem Composer-Modell, nur hochgerechnet. */
  cursor: number;
  codex: number;
  claudeGeschaetzt: boolean;
  codexGeschaetzt: boolean;
  lage: string;
};

const START = "2025-09";

export function monateMitSchaetzung(): Monat[] {
  const gemessen = new Map(daten.monate.map((m) => [m.monat, m]));
  const claudeAb = daten.quellen.claudeAb.slice(0, 7);
  const jeCommit = daten.quellen.claudeTokensJeCommit ?? 0;

  const liste: string[] = [];
  for (let d = new Date(`${START}-01T00:00:00Z`); ; ) {
    const iso = d.toISOString().slice(0, 7);
    if (iso > daten.stand.slice(0, 7)) break;
    liste.push(iso);
    d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
  }

  const roh = liste.map((monat): Monat => {
    const m = gemessen.get(monat);
    const st = STIMMUNG[monat] ?? { claude: 0.5, lage: "" };
    if (m && monat >= claudeAb) {
      return {
        monat,
        cursor: 0,
        claude: m.anthropic,
        codex: m.openai,
        claudeGeschaetzt: false,
        codexGeschaetzt: false,
        lage: st.lage,
      };
    }
    const volumen = st.volumen ?? (m ? m.openai / (1 - st.claude) : 0);
    const ausCommits =
      (daten.quellen.claudeCommitsMonat[monat] ?? 0) * jeCommit;
    const cursor = st.cursor ?? 0;
    const codexHoch = volumen * (1 - st.claude - cursor);
    return {
      monat,
      cursor: Math.round(volumen * cursor),
      claude: Math.round(Math.max(volumen * st.claude, ausCommits)),
      codex: Math.round(Math.max(m?.openai ?? 0, codexHoch)),
      claudeGeschaetzt: true,
      codexGeschaetzt: !m || codexHoch > m.openai,
      lage: st.lage,
    };
  });
  return roh;
}

/** Woche mit dem höchsten Codex-Anteil im Monat, aus den Tageswerten. */
export function codexSpitzenwoche(monat: string) {
  const wochen = new Map<string, [number, number]>();
  for (const [tag, codex, claude] of daten.anbieterTag) {
    if (!tag.startsWith(monat)) continue;
    const d = new Date(`${tag}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    const k = d.toISOString().slice(0, 10);
    const w = wochen.get(k) ?? [0, 0];
    wochen.set(k, [w[0] + codex, w[1] + claude]);
  }
  let beste: { ab: string; anteil: number } | null = null;
  for (const [ab, [codex, claude]] of wochen) {
    if (codex + claude < 20) continue;
    const anteil = codex / (codex + claude);
    if (!beste || anteil > beste.anteil) beste = { ab, anteil };
  }
  return beste;
}

export type KalenderTag = [
  datum: string,
  tokensMio: number,
  commits: number,
  /** Anteil der Tokens, der aus der Hochrechnung stammt (Mio.). */
  hochgerechnet: number,
];

/** Fester Pseudo-Zufall je Datum, damit die Verteilung bei jedem Aufruf gleich bleibt. */
function zufall(iso: string) {
  let h = 2166136261;
  for (const z of iso) h = Math.imul(h ^ z.charCodeAt(0), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

/**
 * Arbeitskalender passend zum Modell-Index: gemessene Tageswerte, dazu je
 * Monat die Differenz zur Hochrechnung, verteilt auf Arbeitstage. Tage mit
 * Commits wiegen schwerer, Wochenenden leichter, einzelne Tage bleiben frei.
 */
export function kalenderMitHochrechnung(): KalenderTag[] {
  const gemessen = new Map(daten.kalender.map((t) => [t[0], t]));
  const tage: KalenderTag[] = [];
  for (let d = new Date(`${START}-01T00:00:00Z`); ; ) {
    const iso = d.toISOString().slice(0, 10);
    if (iso > daten.stand) break;
    const t = gemessen.get(iso);
    tage.push([iso, t?.[1] ?? 0, t?.[2] ?? 0, 0]);
    d = new Date(d.getTime() + 86400000);
  }

  for (const m of monateMitSchaetzung()) {
    const imMonat = tage.filter((t) => t[0].startsWith(m.monat));
    const ziel = m.claude + m.cursor + m.codex;
    const fehlt = ziel - imMonat.reduce((a, t) => a + t[1], 0);
    if (fehlt <= 1) continue;
    const gewicht = imMonat.map((t) => {
      const wochentag = new Date(`${t[0]}T00:00:00Z`).getUTCDay();
      const wochenende = wochentag === 0 || wochentag === 6;
      const z = zufall(t[0]);
      if (!t[2] && z < (wochenende ? 0.55 : 0.18)) return 0;
      return (wochenende ? 0.4 : 1) * (0.4 + z * 1.6) + t[2] * 0.6;
    });
    const summe = gewicht.reduce((a, g) => a + g, 0) || 1;
    imMonat.forEach((t, i) => {
      const extra = Math.round(((fehlt * gewicht[i]) / summe) * 10) / 10;
      t[1] = Math.round((t[1] + extra) * 10) / 10;
      t[3] = extra;
    });
  }
  return tage;
}
