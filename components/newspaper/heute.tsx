"use client";

import { useSyncExternalStore } from "react";

const lang = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Berlin",
});

const kurzFormat = new Intl.DateTimeFormat("de-DE", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Berlin",
});

const nichts = () => () => {};

/**
 * Das Datum des Kopfes ist immer der Tag, an dem gelesen wird. Die Seite
 * wird vorab gerendert, also setzt erst der Browser das Datum ein; bis dahin
 * steht ein geschütztes Leerzeichen, damit die Zeile nicht springt.
 */
export function Heute({ kurz = false }: { kurz?: boolean }) {
  const heute = useSyncExternalStore(
    nichts,
    () => (kurz ? kurzFormat : lang).format(new Date()),
    () => null,
  );
  return <>{heute ?? " "}</>;
}
