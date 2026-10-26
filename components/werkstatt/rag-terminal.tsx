"use client";

import {
  isValidElement,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  InteraktionsFlaeche,
  InteraktionsHinweis,
} from "@/components/werkstatt/interaktions-hinweis";
import {
  FENSTER_RUNDUNG,
  Kopfleiste,
} from "@/components/werkstatt/terminal-zeile";
import { Cursor, Prompt } from "@/components/werkstatt/tipp-terminal";

/*
 * Der Weg einer Frage durch die Rechtsrecherche von Ciprè, nach dem Code in
 * cipre-ai: app/api/legal-search (Gesetz erkennen, Embedding, hybrid_search,
 * Rerank), die Migration legal_rag (Volltext und pgvector je 60, RRF mit
 * k = 60), lib/legal-db/providers/cohere-bedrock.ts (Embed v4 und Rerank 3.5
 * in eu-central-1), app/api/assist (Antwort im Stream, Prüfung durch ein
 * zweites Modell) und lib/assist/confidence.ts (Belegt-Formel). Gezeigt ist
 * der Zielaufbau mit allen Modellen über Bedrock in der EU; Frage,
 * Treffer und Werte sind ein nachgestelltes Beispiel.
 */

const BEFEHL =
  'cipre frage "Wann verjähren Mängelansprüche beim Gebrauchtwagenkauf nach BGB?"';
const SPINNER = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";
const GRUEN = "#28c840";
const GELB = "#febc2e";

const ANTWORT =
  "In zwei Jahren ab Übergabe des Wagens (§ 438 Abs. 1 Nr. 3, Abs. 2 BGB). Kauft ein Verbraucher beim Händler, darf die Frist bei gebrauchten Sachen auf ein Jahr verkürzt werden, aber nur, wenn das ausdrücklich und gesondert vereinbart ist (§ 476 Abs. 2 BGB).";

/* Belegt-Band wie im Code; Zitat-Präzision 100 % */
const BELEGT = Math.round((0.45 * 92 + 0.3 * 88 + 0.25 * 80) * (0.6 + 0.4));

/* ---------- Bühne: vier Server und ihre Leitungen ---------- */

type Knoten = "browser" | "app" | "modell" | "db";
type Leitung = "browser" | "modell" | "db";
type Richtung = "hin" | "zurueck" | "beide";

/** Mittelpunkt des Bildzeichens; die Beschriftung steht darunter */
type Ort = { x: number; y: number };
type Aufbau = {
  breite: number;
  hoehe: number;
  ort: Record<Knoten, Ort>;
  pfad: Record<Leitung, string>;
};

/* Breit: Browser links, Ciprè in der Mitte, rechts Modelle und Datenbank */
const BREIT: Aufbau = {
  breite: 640,
  hoehe: 204,
  ort: {
    browser: { x: 72, y: 78 },
    app: { x: 290, y: 78 },
    modell: { x: 548, y: 24 },
    db: { x: 548, y: 132 },
  },
  pfad: {
    browser: "M104 78 H262",
    modell: "M318 72 H430 V24 H524",
    db: "M318 84 H430 V132 H526",
  },
};

/* Schmal: untereinander, Modelle und Datenbank nebeneinander */
const SCHMAL: Aufbau = {
  breite: 340,
  hoehe: 344,
  ort: {
    browser: { x: 170, y: 28 },
    app: { x: 170, y: 150 },
    modell: { x: 82, y: 262 },
    db: { x: 258, y: 262 },
  },
  pfad: {
    browser: "M170 90 V128",
    modell: "M142 150 H82 V238",
    db: "M198 150 H258 V240",
  },
};

const NAMEN: Record<Knoten, [string, string, string?]> = {
  browser: ["Browser", "Kanzlei"],
  app: ["Ciprè", "Next.js · /api"],
  modell: ["AWS Bedrock", "Modelle", "EU-Profil · eu-central-1"],
  db: ["Supabase", "Postgres · pgvector", "Frankfurt · eu-central-1"],
};

