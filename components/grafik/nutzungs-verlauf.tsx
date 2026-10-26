"use client";

import Image from "next/image";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  cursorGruppe,
  InteraktionsHinweis,
} from "@/components/werkstatt/interaktions-hinweis";
import { anbieter, daten, datumKurz, monatKurz, zahl } from "@/lib/daten";
import { codexSpitzenwoche, type Monat } from "@/lib/schaetzung";
import { FARBE, ICON, NAME } from "./werkzeuge";

const RAND = { links: 40, rechts: 7, oben: 30, unten: 82 };
const SPUR = 22;

type Ansicht = "anteil" | "volumen";

/**
 * Verlauf der Nutzung von Claude und Codex, Monat für Monat. Umschaltbar
 * zwischen Anteil (100 %) und Volumen; beim Überfahren erscheinen Werte,
 * meine Einschätzung und neue Modelle des Monats. Hochgerechnete Monate sind schraffiert.
 */
export function NutzungsVerlauf({
  monate,
  kompakt = false,
  kopfRechts,
}: {
  monate: Monat[];
  kompakt?: boolean;
  /** Ersetzt die Legende rechts neben dem Umschalter. */
  kopfRechts?: ReactNode;
}) {
  const rahmen = useRef<HTMLDivElement>(null);
  const [groesse, setGroesse] = useState({ b: 720, h: 440 });
  const [ansicht, setAnsicht] = useState<Ansicht>("anteil");
  const [aktiv, setAktiv] = useState<number | null>(null);

  useEffect(() => {
    const el = rahmen.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setGroesse({
        b: Math.max(300, e.contentRect.width),
        h: Math.max(kompakt ? 280 : 340, e.contentRect.height),
      }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, [kompakt]);

  const { b: B, h: H } = groesse;
  const innenB = B - RAND.links - RAND.rechts;
  const flaecheH = H - RAND.oben - RAND.unten;
  const basis = RAND.oben + flaecheH;
  const schritt = innenB / (monate.length - 1);
  const x = (i: number) => RAND.links + i * schritt;

  const summe = (m: Monat) => m.claude + m.cursor + m.codex;
  const maxVolumen = Math.max(...monate.map(summe));
  const deckel = Math.ceil(maxVolumen / 1000) * 1000;
  const yWert = (anteil: number) => basis - anteil * flaecheH;

  // Schichten von unten: Claude, Cursor, Codex; je nach Ansicht
  const teiler = (m: Monat) => (ansicht === "anteil" ? summe(m) || 1 : deckel);
  const claudeOben = monate.map((m) => m.claude / teiler(m));
  const cursorOben = monate.map((m) => (m.claude + m.cursor) / teiler(m));
  const gesamtOben = monate.map((m) => summe(m) / teiler(m));
  const pfad = (oben: number[], unten: number[]) =>
    `M${oben.map((v, i) => `${x(i)},${yWert(v)}`).join("L")}L${[...unten]
      .map((_, i) => [
        x(unten.length - 1 - i),
        yWert(unten[unten.length - 1 - i]),
      ])
      .map(([a, b]) => `${a},${b}`)
      .join("L")}Z`;
  const null_ = monate.map(() => 0);

  // Grenze zwischen geschätzt und gemessen
  const ersteGemessen = monate.findIndex(
    (m) => !m.claudeGeschaetzt && !m.codexGeschaetzt,
  );
  const grenzeX = ersteGemessen > 0 ? x(ersteGemessen) : RAND.links;

  const raster =
    ansicht === "anteil"
      ? [0, 0.25, 0.5, 0.75, 1].map((v) => ({ v, text: `${v * 100} %` }))
      : Array.from({ length: deckel / 1000 + 1 }, (_, i) => ({
          v: (i * 1000) / deckel,
          text: i ? `${i} Mrd.` : "0",
        }));

  // Modelle je Monat für Spuren und Tooltip
  const xDatum = (iso: string) => {
    const i = monate.findIndex((m) => m.monat === iso.slice(0, 7));
    if (i < 0) return null;
    const [jahr, monat, tag] = iso.split("-").map(Number);
    const tage = new Date(Date.UTC(jahr, monat, 0)).getUTCDate();
    return x(i) + ((tag - 1) / tage) * schritt;
  };
  const spurY = { codex: basis + 42, claude: basis + 42 + SPUR };

  const m = aktiv !== null ? monate[aktiv] : null;
  const spitze = m && !m.claudeGeschaetzt ? codexSpitzenwoche(m.monat) : null;
  const neue = m ? daten.chronik.filter(([, d]) => d.startsWith(m.monat)) : [];

  const waehle = (clientX: number) => {
    const el = rahmen.current;
    if (!el) return;
    const px = clientX - el.getBoundingClientRect().left;
    const i = Math.round((px - RAND.links) / schritt);
    setAktiv(Math.max(0, Math.min(monate.length - 1, i)));
  };

  return (
    <figure className={`flex flex-col ${kompakt ? "" : "h-full"}`}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3 font-sans text-[0.75rem]">
        <fieldset
          aria-label="Ansicht"
          className="inline-flex border border-rule-strong"
        >
          <legend className="sr-only">Ansicht</legend>
          {(["anteil", "volumen"] as const).map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={ansicht === a}
              onClick={() => setAnsicht(a)}
              className={`btn-quiet px-2.5 py-1 font-semibold ${ansicht === a ? "bg-ink text-paper" : "text-ink hover:bg-paper-2"}`}
            >
              {a === "anteil" ? "Anteil" : "Volumen"}
            </button>
          ))}
        </fieldset>
        {kopfRechts ?? <VerlaufLegende />}
      </div>

      <div
        ref={rahmen}
        {...cursorGruppe("nutzungs-verlauf", { aktiv: aktiv === null })}
        className={`relative touch-pan-y select-none ${kompakt ? "h-[300px] shrink-0" : "min-h-[340px] flex-1 lg:min-h-[400px]"}`}
        onPointerMove={(e) => waehle(e.clientX)}
        onPointerDown={(e) => waehle(e.clientX)}
        onPointerLeave={() => setAktiv(null)}
      >
        <svg
          width={B}
          height={H}
          viewBox={`0 0 ${B} ${H}`}
          className="absolute inset-0 h-full w-full"
          role="img"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: Pfeiltasten wählen die Monatswerte der interaktiven Grafik.
          tabIndex={0}
          aria-keyshortcuts="ArrowLeft ArrowRight Home End"
          // Nur beim Fokus per Tastatur; ein Klick hat den Monat schon gewählt
          onFocus={(event) => {
            if (event.currentTarget.matches(":focus-visible")) setAktiv(0);
          }}
          onBlur={() => setAktiv(null)}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              const schritt = event.key === "ArrowLeft" ? -1 : 1;
              setAktiv((index) =>
                Math.max(
                  0,
                  Math.min(monate.length - 1, (index ?? 0) + schritt),
                ),
              );
            } else if (event.key === "Home" || event.key === "End") {
              event.preventDefault();
              setAktiv(event.key === "Home" ? 0 : monate.length - 1);
            }
          }}
          aria-label={`Nutzung von Claude Code und Codex von ${monatKurz(monate[0].monat)} ${monate[0].monat.slice(0, 4)} bis ${monatKurz(monate.at(-1)?.monat ?? "")} ${monate.at(-1)?.monat.slice(0, 4)}. Claude-Anteil je Monat: ${monate.map((x) => `${monatKurz(x.monat)} ${Math.round((x.claude / (summe(x) || 1)) * 100)} %${x.claudeGeschaetzt ? " hochgerechnet" : ""}`).join(", ")}.`}
        >
          <defs>
            <pattern
              id="schraffur"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="6"
                stroke="var(--paper)"
                strokeOpacity="0.55"
                strokeWidth="2.2"
              />
            </pattern>
            <clipPath id="geschaetzt-bereich">
              <rect x={0} y={0} width={grenzeX} height={basis} />
            </clipPath>
          </defs>

          {raster.map((r) => (
            <g key={r.v}>
              <line
                x1={RAND.links}
                x2={B - RAND.rechts}
                y1={yWert(r.v)}
                y2={yWert(r.v)}
                stroke={r.v === 0 ? "var(--ink)" : "var(--rule)"}
                strokeDasharray={r.v === 0 ? undefined : "2 3"}
              />
              <text
                x={0}
                y={yWert(r.v) + 3.5}
                className="fill-meta font-sans text-[10px]"
              >
                {r.text}
              </text>
            </g>
          ))}

          <path
            d={pfad(gesamtOben, cursorOben)}
            fill={FARBE.codex}
            className="transition-[d] duration-500"
          />
          <path
            d={pfad(cursorOben, claudeOben)}
            fill={FARBE.cursor}
            className="transition-[d] duration-500"
          />
          <path
            d={pfad(claudeOben, null_)}
            fill={FARBE.claude}
            className="transition-[d] duration-500"
          />
          <rect
            x={RAND.links}
            y={RAND.oben}
            width={grenzeX - RAND.links}
            height={flaecheH}
            fill="url(#schraffur)"
            clipPath="url(#geschaetzt-bereich)"
          />

          {ansicht === "anteil" && (
            <line
              x1={RAND.links}
              x2={B - RAND.rechts}
              y1={yWert(0.5)}
              y2={yWert(0.5)}
              stroke="var(--paper)"
              strokeWidth={1.2}
              strokeDasharray="4 3"
            />
          )}

          {/* Grenze geschätzt / gemessen */}
          {ersteGemessen > 0 && (
            <g>
              <line
                x1={grenzeX}
                x2={grenzeX}
                y1={RAND.oben - 18}
                y2={basis}
                stroke="var(--ink)"
                strokeWidth={1}
              />
              <text
                x={grenzeX - 6}
                y={RAND.oben - 8}
                textAnchor="end"
                className="fill-meta font-sans text-[10px]"
              >
                ← nach Hochrechnung
              </text>
              <text
                x={grenzeX + 6}
                y={RAND.oben - 8}
                className="fill-ink font-sans text-[10px] font-semibold"
              >
                gemessen →
              </text>
            </g>
          )}

          {/* Monatsachse */}
          {monate.map((mo, i) => (
            <g key={mo.monat}>
              {(i % 2 === 0 || B > 560) && (
                <text
                  x={x(i)}
                  y={basis + 13}
                  textAnchor={
                    i === 0
                      ? "start"
                      : i === monate.length - 1
                        ? "end"
                        : "middle"
                  }
                  className="fill-ink-2 font-sans text-[10px]"
                >
                  {monatKurz(mo.monat).replace(".", "")}
                  {(i === 0 || mo.monat.endsWith("-01")) && (
                    <tspan x={x(i)} dy={11} className="fill-meta text-[9px]">
                      {mo.monat.slice(0, 4)}
                    </tspan>
                  )}
                </text>
              )}
            </g>
          ))}

          {/* Spuren: erster Einsatz je Modell */}
          {(["codex", "claude"] as const).map((a) => (
            <g key={a}>
              <image
                href={ICON[a]}
                x={0}
                y={spurY[a] - 8}
                width={16}
                height={16}
              />
              <line
                x1={RAND.links}
                x2={B - RAND.rechts}
                y1={spurY[a]}
                y2={spurY[a]}
                stroke={FARBE[a]}
                strokeOpacity={0.3}
                strokeWidth={2}
              />
              {daten.chronik
                .filter(
                  ([n]) => (anbieter(n) === "anthropic") === (a === "claude"),
                )
                .map(([name, datum]) => {
                  const cx = xDatum(datum);
                  if (cx === null) return null;
                  const haupt = Object.values(daten.aktuell).includes(name);
                  return (
                    <circle
                      key={name}
                      cx={cx}
                      cy={spurY[a]}
                      r={haupt ? 5.5 : 4}
                      fill={FARBE[a]}
                      stroke="var(--paper)"
                      strokeWidth={1.5}
                    >
                      <title>{`${name} · erster Einsatz ${datumKurz(datum)}`}</title>
                    </circle>
                  );
                })}
            </g>
          ))}

          {/* Markierung des gewählten Monats */}
          {aktiv !== null && m && (
            <g pointerEvents="none">
              <line
                x1={x(aktiv)}
                x2={x(aktiv)}
                y1={RAND.oben}
                y2={basis}
                stroke="var(--ink)"
                strokeWidth={1}
              />
              <circle
                cx={x(aktiv)}
                cy={yWert(claudeOben[aktiv])}
                r={4}
                fill="var(--paper)"
                stroke={FARBE.claude}
                strokeWidth={2}
              />
              <circle
                cx={x(aktiv)}
                cy={yWert(gesamtOben[aktiv])}
                r={4}
                fill="var(--paper)"
                stroke={FARBE.codex}
                strokeWidth={2}
              />
            </g>
          )}
        </svg>

        {aktiv !== null && m && (
          <div
            className="pointer-events-none absolute z-10 w-60 border border-rule-strong bg-paper p-3 font-sans text-[0.75rem] shadow-sm"
            style={{
              top: RAND.oben + 8,
              left: Math.max(
                8,
                Math.min(
                  B - 248,
                  x(aktiv) > B / 2 ? x(aktiv) - 252 : x(aktiv) + 12,
                ),
              ),
            }}
          >
            <p className="font-semibold">
              {monatKurz(m.monat).replace(".", "")} {m.monat.slice(0, 4)}
              {(m.claudeGeschaetzt || m.codexGeschaetzt) && (
                <span className="ml-1.5 font-normal text-meta">
                  nach Hochrechnung
                </span>
              )}
            </p>
            {(["claude", "cursor", "codex"] as const).map((a) => {
              const wert = m[a];
              if (a === "cursor" && !wert) return null;
              const anteil = wert / (summe(m) || 1);
              const geschaetzt =
                a === "codex" ? m.codexGeschaetzt : m.claudeGeschaetzt;
              return (
                <p
                  key={a}
                  className="mt-1 flex items-center gap-1.5 tabular-nums"
                >
                  <Image
                    src={ICON[a]}
                    alt=""
                    width={14}
                    height={14}
                    className="size-3.5 rounded-[3px]"
                  />
                  <span className="font-semibold" style={{ color: FARBE[a] }}>
                    {Math.round(anteil * 100)} %
                  </span>
                  <span className="text-meta">
                    {geschaetzt ? "≈" : ""}
                    {zahl(wert)} Mio. Tokens
                  </span>
                </p>
              );
            })}
            {m.lage && (
              <p className="mt-2 border-t border-rule pt-2 leading-snug text-ink-2">
                {m.lage}
              </p>
            )}
            {spitze && spitze.anteil >= 0.5 && (
              <p className="mt-1.5 leading-snug text-ink-2">
                Gemessene Spitzenwoche ab {datumKurz(spitze.ab, false)}:{" "}
                <strong style={{ color: FARBE.codex }}>
                  {Math.round(spitze.anteil * 100)} % Codex
                </strong>
              </p>
            )}
            {neue.length > 0 && (
              <p className="mt-1.5 leading-snug text-meta">
                Neu bei mir:{" "}
                {neue.map(([n]) => n.replace("Claude ", "")).join(", ")}
              </p>
            )}
          </div>
        )}
      </div>
      <figcaption className="mt-2">
        <InteraktionsHinweis>
          Monat antippen oder mit der Maus darüberfahren.
        </InteraktionsHinweis>
      </figcaption>
    </figure>
  );
}

/** Legende des Verlaufs: Werkzeuge und Schraffur. */
export function VerlaufLegende() {
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-meta">
      {(["claude", "cursor", "codex"] as const).map((a) => (
        <span key={a} className="flex items-center gap-1.5">
          <Image
            src={ICON[a]}
            alt=""
            width={14}
            height={14}
            className="size-3.5 rounded-[3px]"
          />
          {NAME[a]}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block size-2.5 border border-meta"
          style={{
            background:
              "repeating-linear-gradient(135deg, var(--meta) 0 1px, transparent 1px 3px)",
          }}
        />
        hochgerechnet
      </span>
    </span>
  );
}
