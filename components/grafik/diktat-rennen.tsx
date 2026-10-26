"use client";

import { useEffect, useRef, useState } from "react";
import { diktatBeispiel } from "@/content/arbeitsweise";

const TIPPEN_WPM = 55;
const SPRECHEN_WPM = 140;
/** Farben wie in der Grafik zur Eingabe: Grün gesprochen, Pink getippt. */
export const WISPR = "#005146";
export const TIPPEN = "#F5D6FF";
/** Die Animation läuft sechsmal schneller als die Wirklichkeit. */
const ZEITRAFFER = 6;

const getippt = diktatBeispiel.getippt;
const getipptWorte = getippt.split(" ").length;
const teile = diktatBeispiel.gesprochen.map((t) => ({
  ...t,
  worte: t.text.split(" "),
}));
const gesprochenWorte = teile.reduce((n, t) => n + t.worte.length, 0);

function sekunden(worte: number, wpm: number) {
  return (worte / wpm) * 60;
}

/** Wörter, vor denen der Cursor kurz stehen bleibt, als würde ich überlegen. */
const ZOEGERN = new Set(["KI-Einheit", "Website", "Konzept"]);

/**
 * Zeitpunkt jedes getippten Zeichens als Anteil der Gesamtdauer: schnelle
 * Anschläge mit leichtem Schwanken, längere Pausen nach Satzenden und
 * Kommas und vor einzelnen Wörtern. Fest berechnet, damit Server und Browser
 * dasselbe zeigen.
 */
const tippAnteile = (() => {
  const gewichte = [...getippt].map((_, i) => {
    const davor = getippt[i - 1];
    let g = 0.6 + ((i * 37) % 7) / 10;
    if (davor === "." || davor === "?") g += 34;
    else if (davor === ",") g += 12;
    if (davor === " " && ZOEGERN.has(getippt.slice(i).split(" ")[0])) g += 22;
    return g;
  });
  const summe = gewichte.reduce((a, b) => a + b, 0);
  let bisher = 0;
  return gewichte.map((g) => {
    bisher += g;
    return bisher / summe;
  });
})();

