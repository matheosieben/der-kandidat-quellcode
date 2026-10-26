import type { ReactNode } from "react";
import "./interaktions-hinweis.css";

/**
 * Meldet ein Element beim Cursor der Seite als bedienbar an. Die Kennung
 * fasst zusammen, was gemeinsam als bedient gilt, etwa alle Tabs einer
 * Übersicht. Ohne aktiv geht der Cursor dort nicht hin.
 */
export function cursorGruppe(
  kennung: string,
  {
    art,
    aktiv = true,
    fokusHaelt = true,
  }: {
    /** „links“ zeigt auf Tabs, „innen“ tippt in Knöpfe; ohne Angabe freie Punkte. */
    art?: "links" | "innen";
    aktiv?: boolean;
    /** Ob Fokus darin den Cursor fernhält, wie beim Überfahren. */
    fokusHaelt?: boolean;
  } = {},
) {
  if (!aktiv) return {};
  return {
    "data-cursor-gruppe": kennung,
    "data-cursor-art": art,
    "data-cursor-fokus": fokusHaelt ? undefined : "frei",
  };
}

export function InteraktionsFlaeche({
  children,
  kennung,
  aktiv = true,
  className = "",
}: {
  children: ReactNode;
  /** Fasst für den Cursor zusammen, was gemeinsam als bedient gilt. */
  kennung: string;
  aktiv?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`interaktions-flaeche ${className}`}
      {...cursorGruppe(kennung, { aktiv })}
    >
      {children}
    </div>
  );
}

export function InteraktionsHinweis({ children }: { children: ReactNode }) {
  return (
    <span className="font-sans text-[0.75rem] leading-relaxed text-ink">
      <span className="interaktions-marker">{children}</span>
    </span>
  );
}
