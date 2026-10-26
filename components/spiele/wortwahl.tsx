"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  auswerten,
  type Feld,
  heute,
  RUNDEN,
  tagesraetsel,
} from "@/lib/wortwahl";
import { konfetti } from "./konfetti";

const VERSUCHE = 6;
const TASTEN = ["QWERTZUIOP", "ASDFGHJKL", "↵YXCVBNM⌫"];
const RANG: Record<Feld, number> = { falsch: 0, enthalten: 1, richtig: 2 };

type Stand = { versuche: string[]; status: "laeuft" | "gewonnen" | "verloren" };

const LEER: Stand = { versuche: [], status: "laeuft" };

/** Ein Spielstand je Tag und Runde. */
const schluessel = (datum: string, runde: number) =>
  `wortwahl-${datum}-${runde + 1}`;

function lade(datum: string, runde: number): Stand | null {
  try {
    const roh = localStorage.getItem(schluessel(datum, runde));
    const s = roh ? (JSON.parse(roh) as Stand) : null;
    return s && Array.isArray(s.versuche) ? s : null;
  } catch {
    return null;
  }
}

function speichere(datum: string, runde: number, s: Stand) {
  try {
    localStorage.setItem(schluessel(datum, runde), JSON.stringify(s));
  } catch {
    // Ohne Speicher geht der Stand beim Neuladen verloren, das Spiel läuft trotzdem.
  }
}

const feldFarbe: Record<Feld, string> = {
  richtig: "bg-[var(--wort-richtig)] border-[var(--wort-richtig)] text-white",
  enthalten:
    "bg-[var(--wort-enthalten)] border-[var(--wort-enthalten)] text-white",
  falsch: "bg-[var(--wort-falsch)] border-[var(--wort-falsch)] text-white",
};

