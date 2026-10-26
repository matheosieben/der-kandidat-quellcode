"use client";

import {
  type KeyboardEvent,
  type ReactNode,
  type SyntheticEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { ausgabe } from "@/content/ausgabe";
import { interview } from "@/content/interview";
import { fragen, neuesGespraech, useGespraech } from "@/lib/ki/gespraech";
import { MODELLNAME } from "@/lib/ki/modell";
import { AntwortText } from "./antwort-text";

/*
 * Das Interview als Terminal, im Satz des Terminals aus der Werkstatt:
 * Fragen werden hinter dem Prompt getippt, die Maschine antwortet blau mit
 * ⏺ davor, wie in Claude Code. Die Vorschläge stehen als Auswahlmenü über
 * dem Prompt: ↑ ↓ wählen, Enter fragt, Tab übernimmt den Text in die Zeile.
 * Ohne Menü blättern ↑ ↓ wie in der Shell durch die eigenen Fragen.
 */

const PROMPT = "gast@der-kandidat ~ %";
export const SPINNER = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";
export const MASCHINE = "text-[#8aa4ff]";
/** Grundsatz beider Terminals in der Redaktion. */
export const TERMINAL =
  "h-full cursor-text overflow-y-auto px-4 py-3 font-terminal text-[12.5px] leading-[1.6] break-words whitespace-pre-wrap text-white/85 sm:px-5";

const BEFEHLE: [string, string][] = [
  ["hilfe", "zeigt diese Übersicht und die Vorschläge"],
  ["clear", "beginnt ein neues Gespräch"],
  ["↑ ↓", "wählt einen Vorschlag oder blättert durch Ihre Fragen"],
  ["Tab", "übernimmt den gewählten Vorschlag in die Zeile"],
  ["1–4", "stellt einen Vorschlag direkt"],
];

/** Taste oder Befehl, im Erklärkasten hervorgehoben. */
export function Taste({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-[3px] bg-white/[0.12] px-1 text-white">
      {children}
    </span>
  );
}

/**
 * Erklärkasten am Anfang eines Terminals, wie der Willkommenskasten von
 * Claude Code: Rahmen in Maschinenblau, ✻ und Titel, darunter die Anleitung.
 */
export function Einleitung({
  titel,
  children,
}: {
  titel: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-md border border-[#8aa4ff]/45 px-3.5 py-2.5 whitespace-normal">
      <h3 className="font-semibold text-white">
        <span aria-hidden="true" className={MASCHINE}>
          ✻{" "}
        </span>
        {titel}
      </h3>
      <div className="mt-1.5 space-y-1 text-white/75">{children}</div>
      <p className="mt-2 text-white/35">
        {ausgabe.titel} · {MODELLNAME}
      </p>
    </section>
  );
}

export function Prompt() {
  return (
    <span aria-hidden="true" className="text-white/50 select-none">
      {PROMPT}{" "}
    </span>
  );
}

/** Blockcursor wie im Terminal; ohne Fokus nur als Umriss. */
export function Block({
  zeichen,
  aktiv,
}: {
  zeichen?: string;
  aktiv: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={
        aktiv
          ? "cursor-blinken bg-white/80 text-[#1e1e1e]"
          : "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)]"
      }
    >
      {zeichen && zeichen !== " " ? zeichen : " "}
    </span>
  );
}

export function TerminalChat({
  kompakt = false,
  autoFokus = false,
}: {
  kompakt?: boolean;
  /** Im schwebenden Fenster steht der Cursor gleich in der Zeile. */
  autoFokus?: boolean;
}) {
  const feldId = useId();
  const { verlauf, laeuft, stoerung } = useGespraech();
  const [eingabe, setEingabe] = useState("");
  const [pos, setPos] = useState(0);
  const [wahl, setWahl] = useState(0);
  const [menue, setMenue] = useState(true);
  const [hilfe, setHilfe] = useState(false);
  const [blaettern, setBlaettern] = useState<number | null>(null);
  const [fokus, setFokus] = useState(false);
  const [takt, setTakt] = useState(0);
  const feld = useRef<HTMLInputElement>(null);
  const flaeche = useRef<HTMLDivElement>(null);
  /** Wer im Terminal gefragt hat, landet nach der Antwort wieder im Prompt. */
  const zurueck = useRef(false);

  const leer = verlauf.length === 0;
  const zeigeMenue = !laeuft && (leer || menue);
  const eigene = verlauf.filter((b) => b.rolle === "leser").map((b) => b.text);
  const wartet = laeuft && !verlauf.at(-1)?.text;

  // Spinner, solange die erste Zeile der Antwort fehlt
  useEffect(() => {
    if (!wartet) return;
    const t = setInterval(() => setTakt((x) => x + 1), 80);
    return () => clearInterval(t);
  }, [wartet]);

  // Immer bis zur Eingabezeile scrollen, nur im Fenster
  // biome-ignore lint/correctness/useExhaustiveDependencies: scrollt bei jeder neuen Zeile
  useEffect(() => {
    const el = flaeche.current;
    // Beim leeren Start bleibt der Erklärkasten oben im Bild
    if (el && (verlauf.length > 0 || hilfe)) el.scrollTop = el.scrollHeight;
  }, [verlauf, zeigeMenue, hilfe, stoerung]);

  function setze(text: string, cursor = text.length) {
    setEingabe(text);
    setPos(cursor);
    requestAnimationFrame(() =>
      feld.current?.setSelectionRange(cursor, cursor),
    );
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: nur beim Öffnen
  useEffect(() => {
    if (autoFokus) feld.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (laeuft || !zurueck.current) return;
    zurueck.current = false;
    feld.current?.focus({ preventScroll: true });
  }, [laeuft]);

  function stellen(frage: string) {
    zurueck.current = document.activeElement === feld.current;
    fragen(frage);
    setMenue(false);
    setHilfe(false);
    setBlaettern(null);
    setze("");
  }

  function ausfuehren() {
    const text = eingabe.trim();
    const befehl = text.toLowerCase();
    if (!text) {
      if (zeigeMenue) stellen(interview.vorschlaege[wahl][1]);
      return;
    }
    if (befehl === "clear" || befehl === "neu") {
      neuesGespraech();
      setMenue(true);
      setHilfe(false);
      setze("");
    } else if (["hilfe", "help", "?"].includes(befehl)) {
      setMenue(true);
      setHilfe(true);
      setze("");
    } else if (zeigeMenue && /^[1-4]$/.test(text)) {
      stellen(interview.vorschlaege[Number(text) - 1][1]);
    } else stellen(text);
  }

  function taste(e: KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing) return;
    const n = interview.vorschlaege.length;
    if (e.key === "Enter") {
      e.preventDefault();
      if (!laeuft) ausfuehren();
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      neuesGespraech();
      setMenue(true);
    } else if (e.key === "Escape") {
      setMenue(false);
      setHilfe(false);
    } else if (e.key === "Tab" && zeigeMenue) {
      e.preventDefault();
      setze(interview.vorschlaege[wahl][1]);
    } else if (
      (e.key === "ArrowUp" || e.key === "ArrowDown") &&
      zeigeMenue &&
      !eingabe
    ) {
      e.preventDefault();
      setWahl((w) => (w + (e.key === "ArrowUp" ? -1 : 1) + n) % n);
    } else if (e.key === "ArrowUp" && eigene.length > 0) {
      e.preventDefault();
      const i =
        blaettern === null ? eigene.length - 1 : Math.max(0, blaettern - 1);
      setBlaettern(i);
      setze(eigene[i]);
    } else if (e.key === "ArrowDown" && blaettern !== null) {
      e.preventDefault();
      const i = blaettern + 1;
      setBlaettern(i < eigene.length ? i : null);
      setze(i < eigene.length ? eigene[i] : "");
    }
  }

  function merken(e: SyntheticEvent<HTMLInputElement>) {
    setPos(e.currentTarget.selectionStart ?? e.currentTarget.value.length);
  }

  /** Ein Klick ins Terminal setzt den Fokus in die Zeile, außer beim Markieren. */
  function hinein() {
    if (window.getSelection()?.isCollapsed !== false) feld.current?.focus();
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Die Tastatur wirkt über das Eingabefeld
    // biome-ignore lint/a11y/noStaticElementInteractions: siehe oben
    <div ref={flaeche} onClick={hinein} className={TERMINAL}>
      {kompakt ? (
        <div className="whitespace-normal">
          <h3 className="font-semibold text-white">
            <span aria-hidden="true" className={MASCHINE}>
              ✻{" "}
            </span>
            Fragen an mich
          </h3>
          <p className="mt-1 text-white/65">
            Eine Maschine antwortet aus dieser Ausgabe, mit Fundstellen.
          </p>
        </div>
      ) : (
        <Einleitung titel={`Interview mit ${ausgabe.autor}`}>
          <p>
            Hier antwortet eine Maschine für mich. Sie kennt diese Ausgabe und
            einige Hintergründe über mich und nennt zu jeder Antwort die
            Fundstelle.
          </p>
          <p>
            Tippen Sie Ihre Frage und drücken Sie <Taste>Enter</Taste> oder
            wählen Sie unten einen Vorschlag. <Taste>hilfe</Taste> zeigt alle
            Befehle.
          </p>
        </Einleitung>
      )}

      <div aria-live="polite" aria-busy={laeuft}>
        {verlauf.map((b, i) =>
          b.rolle === "leser" ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: Gesprächsverlauf wächst nur
            <p key={i} className="mt-4">
              <Prompt />
              <span className="text-white">{b.text}</span>
            </p>
          ) : b.text ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: Gesprächsverlauf wächst nur
            <p key={i} className={`mt-1.5 flex gap-2 ${MASCHINE}`}>
              <span aria-hidden="true">⏺</span>
              <span className="min-w-0">
                <span className="sr-only">Redaktion: </span>
                <AntwortText text={b.text} form="terminal" />
                {laeuft && i === verlauf.length - 1 && (
                  <span aria-hidden="true">▍</span>
                )}
              </span>
            </p>
          ) : null,
        )}
        {wartet && (
          <p className={`mt-1.5 ${MASCHINE}`}>
            <span aria-hidden="true">{SPINNER[takt % SPINNER.length]} </span>
            Die Redaktion liest im Archiv …
          </p>
        )}
        {stoerung && (
          <p className="mt-1.5 text-[#ff7b72]">
            redaktion: {stoerung.meldung}
            {stoerung.offline && (
              <>
                {" "}
                Schreiben Sie mir:{" "}
                <a href={`mailto:${ausgabe.mail}`} className="underline">
                  {ausgabe.mail}
                </a>
              </>
            )}
          </p>
        )}
      </div>

      {hilfe && (
        <div className="mt-4">
          <p className="text-white/50">Befehle</p>
          {BEFEHLE.map(([name, text]) => (
            <p key={name}>
              {"  "}
              <span className="inline-block w-[7ch] text-white">{name}</span>
              <span className="text-white/55">{text}</span>
            </p>
          ))}
        </div>
      )}

      {zeigeMenue && (
        <div className="mt-4">
          <p className="text-white/50">
            {kompakt
              ? "Frage wählen oder selbst tippen:"
              : "Vorschläge · ↑↓ wählen · Enter fragen · Tab übernehmen"}
          </p>
          <ul>
            {interview.vorschlaege.map(([thema, frage], i) => (
              <li key={frage}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    stellen(frage);
                  }}
                  onMouseEnter={() => setWahl(i)}
                  data-cursor-ziel
                  className={`btn-terminal w-full text-left ${i === wahl ? "text-white" : "text-white/55"}`}
                >
                  <span
                    className={i === wahl ? MASCHINE : ""}
                    aria-hidden="true"
                  >
                    {i === wahl ? "❯" : " "}
                  </span>{" "}
                  {i + 1}. {frage}{" "}
                  <span className="hidden text-white/30 @lg:inline">
                    {thema}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!laeuft && (
        <div className="relative mt-4">
          <p aria-hidden="true">
            <Prompt />
            <span className="text-white">{eingabe.slice(0, pos)}</span>
            <Block zeichen={eingabe[pos]} aktiv={fokus} />
            <span className="text-white">{eingabe.slice(pos + 1)}</span>
          </p>
          <label htmlFor={feldId} className="sr-only">
            Ihre Frage an die Redaktion
          </label>
          <input
            id={feldId}
            ref={feld}
            value={eingabe}
            onChange={(e) => {
              setEingabe(e.target.value);
              setBlaettern(null);
              merken(e);
            }}
            onSelect={merken}
            onKeyDown={taste}
            onFocus={() => setFokus(true)}
            onBlur={() => setFokus(false)}
            maxLength={500}
            data-interview-eingabe={kompakt ? undefined : ""}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="absolute inset-0 w-full cursor-text bg-transparent text-[16px] text-transparent caret-transparent opacity-0 outline-none!"
          />
        </div>
      )}
    </div>
  );
}
