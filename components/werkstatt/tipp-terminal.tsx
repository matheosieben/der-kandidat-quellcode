"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { InteraktionsHinweis } from "@/components/werkstatt/interaktions-hinweis";
import { TerminalFenster } from "@/components/werkstatt/terminal-zeile";
import { modelle } from "@/content/werkstatt";

const BEFEHL = modelle.befehl;
const SPINNER = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";
const SPIN_SCHRITTE = 22;

/** Was npm nach der Installation ausgibt, Zeile für Zeile. */
const AUSGABE = [
  "",
  "added 3 packages in 4s",
  "",
  "2 packages are looking for funding",
  "  run `npm fund` for details",
];

type Phase = "wartet" | "tippt" | "bereit" | "installiert" | "fertig";

export function Cursor() {
  return (
    <span
      aria-hidden="true"
      className="cursor-blinken ml-px inline-block h-[1.05em] w-[0.55em] translate-y-[0.15em] bg-white/75"
    />
  );
}

export function Prompt({ children }: { children?: ReactNode }) {
  return (
    <>
      <span aria-hidden="true" className="text-white/45">
        ${" "}
      </span>
      {children}
    </>
  );
}

/**
 * Der Befehl tippt sich selbst, sobald das Fenster ins Bild kommt, und
 * wartet dann mit blinkendem Cursor. Mit Enter, einem Klick oder Tippen
 * läuft die Installation ab, nachgestellt nach der Ausgabe von npm. Wer
 * weniger Bewegung eingestellt hat, sieht den Befehl sofort und die
 * Ausgabe ohne Verzögerung.
 */
export function TippTerminal() {
  const rahmen = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("wartet");
  const [n, setN] = useState(0);
  const [spinner, setSpinner] = useState(0);
  const [zeilen, setZeilen] = useState(0);
  const [ruhig, setRuhig] = useState(false);
  const imBild = useRef(false);

  // Erst tippen, wenn das Fenster zu sehen ist
  useEffect(() => {
    const weniger = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setRuhig(weniger);
    if (weniger) {
      setN(BEFEHL.length);
      setPhase("bereit");
    }
    const el = rahmen.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        imBild.current = e.isIntersecting;
        if (e.isIntersecting) setPhase((p) => (p === "wartet" ? "tippt" : p));
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (phase !== "tippt") return;
    if (n >= BEFEHL.length) {
      setPhase("bereit");
      return;
    }
    const t = setTimeout(() => setN((x) => x + 1), n === 0 ? 600 : 42);
    return () => clearTimeout(t);
  }, [phase, n]);

  const ausfuehren = useCallback(() => {
    setPhase((p) => (p === "bereit" ? "installiert" : p));
  }, []);

  // Enter wirkt, solange das Fenster im Bild ist und kein Eingabefeld den Fokus hat
  useEffect(() => {
    if (phase !== "bereit") return;
    const taste = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.metaKey || e.ctrlKey || e.altKey) return;
      const ziel = e.target as HTMLElement | null;
      if (ziel?.closest("input, textarea, select, [contenteditable]")) return;
      if (ziel?.closest("a, button")) return;
      if (!imBild.current) return;
      e.preventDefault();
      ausfuehren();
    };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, [phase, ausfuehren]);

  // Spinner, danach die Ausgabe Zeile für Zeile
  useEffect(() => {
    if (phase !== "installiert") return;
    if (ruhig || zeilen >= AUSGABE.length) {
      setZeilen(AUSGABE.length);
      setPhase("fertig");
      return;
    }
    const t =
      spinner < SPIN_SCHRITTE
        ? setTimeout(() => setSpinner((x) => x + 1), 80)
        : setTimeout(() => setZeilen((z) => z + 1), 140);
    return () => clearTimeout(t);
  }, [phase, ruhig, spinner, zeilen]);

  const laeuft = phase === "installiert" && zeilen === 0;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Klick und Tippen sind eine Abkürzung; per Tastatur wirkt Enter oder der Knopf in der Unterschrift
    // biome-ignore lint/a11y/useKeyWithClickEvents: siehe oben
    <div
      ref={rahmen}
      onClick={ausfuehren}
      className={phase === "bereit" ? "cursor-pointer" : undefined}
    >
      <TerminalFenster
        interaktiv={phase === "bereit"}
        kennung="tipp-terminal"
        zeilen={[
          {
            ausgabe: (
              <span className="text-paper">
                <Prompt>
                  <span aria-hidden="true">{BEFEHL.slice(0, n)}</span>
                </Prompt>
                {(phase === "tippt" ||
                  phase === "bereit" ||
                  phase === "wartet") && <Cursor />}
                <span className="sr-only">{BEFEHL}</span>
              </span>
            ),
          },
          ...(laeuft
            ? [
                {
                  ausgabe: (
                    <span>
                      {SPINNER[spinner % SPINNER.length]} installing
                      @anthropic-ai/claude-code …
                    </span>
                  ),
                },
              ]
            : []),
          ...AUSGABE.slice(0, zeilen).map((text) => ({
            ausgabe: text || " ",
          })),
          ...(phase === "fertig"
            ? [
                {
                  ausgabe: (
                    <span className="text-paper">
                      <Prompt />
                      <Cursor />
                    </span>
                  ),
                },
              ]
            : []),
        ]}
        unterschrift={
          phase === "fertig" || phase === "installiert" ? (
            <span aria-live="polite">
              {phase === "fertig" ? "Installation nachgestellt." : ""}
            </span>
          ) : (
            <InteraktionsHinweis>
              <button
                type="button"
                disabled={phase !== "bereit"}
                onClick={(e) => {
                  e.stopPropagation();
                  ausfuehren();
                }}
                className="btn-quiet py-1 text-left underline-offset-2 hover:underline disabled:cursor-wait"
              >
                Zum Ausführen{" "}
                <kbd className="font-sans font-semibold">Enter</kbd> drücken
                oder ins Fenster tippen.
              </button>
            </InteraktionsHinweis>
          )
        }
      />
    </div>
  );
}