const ZIEL: Record<Leitung, Knoten> = {
  browser: "browser",
  modell: "modell",
  db: "db",
};

type Verkehr = {
  leitungen: Leitung[];
  richtung: Richtung;
  /** Was gerade auf Bedrock läuft, statt „Modelle“ */
  modell?: string;
};

const LINIE = "rgba(255,255,255,0.5)";
const FLAECHE = "rgba(255,255,255,0.04)";

/** Lämpchen, das bei Arbeit blinkt */
function Lampe({
  x,
  y,
  an,
  bewegt,
  takt,
}: {
  x: number;
  y: number;
  an: boolean;
  bewegt: boolean;
  takt: string;
}) {
  return (
    <circle cx={x} cy={y} r={1.8} fill={an ? GRUEN : "rgba(255,255,255,0.25)"}>
      {an && bewegt && (
        <animate
          attributeName="opacity"
          values="1;0.15;1"
          dur={takt}
          repeatCount="indefinite"
        />
      )}
    </circle>
  );
}

/** Browserfenster mit Punkten, Adresszeile und Textzeilen */
function BrowserZeichen({ x, y, an }: Ort & { an: boolean }) {
  const s = an ? GRUEN : LINIE;
  return (
    <g fill="none" stroke={s} strokeWidth={1.3}>
      <rect
        x={x - 32}
        y={y - 22}
        width={64}
        height={44}
        rx={4}
        fill={FLAECHE}
      />
      <path d={`M${x - 32} ${y - 11} H${x + 32}`} />
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={x - 26 + i * 5}
          cy={y - 16.5}
          r={1.3}
          fill={s}
          stroke="none"
        />
      ))}
      <rect
        x={x - 10}
        y={y - 19}
        width={36}
        height={5}
        rx={2.5}
        strokeWidth={1}
      />
      <path
        d={`M${x - 24} ${y - 2} H${x + 16} M${x - 24} ${y + 5} H${x + 22} M${x - 24} ${y + 12} H${x + 6}`}
        strokeOpacity={0.6}
      />
    </g>
  );
}

/** Drei Einschübe eines Server-Racks, je mit zwei Lämpchen */
function RackZeichen({
  x,
  y,
  an,
  bewegt,
}: Ort & { an: boolean; bewegt: boolean }) {
  const s = an ? GRUEN : LINIE;
  return (
    <g>
      {[-22, -7, 8].map((dy, i) => (
        <g key={dy}>
          <rect
            x={x - 28}
            y={y + dy}
            width={56}
            height={13}
            rx={2}
            fill={FLAECHE}
            stroke={s}
            strokeWidth={1.3}
          />
          <Lampe
            x={x - 21}
            y={y + dy + 6.5}
            an={an}
            bewegt={bewegt}
            takt={`${0.5 + i * 0.17}s`}
          />
          <Lampe
            x={x - 15}
            y={y + dy + 6.5}
            an={an && i !== 1}
            bewegt={bewegt}
            takt={`${0.8 + i * 0.11}s`}
          />
          <path
            d={`M${x - 4} ${y + dy + 4.5} H${x + 22} M${x - 4} ${y + dy + 8.5} H${x + 22}`}
            stroke={s}
            strokeWidth={1}
            strokeOpacity={0.5}
          />
        </g>
      ))}
    </g>
  );
}

