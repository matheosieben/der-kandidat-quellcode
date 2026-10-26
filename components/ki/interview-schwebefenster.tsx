"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cursorGruppe } from "@/components/werkstatt/interaktions-hinweis";
import { AMPEL } from "@/components/werkstatt/terminal-zeile";
import {
  type Fenster,
  fokussiereInterviewSeite,
  interviewUmschalten,
  setzeFenster,
  useFenster,
} from "@/lib/ki/fenster";
import { useGespraech } from "@/lib/ki/gespraech";
import { MODELLNAME } from "@/lib/ki/modell";
import { Kuerzel } from "./interview-taste";
import { MASCHINE, TerminalChat } from "./terminal-chat";

type Groesse = { b: number; h: number };

const START: Groesse = { b: 440, h: 500 };
const MIN: Groesse = { b: 340, h: 320 };
/** Abstand zum Rand des Browserfensters */
const RAND = 16;
const SPEICHER = "interview-fenster-groesse";

function klemmen(wert: number, min: number, max: number) {
  return Math.max(Math.min(wert, max), Math.min(min, max));
}

function begrenzen({ b, h }: Groesse): Groesse {
  return {
    b: Math.round(klemmen(b, MIN.b, window.innerWidth - 2 * RAND)),
    h: Math.round(klemmen(h, MIN.h, window.innerHeight - 2 * RAND)),
  };
}

function gespeichert(): Groesse {
  try {
    const g = JSON.parse(localStorage.getItem(SPEICHER) ?? "null");
    if (typeof g?.b === "number" && typeof g?.h === "number") return g;
  } catch {}
  return START;
}

function speichern(g: Groesse) {
  try {
    localStorage.setItem(SPEICHER, JSON.stringify(g));
  } catch {}
}

/** Die Ampel als echte Knöpfe; die Zeichen erscheinen wie unter macOS erst beim Überfahren. */
const KNOEPFE: {
  ziel: Fenster | "seite";
  name: string;
  /** Zeichen im 12er-Raster, in der dunklen Tönung der Knopffarbe wie unter macOS */
  zeichen: ReactNode;
}[] = [
  {
    ziel: "zu",
    name: "Schließen",
    zeichen: (
      <path
        d="M3.75 3.75l4.5 4.5M8.25 3.75l-4.5 4.5"
        stroke="#4d0000"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    ),
  },
  {
    ziel: "angedockt",
    name: "Unten rechts andocken",
    zeichen: (
      <path
        d="M3.25 6h5.5"
        stroke="#995700"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    ),
  },
  {
    ziel: "seite",
    name: "Als Interview-Seite öffnen",
    zeichen: <path d="M4.6 3.4h4v4zM7.4 8.6h-4v-4z" fill="#006500" />,
  },
];

/**
 * Das Interview als Fenster, das mit ⌘K von unten rechts aufgeht. Es zeigt
 * dasselbe Gespräch wie das Interview-Ressort. Rot schließt, Gelb dockt es
 * als kleine Leiste unten rechts an, Grün öffnet die Interview-Seite. Ziehen
 * an der oberen linken Ecke oder an den Kanten ändert die Größe. Angedockt
 * liegt es von Anfang an da, wie der Knopf im Kopf nur mit Maus oder Trackpad.
 */
