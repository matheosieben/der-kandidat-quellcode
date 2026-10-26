import { loesungen, START } from "@/content/wortwahl";

export type Feld = "richtig" | "enthalten" | "falsch";

/** Bewertet einen Versuch wie das Original: doppelte Buchstaben zählen nur so oft, wie sie vorkommen. */
export function auswerten(versuch: string, loesung: string): Feld[] {
  const ergebnis: Feld[] = Array.from({ length: 5 }, () => "falsch");
  const uebrig = new Map<string, number>();
  for (let i = 0; i < 5; i++) {
    if (versuch[i] === loesung[i]) ergebnis[i] = "richtig";
    else uebrig.set(loesung[i], (uebrig.get(loesung[i]) ?? 0) + 1);
  }
  for (let i = 0; i < 5; i++) {
    if (ergebnis[i] === "richtig") continue;
    const n = uebrig.get(versuch[i]) ?? 0;
    if (n > 0) {
      ergebnis[i] = "enthalten";
      uebrig.set(versuch[i], n - 1);
    }
  }
  return ergebnis;
}

/** Heutiges Datum in Berlin als JJJJ-MM-TT. */
export function heute(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(
    new Date(),
  );
}

/** Drei Rätsel pro Tag. */
export const RUNDEN = 3;

/** Nummer der Ausgabe und Lösung eines Tages; runde zählt ab 0. */
export function tagesraetsel(datum: string, runde = 0) {
  const tage = Math.round((Date.parse(datum) - Date.parse(START)) / 86_400_000);
  const nummer = Math.max(0, tage) + 1;
  const eintrag = loesungen[((nummer - 1) * RUNDEN + runde) % loesungen.length];
  return { nummer, ...eintrag };
}
