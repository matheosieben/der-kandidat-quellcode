"use client";

import { useSyncExternalStore } from "react";
import { ablegen, initialisiereAblage, neueId } from "./ablage";
import { frageRedaktion } from "./lesen";

/*
 * Ein Gespräch für die ganze Ausgabe: Titelseite und Interview-Ressort
 * zeigen denselben Verlauf, auch während eine Antwort noch läuft.
 */

export type Beitrag = { rolle: "leser" | "redaktion"; text: string };
type Zustand = {
  verlauf: Beitrag[];
  laeuft: boolean;
  stoerung: { meldung: string; offline?: boolean } | null;
};

let zustand: Zustand = { verlauf: [], laeuft: false, stoerung: null };
const hoerer = new Set<() => void>();
let abbruch: AbortController | null = null;
/** Unter dieser Nummer liegt das laufende Gespräch in der Ablage. */
let id = "";

function setze(neu: Partial<Zustand>) {
  zustand = { ...zustand, ...neu };
  for (const h of hoerer) h();
}

function abonnieren(h: () => void) {
  initialisiereAblage();
  hoerer.add(h);
  return () => hoerer.delete(h);
}

const leer: Zustand = { verlauf: [], laeuft: false, stoerung: null };

export function useGespraech() {
  return useSyncExternalStore(
    abonnieren,
    () => zustand,
    () => leer,
  );
}

export async function fragen(frage: string) {
  const text = frage.trim();
  if (!text || zustand.laeuft) return;
  abbruch?.abort();
  const steuerung = new AbortController();
  abbruch = steuerung;

  const neu: Beitrag[] = [...zustand.verlauf, { rolle: "leser", text }];
  setze({
    verlauf: [...neu, { rolle: "redaktion", text: "" }],
    laeuft: true,
    stoerung: null,
  });

  const ergebnis = await frageRedaktion(
    { modus: "interview", verlauf: neu.slice(-12) },
    (teil) => setze({ verlauf: [...neu, { rolle: "redaktion", text: teil }] }),
    steuerung.signal,
  );
  if (steuerung.signal.aborted) return;
  if (ergebnis.ok) {
    if (!id) id = neueId();
    ablegen({
      id,
      art: "interview",
      titel: zustand.verlauf[0]?.text ?? text,
      verlauf: zustand.verlauf,
    });
  } else {
    const letzte = zustand.verlauf.at(-1);
    setze({
      stoerung: ergebnis,
      // Ohne Antworttext verschwindet die unbeantwortete Frage wieder aus dem Verlauf.
      verlauf: letzte?.text ? zustand.verlauf : zustand.verlauf.slice(0, -2),
    });
  }
  setze({ laeuft: false });
}

export function neuesGespraech() {
  abbruch?.abort();
  id = "";
  setze({ verlauf: [], laeuft: false, stoerung: null });
}

/** Setzt ein abgelegtes Gespräch fort. */
export function gespraechLaden(eintragId: string, verlauf: Beitrag[]) {
  abbruch?.abort();
  id = eintragId;
  setze({ verlauf, laeuft: false, stoerung: null });
}
