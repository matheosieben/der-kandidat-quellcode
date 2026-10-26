"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

/**
 * Blendet die Kopfleiste oben ein, sobald der große Titelkopf (#titelkopf)
 * aus dem Bild gescrollt ist – wie der kleine Kopf des WSJ.
 */
export function EinblendKopf({ children }: { children: ReactNode }) {
  const [sichtbar, setSichtbar] = useState(false);
  const leiste = useRef<HTMLElement>(null);

  useEffect(() => {
    const kopf = document.getElementById("titelkopf");
    if (!kopf) return;
    const beobachter = new IntersectionObserver(([eintrag]) =>
      setSichtbar(!eintrag.isIntersecting),
    );
    beobachter.observe(kopf);
    const kompakt = leiste.current;
    const messen = () => {
      if (kompakt) {
        document.documentElement.style.setProperty(
          "--kopfhoehe",
          `${kompakt.getBoundingClientRect().height}px`,
        );
      }
    };
    const groesse = new ResizeObserver(messen);
    if (kompakt) groesse.observe(kompakt);
    messen();
    return () => {
      beobachter.disconnect();
      groesse.disconnect();
      document.documentElement.style.removeProperty("--kopfhoehe");
    };
  }, []);

  return (
    <header
      ref={leiste}
      className={`no-print fixed inset-x-0 top-0 z-30 transition-transform duration-200 ease-out motion-reduce:transition-none ${
        sichtbar ? "translate-y-0" : "-translate-y-full"
      }`}
      inert={!sichtbar}
    >
      {children}
    </header>
  );
}
