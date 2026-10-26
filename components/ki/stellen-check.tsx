"use client";

import {
  type KeyboardEvent,
  type SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { ablegen, neueId } from "@/lib/ki/ablage";
import { frageRedaktion } from "@/lib/ki/lesen";
import { AntwortText } from "./antwort-text";
import {
  Block,
  Einleitung,
  MASCHINE,
  Prompt,
  SPINNER,
  Taste,
  TERMINAL,
} from "./terminal-chat";

/*
 * Der Fit Check als Terminal, im selben Satz wie das Interview. Die Anzeige
 * wird wie ein Heredoc eingegeben (fitcheck <<ANZEIGE, jede Zeile mit „>“),
 * ⌘↩ prüft. Das Gutachten erscheint als Ausgabe mit Passungsbalken, danach
 * fragt ein Menü, wie es weitergeht.
 */

const BEISPIEL = `AI Engineer (m/w/d) – Beispielanzeige, fiktiv

Du entwickelst KI-Funktionen für journalistische Produkte mit Millionen Nutzerinnen und Nutzern. Du baust Prototypen mit großen Sprachmodellen, bringst sie gemeinsam mit Redaktion und Produktteam in den Betrieb und misst, ob sie wirken.

Das bringst du mit:
– Erfahrung mit LLM-APIs, Retrieval und Evaluation
– sicherer Umgang mit TypeScript oder Python
– Produktgespür und Freude an schneller Iteration
– Verständnis für Qualität, Quellen und Vertrauen im Journalismus
– abgeschlossenes Studium der Informatik oder vergleichbare Erfahrung`;

const MINDESTENS = 150;

/** Die drei Stufen der Passung, aufsteigend, mit Füllung des Balkens. */
const STUFEN = [
  ["hoch, mit Lernkurve", "text-[#a6e22e]", 12],
  ["hoch", "text-[#32d74b]", 15],
  ["sehr hoch", "text-[#32d74b]", 18],
] as const;
const BALKEN = 18;

const MENUE = ["Neue Anzeige prüfen", "Anzeige bearbeiten"] as const;

type Gutachten = {
  passung?: string;
  dafuer: string[];
  lernfelder: string[];
  fragen: string[];
  keine?: string;
};

function zerlege(text: string): Gutachten {
  const g: Gutachten = { dafuer: [], lernfelder: [], fragen: [] };
  let liste: string[] | null = null;
  for (const zeile of text.split("\n").map((z) => z.trim())) {
    if (!zeile) continue;
    if (zeile.startsWith("KEINE STELLENANZEIGE:"))
      g.keine = zeile.slice(21).trim();
    else if (zeile.startsWith("PASSUNG:")) g.passung = zeile.slice(8).trim();
    else if (zeile.startsWith("DAFÜR")) liste = g.dafuer;
    else if (zeile.startsWith("LERNFELDER")) liste = g.lernfelder;
    else if (zeile.startsWith("FRAGEN")) liste = g.fragen;
    else if (liste) liste.push(zeile.replace(/^[-–•]\s*/, ""));
  }
  return g;
}

/** Die erste Zeile der Anzeige, gekürzt: Name des Eintrags in der Ablage. */
function anzeigeTitel(stelle: string) {
  const zeile = stelle.trim().split("\n")[0] ?? "";
  return zeile.length > 70 ? `${zeile.slice(0, 69)}…` : zeile;
}

/** Passung als Balken aus Blockzeichen. */
function Passung({ stufe }: { stufe?: string }) {
  const i = STUFEN.findIndex(([name]) => stufe === name.toLowerCase());
  const voll = i < 0 ? 0 : STUFEN[i][2];
  return (
    <p>
      <span className="text-white/50">Passung </span>
      <span className={i < 0 ? "" : STUFEN[i][1]} aria-hidden="true">
        {"█".repeat(voll)}
      </span>
      <span className="text-white/15" aria-hidden="true">
        {"░".repeat(BALKEN - voll)}
      </span>
      <span className={`ml-2 ${i < 0 ? "text-white/40" : STUFEN[i][1]}`}>
        {i < 0 ? "…" : STUFEN[i][0]}
      </span>
    </p>
  );
}

function Liste({
  titel,
  zeichen,
  punkte,
}: {
  titel: string;
  /** Vorzeichen vor jedem Punkt; ohne Angabe wird nummeriert. */
  zeichen?: string;
  punkte: string[];
}) {
  if (punkte.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-white/50">{titel}</p>
      <ul>
        {punkte.map((p, i) => (
          <li key={p} className="flex gap-2">
            <span aria-hidden="true" className="shrink-0 text-white/40">
              {zeichen ?? `${i + 1}.`}
            </span>
            <span className="min-w-0">
              <AntwortText text={p} form="terminal" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Eine „vorlage“ aus der Ablage öffnet ein früheres Gutachten; unter „id“
 * wird das Gutachten abgelegt.
 */
export function StellenCheck({
  id: vorgabeId,
  vorlage,
}: {
  id: string;
  vorlage?: { stelle: string; antwort: string };
}) {
  const [stelle, setStelle] = useState(vorlage?.stelle ?? "");
  const [pos, setPos] = useState(stelle.length);
  const [antwort, setAntwort] = useState(vorlage?.antwort ?? "");
  const [laeuft, setLaeuft] = useState(false);
  const [stoerung, setStoerung] = useState<string | null>(null);
  const [hinweis, setHinweis] = useState<string | null>(null);
  const [ergebnis, setErgebnis] = useState(Boolean(vorlage));
  const [wahl, setWahl] = useState(0);
  const [fokus, setFokus] = useState(false);
  const [takt, setTakt] = useState(0);
  const abbruch = useRef<AbortController | null>(null);
  const id = useRef(vorgabeId);
  const feld = useRef<HTMLTextAreaElement>(null);
  const menuefeld = useRef<HTMLInputElement>(null);
  const flaeche = useRef<HTMLDivElement>(null);
  const zurueck = useRef(false);

  useEffect(() => () => abbruch.current?.abort(), []);

  const wartet = laeuft && !antwort;
  useEffect(() => {
    if (!wartet) return;
    const t = setInterval(() => setTakt((x) => x + 1), 80);
    return () => clearInterval(t);
  }, [wartet]);

  // Nach dem Gutachten landet der Fokus im Menü, beim Bearbeiten in der Anzeige.
  useEffect(() => {
    if (laeuft || !zurueck.current) return;
    zurueck.current = false;
    (ergebnis ? menuefeld : feld).current?.focus({ preventScroll: true });
  }, [laeuft, ergebnis]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scrollt bei jeder neuen Ausgabe
  useEffect(() => {
    const el = flaeche.current;
    if (el && (ergebnis || (stelle && pos === stelle.length)))
      el.scrollTop = el.scrollHeight;
  }, [antwort, ergebnis, stelle, hinweis, stoerung]);

  async function pruefen() {
    if (laeuft) return;
    if (stelle.trim().length < MINDESTENS) {
      setHinweis(
        `fitcheck: Die Anzeige ist zu kurz (${stelle.trim().length} von mindestens ${MINDESTENS} Zeichen).`,
      );
      return;
    }
    zurueck.current = true;
    abbruch.current?.abort();
    const steuerung = new AbortController();
    abbruch.current = steuerung;
    setAntwort("");
    setStoerung(null);
    setHinweis(null);
    setWahl(0);
    setLaeuft(true);
    setErgebnis(true);
    let text = "";
    const ende = await frageRedaktion(
      { modus: "stelle", text: stelle },
      (t) => {
        text = t;
        setAntwort(t);
      },
      steuerung.signal,
    );
    if (steuerung.signal.aborted) return;
    if (!ende.ok) setStoerung(ende.meldung);
    else if (text) {
      id.current ||= neueId();
      ablegen({
        id: id.current,
        art: "fit-check",
        titel: anzeigeTitel(stelle),
        stelle,
        antwort: text,
      });
    }
    setLaeuft(false);
  }

  function setze(text: string) {
    setStelle(text);
    setPos(text.length);
    setHinweis(null);
    requestAnimationFrame(() =>
      feld.current?.setSelectionRange(text.length, text.length),
    );
  }

  function weiter(i: number) {
    zurueck.current = true;
    if (i === 0) {
      id.current = neueId();
      setAntwort("");
      setze("");
    }
    setStoerung(null);
    setErgebnis(false);
    // Beim Bearbeiten steht der Cursor am Ende der Anzeige.
    requestAnimationFrame(() => {
      const el = feld.current;
      if (!el) return;
      el.focus({ preventScroll: true });
      el.setSelectionRange(el.value.length, el.value.length);
      setPos(el.value.length);
    });
  }

  function tasteAnzeige(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      pruefen();
    } else if (e.key === "Tab" && !stelle) {
      e.preventDefault();
      setze(BEISPIEL);
    }
  }

  function tasteMenue(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      setWahl((w) => (w + 1) % MENUE.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      weiter(wahl);
    } else if (/^[12]$/.test(e.key)) {
      e.preventDefault();
      weiter(Number(e.key) - 1);
    }
  }

  function merken(e: SyntheticEvent<HTMLTextAreaElement>) {
    setPos(e.currentTarget.selectionStart ?? e.currentTarget.value.length);
  }

  function hinein() {
    if (window.getSelection()?.isCollapsed === false) return;
    (ergebnis ? menuefeld : feld).current?.focus({ preventScroll: true });
  }

  const g = zerlege(antwort);
  // Erst mit dem Gedankenstrich steht die Stufe fest: „hoch“ kann noch „hoch, mit Lernkurve“ werden.
  const stufe =
    g.passung && (!laeuft || /\s[–-]\s/.test(g.passung))
      ? g.passung.split(/\s[–-]\s/)[0]?.toLowerCase()
      : undefined;
  const begruendung = g.passung
    ?.split(/\s[–-]\s/)
    .slice(1)
    .join(" – ");

  // Die Anzeige Zeile für Zeile mit „>“ davor, der Cursor an seiner Stelle
  let anfang = 0;
  const zeilen = stelle.split("\n").map((zeile, i) => {
    const ende = anfang + zeile.length;
    const hier = pos >= anfang && pos <= ende;
    const spalte = pos - anfang;
    anfang = ende + 1;
    return (
      // biome-ignore lint/suspicious/noArrayIndexKey: Zeilen haben keine eigene Kennung
      <p key={i} className="flex">
        <span className="shrink-0 text-white/40 select-none">{"> "}</span>
        <span className="min-w-0">
          {hier ? (
            <>
              {zeile.slice(0, spalte)}
              <Block zeichen={zeile[spalte]} aktiv={fokus} />
              {zeile.slice(spalte + 1)}
            </>
          ) : (
            zeile
          )}
        </span>
      </p>
    );
  });

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Die Tastatur wirkt über die Eingabefelder
    // biome-ignore lint/a11y/noStaticElementInteractions: siehe oben
    <div ref={flaeche} onClick={hinein} className={TERMINAL}>
      <Einleitung titel="Fit Check: Passe ich zu Ihrer Stelle?">
        <p>
          Fügen Sie eine Stellenanzeige ein. Die Maschine legt sie neben diese
          Ausgabe, zeigt, was belegt ist und wo ich noch dazulerne, und schlägt
          drei Fragen für das Gespräch vor.
        </p>
        <p>
          <Taste>⌘V</Taste> fügt ein, <Taste>⌘↩</Taste> prüft. Ohne Anzeige zur
          Hand? <Taste>Tab</Taste> setzt ein Beispiel ein. Bitte keine
          personenbezogenen Daten.
        </p>
      </Einleitung>

      {!ergebnis ? (
        <>
          <p className="mt-4">
            <Prompt />
            <span className="text-white">fitcheck {"<<"}ANZEIGE</span>
          </p>
          <div className="relative">
            <div aria-hidden="true" className="text-white">
              {zeilen}
            </div>
            <label htmlFor="stelle" className="sr-only">
              Ihre Stellenanzeige
            </label>
            <textarea
              id="stelle"
              ref={feld}
              value={stelle}
              onChange={(e) => {
                setStelle(e.target.value);
                setHinweis(null);
                merken(e);
              }}
              onSelect={merken}
              onKeyDown={tasteAnzeige}
              onFocus={() => setFokus(true)}
              onBlur={() => setFokus(false)}
              maxLength={8000}
              spellCheck={false}
              className="absolute inset-0 h-full w-full resize-none bg-transparent text-[16px] text-transparent caret-transparent opacity-0 outline-none!"
            />
          </div>
          {hinweis && <p className="mt-2 text-[#ff7b72]">{hinweis}</p>}
          <p className="mt-3 flex flex-wrap gap-x-4 text-white/40">
            <span className="tabular-nums">
              {stelle.length.toLocaleString("de-DE")} / 8.000 Zeichen
            </span>
            {!stelle && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setze(BEISPIEL);
                  feld.current?.focus({ preventScroll: true });
                }}
                className="text-white/70 underline decoration-white/30 underline-offset-[3px] hover:text-white"
              >
                Beispiel einsetzen
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                pruefen();
              }}
              className="text-white/70 underline decoration-white/30 underline-offset-[3px] hover:text-white"
            >
              Prüfen
            </button>
          </p>
        </>
      ) : (
        <div aria-live="polite" aria-busy={laeuft}>
          <p className="mt-4">
            <Prompt />
            <span className="text-white">
              fitcheck „{anzeigeTitel(stelle)}“
            </span>
          </p>
          <div className={`mt-1.5 ${MASCHINE}`}>
            {wartet && (
              <p>
                <span aria-hidden="true">
                  {SPINNER[takt % SPINNER.length]}{" "}
                </span>
                Die Maschine liest die Anzeige und das Archiv …
              </p>
            )}
            {stoerung && <p className="text-[#ff7b72]">fitcheck: {stoerung}</p>}
            {g.keine && (
              <p className="flex gap-2">
                <span aria-hidden="true">⏺</span>
                {g.keine}
              </p>
            )}
            {antwort && !g.keine && (
              <div className="flex gap-2">
                <span aria-hidden="true">⏺</span>
                <div className="min-w-0 flex-1">
                  <Passung stufe={stufe} />
                  {begruendung && <p className="mt-1">{begruendung}</p>}
                  <Liste titel="Dafür" zeichen="+" punkte={g.dafuer} />
                  <Liste titel="Lernfelder" zeichen="→" punkte={g.lernfelder} />
                  <Liste titel="Fragen fürs Gespräch" punkte={g.fragen} />
                  {laeuft && <span aria-hidden="true">▍</span>}
                </div>
              </div>
            )}
          </div>

          {!laeuft && (
            <>
              <div className="mt-4">
                <p className="text-white/50">Weiter · ↑↓ wählen · Enter</p>
                <ul>
                  {MENUE.map((name, i) => (
                    <li key={name}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          weiter(i);
                        }}
                        onMouseEnter={() => setWahl(i)}
                        className={`btn-terminal w-full text-left ${i === wahl ? "text-white" : "text-white/55"}`}
                      >
                        <span
                          className={i === wahl ? MASCHINE : ""}
                          aria-hidden="true"
                        >
                          {i === wahl ? "❯" : " "}
                        </span>{" "}
                        {i + 1}. {name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative mt-4">
                <p aria-hidden="true">
                  <Prompt />
                  <Block aktiv={fokus} />
                </p>
                <label htmlFor="fit-weiter" className="sr-only">
                  Weiter: {MENUE.join(" oder ")}
                </label>
                <input
                  id="fit-weiter"
                  ref={menuefeld}
                  value=""
                  onChange={() => {}}
                  onKeyDown={tasteMenue}
                  onFocus={() => setFokus(true)}
                  onBlur={() => setFokus(false)}
                  autoComplete="off"
                  className="absolute inset-0 w-full cursor-text bg-transparent text-[16px] text-transparent caret-transparent opacity-0 outline-none!"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
