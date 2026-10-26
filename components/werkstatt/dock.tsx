"use client";

import Image from "next/image";
import { type PointerEvent, useEffect, useRef, useState } from "react";
import hintergrund from "@/public/werkzeuge/hintergrund.webp";

export type DockApp = {
  name: string;
  icon: string;
  /** Im täglichen Einsatz: Punkt darunter wie bei einer laufenden App. */
  laeuft: boolean;
  /** Gehört zu früher und steht rechts vom Trennstrich. */
  frueher?: boolean;
  /** Kurz, wofür ich die App nutze; erscheint beim Überfahren. */
  zweck: string;
};

/*
 * Maße nach dem echten Dock, abgemessen am Bildschirmfoto. Die Icon-Dateien
 * von macOS haben ringsum 10 % Leerrand, das sichtbare Icon ist also nur
 * 80 % so groß wie GROESSE. Die Abstände sind darum von Datei zu Datei
 * gemessen, nicht von Icon zu Icon: Rand der Leiste, Lücke zwischen den
 * Icons, Platz für den Punkt darunter und Zusatzabstand beim Trennstrich.
 *
 * Die Vergrößerung reicht wie beim Mac gut zwei Icons weit: Die direkten
 * Nachbarn wachsen deutlich mit, das zweite daneben nur noch wenig.
 */
const GROESSE = 56;
const MAX = 1.65;
const REICHWEITE = 140;
const RAND = 6;
const LUECKE = 4;
const UNTEN = 9;
const TRENNER = 29;
/** So lange wächst das Dock beim Hineinfahren und schrumpft beim Verlassen, in ms. */
const EINBLENDEN = 150;

/** Glas wie beim Dock auf dem Mac, für Leiste und Infoschild. */
const GLAS =
  "border border-white/40 bg-white/25 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-2xl backdrop-saturate-150";

type Masse = {
  anzahl: number;
  groesse: number;
  rand: number;
  luecke: number;
  trennAbstand: number;
  reichweite: number;
  trenner: number;
};

/** Icon-Mitten und Gesamtbreite der Leiste bei den gegebenen Icon-Breiten. */
function aufreihen(breiten: number[], m: Masse) {
  let x = 1 + m.rand;
  const mitten = breiten.map((b, i) => {
    if (i > 0) x += m.luecke;
    if (i === m.trenner) x += m.trennAbstand;
    x += b;
    return x - b / 2;
  });
  return { mitten, breite: x + m.rand + 1 };
}

/** Die Stelle `x` der Ruhelage in der vergrößerten Leiste, linear zwischen den Icon-Mitten. */
function abbilden(x: number, ruhe: number[], gross: number[]) {
  const letzte = ruhe.length - 1;
  if (x <= ruhe[0]) return gross[0] - (ruhe[0] - x);
  if (x >= ruhe[letzte]) return gross[letzte] + (x - ruhe[letzte]);
  const i = ruhe.findIndex((m, j) => x >= m && x <= ruhe[j + 1]);
  const t = (x - ruhe[i]) / (ruhe[i + 1] - ruhe[i]);
  return gross[i] + t * (gross[i + 1] - gross[i]);
}

/**
 * Vergrößerung je Icon für den Zeiger, gemessen als Abstand zur Mitte des
 * Docks. `staerke` blendet von der Ruhelage (0) zur vollen Vergrößerung (1).
 * Die Leiste bleibt mittig wie beim Mac; gesucht wird die Stelle der
 * Ruhelage, die nach dem Vergrößern genau unter dem Zeiger liegt.
 */
function vergroessern(zeiger: number, staerke: number, m: Masse) {
  const ruhe = aufreihen(
    Array.from({ length: m.anzahl }, () => m.groesse),
    m,
  );
  function wachsen(stelle: number) {
    const faktoren = ruhe.mitten.map((mitte) => {
      const abstand = Math.abs(stelle - mitte);
      return abstand >= m.reichweite
        ? 1
        : 1 +
            (MAX - 1) *
              staerke *
              Math.cos((abstand / m.reichweite) * (Math.PI / 2));
    });
    const gross = aufreihen(
      faktoren.map((f) => m.groesse * f),
      m,
    );
    const ort = abbilden(stelle, ruhe.mitten, gross.mitten) - gross.breite / 2;
    return { faktoren, gross, ort };
  }
  // Der Ort wächst stetig mit der Stelle, also halbieren bis er unter dem
  // Zeiger liegt
  let links = -ruhe.breite;
  let rechts = 2 * ruhe.breite;
  for (let n = 0; n < 24; n++) {
    const mitte = (links + rechts) / 2;
    if (wachsen(mitte).ort < zeiger) links = mitte;
    else rechts = mitte;
  }
  const { faktoren, gross } = wachsen((links + rechts) / 2);
  // Das Schild gehört zum Icon unter dem Zeiger
  const abstaende = gross.mitten.map((mitte) =>
    Math.abs(zeiger + gross.breite / 2 - mitte),
  );
  return { faktoren, schild: abstaende.indexOf(Math.min(...abstaende)) };
}