/** Prozessor mit Anschlüssen; der Kern pulsiert, während ein Modell rechnet */
function ChipZeichen({
  x,
  y,
  an,
  bewegt,
}: Ort & { an: boolean; bewegt: boolean }) {
  const s = an ? GRUEN : LINIE;
  const pins = [-9, 0, 9];
  return (
    <g stroke={s} strokeWidth={1.3}>
      {pins.map((p) => (
        <path
          key={p}
          d={`M${x + p} ${y - 22} V${y - 16} M${x + p} ${y + 16} V${y + 22} M${x - 22} ${y + p} H${x - 16} M${x + 16} ${y + p} H${x + 22}`}
        />
      ))}
      <rect
        x={x - 16}
        y={y - 16}
        width={32}
        height={32}
        rx={3}
        fill={FLAECHE}
      />
      <rect
        x={x - 7}
        y={y - 7}
        width={14}
        height={14}
        rx={1.5}
        fill={an ? GRUEN : "none"}
        fillOpacity={an ? 0.5 : 0}
      >
        {an && bewegt && (
          <animate
            attributeName="fill-opacity"
            values="0.15;0.7;0.15"
            dur="0.9s"
            repeatCount="indefinite"
          />
        )}
      </rect>
    </g>
  );
}

/** Datenbanktonne */
function TonneZeichen({ x, y, an }: Ort & { an: boolean }) {
  const s = an ? GRUEN : LINIE;
  const r = 21;
  const k = 6;
  return (
    <g fill="none" stroke={s} strokeWidth={1.3}>
      <path
        d={`M${x - r} ${y - 16} V${y + 16} A${r} ${k} 0 0 0 ${x + r} ${y + 16} V${y - 16}`}
        fill={FLAECHE}
      />
      <ellipse cx={x} cy={y - 16} rx={r} ry={k} fill={FLAECHE} />
      <path
        d={`M${x - r} ${y - 5} A${r} ${k} 0 0 0 ${x + r} ${y - 5} M${x - r} ${y + 6} A${r} ${k} 0 0 0 ${x + r} ${y + 6}`}
        strokeOpacity={0.6}
      />
    </g>
  );
}

function Pakete({
  pfad,
  zuCipre,
  farbe,
  dauer,
  versatz = 0,
}: {
  pfad: string;
  /** true: von außen zu Ciprè hin */
  zuCipre: boolean;
  farbe: string;
  dauer: number;
  versatz?: number;
}) {
  return [0, 1, 2].map((i) => (
    <circle key={i} r={2.8} fill={farbe}>
      <animateMotion
        dur={`${dauer}s`}
        begin={`${-(i / 3 + versatz) * dauer}s`}
        repeatCount="indefinite"
        calcMode="linear"
        keyPoints={zuCipre ? "1;0" : "0;1"}
        keyTimes="0;1"
      >
        <mpath href={`#${pfad}`} />
      </animateMotion>
    </circle>
  ));
}

