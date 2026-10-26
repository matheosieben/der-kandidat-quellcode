import { IconChevron } from "@/components/newspaper/icons";
import { cursorGruppe } from "@/components/werkstatt/interaktions-hinweis";

/** Abstand der Pfeilmitte vom rechten Rand des Felds; der Cursor tippt dorthin. */
const PFEIL = 22;

/**
 * Auswahl der Kapitel oben auf schmalen Bildschirmen, wo die Übersicht in der
 * Randspalte fehlt. Der Pfeil ist eigens gezeichnet, damit er mit Abstand zum
 * Rand steht statt am Rand zu kleben, wie es der Browser sonst tut.
 */
export function KapitelAuswahl({
  id,
  beschriftung,
  ariaLabel,
  kennung,
  kapitel,
  wert,
  onWaehle,
}: {
  id: string;
  beschriftung: string;
  ariaLabel: string;
  /** Dieselbe Cursor-Gruppe wie die Übersicht in der Randspalte: Wer eine davon bedient, braucht den Hinweis in keiner mehr. */
  kennung: string;
  kapitel: readonly { id: string; titel: string }[];
  wert: string;
  onWaehle: (id: string) => void;
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className="flex items-center gap-3 border-t-4 border-opinion pt-2"
      {...cursorGruppe(kennung, { art: "innen" })}
    >
      <label htmlFor={id} className="kicker shrink-0">
        {beschriftung}
      </label>
      <div className="relative min-w-0 flex-1">
        <select
          id={id}
          value={wert}
          onChange={(event) => onWaehle(event.target.value)}
          data-cursor-ziel
          data-cursor-pfeil={PFEIL}
          className="min-h-11 w-full appearance-none rounded-none border border-rule bg-paper pr-10 pl-3 font-sans text-[0.88rem] text-ink"
        >
          {kapitel.map((k, index) => (
            <option key={k.id} value={k.id}>
              {index + 1} / {kapitel.length} · {k.titel}
            </option>
          ))}
        </select>
        <IconChevron
          width={16}
          height={16}
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-2"
          style={{ right: PFEIL - 8 }}
        />
      </div>
    </nav>
  );
}