/**
 * Ein Dock wie auf dem Mac: Beim Überfahren wachsen die Icons nahe dem
 * Zeiger. Nach oben ragen sie aus der Leiste heraus, in der Breite wächst
 * die Leiste mit, sodass seitlich nichts übersteht. Ein Strich trennt die
 * Apps von heute von denen, mit denen ich früher gearbeitet habe.
 *
 * Wie beim Mac folgt die Vergrößerung dem Zeiger ohne Verzögerung, nur das
 * Hineinfahren und Verlassen ist animiert. Die Größen schreibt eine eigene
 * Schleife Bild für Bild direkt an die Icons, ohne CSS-Übergänge, die sich
 * bei jeder Bewegung neu starten würden. Gemessen werden die Icons dabei
 * nie: Alles ist aus der Ruhelage gerechnet.
 */
export function Dock({ apps }: { apps: DockApp[] }) {
  const rahmen = useRef<HTMLDivElement>(null);
  const plaetze = useRef<(HTMLLIElement | null)[]>([]);
  const knoepfe = useRef<(HTMLButtonElement | null)[]>([]);
  const spalten = useRef<(HTMLDivElement | null)[]>([]);
  const [mass, setMass] = useState(1);
  /** Schild zum Icon unter dem Zeiger. */
  const [schild, setSchild] = useState<number | null>(null);
  /** Schild für Fokus und Antippen, wenn kein Zeiger darüber ist. */
  const [gewaehlt, setGewaehlt] = useState<number | null>(null);

  const groesse = GROESSE * mass;
  const rand = RAND * mass;
  const luecke = LUECKE * mass;
  const unten = UNTEN * mass;
  const trennAbstand = TRENNER * mass;
  const trenner = apps.findIndex((a) => a.frueher);

  /** Zustand der Schleife; liegt außerhalb von React, damit nichts neu zeichnet. */
  const lage = useRef({
    masse: null as Masse | null,
    /** Zeiger als Abstand zur Mitte des Docks, die beim Vergrößern stehen bleibt. */
    zeiger: null as number | null,
    staerke: 0,
    ziel: 0,
    zuletzt: 0,
    lauf: 0,
    schild: null as number | null,
  });

  // Auf schmalen Bildschirmen schrumpft das ganze Dock maßstabsgetreu
  useEffect(() => {
    const el = rahmen.current;
    if (!el) return;
    const breite =
      apps.length * GROESSE +
      (apps.length - 1) * LUECKE +
      2 * RAND +
      (trenner >= 0 ? TRENNER : 0) +
      2;
    const ro = new ResizeObserver(([e]) =>
      setMass(Math.min(1, (e.contentRect.width - 8) / breite)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, [apps.length, trenner]);

  useEffect(() => {
    lage.current.masse = {
      anzahl: apps.length,
      groesse: GROESSE * mass,
      rand: RAND * mass,
      luecke: LUECKE * mass,
      trennAbstand: TRENNER * mass,
      reichweite: REICHWEITE * mass,
      trenner,
    };
  }, [apps.length, mass, trenner]);

  useEffect(() => {
    const z = lage.current;
    return () => cancelAnimationFrame(z.lauf);
  }, []);

  /** Schreibt die Größen des jetzigen Zustands an Icons und Schilder. */
  function anwenden() {
    const z = lage.current;
    const m = z.masse;
    if (!m) return;
    // Weich hinein und hinaus statt gleichmäßig
    const s = z.staerke * z.staerke * (3 - 2 * z.staerke);
    const ergebnis =
      z.zeiger === null || s === 0 ? null : vergroessern(z.zeiger, s, m);
    for (let i = 0; i < m.anzahl; i++) {
      const f = ergebnis ? ergebnis.faktoren[i] : 1;
      const breite = `${m.groesse * f}px`;
      const platz = plaetze.current[i];
      const knopf = knoepfe.current[i];
      const spalte = spalten.current[i];
      if (platz) platz.style.width = breite;
      if (knopf) knopf.style.transform = `scale(${f})`;
      if (spalte) {
        spalte.style.width = breite;
        // Um so viel ragt das Icon oben heraus, das Schild steht darüber
        spalte.style.setProperty("--mehr", `${m.groesse * (f - 1)}px`);
      }
    }
    const neu = z.ziel === 1 && ergebnis ? ergebnis.schild : null;
    if (neu !== z.schild) {
      z.schild = neu;
      setSchild(neu);
    }
  }

  function bild(jetzt: number) {
    const z = lage.current;
    const dauer = z.zuletzt ? jetzt - z.zuletzt : 16;
    z.zuletzt = jetzt;
    const schritt = dauer / EINBLENDEN;
    z.staerke =
      z.ziel > z.staerke
        ? Math.min(z.ziel, z.staerke + schritt)
        : Math.max(z.ziel, z.staerke - schritt);
    if (z.staerke === 0) z.zeiger = null;
    anwenden();
    z.lauf = z.staerke === z.ziel ? 0 : requestAnimationFrame(bild);
  }

  /** Zeichnet im nächsten Bild; mehrere Bewegungen davor zählen als eine. */
  function anstossen() {
    const z = lage.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cancelAnimationFrame(z.lauf);
      z.lauf = 0;
      z.staerke = z.ziel;
      anwenden();
      return;
    }
    if (z.lauf) return;
    z.zuletzt = 0;
    z.lauf = requestAnimationFrame(bild);
  }

  function bewegen(e: PointerEvent<HTMLUListElement>) {
    const el = rahmen.current;
    if (e.pointerType === "touch" || !el) return;
    const r = el.getBoundingClientRect();
    lage.current.zeiger = e.clientX - (r.left + r.width / 2);
    lage.current.ziel = 1;
    anstossen();
  }

  function verlassen() {
    // Schrumpft von der letzten Stelle aus, der Zeiger bleibt dafür stehen
    lage.current.ziel = 0;
    setGewaehlt(null);
    anstossen();
  }

  const offen = schild ?? gewaehlt;

  return (
    <div
      ref={rahmen}
      className="relative overflow-hidden rounded-[6px] px-4 pt-36 pb-4"
    >
      <Image
        src={hintergrund}
        alt=""
        fill
        sizes="(min-width: 768px) 768px, 100vw"
        placeholder="blur"
        className="object-cover object-[50%_35%]"
      />
      <ul
        onPointerMove={bewegen}
        onPointerLeave={verlassen}
        // Mittig auch dann, wenn die vergrößerte Leiste breiter als das Bild ist
        className={`relative left-1/2 flex w-max -translate-x-1/2 items-end ${GLAS}`}
        style={{
          gap: luecke,
          padding: `${rand}px ${rand}px 0`,
          borderRadius: 20 * mass,
        }}
      >
        {apps.map((app, i) => (
          <li
            key={app.name}
            ref={(el) => {
              plaetze.current[i] = el;
            }}
            className="relative"
            style={{
              width: groesse,
              marginLeft: i === trenner ? trennAbstand : 0,
            }}
            onFocus={() => setGewaehlt(i)}
            onBlur={() => setGewaehlt(null)}
          >
            <div className="relative flex flex-col items-center">
              {i === trenner && (
                <span
                  aria-hidden="true"
                  className="absolute w-px bg-white/45"
                  style={{
                    left: -(luecke + trennAbstand) / 2,
                    top: groesse * 0.1,
                    height: groesse * 0.8,
                  }}
                />
              )}
              <button
                ref={(el) => {
                  knoepfe.current[i] = el;
                }}
                type="button"
                onClick={() => setGewaehlt(i)}
                aria-label={`${app.name}: ${app.zweck}`}
                className="block origin-bottom rounded-[12px] outline-none active:brightness-90 focus-visible:ring-2 focus-visible:ring-white"
                style={{ width: groesse, height: groesse }}
              >
                <Image
                  src={app.icon}
                  alt=""
                  width={256}
                  height={256}
                  draggable={false}
                  className="size-full select-none"
                />
              </button>
              <span
                aria-hidden="true"
                className="flex justify-center"
                style={{ height: unten, paddingTop: 0.5 * mass }}
              >
                <span
                  className={`size-[5px] rounded-full ${app.laeuft ? "bg-white/75" : "bg-transparent"}`}
                />
              </span>
            </div>
          </li>
        ))}
      </ul>
      {/* Infoschilder in einer eigenen Ebene mit derselben Aufteilung wie das
          Dock: Innerhalb der Glasleiste könnte das Schild den Hintergrund
          nicht weichzeichnen. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 bottom-4"
      >
        <div
          className="relative left-1/2 flex w-max -translate-x-1/2 border border-transparent"
          style={{ gap: luecke, padding: `${rand}px ${rand}px 0` }}
        >
          {apps.map((app, i) => (
            <div
              key={app.name}
              ref={(el) => {
                spalten.current[i] = el;
              }}
              className="relative flex justify-center"
              style={{
                width: groesse,
                height: groesse + unten,
                marginLeft: i === trenner ? trennAbstand : 0,
              }}
            >
              {offen === i && (
                <span
                  className={`absolute bottom-[calc(100%+var(--mehr,0px)+10px)] w-max max-w-[16rem] rounded-[10px] px-3 py-1.5 text-center font-sans text-[0.78rem] leading-snug text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] ${GLAS}`}
                >
                  <span className="block font-semibold">{app.name}</span>
                  <span className="block text-white/90">{app.zweck}</span>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
