"use client";

import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { cursorGruppe } from "@/components/werkstatt/interaktions-hinweis";
import { AMPEL } from "@/components/werkstatt/terminal-zeile";
import { ausgabe } from "@/content/ausgabe";
import {
  type Eintrag,
  neueId,
  oeffnen,
  useAblage,
  zeitpunkt,
} from "@/lib/ki/ablage";
import {
  gespraechLaden,
  neuesGespraech,
  useGespraech,
} from "@/lib/ki/gespraech";
import { MODELLNAME } from "@/lib/ki/modell";
import { StellenCheck } from "./stellen-check";
import { TerminalChat } from "./terminal-chat";

/*
 * Die Redaktion als Finder-Fenster von macOS 26 in der dunklen Darstellung,
 * auf der Grundlage des Terminalfensters aus der Werkstatt. Maße nach
 * Bildschirmfotos des Finders: Ampel 12 px, Werkzeugleiste 52 px mit
 * Glaskapseln von 34 px, Seitenleiste mit Zeilen von 28 px in 13 px,
 * Rubriken in 11 px, Pfadleiste unten. Schrift ist auf dem Mac SF Pro,
 * im Terminal SF Mono.
 */

type Ansicht = "zuletzt" | "interview" | "fit-check";

/** Fensterhöhe in px: Start, Untergrenze, Obergrenze. */
const HOEHE = { start: 440, min: 340, max: 820 };

const NAMEN: Record<Ansicht, string> = {
  zuletzt: "Zuletzt benutzt",
  interview: "Interview",
  "fit-check": "Fit Check",
};

/** Systemblau der dunklen Darstellung. */
const AKZENT = "#0a84ff";

/* ---------- Symbole nach SF Symbols, Strichstärke „regular“ ---------- */

function Zeichen({
  children,
  groesse = 16,
  className = "",
}: {
  children: ReactNode;
  groesse?: number;
  className?: string;
}) {
  return (
    <svg
      width={groesse}
      height={groesse}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      {children}
    </svg>
  );
}

const PFADE = {
  uhr: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3.2 2" />
    </>
  ),
  terminal: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="3.5" />
      <path d="M7.5 10l3 2.5-3 2.5M12.5 15.5h4" />
    </>
  ),
  pruefung: (
    <>
      <path d="M13.5 3H7a2.5 2.5 0 0 0-2.5 2.5v13A2.5 2.5 0 0 0 7 21h4" />
      <path d="M13.5 3l5 5v2.5M13.5 3v3.5A1.5 1.5 0 0 0 15 8h3.5" />
      <circle cx="16" cy="16" r="3" />
      <path d="M18.2 18.2L21 21" />
    </>
  ),
  links: <path d="M14.5 5.5L8 12l6.5 6.5" />,
  rechts: <path d="M9.5 5.5L16 12l-6.5 6.5" />,
  neu: (
    <>
      <path d="M10.5 4.5H7.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-3" />
      <path d="M17.6 3.9a1.8 1.8 0 0 1 2.5 2.5L12.5 14l-3.2.7.7-3.2Z" />
    </>
  ),
  teilen: (
    <>
      <path d="M12 3.5v11M8.5 7L12 3.5 15.5 7" />
      <path d="M8.5 10.5h-1A2.5 2.5 0 0 0 5 13v5a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 18v-5a2.5 2.5 0 0 0-2.5-2.5h-1" />
    </>
  ),
  haken: <path d="M5.5 12.5l4 4 9-9" />,
  lupe: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.3 15.3L20 20" />
    </>
  ),
  runter: <path d="M7 10l5 5 5-5" />,
  weiter: <path d="M10 7l5 5-5 5" />,
};

/** Kleiner gefüllter Ordner für die Pfadleiste. */
function Ordner() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 13" aria-hidden="true">
      <path
        d="M0 2a2 2 0 0 1 2-2h4l1.5 1.5H14a2 2 0 0 1 2 2V11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2Z"
        fill="#5aa9e6"
      />
      <path d="M0 4h16v7a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2Z" fill="#7cc0f2" />
    </svg>
  );
}

function Ampel() {
  return (
    <div className="flex gap-2" aria-hidden="true">
      {AMPEL.map(([farbe, rand]) => (
        <span
          key={farbe}
          className="size-3 rounded-full"
          style={{ background: farbe, boxShadow: `inset 0 0 0 0.5px ${rand}` }}
        />
      ))}
    </div>
  );
}

/* ---------- Werkzeugleiste: Glaskapseln wie unter macOS 26 ---------- */