function Buehne({
  aufbau,
  verkehr,
  bewegt,
  langsam,
}: {
  aufbau: Aufbau;
  verkehr: Verkehr | null;
  bewegt: boolean;
  /** In der Pause laufen die Pakete gemächlicher weiter */
  langsam: boolean;
}) {
  const id = useId();
  const aktiv = new Set<Knoten>(
    verkehr ? ["app", ...verkehr.leitungen.map((l) => ZIEL[l])] : [],
  );
  const dauer = langsam ? 1.8 : 0.9;

  return (
    <svg
      viewBox={`0 0 ${aufbau.breite} ${aufbau.hoehe}`}
      className="block h-auto w-full"
      role="img"
      aria-label="Browser, Ciprè, AWS Bedrock und Supabase, verbunden über Leitungen"
    >
      {(Object.keys(aufbau.pfad) as Leitung[]).map((l) => {
        const an = verkehr?.leitungen.includes(l) ?? false;
        const pfad = `${id}-${l}`;
        // Die Pfade laufen von Ciprè weg, nur der zum Browser läuft auf Ciprè zu
        const hinZuCipre = l === "browser";
        const r = verkehr?.richtung;
        return (
          <g key={l}>
            <path
              id={pfad}
              d={aufbau.pfad[l]}
              fill="none"
              stroke={an ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.16)"}
              strokeWidth={1.2}
              strokeDasharray={an ? undefined : "3 4"}
            />
            {an && bewegt && (r === "hin" || r === "beide") && (
              <Pakete
                key={`hin-${dauer}`}
                pfad={pfad}
                zuCipre={hinZuCipre}
                farbe={GRUEN}
                dauer={dauer}
              />
            )}
            {an && bewegt && (r === "zurueck" || r === "beide") && (
              <Pakete
                key={`zurueck-${dauer}`}
                pfad={pfad}
                zuCipre={!hinZuCipre}
                farbe={GELB}
                dauer={dauer}
                versatz={r === "beide" ? 1 / 6 : 0}
              />
            )}
          </g>
        );
      })}

      {(Object.keys(aufbau.ort) as Knoten[]).map((k) => {
        const o = aufbau.ort[k];
        const an = aktiv.has(k);
        const [name, unter, wo] = NAMEN[k];
        const zeigtModell = an && k === "modell" && !!verkehr?.modell;
        const unten = o.y + 38;
        return (
          <g key={k}>
            {k === "browser" && <BrowserZeichen {...o} an={an} />}
            {k === "app" && <RackZeichen {...o} an={an} bewegt={bewegt} />}
            {k === "modell" && <ChipZeichen {...o} an={an} bewegt={bewegt} />}
            {k === "db" && <TonneZeichen {...o} an={an} />}
            <text
              x={o.x}
              y={unten}
              textAnchor="middle"
              fontSize={13}
              fill={an ? GRUEN : "currentColor"}
              fillOpacity={an ? 1 : 0.85}
            >
              {name}
            </text>
            <text
              x={o.x}
              y={unten + 15}
              textAnchor="middle"
              fontSize={11}
              fill={zeigtModell ? GELB : "currentColor"}
              fillOpacity={zeigtModell ? 1 : 0.5}
            >
              {zeigtModell ? verkehr?.modell : unter}
            </text>
            {wo && (
              <text
                x={o.x}
                y={unten + 29}
                textAnchor="middle"
                fontSize={9.5}
                fill="currentColor"
                fillOpacity={0.35}
              >
                {wo}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Protokoll ---------- */

function Kommentar({ children }: { children: ReactNode }) {
  return (
    <span className="block whitespace-pre-wrap text-white/40">
      # {children}
    </span>
  );
}

function Ok({ children }: { children: ReactNode }) {
  return (
    <span>
      <span style={{ color: GRUEN }}>✓</span> {children}
    </span>
  );
}

function Hell({ children }: { children: ReactNode }) {
  return <span className="text-paper">{children}</span>;
}

function Pfeil({
  von,
  nach,
  children,
}: {
  von: string;
  nach: string;
  children: ReactNode;
}) {
  return (
    <span>
      <span className="text-white/45">
        {von} → {nach}
      </span>
      {"  "}
      {children}
    </span>
  );
}

function EnterHinweis({ children }: { children: ReactNode }) {
  return (
    <span className="mt-[1lh] block">
      <span className="rounded-[3px] bg-marker px-1.5 py-px font-semibold text-ink">
        ↵ Enter
      </span>{" "}
      <span className="text-white/80">{children}</span>
    </span>
  );
}

function Balken({ wert }: { wert: number }) {
  const voll = Math.round(wert / 10);
  return (
    <>
      <span style={{ color: GRUEN }}>{"█".repeat(voll)}</span>
      <span className="text-white/20">{"█".repeat(10 - voll)}</span>
    </>
  );
}

/**
 * Der Ablauf als Folge von Schritten: feste Zeilen, Anfragen mit Spinner und
 * Verkehr auf den Leitungen, und die Antwort, die Zeichen für Zeichen
 * hereinläuft wie aus /api/assist.
 */
type Schritt =
  | { zeile: ReactNode }
  | ({ warte: string; dauer: number } & Verkehr)
  | ({ strom: string } & Verkehr);

const ABLAUF: Schritt[] = [
  { zeile: " " },
  {
    zeile: (
      <Kommentar>
        1 Die Frage geht an den Server. Erst wird geprüft, wer fragt.
      </Kommentar>
    ),
  },
  {
    warte: "POST /api/legal-search",
    dauer: 900,
    leitungen: ["browser"],
    richtung: "hin",
  },
  {
    zeile: (
      <Pfeil von="Browser" nach="Ciprè">
        POST /api/legal-search <span style={{ color: GRUEN }}>angemeldet</span>
      </Pfeil>
    ),
  },
  { zeile: " " },
  {
    zeile: (
      <Kommentar>
        2 Nennt die Frage ein Gesetz, wird die Suche darauf eingegrenzt.
      </Kommentar>
    ),
  },
  {
    warte: "gleiche mit der Gesetzesliste ab",
    dauer: 700,
    leitungen: ["db"],
    richtung: "hin",
  },
  {
    zeile: (
      <Ok>
        Gesetz erkannt: <Hell>BGB</Hell> · gesucht wird nur dort
      </Ok>
    ),
  },
  { zeile: " " },
  {
    zeile: (
      <Kommentar>
        3 Ein Embedding-Modell übersetzt die Bedeutung der Frage in 1.024
        Zahlen. Texte mit ähnlicher Bedeutung liegen nah beieinander.
      </Kommentar>
    ),
  },
  {
    warte: "embed (input_type: search_query)",
    dauer: 1100,
    leitungen: ["modell"],
    richtung: "hin",
    modell: "Cohere Embed v4",
  },
  {
    zeile: (
      <Pfeil von="Ciprè" nach="Bedrock">
        <Hell>Cohere Embed v4</Hell>
      </Pfeil>
    ),
  },
  {
    zeile: (
      <Ok>
        [0.021, −0.113, 0.087, 0.004, …] <Hell>1.024</Hell> Dimensionen
      </Ok>
    ),
  },
  { zeile: " " },
  {
    zeile: (
      <Kommentar>
        4 Zwei Suchen in einer Abfrage: nach Wörtern und nach Bedeutung. Wer in
        beiden Listen weit oben steht, kommt nach vorn.
      </Kommentar>
    ),
  },
  {
    warte: "rpc hybrid_search",
    dauer: 1100,
    leitungen: ["db"],
    richtung: "hin",
  },
  {
    zeile: (
      <Pfeil von="Ciprè" nach="Supabase">
        rpc <Hell>hybrid_search</Hell>
      </Pfeil>
    ),
  },
  {
    zeile: (
      <Ok>
        Volltext, deutsch{"       "}
        <Hell>60</Hell> Kandidaten
      </Ok>
    ),
  },
  {
    zeile: (
      <Ok>
        Vektor, pgvector HNSW{"   "}
        <Hell>60</Hell> Kandidaten
      </Ok>
    ),
  },
  {
    zeile: (
      <Ok>
        zusammengeführt: 1 / (60 + Rang) → <Hell>beste 20</Hell>
      </Ok>
    ),
  },
  { zeile: " " },
  {
    zeile: (
      <Kommentar>
        5 Die Suche ist schnell, aber grob. Rerank liest jeden der 20 Abschnitte
        zusammen mit der Frage und sortiert genauer.
      </Kommentar>
    ),
  },
  {
    warte: "rerank 20 Abschnitte",
    dauer: 1100,
    leitungen: ["modell"],
    richtung: "hin",
    modell: "Cohere Rerank 3.5",
  },
  {
    zeile: (
      <Pfeil von="Ciprè" nach="Bedrock">
        <Hell>Cohere Rerank 3.5</Hell>
      </Pfeil>
    ),
  },
  ...(
    [
      ["0,96", "§ 438 BGB", "Verjährung der Mängelansprüche"],
      ["0,91", "§ 476 BGB", "Abweichende Vereinbarungen"],
      ["0,74", "§ 437 BGB", "Rechte des Käufers bei Mängeln"],
      ["0,31", "§ 195 BGB", "Regelmäßige Verjährungsfrist"],
    ] as const
  ).map(([wert, zitat, titel]) => ({
    zeile: (
      <span>
        {"  "}
        <span style={{ color: GELB }}>{wert}</span>
        {"  "}
        <Hell>{zitat}</Hell>
        {"  "}
        {titel}
      </span>
    ),
  })),
  { zeile: <Ok>die besten 8 gehen weiter</Ok> },
  { zeile: " " },
  {
    zeile: (
      <Kommentar>
        6 Claude antwortet nur aus diesen Quellen, mit Fundstelle.
      </Kommentar>
    ),
  },
  {
    warte: "POST /api/assist · 8 Quellen",
    dauer: 1000,
    leitungen: ["browser", "modell"],
    richtung: "hin",
    modell: "Claude Sonnet",
  },
  {
    zeile: (
      <Pfeil von="Ciprè" nach="Bedrock">
        <Hell>Claude Sonnet</Hell> · Antwort im Stream
      </Pfeil>
    ),
  },
  {
    strom: ANTWORT,
    leitungen: ["modell", "browser"],
    richtung: "zurueck",
    modell: "Claude Sonnet",
  },
  { zeile: " " },
  {
    zeile: (
      <Kommentar>
        7 Prüfen: Trägt jede Aussage, stehen die Paragrafen in den Quellen?
      </Kommentar>
    ),
  },
  {
    warte: "bewerte Faktentreue und Vollständigkeit",
    dauer: 1000,
    leitungen: ["modell"],
    richtung: "hin",
    modell: "Claude Haiku",
  },
  {
    zeile: (
      <Pfeil von="Ciprè" nach="Bedrock">
        <Hell>Claude Haiku</Hell> als Prüfer
      </Pfeil>
    ),
  },
  { zeile: <Ok>2 von 2 Paragrafen in den Quellen gefunden</Ok> },
  {
    zeile: (
      <span>
        Belegt{"  "}
        <Balken wert={BELEGT} />
        {"  "}
        <Hell>{BELEGT} %</Hell>
      </span>
    ),
  },
];

/* Vor jeder Kommentarzeile außer der ersten hält der Ablauf an und wartet auf Enter */
const istKapitel = (s?: Schritt) =>
  !!s && "zeile" in s && isValidElement(s.zeile) && s.zeile.type === Kommentar;
const HALTE = new Set(
  ABLAUF.flatMap((_, i) => (i > 0 && istKapitel(ABLAUF[i + 1]) ? [i] : [])),
);
const KAPITEL = ABLAUF.filter((s) => istKapitel(s)).length;

type Phase = "wartet" | "tippt" | "bereit" | "laeuft" | "pause" | "fertig";

/**
 * Wie das Installations-Terminal: Der Befehl tippt sich selbst, sobald das
 * Fenster ins Bild kommt. Jedes Enter, jeder Klick oder Tipp spielt einen
 * Schritt der Recherche ab, danach wartet das Terminal auf den nächsten.
 * Oben zeigt die Bühne, welcher Server gerade mit welchem spricht, darunter
 * läuft das Protokoll. Wer weniger Bewegung
 * eingestellt hat, sieht den ganzen Ablauf auf einmal.
 */
export function RagTerminal() {
  const rahmen = useRef<HTMLDivElement>(null);
  const protokoll = useRef<HTMLPreElement>(null);
  const imBild = useRef(false);
  const [phase, setPhase] = useState<Phase>("wartet");
  const [ruhig, setRuhig] = useState(false);
  const [breit, setBreit] = useState(true);
  const [n, setN] = useState(0);
  const [schritt, setSchritt] = useState(0);
  const [takt, setTakt] = useState(0);
  const [freigabe, setFreigabe] = useState(-1);

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
      { threshold: 0.4 },
    );
    io.observe(el);
    const ro = new ResizeObserver(([e]) =>
      setBreit(e.contentRect.width >= 520),
    );
    ro.observe(el);
    return () => {
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    if (phase !== "tippt") return;
    if (n >= BEFEHL.length) {
      setPhase("bereit");
      return;
    }
    const t = setTimeout(() => setN((x) => x + 1), n === 0 ? 600 : 32);
    return () => clearTimeout(t);
  }, [phase, n]);

  const ausfuehren = useCallback(() => {
    if (phase === "pause") {
      setFreigabe(schritt);
      setPhase("laeuft");
    } else if (phase === "bereit") {
      setPhase("laeuft");
    }
  }, [phase, schritt]);

  const nochmal = useCallback(() => {
    setSchritt(0);
    setTakt(0);
    setFreigabe(-1);
    setPhase("laeuft");
  }, []);

  useEffect(() => {
    if (phase !== "bereit" && phase !== "pause") return;
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

  // Ein Schritt nach dem anderen; takt zählt Spinnerbilder oder Zeichen
  useEffect(() => {
    if (phase !== "laeuft") return;
    if (ruhig || schritt >= ABLAUF.length) {
      setSchritt(ABLAUF.length);
      setPhase("fertig");
      return;
    }
    if (HALTE.has(schritt) && freigabe !== schritt) {
      setPhase("pause");
      return;
    }
    const s = ABLAUF[schritt];
    const weiter = () => {
      setSchritt((x) => x + 1);
      setTakt(0);
    };
    let t: ReturnType<typeof setTimeout>;
    if ("warte" in s) {
      t =
        takt * 80 < s.dauer
          ? setTimeout(() => setTakt((x) => x + 1), 80)
          : setTimeout(weiter, 0);
    } else if ("strom" in s) {
      t =
        takt < s.strom.length
          ? setTimeout(() => setTakt((x) => x + 2), 20)
          : setTimeout(weiter, 300);
    } else {
      t = setTimeout(weiter, 120);
    }
    return () => clearTimeout(t);
  }, [phase, ruhig, schritt, takt, freigabe]);

  // Das Protokoll folgt der letzten Zeile, wie ein echtes Terminal
  // biome-ignore lint/correctness/useExhaustiveDependencies: schritt und takt lösen das Mitlaufen aus
  useEffect(() => {
    const el = protokoll.current;
    if (el && (phase === "laeuft" || phase === "pause"))
      el.scrollTop = el.scrollHeight;
  }, [schritt, takt, phase]);

  // Während ein Schritt läuft, zeigt die Bühne seinen Verkehr. In der Pause
  // bleibt der des letzten Schritts stehen, mit Anfrage und Antwort.
  const zuletzt = ABLAUF.slice(0, schritt + 1).findLast(
    (s): s is Extract<Schritt, Verkehr> => "warte" in s || "strom" in s,
  );
  const aktuell = phase === "laeuft" ? ABLAUF[schritt] : undefined;
  const verkehr: Verkehr | null =
    aktuell && ("warte" in aktuell || "strom" in aktuell)
      ? aktuell
      : phase === "pause" && zuletzt
        ? { ...zuletzt, richtung: "beide" }
        : null;

  const erledigt = ABLAUF.slice(0, schritt).filter((s) => istKapitel(s)).length;

  const zeilen: ReactNode[] = [];
  ABLAUF.forEach((s, i) => {
    if (i > schritt || (i === schritt && phase !== "laeuft")) return;
    const jetzt = i === schritt;
    if ("warte" in s) {
      if (jetzt)
        zeilen.push(
          <span>
            {SPINNER[takt % SPINNER.length]} {s.warte} …
          </span>,
        );
    } else if ("strom" in s) {
      zeilen.push(
        <span className="block whitespace-pre-wrap text-paper">
          {jetzt ? s.strom.slice(0, takt) : s.strom}
          {jetzt && <Cursor />}
        </span>,
      );
    } else if (!jetzt) {
      zeilen.push(s.zeile);
    }
  });

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Klick und Tippen sind eine Abkürzung; per Tastatur wirkt Enter oder der Knopf in der Unterschrift
    // biome-ignore lint/a11y/useKeyWithClickEvents: siehe oben
    <div
      ref={rahmen}
      onClick={ausfuehren}
      className={
        phase === "bereit" || phase === "pause" ? "cursor-pointer" : undefined
      }
    >
      <figure className="my-5">
        <InteraktionsFlaeche
          aktiv={phase === "bereit" || phase === "pause"}
          kennung="rag-terminal"
        >
          <div
            className={`overflow-hidden ${FENSTER_RUNDUNG} bg-ink text-paper shadow-[0_6px_20px_rgba(0,0,0,0.18)]`}
          >
            <Kopfleiste titel="matheosieben — cipre" />

            <div className="border-b border-white/10 px-3 py-2.5 font-mono">
              <Buehne
                aufbau={breit ? BREIT : SCHMAL}
                verkehr={verkehr}
                bewegt={!ruhig}
                langsam={phase === "pause"}
              />
            </div>

            <pre
              ref={protokoll}
              className="h-[12.5rem] overflow-y-auto whitespace-pre-wrap px-4 py-3 font-mono text-[0.8rem] leading-relaxed text-white/70"
            >
              <Kommentar>
                Vorab: Jeder Gesetzesabschnitt (100 bis 500 Tokens) liegt in
                Supabase schon als Vektor, berechnet mit demselben
                Embedding-Modell wie gleich die Frage.
              </Kommentar>
              <span className="mt-[1lh] block whitespace-pre-wrap text-paper">
                <Prompt>
                  <span aria-hidden="true">{BEFEHL.slice(0, n)}</span>
                </Prompt>
                {(phase === "wartet" ||
                  phase === "tippt" ||
                  phase === "bereit") && <Cursor />}
                <span className="sr-only">{BEFEHL}</span>
              </span>
              {zeilen.map((z, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Zeilen werden nur angehängt
                <span key={i} className="block">
                  {z}
                </span>
              ))}
              {phase === "bereit" && (
                <EnterHinweis>
                  startet die Suche, Schritt für Schritt
                </EnterHinweis>
              )}
              {phase === "pause" && (
                <EnterHinweis>
                  für Schritt {erledigt + 1} von {KAPITEL}
                </EnterHinweis>
              )}
              {phase === "fertig" && (
                <span className="mt-[1lh] block text-paper">
                  <Prompt />
                  <Cursor />
                </span>
              )}
            </pre>
          </div>
        </InteraktionsFlaeche>
        <figcaption className="mt-2 font-sans text-[0.72rem] leading-snug text-meta">
          {phase === "fertig" ? (
            <span aria-live="polite">
              Nachgestellt an einer Beispielfrage, im Zielaufbau mit allen
              Modellen über AWS Bedrock in der EU.{" "}
              <InteraktionsHinweis>
                <button
                  type="button"
                  onClick={nochmal}
                  className="btn-quiet py-1 underline underline-offset-2"
                >
                  Noch einmal
                </button>
              </InteraktionsHinweis>
            </span>
          ) : phase === "laeuft" ? (
            `Schritt ${Math.max(erledigt, 1)} von ${KAPITEL}`
          ) : (
            <InteraktionsHinweis>
              <button
                type="button"
                disabled={phase !== "bereit" && phase !== "pause"}
                onClick={(e) => {
                  e.stopPropagation();
                  ausfuehren();
                }}
                className="btn-quiet py-1 text-left underline-offset-2 hover:underline disabled:cursor-wait"
              >
                {phase === "pause" ? "Weiter: " : "Zum Ausführen "}
                <kbd className="font-sans font-semibold">Enter</kbd> drücken
                oder ins Fenster tippen.
              </button>
            </InteraktionsHinweis>
          )}
        </figcaption>
      </figure>
    </div>
  );
}
