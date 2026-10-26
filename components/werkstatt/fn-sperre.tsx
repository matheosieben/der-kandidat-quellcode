"use client";

import { useState } from "react";
import { DiktatRennen, TIPPEN, WISPR } from "@/components/grafik/diktat-rennen";
import { cursorGruppe } from "@/components/werkstatt/interaktions-hinweis";

/** Die Fn-Taste, mit der Wispr Flow startet: Grün mit rosa Beschriftung. */
function FnTaste() {
  return (
    <svg viewBox="4 4 88 88" className="block size-20" aria-hidden="true">
      <rect x="4" y="8" width="88" height="84" rx="14" fill={WISPR} />
      <rect
        x="10"
        y="4"
        width="76"
        height="76"
        rx="11"
        fill={WISPR}
        stroke={TIPPEN}
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <text
        x="74"
        y="30"
        textAnchor="end"
        fill={TIPPEN}
        className="font-sans"
        fontSize="17"
        fontWeight="600"
      >
        fn
      </text>
      <g
        transform="translate(30 56)"
        fill="none"
        stroke={TIPPEN}
        strokeWidth="2"
      >
        <circle r="11" />
        <ellipse rx="4.5" ry="11" />
        <line x1="-11" x2="11" />
        <path d="M-9.5 -5.5 H9.5 M-9.5 5.5 H9.5" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

/**
 * Das Diktat-Beispiel liegt erst unscharf unter einer Sperre. Wie Wispr Flow
 * startet es mit Fn, hier per Klick auf die gezeichnete Taste. Die echte
 * Fn-Taste melden Browser auf dem Mac nicht an die Seite.
 */
export function FnSperre() {
  const [offen, setOffen] = useState(false);

  return (
    <div className="relative">
      <div
        aria-hidden={!offen}
        inert={!offen}
        className={`transition-[filter] duration-700 ${offen ? "" : "pointer-events-none blur-[6px] select-none"}`}
      >
        <DiktatRennen bereit={offen} farbig />
      </div>
      {!offen && (
        <button
          type="button"
          onClick={() => setOffen(true)}
          aria-label="Press Fn to unlock"
          {...cursorGruppe("fn-sperre")}
          className="group absolute inset-0 flex items-center justify-center bg-paper/40"
        >
          {/* Press bündig mit der Oberkante der Taste, to unlock mit der Unterkante;
              die Verschiebung gleicht den Leerraum über und unter der Schrift aus */}
          <span data-cursor-ziel className="flex items-stretch gap-x-3">
            <span className="hl-feature relative -top-[0.25em] self-start text-[1.5rem] leading-none">
              <mark className="marker">Press</mark>
            </span>
            <span className="transition-transform duration-150 group-hover:translate-y-0.5 group-active:translate-y-1.5">
              <FnTaste />
            </span>
            <span className="hl-feature relative top-[0.18em] self-end text-[1.5rem] leading-none">
              <mark className="marker">to unlock</mark>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