const GLAS =
  "bg-[#333] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.16),0_0_0_0.5px_rgba(0,0,0,0.6),0_1px_3px_rgba(0,0,0,0.3)]";

function Kapsel({ children }: { children: ReactNode }) {
  return (
    <div
      className={`flex h-[34px] items-center rounded-full px-[3px] text-white/85 ${GLAS}`}
    >
      {children}
    </div>
  );
}

function Knopf({
  name,
  onClick,
  disabled,
  breit = false,
  children,
}: {
  name: string;
  onClick: () => void;
  disabled?: boolean;
  breit?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={name}
      title={name}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-7 place-items-center rounded-full transition-colors hover:bg-white/10 active:bg-white/15 disabled:text-white/25 disabled:hover:bg-transparent ${breit ? "w-[38px]" : "w-7"}`}
    >
      {children}
    </button>
  );
}

function Seitenzeile({
  symbol,
  name,
  aktiv,
  onClick,
}: {
  symbol: ReactNode;
  name: string;
  aktiv: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-current={aktiv ? "page" : undefined}
        data-cursor-ziel
        className={`btn-terminal flex h-7 w-full items-center gap-[7px] rounded-lg px-2 text-left text-[13px] ${
          aktiv ? "bg-white/[0.11] text-white" : "text-white/85"
        }`}
      >
        <span style={{ color: AKZENT }}>
          <Zeichen>{symbol}</Zeichen>
        </span>
        {name}
      </button>
    </li>
  );
}

/* ---------- Das Fenster ---------- */

export function Redaktion() {
  const [weg, setWeg] = useState<{ liste: Ansicht[]; i: number }>({
    liste: ["interview"],
    i: 0,
  });
  const ansicht = weg.liste[weg.i];
  const [fit, setFit] = useState<{ id: string; vorlage?: Eintrag }>({
    id: "neu",
  });
  const [suche, setSuche] = useState<string | null>(null);
  const [kopiert, setKopiert] = useState(false);
  const [hoehe, setHoehe] = useState(HOEHE.start);
  const ziehen = useRef<{ y: number; h: number } | null>(null);

  /** Höchstens so hoch, dass das Fenster samt Kopfzeile in den Bildschirm passt. */
  function begrenzen(h: number) {
    const max = Math.min(HOEHE.max, window.innerHeight - 120);
    return Math.round(Math.max(HOEHE.min, Math.min(h, max)));
  }

  function greifen(e: PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    ziehen.current = { y: e.clientY, h: hoehe };
  }

  function bewegen(e: PointerEvent<HTMLDivElement>) {
    const z = ziehen.current;
    if (z) setHoehe(begrenzen(z.h + e.clientY - z.y));
  }

  function tasteGriff(e: KeyboardEvent<HTMLDivElement>) {
    const schritt = e.shiftKey ? 96 : 24;
    if (e.key === "ArrowDown") setHoehe((h) => begrenzen(h + schritt));
    else if (e.key === "ArrowUp") setHoehe((h) => begrenzen(h - schritt));
    else if (e.key === "Home") setHoehe(begrenzen(HOEHE.min));
    else if (e.key === "End") setHoehe(begrenzen(HOEHE.max));
    else return;
    e.preventDefault();
  }
  const ablage = useAblage();
  const { verlauf, laeuft } = useGespraech();

  function gehe(ziel: Ansicht) {
    setWeg((w) =>
      w.liste[w.i] === ziel
        ? w
        : { liste: [...w.liste.slice(0, w.i + 1), ziel], i: w.i + 1 },
    );
  }

  // Die Nummer des ersten Fit Checks entsteht erst im Browser, nicht beim Vorrendern.
  useEffect(() => setFit({ id: neueId() }), []);

  // Verweise auf #fit-check, etwa von der Titelseite, öffnen den Fit Check.
  useEffect(() => {
    const lesen = () => {
      if (window.location.hash === "#fit-check")
        setWeg({ liste: ["fit-check"], i: 0 });
    };
    lesen();
    window.addEventListener("hashchange", lesen);
    return () => window.removeEventListener("hashchange", lesen);
  }, []);

  // Die Adresse folgt der Ansicht, damit ein geteilter Link stimmt.
  useEffect(() => {
    const ziel =
      ansicht === "fit-check" ? "#fit-check" : window.location.pathname;
    if (`${window.location.pathname}${window.location.hash}` !== ziel)
      history.replaceState(null, "", ziel);
  }, [ansicht]);

  function eintragOeffnen(e: Eintrag) {
    oeffnen(e.id);
    setSuche(null);
    if (e.art === "interview") {
      gespraechLaden(e.id, e.verlauf ?? []);
      gehe("interview");
    } else {
      setFit({ id: e.id, vorlage: e });
      gehe("fit-check");
    }
  }

  function neu() {
    if (ansicht === "fit-check") setFit({ id: neueId() });
    else {
      neuesGespraech();
      gehe("interview");
    }
  }

  /** Was „Teilen“ in die Zwischenablage legt. */
  const fitEintrag = ablage.find((e) => e.id === fit.id);
  const text =
    ansicht === "interview" && verlauf.length > 0 && !laeuft
      ? verlauf
          .map(
            (b) => `${b.rolle === "leser" ? "Frage" : "Redaktion"}: ${b.text}`,
          )
          .join("\n\n")
      : ansicht === "fit-check" && fitEintrag
        ? `Fit Check: ${fitEintrag.titel}\n\n${fitEintrag.antwort}`
        : "";

  async function teilen() {
    try {
      await navigator.clipboard.writeText(
        `${text}\n\n${ausgabe.titel} · ${ausgabe.autor}`,
      );
      setKopiert(true);
      setTimeout(() => setKopiert(false), 1600);
    } catch {
      // Ohne Zugriff auf die Zwischenablage bleibt der Knopf wirkungslos.
    }
  }

  return (
    <section
      id="fit-check"
      aria-label="Die Redaktion"
      {...cursorGruppe("interview", { art: "innen" })}
      className="relative scroll-mt-24 overflow-hidden rounded-[20px] bg-[#1e1e1e] font-system text-white antialiased shadow-[0_0_0_0.5px_rgba(0,0,0,0.85),inset_0_0_0_0.5px_rgba(255,255,255,0.16),0_28px_70px_-18px_rgba(0,0,0,0.5)]"
    >
      <div className="flex" style={{ height: hoehe }}>
        {/* Seitenleiste mit der Ampel oben */}
        <aside className="hidden w-[184px] shrink-0 flex-col bg-white/[0.045] shadow-[inset_-0.5px_0_0_rgba(255,255,255,0.07)] md:flex">
          <div className="flex h-[52px] shrink-0 items-center px-[18px]">
            <Ampel />
          </div>
          <nav aria-label="Seitenleiste" className="px-2.5">
            <ul>
              <Seitenzeile
                symbol={PFADE.uhr}
                name={NAMEN.zuletzt}
                aktiv={ansicht === "zuletzt"}
                onClick={() => gehe("zuletzt")}
              />
            </ul>
            <p className="mt-3.5 mb-0.5 px-2 text-[11px] font-semibold text-white/35">
              Favoriten
            </p>
            <ul>
              <Seitenzeile
                symbol={PFADE.terminal}
                name={NAMEN.interview}
                aktiv={ansicht === "interview"}
                onClick={() => gehe("interview")}
              />
              <Seitenzeile
                symbol={PFADE.pruefung}
                name={NAMEN["fit-check"]}
                aktiv={ansicht === "fit-check"}
                onClick={() => gehe("fit-check")}
              />
            </ul>
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Werkzeugleiste */}
          <div className="flex h-[52px] shrink-0 items-center gap-2 px-3">
            <div className="mr-1 md:hidden">
              <Ampel />
            </div>
            <Kapsel>
              <Knopf
                name="Zurück"
                disabled={weg.i === 0}
                onClick={() => setWeg((w) => ({ ...w, i: w.i - 1 }))}
              >
                <Zeichen groesse={15}>{PFADE.links}</Zeichen>
              </Knopf>
              <span className="mx-px h-[18px] w-px bg-white/[0.12]" />
              <Knopf
                name="Vorwärts"
                disabled={weg.i === weg.liste.length - 1}
                onClick={() => setWeg((w) => ({ ...w, i: w.i + 1 }))}
              >
                <Zeichen groesse={15}>{PFADE.rechts}</Zeichen>
              </Knopf>
            </Kapsel>
            <h2 className="ml-1.5 min-w-0 flex-1 truncate text-[15px] font-bold tracking-[-0.01em] text-white/90">
              {NAMEN[ansicht]}
            </h2>
            <div className="hidden sm:block">
              <Kapsel>
                <Knopf
                  name={
                    ansicht === "fit-check" ? "Neue Prüfung" : "Neues Gespräch"
                  }
                  onClick={neu}
                  disabled={laeuft}
                  breit
                >
                  <Zeichen groesse={17}>{PFADE.neu}</Zeichen>
                </Knopf>
                <Knopf
                  name={kopiert ? "Kopiert" : "Teilen"}
                  onClick={teilen}
                  disabled={!text}
                  breit
                >
                  <Zeichen groesse={17}>
                    {kopiert ? PFADE.haken : PFADE.teilen}
                  </Zeichen>
                </Knopf>
              </Kapsel>
            </div>
            {suche !== null ? (
              <div
                className={`flex h-[34px] w-[46%] max-w-[220px] items-center gap-1.5 rounded-full px-3 text-white/55 ${GLAS}`}
              >
                <Zeichen groesse={15}>{PFADE.lupe}</Zeichen>
                <label htmlFor="suche" className="sr-only">
                  Gespräche durchsuchen
                </label>
                <input
                  id="suche"
                  // biome-ignore lint/a11y/noAutofocus: Das Feld erscheint erst auf Klick auf die Lupe
                  autoFocus
                  value={suche}
                  onChange={(e) => setSuche(e.target.value)}
                  onBlur={() => !suche && setSuche(null)}
                  onKeyDown={(e) => e.key === "Escape" && setSuche(null)}
                  placeholder="Suchen"
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none! placeholder:text-white/35"
                />
              </div>
            ) : (
              <div
                className={`grid size-[34px] place-items-center rounded-full text-white/85 ${GLAS}`}
              >
                <Knopf
                  name="Suchen"
                  onClick={() => {
                    setSuche("");
                    gehe("zuletzt");
                  }}
                >
                  <Zeichen groesse={16}>{PFADE.lupe}</Zeichen>
                </Knopf>
              </div>
            )}
          </div>

          {/* Schmale Bildschirme: segmentierte Steuerung statt Seitenleiste */}
          <div className="px-3 pb-2.5 md:hidden">
            <div className="flex rounded-[9px] bg-white/[0.07] p-0.5">
              {(Object.keys(NAMEN) as Ansicht[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => gehe(a)}
                  aria-current={ansicht === a ? "page" : undefined}
                  data-cursor-ziel
                  className={`flex-1 rounded-[7px] py-1 text-[12px] font-medium ${ansicht === a ? "bg-white/[0.18] text-white shadow-[0_1px_2px_rgba(0,0,0,0.3)]" : "text-white/60"}`}
                >
                  {NAMEN[a]}
                </button>
              ))}
            </div>
          </div>

          <div className="@container min-h-0 flex-1">
            {ansicht === "zuletzt" && (
              <Zuletzt
                eintraege={ablage}
                suche={suche ?? ""}
                oeffnen={eintragOeffnen}
              />
            )}
            {/* Beide bleiben eingehängt, damit Eingaben beim Wechseln bleiben */}
            <div hidden={ansicht !== "interview"} className="h-full">
              <TerminalChat />
            </div>
            <div hidden={ansicht !== "fit-check"} className="h-full">
              <StellenCheck
                key={fit.id}
                id={fit.id}
                vorlage={
                  fit.vorlage
                    ? {
                        stelle: fit.vorlage.stelle ?? "",
                        antwort: fit.vorlage.antwort ?? "",
                      }
                    : undefined
                }
              />
            </div>
          </div>

          {/* Pfadleiste */}
          <div className="flex h-[26px] shrink-0 items-center justify-between gap-3 border-t border-white/[0.08] px-3 text-[11px] text-white/55">
            <p className="flex min-w-0 items-center gap-1 truncate">
              <span
                className="wordmark-springer text-[12px] text-white/70"
                aria-hidden="true"
              />
              {ausgabe.titel}
              <Zeichen groesse={10} className="text-white/30">
                {PFADE.weiter}
              </Zeichen>
              <Ordner />
              Redaktion
              <Zeichen groesse={10} className="text-white/30">
                {PFADE.weiter}
              </Zeichen>
              <span className="text-white/80">{NAMEN[ansicht]}</span>
            </p>
            <p className="hidden shrink-0 items-center gap-1.5 sm:flex">
              <span
                className="size-1.5 rounded-full bg-[#30d158]"
                aria-hidden="true"
              />
              {MODELLNAME}
            </p>
          </div>
        </div>
      </div>

      {/* Unterkante zum Ziehen, wie bei einem Fenster unter macOS */}
      {/* biome-ignore lint/a11y/useSemanticElements: ein fokussierbarer Trenner zum Ziehen ist kein <hr> */}
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Fensterhöhe ändern"
        aria-valuenow={hoehe}
        aria-valuemin={HOEHE.min}
        aria-valuemax={HOEHE.max}
        tabIndex={0}
        onPointerDown={greifen}
        onPointerMove={bewegen}
        onPointerUp={() => {
          ziehen.current = null;
        }}
        onPointerCancel={() => {
          ziehen.current = null;
        }}
        onDoubleClick={() => setHoehe(begrenzen(HOEHE.start))}
        onKeyDown={tasteGriff}
        title="Ziehen ändert die Höhe, Doppelklick setzt sie zurück"
        className="group absolute inset-x-0 bottom-0 z-20 grid h-2.5 cursor-ns-resize touch-none place-items-center outline-none!"
      >
        <span className="h-[3px] w-10 rounded-full bg-white/15 transition-colors group-hover:bg-white/45 group-focus-visible:bg-[#0a84ff] group-active:bg-white/60" />
      </div>
    </section>
  );
}

/* ---------- Zuletzt benutzt: Listenansicht wie im Finder ---------- */

function Zuletzt({
  eintraege,
  suche,
  oeffnen,
}: {
  eintraege: Eintrag[];
  suche: string;
  oeffnen: (e: Eintrag) => void;
}) {
  const [auswahl, setAuswahl] = useState<string | null>(null);
  const s = suche.trim().toLowerCase();
  const treffer = s
    ? eintraege.filter((e) =>
        `${e.titel} ${e.verlauf?.map((b) => b.text).join(" ") ?? ""} ${e.stelle ?? ""}`
          .toLowerCase()
          .includes(s),
      )
    : eintraege;

  if (treffer.length === 0) {
    return (
      <div className="grid h-full place-items-center p-8 text-center">
        <div className="max-w-[300px]">
          <p className="text-[13px] font-semibold text-white/60">
            {s ? "Keine Treffer" : "Noch keine Gespräche"}
          </p>
          <p className="mt-1 text-[12px] leading-snug text-white/35">
            {s
              ? `Kein Gespräch enthält „${suche.trim()}“.`
              : "Ihre Interviews und Fit Checks erscheinen hier. Beim Neuladen wird die Liste geleert."}
          </p>
        </div>
      </div>
    );
  }

  const spalten =
    "grid grid-cols-[minmax(0,1fr)_9rem] @lg:grid-cols-[minmax(0,1fr)_6.5rem_11.5rem]";

  return (
    <div className="h-full overflow-y-auto px-2.5 pb-2">
      <div
        className={`${spalten} sticky top-0 z-10 h-7 items-center border-b border-white/[0.09] bg-[#1e1e1e] text-[11px] text-white/50`}
      >
        <span className="pl-[34px]">Name</span>
        <span className="hidden h-3.5 border-l border-white/[0.12] pl-2 leading-[14px] @lg:block">
          Art
        </span>
        <span className="flex h-3.5 items-center justify-between border-l border-white/[0.12] pr-1.5 pl-2 font-semibold text-white/85">
          Zuletzt geöffnet
          <Zeichen groesse={11}>{PFADE.runter}</Zeichen>
        </span>
      </div>
      <ul className="mt-1" aria-label="Zuletzt benutzt">
        {treffer.map((e, i) => {
          const gewaehlt = auswahl === e.id;
          return (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => (gewaehlt ? oeffnen(e) : setAuswahl(e.id))}
                onDoubleClick={() => oeffnen(e)}
                onKeyDown={(k) => k.key === "Enter" && oeffnen(e)}
                aria-pressed={gewaehlt}
                className={`${spalten} h-6 w-full items-center rounded-[5px] text-left text-[13px] ${
                  gewaehlt
                    ? "text-white"
                    : i % 2
                      ? "bg-white/[0.035] text-white/90"
                      : "text-white/90"
                }`}
                style={gewaehlt ? { background: AKZENT } : undefined}
              >
                <span className="flex min-w-0 items-center gap-2 pl-2">
                  <span
                    style={
                      gewaehlt
                        ? undefined
                        : { color: e.art === "interview" ? "#c9c9c9" : AKZENT }
                    }
                  >
                    <Zeichen>
                      {e.art === "interview" ? PFADE.terminal : PFADE.pruefung}
                    </Zeichen>
                  </span>
                  <span className="truncate">{e.titel}</span>
                </span>
                <span
                  className={`hidden truncate pl-2 @lg:block ${gewaehlt ? "" : "text-white/50"}`}
                >
                  {NAMEN[e.art]}
                </span>
                <span
                  className={`truncate pl-2 ${gewaehlt ? "" : "text-white/50"}`}
                >
                  {zeitpunkt(e.zeit)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