function Zeit({
  s,
  fertig,
  farbe,
}: {
  s: number;
  fertig: boolean;
  farbe?: string;
}) {
  return (
    <span
      className={`font-mono text-[0.75rem] tabular-nums ${fertig ? "font-bold text-ink" : "text-meta"}`}
      style={farbe ? { color: farbe } : undefined}
    >
      {s.toLocaleString("de-DE", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}{" "}
      s
    </span>
  );
}

/**
 * Derselbe Auftrag, einmal knapp getippt und einmal ausführlich gesprochen.
 * Ist der gesprochene Auftrag fertig, zeigt die Grafik, wie er gebaut ist.
 */
export function DiktatRennen({
  bereit = true,
  farbig = false,
}: {
  /** Erst wenn bereit, startet die Animation; vorher steht der fertige Text. */
  bereit?: boolean;
  /** „Getippt“ in Pink statt Schwarz. */
  farbig?: boolean;
} = {}) {
  const [verstrichen, setVerstrichen] = useState(0);
  const [lauf, setLauf] = useState(0);
  const rahmen = useRef<HTMLDivElement>(null);

  const zielGesprochen = sekunden(gesprochenWorte, SPRECHEN_WPM);
  const zielGetippt = sekunden(getipptWorte, TIPPEN_WPM);
  const dauer = Math.max(zielGesprochen, zielGetippt);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `lauf` startet die Animation neu
  useEffect(() => {
    if (!bereit) {
      setVerstrichen(dauer);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVerstrichen(dauer);
      return;
    }
    let start = 0;
    let anfrage = 0;
    const schritt = (zeit: number) => {
      if (!start) start = zeit;
      const s = ((zeit - start) / 1000) * ZEITRAFFER;
      setVerstrichen(Math.min(s, dauer));
      if (s < dauer) anfrage = requestAnimationFrame(schritt);
    };
    const beobachter = new IntersectionObserver(
      ([eintrag]) => {
        if (eintrag.isIntersecting) {
          beobachter.disconnect();
          setVerstrichen(0);
          anfrage = requestAnimationFrame(schritt);
        }
      },
      { threshold: 0.4 },
    );
    if (rahmen.current) beobachter.observe(rahmen.current);
    return () => {
      beobachter.disconnect();
      cancelAnimationFrame(anfrage);
    };
  }, [lauf, dauer, bereit]);

  const anteilGetippt = verstrichen / zielGetippt;
  let nGetippt = 0;
  while (nGetippt < getippt.length && tippAnteile[nGetippt] <= anteilGetippt)
    nGetippt++;
  // Steht der Cursor länger als einen Anschlag, blinkt er wie beim Überlegen
  const letzterAnschlag = nGetippt
    ? tippAnteile[nGetippt - 1] * zielGetippt
    : 0;
  const ueberlegt = verstrichen - letzterAnschlag > 0.8;
  const nGesprochen = Math.min(
    gesprochenWorte,
    Math.floor((verstrichen / zielGesprochen) * gesprochenWorte),
  );
  const fertig = nGesprochen === gesprochenWorte;

  // Worte des gesprochenen Auftrags auf die Teile verteilen
  let rest = nGesprochen;
  const sichtbar = teile.map((t) => {
    const n = Math.min(t.worte.length, rest);
    rest -= n;
    return n;
  });

  return (
    <div ref={rahmen}>
      <div className="border-t border-rule py-3">
        <div className="flex items-baseline justify-between gap-3 font-sans text-[0.78rem]">
          <span>
            <span
              className="font-bold text-ink"
              style={farbig ? { color: TIPPEN } : undefined}
            >
              Getippt
            </span>{" "}
            <span className="text-meta">· so sähe der Auftrag aus</span>
          </span>
          <Zeit
            s={Math.min(verstrichen, zielGetippt)}
            fertig={nGetippt === getippt.length}
            farbe={farbig ? TIPPEN : undefined}
          />
        </div>
        <p className="mt-1.5 font-body text-[1.05rem] leading-snug text-ink-2">
          {getippt.slice(0, nGetippt)}
          {nGetippt < getippt.length && (
            <span className={ueberlegt ? "animate-pulse" : ""}>▍</span>
          )}
        </p>
      </div>

      <div className="border-t border-rule py-3">
        <div className="flex items-baseline justify-between gap-3 font-sans text-[0.78rem]">
          <span>
            <span className="font-bold text-[#005146]">Gesprochen</span>{" "}
            <span className="text-meta">· so sieht er aus</span>
          </span>
          <Zeit
            s={Math.min(verstrichen, zielGesprochen)}
            fertig={fertig}
            farbe={WISPR}
          />
        </div>
        <p className="mt-1.5 min-h-[9em] font-body text-[1.05rem] leading-relaxed">
          {teile.map((t, i) =>
            sichtbar[i] > 0 ? (
              <span key={t.rolle}>
                {fertig && (
                  <sup className="mr-0.5 font-sans text-[0.62rem] font-bold text-[#005146]">
                    {i + 1}
                  </sup>
                )}
                <span
                  className={
                    fertig
                      ? "decoration-[#005146]/40 underline decoration-2 underline-offset-4"
                      : ""
                  }
                >
                  {t.worte.slice(0, sichtbar[i]).join(" ")}
                </span>{" "}
              </span>
            ) : null,
          )}
          {!fertig && <span className="animate-pulse">▍</span>}
        </p>
        <ol
          aria-label="So ist der gesprochene Auftrag gebaut"
          className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 font-sans text-[0.75rem] transition-opacity duration-500 ${fertig ? "opacity-100" : "opacity-0"}`}
        >
          {teile.map((t, i) => (
            <li key={t.rolle}>
              <span className="font-bold text-[#005146]">{i + 1}</span>{" "}
              <span className="text-ink-2">{t.rolle}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-rule pt-2 font-sans text-[0.72rem] text-meta">
        <span>
          Beispiel, nachgestellt. Angenommenes Tempo: getippt {TIPPEN_WPM},
          gesprochen {SPRECHEN_WPM} Wörter pro Minute; Darstellung im{" "}
          {ZEITRAFFER}-fachen Zeitraffer.
        </span>
        <button
          type="button"
          onClick={() => setLauf((n) => n + 1)}
          className="btn-quiet shrink-0 rounded-sm px-2 py-1 underline underline-offset-2"
        >
          Noch einmal
        </button>
      </div>
    </div>
  );
}