export function InterviewSchwebefenster() {
  const fenster = useFenster();
  const pfad = usePathname();
  const router = useRouter();
  const titelId = useId();
  const { laeuft } = useGespraech();
  const [groesse, setGroesse] = useState<Groesse>(START);
  const [neu, setNeu] = useState(false);
  const ziehen = useRef<{
    x: number;
    y: number;
    start: Groesse;
    breite: boolean;
    hoehe: boolean;
  } | null>(null);
  const vorher = useRef<HTMLElement | null>(null);
  const zurSeite = useRef(false);
  const pfadJetzt = useRef(pfad);
  pfadJetzt.current = pfad;
  const lief = useRef(laeuft);

  // Gespeicherte Größe übernehmen und bei kleinerem Browserfenster nachziehen
  useEffect(() => {
    setGroesse(begrenzen(gespeichert()));
    const anpassen = () => setGroesse((g) => begrenzen(g));
    window.addEventListener("resize", anpassen);
    return () => window.removeEventListener("resize", anpassen);
  }, []);

  // ⌘K bzw. Strg K auf jeder Seite
  useEffect(() => {
    function taste(e: globalThis.KeyboardEvent) {
      if (e.key.toLowerCase() !== "k" || e.altKey || e.shiftKey) return;
      if (!(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      interviewUmschalten(pfadJetzt.current);
    }
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, []);

  // Beim Öffnen merken, wo der Fokus war, beim Schließen dorthin zurück
  useEffect(() => {
    if (fenster === "offen") {
      setNeu(false);
      const aktiv = document.activeElement;
      if (
        aktiv instanceof HTMLElement &&
        !aktiv.closest("[data-schwebefenster]")
      )
        vorher.current = aktiv;
    } else if (fenster === "zu" && vorher.current) {
      if (vorher.current.isConnected)
        vorher.current.focus({ preventScroll: true });
      vorher.current = null;
    }
  }, [fenster]);

  // Angedockt: ein Punkt zeigt, dass inzwischen eine Antwort fertig ist
  useEffect(() => {
    if (lief.current && !laeuft && fenster === "angedockt") setNeu(true);
    lief.current = laeuft;
  }, [laeuft, fenster]);

  // Nach Grün im Interview-Ressort gleich in die Eingabezeile
  useEffect(() => {
    if (pfad !== "/interview" || !zurSeite.current) return;
    zurSeite.current = false;
    let versuche = 0;
    const t = setInterval(() => {
      if (fokussiereInterviewSeite() || ++versuche > 20) clearInterval(t);
    }, 50);
    return () => clearInterval(t);
  }, [pfad]);

  if (fenster === "zu" || pfad === "/interview") return null;

  function waehlen(ziel: Fenster | "seite") {
    if (ziel === "seite") {
      zurSeite.current = true;
      vorher.current = null;
      setzeFenster("zu");
      router.push("/interview");
    } else setzeFenster(ziel);
  }

  function greifen(e: PointerEvent<HTMLDivElement>) {
    const { breite, hoehe } = e.currentTarget.dataset;
    // Kein Markieren von Text, während das Fenster wächst
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    ziehen.current = {
      x: e.clientX,
      y: e.clientY,
      start: groesse,
      breite: breite !== undefined,
      hoehe: hoehe !== undefined,
    };
  }

  function bewegen(e: PointerEvent<HTMLDivElement>) {
    const z = ziehen.current;
    if (!z) return;
    // Das Fenster hängt unten rechts: nach links und oben ziehen macht es größer
    setGroesse(
      begrenzen({
        b: z.breite ? z.start.b + z.x - e.clientX : z.start.b,
        h: z.hoehe ? z.start.h + z.y - e.clientY : z.start.h,
      }),
    );
  }

  function loslassen() {
    if (!ziehen.current) return;
    ziehen.current = null;
    speichern(groesse);
  }

  function tasteGriff(e: KeyboardEvent<HTMLDivElement>) {
    const schritt = e.shiftKey ? 80 : 20;
    const d = {
      ArrowLeft: [schritt, 0],
      ArrowRight: [-schritt, 0],
      ArrowUp: [0, schritt],
      ArrowDown: [0, -schritt],
    }[e.key];
    if (!d) return;
    e.preventDefault();
    const g = begrenzen({ b: groesse.b + d[0], h: groesse.h + d[1] });
    setGroesse(g);
    speichern(g);
  }

  const griff = {
    onPointerDown: greifen,
    onPointerMove: bewegen,
    onPointerUp: loslassen,
    onPointerCancel: loslassen,
    onDoubleClick: () => {
      const g = begrenzen(START);
      setGroesse(g);
      speichern(g);
    },
  };

  if (fenster === "angedockt") {
    return (
      <button
        type="button"
        data-schwebefenster
        {...cursorGruppe("interview-leiste")}
        onClick={() => setzeFenster("offen")}
        aria-label={`Interview-Fenster öffnen${neu ? ", neue Antwort" : ""}`}
        className="btn-terminal fenster-auf no-print fixed right-4 bottom-4 z-40 hidden h-11 items-center gap-3 rounded-[12px] bg-[#1e1e1e] pr-3 pl-4 font-system text-[13px] text-white/85 shadow-[0_0_0_0.5px_rgba(0,0,0,0.85),inset_0_0_0_0.5px_rgba(255,255,255,0.16),0_14px_30px_-12px_rgba(0,0,0,0.45)] hover:bg-[#303030] hover:text-white active:bg-[#141414] pointer-fine:md:flex"
      >
        <span aria-hidden="true" className={MASCHINE}>
          ✻
        </span>
        <span className="font-semibold">Interview · Chat</span>
        {laeuft ? (
          <span className="text-white/50">antwortet …</span>
        ) : (
          neu && (
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-[#8aa4ff]"
            />
          )
        )}
        <Kuerzel className="text-white/55" />
      </button>
    );
  }

  return (
    <section
      id="interview-fenster"
      role="dialog"
      aria-modal="false"
      aria-labelledby={titelId}
      data-schwebefenster
      // Die Eingabe hat gleich den Fokus, fern hält ihn nur das Überfahren
      {...cursorGruppe("interview", { art: "innen", fokusHaelt: false })}
      onKeyDown={(e) => {
        if (e.key === "Escape") setzeFenster("zu");
      }}
      style={{ width: groesse.b, height: groesse.h }}
      className="fenster-auf no-print fixed right-4 bottom-4 z-40 flex flex-col overflow-hidden rounded-[14px] bg-[#1e1e1e] font-system text-white shadow-[0_0_0_0.5px_rgba(0,0,0,0.85),inset_0_0_0_0.5px_rgba(255,255,255,0.16),0_24px_60px_-20px_rgba(0,0,0,0.55)]"
    >
      <div className="flex h-11 shrink-0 items-center gap-4 border-b border-white/[0.08] bg-white/[0.045] px-4">
        <span className="group flex gap-2">
          {KNOEPFE.map(({ ziel, name, zeichen }, i) => (
            <button
              key={name}
              type="button"
              onClick={() => waehlen(ziel)}
              aria-label={name}
              title={name}
              className="grid size-3 place-items-center rounded-full hover:brightness-110 active:brightness-75 focus-visible:outline-[#8aa4ff]"
              style={{
                background: AMPEL[i][0],
                boxShadow: `inset 0 0 0 0.5px ${AMPEL[i][1]}`,
              }}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 12 12"
                className="size-3 opacity-0 group-hover:opacity-100 group-has-focus-visible:opacity-100"
              >
                {zeichen}
              </svg>
            </button>
          ))}
        </span>
        <h2 id={titelId} className="text-[13px] font-semibold text-white/85">
          Interview · Chat
        </h2>
        <Kuerzel className="ml-auto text-white/40" />
      </div>
      <div className="@container min-h-0 flex-1">
        <TerminalChat kompakt autoFokus />
      </div>
      <p className="shrink-0 border-t border-white/[0.08] px-4 py-2 text-[10px] text-white/50">
        {MODELLNAME} · Antworten aus dem Archiv · Ihre Fragen gehen an Anthropic
      </p>

      {/* Griffe zum Ziehen: Ecke oben links, obere und linke Kante */}
      <div
        {...griff}
        data-hoehe
        aria-hidden="true"
        className="absolute inset-x-5 top-0 h-2 cursor-ns-resize touch-none"
      />
      <div
        {...griff}
        data-breite
        aria-hidden="true"
        className="absolute inset-y-5 left-0 w-2 cursor-ew-resize touch-none"
      />
      {/* biome-ignore lint/a11y/useSemanticElements: ein fokussierbarer Griff zum Ziehen ist kein <hr> */}
      <div
        {...griff}
        data-breite
        data-hoehe
        role="separator"
        aria-label="Fenstergröße ändern, mit den Pfeiltasten"
        aria-valuenow={groesse.b}
        tabIndex={0}
        onKeyDown={tasteGriff}
        title="Ziehen ändert die Größe, Doppelklick setzt sie zurück"
        className="absolute top-0 left-0 size-[14px] cursor-nwse-resize touch-none rounded-tl-[14px] outline-none focus-visible:bg-[#0a84ff]/40"
      />
    </section>
  );
}
