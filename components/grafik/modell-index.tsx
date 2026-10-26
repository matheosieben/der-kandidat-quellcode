import Image from "next/image";
import { modellAnteile } from "@/lib/modell-anteile";
import type { Monat } from "@/lib/schaetzung";
import { FARBE, ICON, NAME } from "./werkzeuge";

/** Die Anteile in einer Zeile, etwa rechts über dem Verlauf. */
export function AnteilZeile({ monate }: { monate: Monat[] }) {
  const anteile = modellAnteile(monate);

  return (
    <p className="flex min-h-7 flex-wrap items-center gap-x-5 gap-y-2 font-sans text-[1rem] leading-none">
      {(["claude", "codex"] as const).map((a) => (
        <span key={a} className="flex shrink-0 items-center gap-1.5">
          <Image src={ICON[a]} alt="" width={20} height={20} />
          <span className="text-ink-2">{NAME[a]}</span>
          <strong
            className="hl-feature text-[1.5rem] tabular-nums"
            style={{ color: FARBE[a] }}
          >
            {anteile[a]} %
          </strong>
        </span>
      ))}
    </p>
  );
}
