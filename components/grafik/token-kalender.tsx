"use client";

import Image from "next/image";
import {
  type KeyboardEvent,
  type PointerEvent,
  useId,
  useMemo,
  useState,
} from "react";
import {
  InteraktionsFlaeche,
  InteraktionsHinweis,
} from "@/components/werkstatt/interaktions-hinweis";
import { datumKurz, monatKurz, zahl } from "@/lib/daten";
import type { TokenTag } from "@/lib/token-kalender";
import { FARBE, ICON, NAME } from "./werkzeuge";

/* Ein Tag ist ein Quadrat: Schrittweite und Lücke in SVG-Einheiten. */
const SCHRITT = 24;
const LUECKE = 4;
const RAND = 1;

type Auswahl = {
  datum: string;
  x: number;
  y: number;
  breite: number;
  oben: boolean;
};

export function TokenKalender({
  tage,
  spalten = 28,
  kennzahlen = true,
  schlicht = false,
}: {
  tage: TokenTag[];
  /** Tage je Zeile; die Felder bleiben quadratisch. */
  spalten?: number;
  kennzahlen?: boolean;
  /** Nur das Mosaik, ohne Titel, Legende und Erklärung; der Tooltip bleibt. */
  schlicht?: boolean;
}) {
  const muster = useId();
  const [auswahl, setAuswahl] = useState<Auswahl | null>(null);
  const grenzen = useMemo(() => {
    const werte = tage
      .map((t) => t.tokens)
      .filter((t) => t > 0)
      .sort((a, b) => a - b);
    return [0.25, 0.5, 0.75].map(
      (p) =>
        werte[Math.min(werte.length - 1, Math.floor(p * werte.length))] ?? 0,
    );
  }, [tage]);
  const zeilen = Math.max(1, Math.ceil(tage.length / spalten));
  const breite = RAND * 2 + spalten * SCHRITT - LUECKE;
  const hoehe = RAND * 2 + zeilen * SCHRITT - LUECKE;
  const zelle = SCHRITT - LUECKE;
  const aktiv = tage.find((t) => t.datum === auswahl?.datum);
  const aktiveTage = tage.filter((t) => t.tokens > 0).length;
  const volumen = tage.reduce((summe, tag) => summe + tag.tokens, 0);

  function zeigen(datum: string, rahmen: DOMRect, x: number, y: number) {
    const tipBreite = Math.min(240, rahmen.width - 16);
    const links =
      x + tipBreite + 12 > rahmen.width - 8 ? x - tipBreite - 12 : x + 12;
    const oben = y > rahmen.height / 2;
    setAuswahl({
      datum,
      x: Math.max(8, Math.min(links, rahmen.width - tipBreite - 8)),
      y: oben ? y - 12 : y + 12,
      breite: tipBreite,
      oben,
    });
  }

  function waehlen(event: PointerEvent<SVGSVGElement>) {
    const datum =
      event.target instanceof SVGElement
        ? event.target.getAttribute("data-datum")
        : null;
    if (!datum) {
      setAuswahl(null);
      return;
    }
    const rahmen = event.currentTarget.getBoundingClientRect();
    zeigen(
      datum,
      rahmen,
      event.clientX - rahmen.left,
      event.clientY - rahmen.top,
    );
  }

  function tagWaehlen(index: number, svg: SVGSVGElement) {
    const rahmen = svg.getBoundingClientRect();
    const x =
      ((RAND + (index % spalten) * SCHRITT + zelle / 2) / breite) *
      rahmen.width;
    const y =
      ((RAND + Math.floor(index / spalten) * SCHRITT + zelle / 2) / hoehe) *
      rahmen.height;
    zeigen(tage[index].datum, rahmen, x, y);
  }

  function taste(event: KeyboardEvent<SVGSVGElement>) {
    const schritte: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -spalten,
      ArrowDown: spalten,
    };
    const index = Math.max(
      0,
      tage.findIndex((tag) => tag.datum === auswahl?.datum),
    );
    let ziel: number;
    if (event.key === "Home") ziel = 0;
    else if (event.key === "End") ziel = tage.length - 1;
    else if (event.key in schritte) ziel = index + schritte[event.key];
    else return;
    event.preventDefault();
    tagWaehlen(
      Math.max(0, Math.min(tage.length - 1, ziel)),
      event.currentTarget,
    );
  }

  return (
    <figure id="kalender" className="min-w-0 scroll-mt-24">
      {!schlicht && (
        <>
          <div className="mb-2 flex min-h-7 flex-wrap items-center justify-between gap-3 font-sans">
            <h2 className="text-[0.8rem] font-semibold">Token-Nutzung</h2>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[0.68rem] text-meta">
              {(["claude", "cursor", "codex"] as const).map((w) => (
                <span key={w} className="flex items-center gap-1.5">
                  <Image src={ICON[w]} alt="" width={14} height={14} />
                  {NAME[w]}
                </span>
              ))}
            </div>
          </div>
          <p className="mb-1.5 font-sans text-[0.68rem] text-meta">
            {monatKurz(tage[0].datum)} {tage[0].datum.slice(0, 4)} bis{" "}
            {monatKurz(tage[tage.length - 1].datum)}{" "}
            {tage[tage.length - 1].datum.slice(0, 4)}
          </p>
        </>
      )}
      <InteraktionsFlaeche aktiv={!aktiv} kennung="token-kalender">
        <svg
          viewBox={`0 0 ${breite} ${hoehe}`}
          className="block h-auto w-full touch-pan-y select-none"
          role="img"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: Pfeiltasten wählen die Tageswerte der interaktiven Grafik.
          tabIndex={0}
          aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Home End"
          aria-label={`Token-Nutzung von ${datumKurz(tage[0].datum)} bis ${datumKurz(tage[tage.length - 1].datum)}: ${aktiveTage} aktive Tage. Die Tage folgen zeilenweise von links nach rechts. Jedes Feld zeigt einen Tag; die Farbe zeigt das meistgenutzte Werkzeug, die Intensität das Token-Volumen. Schraffierte Tage sind überwiegend hochgerechnet.`}
          onPointerMove={waehlen}
          onPointerDown={waehlen}
          onPointerLeave={() => setAuswahl(null)}
          onPointerCancel={() => setAuswahl(null)}
          // Nur beim Fokus per Tastatur; ein Klick hat den Tag schon gewählt
          onFocus={(event) => {
            if (event.currentTarget.matches(":focus-visible"))
              tagWaehlen(0, event.currentTarget);
          }}
          onBlur={() => setAuswahl(null)}
          onKeyDown={taste}
          aria-describedby={aktiv ? `${muster}-tooltip` : undefined}
        >
          <defs>
            <pattern
              id={muster}
              width="3"
              height="3"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="3"
                stroke="var(--paper)"
                strokeOpacity="0.65"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          {tage.map((tag, index) => {
            const x = RAND + (index % spalten) * SCHRITT;
            const y = RAND + Math.floor(index / spalten) * SCHRITT;
            const deckkraft =
              tag.tokens > 0
                ? [0.3, 0.5, 0.75, 1][
                    grenzen.filter((g) => tag.tokens > g).length
                  ]
                : 1;
            const beschreibung = `${datumKurz(tag.datum)}: ${zahl(tag.tokens, 1)} Mio. Tokens${tag.werkzeug ? `, überwiegend ${NAME[tag.werkzeug]}` : ""}${tag.hochgerechnet ? ", hochgerechnet" : ""}`;
            return (
              <g key={tag.datum}>
                <rect
                  data-datum={tag.datum}
                  x={x}
                  y={y}
                  width={zelle}
                  height={zelle}
                  rx={2}
                  fill={tag.werkzeug ? FARBE[tag.werkzeug] : "var(--paper-2)"}
                  fillOpacity={deckkraft}
                  stroke={
                    auswahl?.datum === tag.datum ? "var(--ink)" : "var(--rule)"
                  }
                  strokeWidth={auswahl?.datum === tag.datum ? 1 : 0.3}
                  aria-label={beschreibung}
                />
                {tag.hochgerechnet && tag.tokens > 0 && (
                  <rect
                    x={x}
                    y={y}
                    width={zelle}
                    height={zelle}
                    rx={2}
                    fill={`url(#${muster})`}
                    pointerEvents="none"
                  />
                )}
              </g>
            );
          })}
        </svg>
        {aktiv && auswahl && (
          <div
            id={`${muster}-tooltip`}
            role="tooltip"
            className="pointer-events-none absolute z-10 border border-rule-strong bg-paper p-3 font-sans text-[0.75rem] shadow-sm"
            style={{
              left: auswahl.x,
              top: auswahl.y,
              width: auswahl.breite,
              transform: auswahl.oben ? "translateY(-100%)" : undefined,
            }}
          >
            <p className="font-semibold">{datumKurz(aktiv.datum)}</p>
            <p className="mt-1 tabular-nums">
              <strong>{zahl(aktiv.tokens, 1)}</strong> Mio. Tokens
            </p>
            {aktiv.werkzeug && (
              <p className="mt-1 flex items-center gap-1.5">
                <Image
                  src={ICON[aktiv.werkzeug]}
                  alt=""
                  width={14}
                  height={14}
                />
                <span style={{ color: FARBE[aktiv.werkzeug] }}>
                  {NAME[aktiv.werkzeug]} überwiegt
                </span>
              </p>
            )}
            {aktiv.hochgerechnet && (
              <p className="mt-1 text-meta">überwiegend hochgerechnet</p>
            )}
          </div>
        )}
      </InteraktionsFlaeche>
      <figcaption className="mt-2 font-sans text-[0.72rem] leading-snug text-meta">
        <InteraktionsHinweis>
          Tag antippen oder mit der Maus darüberfahren.
        </InteraktionsHinweis>
        {!schlicht && (
          <p className="mt-2 min-h-[2.7em]">
            Ein Feld pro Tag, zeilenweise chronologisch. Farbe: meistgenutztes
            Werkzeug. Intensität: Token-Volumen. Schraffur: überwiegend
            hochgerechnet, Werkzeuganteile nach Monatsverteilung.
          </p>
        )}
      </figcaption>
      {kennzahlen && (
        <dl className="mt-4 grid grid-cols-2 gap-5 border-t border-rule pt-3 font-sans">
          <div>
            <dt className="text-[0.78rem] font-semibold">Token-Volumen</dt>
            <dd className="hl-feature mt-1 text-[1.6rem] leading-none tabular-nums">
              {zahl(volumen / 1000, 1)} Mrd.
            </dd>
          </div>
          <div>
            <dt className="text-[0.78rem] font-semibold">Aktive Tage</dt>
            <dd className="hl-feature mt-1 text-[1.6rem] leading-none tabular-nums">
              {aktiveTage}
            </dd>
          </div>
        </dl>
      )}
    </figure>
  );
}
