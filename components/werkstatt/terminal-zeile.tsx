import type { ReactNode } from "react";
import { InteraktionsFlaeche } from "@/components/werkstatt/interaktions-hinweis";

type TerminalEintrag = { befehl: string } | { ausgabe: ReactNode };

/** Ampelknöpfe wie unter macOS: satte Farbe mit dunklem Rand */
export const AMPEL = [
  ["#ff5f57", "#e0443e"],
  ["#febc2e", "#dea123"],
  ["#28c840", "#1aab29"],
] as const;

/*
 * Maße nach einem Bildschirmfoto des Terminals von macOS: Kopfleiste 32 px,
 * Knöpfe 14 px im Abstand von 23 px (Mitte zu Mitte), Mitte des ersten Knopfs
 * 16 px von oben und links. Der Eckenradius des Fensters ist ebenfalls 16 px,
 * so liegen Ecke und Schließknopf konzentrisch.
 */
export const FENSTER_RUNDUNG = "rounded-[16px]";

/**
 * Kopfleiste nach dem Vorbild des Terminals von macOS: etwas heller als das
 * Fenster mit Lichtkante oben, Ampelknöpfe, Ordnersymbol und der Titel in
 * halbfetter Systemschrift.
 */
export function Kopfleiste({ titel }: { titel: string }) {
  return (
    <div className="flex h-[33px] items-center gap-[9px] border-b border-white/10 bg-[#2a2b2b] pl-[9px] pr-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
      {AMPEL.map(([farbe, rand]) => (
        <span
          key={farbe}
          aria-hidden="true"
          className="size-[14px] shrink-0 rounded-full"
          style={{ background: farbe, boxShadow: `inset 0 0 0 0.5px ${rand}` }}
        />
      ))}
      <svg
        aria-hidden="true"
        viewBox="0 0 16 13"
        className="ml-[5px] h-[13px] w-auto shrink-0"
      >
        <path
          d="M0 2a2 2 0 0 1 2-2h4l1.5 1.5H14a2 2 0 0 1 2 2V11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2Z"
          fill="#5aa9e6"
        />
        <path d="M0 4h16v7a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2Z" fill="#7cc0f2" />
      </svg>
      <span className="-ml-[3px] truncate font-sans text-[13px] font-semibold text-white/55">
        {titel}
      </span>
    </div>
  );
}

/** Ein kleines Terminalfenster mitten im Text: Befehle mit $, darunter Ausgaben. */
export function TerminalFenster({
  zeilen,
  unterschrift,
  titel = "matheosieben — -zsh",
  interaktiv = false,
  kennung = "terminal",
}: {
  zeilen: TerminalEintrag[];
  unterschrift?: ReactNode;
  titel?: string;
  interaktiv?: boolean;
  /** Für den Cursor: merkt sich, dass hier schon jemand eingegriffen hat. */
  kennung?: string;
}) {
  return (
    <figure className="my-5">
      <InteraktionsFlaeche aktiv={interaktiv} kennung={kennung}>
        <div
          className={`overflow-hidden ${FENSTER_RUNDUNG} bg-ink text-paper shadow-[0_6px_20px_rgba(0,0,0,0.18)]`}
        >
          <Kopfleiste titel={titel} />
          <pre className="scroll-x px-4 py-3 font-mono text-[0.85rem] leading-relaxed">
            {zeilen.map((z, i) =>
              "befehl" in z ? (
                // biome-ignore lint/suspicious/noArrayIndexKey: Zeilen werden nur angehängt
                <code key={i} className="block">
                  <span
                    aria-hidden="true"
                    className="text-white/45 select-none"
                  >
                    ${" "}
                  </span>
                  {z.befehl}
                </code>
              ) : (
                // biome-ignore lint/suspicious/noArrayIndexKey: Zeilen werden nur angehängt
                <span key={i} className="block text-white/70">
                  {z.ausgabe}
                </span>
              ),
            )}
          </pre>
        </div>
      </InteraktionsFlaeche>
      {unterschrift && (
        <figcaption className="mt-2 font-sans text-[0.72rem] leading-snug text-meta">
          {unterschrift}
        </figcaption>
      )}
    </figure>
  );
}
