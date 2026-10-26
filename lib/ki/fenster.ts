"use client";

import { useSyncExternalStore } from "react";

/*
 * Das schwebende Interview-Fenster: zu, offen oder unten rechts angedockt.
 * Ein Zustand für die ganze Ausgabe, damit Kopf, Titelseite und Fenster
 * dasselbe sehen. Zu Beginn liegt es angedockt unten rechts.
 */

export type Fenster = "zu" | "offen" | "angedockt";

let zustand: Fenster = "angedockt";
const hoerer = new Set<() => void>();

export function setzeFenster(neu: Fenster) {
  if (neu === zustand) return;
  zustand = neu;
  for (const h of hoerer) h();
}

function abonnieren(h: () => void) {
  hoerer.add(h);
  return () => hoerer.delete(h);
}

export function useFenster() {
  return useSyncExternalStore(
    abonnieren,
    () => zustand,
    () => "angedockt" as const,
  );
}

/** Auf der Interview-Seite steht das Terminal schon da: dorthin springen. */
export function fokussiereInterviewSeite() {
  const feld = document.querySelector<HTMLInputElement>(
    "[data-interview-eingabe]",
  );
  feld?.focus({ preventScroll: true });
  feld?.scrollIntoView({ block: "nearest" });
  return Boolean(feld);
}

/** ⌘K und der Knopf im Kopf: öffnen, oder schließen, wenn es schon offen ist. */
export function interviewUmschalten(pfad: string) {
  // Dort gibt es kein Fenster; im Fit Check bleibt ⌘K darum ohne Wirkung.
  if (pfad === "/interview") fokussiereInterviewSeite();
  else setzeFenster(zustand === "offen" ? "zu" : "offen");
}

export function istMac() {
  return /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
}
