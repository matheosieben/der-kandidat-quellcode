"use client";

import Link from "next/link";
import { useRef } from "react";
import { ausgabe, kontaktLink, rubriken } from "@/content/ausgabe";
import { Heute } from "./heute";
import { IconClose, IconGames, IconMenu } from "./icons";
import { Wortmarke } from "./wortmarke";

/**
 * Burger-Menü der schmalen Ansicht. Der native Dialog übernimmt Fokus,
 * Escape und das Sperren des Hintergrunds; ein Tipp neben das Panel oder
 * auf einen Link schließt ihn.
 */
export function Menue({ ressort }: { ressort: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const schliessen = () => dialog.current?.close();

  return (
    <>
      <button
        type="button"
        aria-label="Menü öffnen"
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
        className="btn-quiet -ml-2 grid size-10 place-items-center rounded-sm"
      >
        <IconMenu width={24} height={24} />
      </button>

      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Escape schließt den Dialog nativ */}
      <dialog
        ref={dialog}
        aria-label="Menü"
        className="menue"
        onClick={(e) => {
          if (e.target === e.currentTarget) schliessen();
        }}
      >
        <div className="flex h-full flex-col px-5">
          <div className="flex items-center justify-between border-b border-rule py-3">
            <Link
              href="/"
              onClick={schliessen}
              className="wordmark text-[1.2rem]"
            >
              <Wortmarke />
            </Link>
            <button
              type="button"
              aria-label="Menü schließen"
              onClick={schliessen}
              className="btn-quiet -mr-2 grid size-10 place-items-center rounded-sm"
            >
              <IconClose width={24} height={24} />
            </button>
          </div>

          <nav aria-label="Ressorts" className="mt-2">
            <ul className="-mx-5 font-sans text-[1.1rem]">
              {rubriken
                .filter((r) => r.href !== "/lebenslauf")
                .map((r) => (
                  <li key={r.href} className="border-b border-rule">
                    <Link
                      href={r.href}
                      onClick={schliessen}
                      aria-current={r.name === ressort ? "page" : undefined}
                      className="section-link flex items-center gap-2 border-l-4 border-transparent pr-5 pl-4 py-3 aria-[current=page]:border-ink aria-[current=page]:bg-paper-2 aria-[current=page]:font-bold"
                    >
                      {r.href === "/games" && (
                        <IconGames
                          width={18}
                          height={18}
                          className="shrink-0"
                        />
                      )}
                      {r.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>

          <div className="mt-6 grid gap-2">
            <a
              href={kontaktLink}
              className="btn-cta justify-center py-3 text-[0.95rem]"
            >
              Kontakt
            </a>
            <Link
              href="/lebenslauf"
              onClick={schliessen}
              aria-current={ressort === "Lebenslauf" ? "page" : undefined}
              className="btn-outline justify-center py-3 text-[0.95rem]"
            >
              Lebenslauf
            </Link>
          </div>

          <p className="mt-auto py-5 font-sans text-[0.8rem] text-meta">
            <Heute /> · {ausgabe.untertitel} · {ausgabe.nummer}
          </p>
        </div>
      </dialog>
    </>
  );
}
