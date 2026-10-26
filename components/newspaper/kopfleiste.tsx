import Link from "next/link";
import { InterviewTaste, Kuerzel } from "@/components/ki/interview-taste";
import { kontaktLink, rubriken } from "@/content/ausgabe";
import { IconGames } from "./icons";
import { Menue } from "./menue";
import { Wortmarke } from "./wortmarke";

/**
 * Interview-Fenster, Kontakt und Lebenslauf; schmal steht der Lebenslauf im
 * Menü, das Interview-Fenster gibt es nur mit Maus und Tastatur.
 */
export function KopfAktionen({ ressort }: { ressort: string }) {
  return (
    <div className="flex shrink-0 justify-end gap-2 whitespace-nowrap">
      <InterviewTaste className="btn-outline hidden gap-2 font-semibold pointer-fine:md:inline-flex">
        Interview <Kuerzel className="opacity-65" />
      </InterviewTaste>
      <a href={kontaktLink} className="btn-cta">
        Kontakt
      </a>
      <Link
        href="/lebenslauf"
        aria-current={ressort === "Lebenslauf" ? "page" : undefined}
        className="btn-outline max-md:hidden"
      >
        Lebenslauf
      </Link>
    </div>
  );
}

export function RessortNavigation({
  ressort,
  kompakt = false,
}: {
  ressort: string;
  kompakt?: boolean;
}) {
  return (
    <nav aria-label="Ressorts" className={kompakt ? "min-w-0" : "double-rule"}>
      <ul
        className={`scroll-x flex items-center whitespace-nowrap font-sans ${
          kompakt
            ? "gap-5 py-2 text-[0.85rem] xl:gap-4 xl:py-4 xl:text-[0.8rem]"
            : "justify-center gap-7 py-3 text-[0.92rem] lg:gap-9"
        }`}
      >
        {rubriken
          .filter((r) => r.href !== "/lebenslauf")
          .map((r) => (
            <li key={r.href} className="shrink-0">
              <Link
                href={r.href}
                aria-current={r.name === ressort ? "page" : undefined}
                className="nav-link inline-flex items-center gap-1.5 aria-[current=page]:font-bold"
              >
                {r.href === "/games" && (
                  <IconGames width={16} height={16} className="shrink-0" />
                )}
                <span className="nav-link-label">{r.name}</span>
              </Link>
            </li>
          ))}
      </ul>
    </nav>
  );
}

/**
 * Die eingeblendete Leiste. Schmal: Menü, Wortmarke, Kontakt in einer
 * Zeile. Ab md: Wortmarke und Knöpfe, darunter die Ressorts. Ab xl: alles
 * in einer Zeile.
 */
export function Kopfleiste({ ressort }: { ressort: string }) {
  return (
    <div className="border-b border-rule bg-paper shadow-[0_2px_6px_rgba(0,0,0,0.06)]">
      <div className="mx-auto grid max-w-[1280px] grid-cols-[auto_1fr_auto] items-center gap-x-2 px-4 py-1.5 md:grid-cols-[auto_1fr] md:gap-x-3 md:px-6 md:pt-2 md:pb-0 xl:grid-cols-[auto_minmax(0,1fr)_auto] xl:gap-x-6 xl:py-1">
        <div className="md:hidden">
          <Menue ressort={ressort} />
        </div>
        <Link
          href="/"
          className="wordmark justify-self-start text-[1.2rem] max-[360px]:text-[1rem] md:text-[1.65rem] xl:text-[1.45rem]"
          title="Zur Titelseite"
        >
          <Wortmarke />
        </Link>
        <div className="hidden min-w-0 md:col-span-2 md:row-start-2 md:block xl:col-span-1 xl:col-start-2 xl:row-start-1">
          <RessortNavigation ressort={ressort} kompakt />
        </div>
        <div className="justify-self-end md:col-start-2 md:row-start-1 xl:col-start-3">
          <KopfAktionen ressort={ressort} />
        </div>
      </div>
    </div>
  );
}
