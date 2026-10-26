"use client";

import { useSyncExternalStore } from "react";
import type { Beitrag } from "./gespraech";

/*
 * Die Ablage: vergangene Gespräche und Fit Checks, wie „Zuletzt benutzt“
 * im Finder. Sie bleibt im Arbeitsspeicher der geladenen Anwendung und
 * wird beim Neuladen verworfen.
 */

export type Eintrag = {
  id: string;
  art: "interview" | "fit-check";
  titel: string;
  /** Zuletzt geöffnet, in Millisekunden. */
  zeit: number;
  verlauf?: Beitrag[];
  stelle?: string;
  antwort?: string;
};

const ALTER_SCHLUESSEL = "der-kandidat:ablage";
const HOECHSTENS = 30;

let eintraege: Eintrag[] = [];
let initialisiert = false;
const hoerer = new Set<() => void>();
const leer: Eintrag[] = [];

export function initialisiereAblage() {
  if (initialisiert) return;
  try {
    window.localStorage.removeItem(ALTER_SCHLUESSEL);
    initialisiert = true;
  } catch {
    // Bei gesperrtem Browserspeicher werden auch keine Altdaten eingelesen.
  }
}

function melden() {
  for (const h of hoerer) h();
}

function abonnieren(h: () => void) {
  initialisiereAblage();
  hoerer.add(h);
  return () => hoerer.delete(h);
}

/** Alle Einträge, der zuletzt geöffnete zuerst. */
export function useAblage() {
  return useSyncExternalStore(
    abonnieren,
    () => eintraege,
    () => leer,
  );
}

export function neueId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Legt einen Eintrag ab oder ersetzt ihn und stellt ihn nach oben. */
export function ablegen(e: Omit<Eintrag, "zeit">) {
  initialisiereAblage();
  eintraege = [
    { ...e, zeit: Date.now() },
    ...eintraege.filter((x) => x.id !== e.id),
  ].slice(0, HOECHSTENS);
  melden();
}

/** Markiert einen Eintrag als gerade geöffnet. */
export function oeffnen(id: string) {
  const e = eintraege.find((x) => x.id === id);
  if (e) ablegen(e);
}

/** „Heute um 16:55“, „Gestern um …“ oder „18. Oktober 2026 um 09:58“. */
export function zeitpunkt(ms: number) {
  const d = new Date(ms);
  const uhr = d.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const tage = Math.round(
    (new Date().setHours(0, 0, 0, 0) - new Date(ms).setHours(0, 0, 0, 0)) /
      86_400_000,
  );
  const tag =
    ["Heute", "Gestern", "Vorgestern"][tage] ??
    d.toLocaleDateString("de-DE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  return `${tag} um ${uhr}`;
}
