import roh from "@/content/daten.json";

/** Ein Kalendertag: Datum, Millionen Tokens, Commits. */
type Kalendertag = [datum: string, tokensMio: number, commits: number];

type Daten = {
  stand: string;
  summen: {
    tokensMrd: number;
    ausgabeMio: number;
    aktiveTage: number;
    commits: number;
    modelle: number;
  };
  kalender: Kalendertag[];
  /** Tokens je Tag in Mio.: Codex, Claude. */
  anbieterTag: [datum: string, openai: number, anthropic: number][];
  monate: {
    monat: string;
    openai: number;
    anthropic: number;
  }[];
  chronik: [name: string, datum: string][];
  /** Hauptmodell je Anbieter nach Volumen der letzten 30 Tage. */
  aktuell: { openai: string; anthropic: string };
  wispr: {
    von: string;
    bis: string;
    diktate: number;
    worte: number;
    minuten: number;
    wpm: number;
    medianWorte: number;
    laengstesDiktat: number;
    anteilInClaude: number;
    wochenlimitErreicht: number | null;
  };
  quellen: {
    codexAb: string;
    claudeAb: string;
    claudeTokensJeCommit: number | null;
    claudeCommitsMonat: Record<string, number>;
  };
};

export const daten = roh as unknown as Daten;

export function zahl(n: number, nachkomma = 0) {
  return n.toLocaleString("de-DE", {
    minimumFractionDigits: nachkomma,
    maximumFractionDigits: nachkomma,
  });
}

const monate = [
  "Jan.",
  "Feb.",
  "März",
  "Apr.",
  "Mai",
  "Juni",
  "Juli",
  "Aug.",
  "Sep.",
  "Okt.",
  "Nov.",
  "Dez.",
];

/** „2026-10-05“ → „5. Okt. 2026“ */
export function datumKurz(iso: string, mitJahr = true) {
  const [j, m, t] = iso.split("-").map(Number);
  return `${t}. ${monate[m - 1]}${mitJahr ? ` ${j}` : ""}`;
}

/** „2026-10“ → „Okt.“ */
export function monatKurz(iso: string) {
  return monate[Number(iso.slice(5, 7)) - 1];
}

/** Anbieter eines Modells aus seinem Anzeigenamen. */
export function anbieter(name: string): "anthropic" | "openai" {
  return name.startsWith("Claude") ? "anthropic" : "openai";
}
