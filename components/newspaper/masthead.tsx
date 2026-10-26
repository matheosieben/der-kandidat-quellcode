import Link from "next/link";
import { ausgabe } from "@/content/ausgabe";
import { modellAnteile } from "@/lib/modell-anteile";
import { monateMitSchaetzung } from "@/lib/schaetzung";
import { EinblendKopf } from "./einblend-kopf";
import { Heute } from "./heute";
import { KopfAktionen, Kopfleiste, RessortNavigation } from "./kopfleiste";
import { Menue } from "./menue";
import { Wortmarke } from "./wortmarke";

export function Masthead({ ressort = "Titelseite" }: { ressort?: string }) {
  const monate = monateMitSchaetzung();
  const anteile = modellAnteile(monate);
  const vorher = modellAnteile(monate.slice(0, -1));
  return (
    <>
      <EinblendKopf key={ressort}>
        <Kopfleiste ressort={ressort} />
      </EinblendKopf>
      <header id="titelkopf" className="no-print">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6">
          <div className="hidden grid-cols-[1fr_auto_1fr] items-center pt-3 xl:grid">
            <span />
            <ul className="flex gap-5 font-sans text-[0.68rem] tracking-[0.14em] text-ink-2 uppercase">
              <li className="font-bold text-ink">{ausgabe.untertitel}</li>
              <li>{ausgabe.nummer}</li>
            </ul>
            <KopfAktionen ressort={ressort} />
          </div>

          {/* md bis xl: Datum links, Knöpfe rechts über der Wortmarke */}
          <div className="hidden items-center justify-between gap-4 pt-3 md:flex xl:hidden">
            <p className="font-sans text-[0.85rem] leading-snug">
              <span className="font-semibold">
                <Heute />
              </span>
              <span className="text-ink-2"> · {ausgabe.ort}</span>
            </p>
            <KopfAktionen ressort={ressort} />
          </div>

          <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-x-1 gap-y-1 pt-3 pb-3 md:grid-cols-1 md:pt-1 xl:grid-cols-[1fr_auto_1fr] xl:pt-1">
            <div className="md:hidden">
              <Menue ressort={ressort} />
            </div>
            <div className="hidden font-sans text-[0.9rem] leading-snug xl:block">
              <p className="font-semibold">
                <Heute />
              </p>
              <p className="text-ink-2">{ausgabe.ort}</p>
            </div>
            <Link
              href="/"
              className="wordmark text-[1.75rem] max-[360px]:text-[1.5rem] sm:text-[2.6rem] md:text-[3.4rem] lg:text-[4.4rem]"
            >
              <Wortmarke />
            </Link>
            <span className="md:hidden" />
            <p className="col-span-3 text-center font-sans text-[0.78rem] text-meta md:col-span-1 xl:hidden">
              <span className="md:hidden">
                <Heute kurz /> ·{" "}
              </span>
              {ausgabe.untertitel}
              <span className="max-md:hidden"> · {ausgabe.nummer}</span>
            </p>
            <Link
              href="/werkstatt#modelle"
              className="hidden flex-col items-end gap-1 font-sans text-[0.85rem] tabular-nums hover:underline xl:flex"
              title="Zu Modelle und Arbeitskalender in der Werkstatt. Token-Anteile seit September 2025, einschließlich Hochrechnung. Pfeile: Veränderung gegenüber dem Gesamtanteil bis zum Vormonat."
            >
              <span className="flex gap-2 text-up">
                <span>Claude</span>
                <span className="font-semibold">
                  {anteile.claude} %{" "}
                  {anteile.claude >= vorher.claude ? "↑" : "↓"}
                </span>
              </span>
              <span className="flex gap-2 text-live">
                <span>Codex</span>
                <span className="font-semibold">
                  {anteile.codex} % {anteile.codex <= vorher.codex ? "↓" : "↑"}
                </span>
              </span>
            </Link>
          </div>

          <div className="double-rule md:hidden" />
          <div className="max-md:hidden">
            <RessortNavigation ressort={ressort} />
          </div>
        </div>
      </header>
    </>
  );
}