export function Wortwahl() {
  const [datum, setDatum] = useState<string | null>(null);
  const [staende, setStaende] = useState<Stand[]>(() =>
    Array.from({ length: RUNDEN }, () => LEER),
  );
  const [runde, setRunde] = useState(0);
  const stand = staende[runde];
  const [eingabe, setEingabe] = useState("");
  const [meldung, setMeldung] = useState<string | null>(null);
  const [hinweis, setHinweis] = useState(false);
  const brett = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = heute();
    setDatum(d);
    const geladen = Array.from(
      { length: RUNDEN },
      (_, r) => lade(d, r) ?? LEER,
    );
    setStaende(geladen);
    // Weiter beim ersten Rätsel, das noch offen ist
    const offen = geladen.findIndex((s) => s.status === "laeuft");
    setRunde(offen === -1 ? 0 : offen);
  }, []);

  const wechsle = (r: number) => {
    setRunde(r);
    setEingabe("");
    setMeldung(null);
    setHinweis(false);
  };
  const naechstes = staende.findIndex(
    (s, r) => r !== runde && s.status === "laeuft",
  );

  const raetsel = datum ? tagesraetsel(datum, runde) : null;

  const tippe = useCallback(
    (taste: string) => {
      if (!raetsel || stand.status !== "laeuft") return;
      setMeldung(null);
      if (taste === "⌫") return setEingabe((e) => e.slice(0, -1));
      if (taste === "↵") {
        if (eingabe.length < 5) return setMeldung("Fünf Buchstaben, bitte.");
        const versuche = [...stand.versuche, eingabe];
        const status =
          eingabe === raetsel.wort
            ? "gewonnen"
            : versuche.length >= VERSUCHE
              ? "verloren"
              : "laeuft";
        const neu: Stand = { versuche, status };
        setStaende((alt) => alt.map((s, r) => (r === runde ? neu : s)));
        setEingabe("");
        if (datum) speichere(datum, runde, neu);
        if (status === "gewonnen") konfetti();
        return;
      }
      if (/^[A-Z]$/.test(taste))
        setEingabe((e) => (e.length < 5 ? e + taste : e));
    },
    [raetsel, stand, eingabe, datum, runde],
  );

  // Echte Tastatur: aktiv, solange das Brett sichtbar ist und kein Eingabefeld den Fokus hat.
  const sichtbar = useRef(false);
  useEffect(() => {
    const el = brett.current;
    if (!el) return;
    const beobachter = new IntersectionObserver(
      ([e]) => {
        sichtbar.current = e.isIntersecting;
      },
      { threshold: 0.4 },
    );
    beobachter.observe(el);
    return () => beobachter.disconnect();
  }, []);

  useEffect(() => {
    function taste(e: KeyboardEvent) {
      if (!sichtbar.current || e.metaKey || e.ctrlKey || e.altKey) return;
      const ziel = e.target as HTMLElement | null;
      if (ziel?.closest("input, textarea, select, [contenteditable='true']"))
        return;
      const k = e.key;
      if (k === "Enter") tippe("↵");
      else if (k === "Backspace") tippe("⌫");
      else if (/^[a-zA-Z]$/.test(k)) tippe(k.toUpperCase());
      else return;
      e.preventDefault();
    }
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, [tippe]);

  // Bester bekannter Status je Buchstabe, für die Tastaturfarben.
  const bekannt = new Map<string, Feld>();
  if (raetsel) {
    for (const v of stand.versuche) {
      auswerten(v, raetsel.wort).forEach((f, i) => {
        const alt = bekannt.get(v[i]);
        if (!alt || RANG[f] > RANG[alt]) bekannt.set(v[i], f);
      });
    }
  }

  const zeigeHinweis =
    hinweis || stand.versuche.length >= 3 || stand.status !== "laeuft";

  return (
    <div ref={brett} className="mx-auto max-w-[23rem]">
      <div
        role="tablist"
        aria-label="Rätsel des Tages"
        className="mb-3 flex justify-center gap-2 font-sans text-[0.8rem]"
      >
        {staende.map((s, r) => (
          <button
            // biome-ignore lint/suspicious/noArrayIndexKey: feste Runden
            key={r}
            type="button"
            role="tab"
            aria-selected={r === runde}
            onClick={() => wechsle(r)}
            className={`btn-quiet rounded-full border px-3 py-1 font-semibold ${
              r === runde
                ? "border-ink bg-ink text-paper"
                : "border-rule text-ink hover:border-ink"
            }`}
          >
            Rätsel {r + 1}
            {s.status === "gewonnen" && " ✓"}
            {s.status === "verloren" && " ✗"}
          </button>
        ))}
      </div>
      <div className="grid gap-1.5" aria-live="polite">
        {Array.from({ length: VERSUCHE }, (_, zeile) => {
          const versuch = stand.versuche[zeile];
          const aktiv =
            zeile === stand.versuche.length && stand.status === "laeuft";
          const buchstaben = versuch ?? (aktiv ? eingabe : "");
          const felder =
            versuch && raetsel ? auswerten(versuch, raetsel.wort) : null;
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: feste Zeilen
            <div key={zeile} className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: feste Felder
                  key={i}
                  className={`grid aspect-square place-items-center border-2 font-sans text-[1.6rem] font-bold uppercase ${
                    felder
                      ? feldFarbe[felder[i]]
                      : buchstaben[i]
                        ? "border-ink-2 text-ink"
                        : "border-rule text-ink"
                  }`}
                >
                  {buchstaben[i] ?? ""}
                </span>
              ))}
            </div>
          );
        })}
      </div>

      <div className="mt-3 min-h-[3rem] text-center font-sans text-[0.85rem]">
        {meldung && <p className="font-semibold">{meldung}</p>}
        {stand.status === "gewonnen" && raetsel && (
          <p>
            <strong>Richtig: {raetsel.wort}.</strong> {stand.versuche.length}{" "}
            von {VERSUCHE} Versuchen.{" "}
            {naechstes !== -1 && (
              <button
                type="button"
                onClick={() => wechsle(naechstes)}
                className="btn-quiet underline"
              >
                Nächstes Rätsel
              </button>
            )}
          </p>
        )}
        {stand.status === "verloren" && raetsel && (
          <p>
            Die Lösung war <strong>{raetsel.wort}</strong>.{" "}
            {naechstes !== -1 ? (
              <button
                type="button"
                onClick={() => wechsle(naechstes)}
                className="btn-quiet underline"
              >
                Nächstes Rätsel
              </button>
            ) : (
              "Morgen gibt es drei neue Wörter."
            )}
          </p>
        )}
        {raetsel && stand.status === "laeuft" && !meldung && (
          <p className="text-meta">
            {zeigeHinweis ? (
              <>Hinweis: {raetsel.hinweis}</>
            ) : (
              <button
                type="button"
                onClick={() => setHinweis(true)}
                className="btn-quiet underline"
              >
                Hinweis zeigen
              </button>
            )}
          </p>
        )}
      </div>

      <div className="mt-2 grid gap-1.5">
        {TASTEN.map((reihe) => (
          <div key={reihe} className="flex justify-center gap-1">
            {[...reihe].map((t) => {
              const f = bekannt.get(t);
              const breit = t === "↵" || t === "⌫";
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => tippe(t)}
                  aria-label={t === "↵" ? "Eingabe" : t === "⌫" ? "Löschen" : t}
                  className={`h-12 rounded-[3px] font-sans text-[0.85rem] font-bold hover:brightness-95 active:brightness-90 ${breit ? "flex-[1.5] px-1" : "flex-1"} ${
                    f ? feldFarbe[f] : "bg-paper-2 text-ink hover:bg-rule"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
