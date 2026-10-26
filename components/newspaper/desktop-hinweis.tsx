"use client";

import { useId, useState, useSyncExternalStore } from "react";
import { AMPEL } from "@/components/werkstatt/terminal-zeile";
import { istMobilgeraet } from "@/lib/geraet";
import { teileLink } from "@/lib/link-teilen";

const SPEICHER = "kandidat:desktop-hinweis-geschlossen";

function abonnieren(hoerer: () => void) {
  const eingabe = window.matchMedia("(pointer: coarse) and (hover: none)");
  eingabe.addEventListener("change", hoerer);
  return () => eingabe.removeEventListener("change", hoerer);
}

function sollHinweisZeigen() {
  if (
    process.env.NODE_ENV === "development" &&
    new URLSearchParams(window.location.search).get("vorschau") ===
      "desktop-hinweis"
  ) {
    return true;
  }
  if (!istMobilgeraet()) return false;
  try {
    return sessionStorage.getItem(SPEICHER) !== "ja";
  } catch {
    return true;
  }
}

export function DesktopHinweis() {
  const titelId = useId();
  const mobil = useSyncExternalStore(
    abonnieren,
    sollHinweisZeigen,
    () => false,
  );
  const [geschlossen, setGeschlossen] = useState(false);
  const [teilt, setTeilt] = useState(false);
  const [meldung, setMeldung] = useState("");
  const [manuellerLink, setManuellerLink] = useState("");

  function schliessen() {
    setGeschlossen(true);
    try {
      sessionStorage.setItem(SPEICHER, "ja");
    } catch {}
  }

  async function senden() {
    if (teilt) return;
    setTeilt(true);
    setMeldung("");
    setManuellerLink("");
    const link = window.location.href;
    const ergebnis = await teileLink(link);
    if (ergebnis === "kopiert") {
      setMeldung("Link kopiert – Sie können ihn jetzt verschicken.");
    } else if (ergebnis === "manuell") {
      setManuellerLink(link);
      setMeldung(
        "Wählen Sie den Link aus und kopieren Sie ihn zum Verschicken.",
      );
    }
    setTeilt(false);
  }

  if (!mobil || geschlossen) return null;

  return (
    <aside
      aria-labelledby={titelId}
      className="fenster-auf no-print fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-40 mx-auto max-w-md overflow-hidden rounded-[14px] bg-[#1e1e1e] font-system text-white shadow-[0_0_0_0.5px_rgba(0,0,0,0.85),inset_0_0_0_0.5px_rgba(255,255,255,0.16),0_24px_60px_-20px_rgba(0,0,0,0.55)]"
    >
      <div className="flex h-11 items-center gap-4 border-b border-white/[0.08] bg-white/[0.045] px-4">
        <span className="-ml-4 flex items-center gap-2">
          <button
            type="button"
            onClick={schliessen}
            aria-label="Desktop-Hinweis schließen"
            title="Schließen"
            className="group/close -mr-4 grid size-11 place-items-center rounded-lg focus-visible:outline-[#8aa4ff]"
          >
            <span
              className="grid size-3 place-items-center rounded-full group-hover/close:brightness-110 group-active/close:brightness-75"
              style={{
                background: AMPEL[0][0],
                boxShadow: `inset 0 0 0 0.5px ${AMPEL[0][1]}`,
              }}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 12 12"
                className="size-3 opacity-0 group-hover/close:opacity-100 group-focus-visible/close:opacity-100 pointer-coarse:opacity-100"
              >
                <path
                  d="M3.75 3.75l4.5 4.5M8.25 3.75l-4.5 4.5"
                  stroke="#4d0000"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </button>
          {AMPEL.slice(1).map(([farbe, rand]) => (
            <span
              key={farbe}
              aria-hidden="true"
              className="size-3 rounded-full opacity-35"
              style={{
                background: farbe,
                boxShadow: `inset 0 0 0 0.5px ${rand}`,
              }}
            />
          ))}
        </span>
        <span className="text-[13px] font-semibold text-white/85">
          Der Kandidat · Hinweis
        </span>
      </div>
      <div className="px-4 py-4 font-terminal text-[12.5px] leading-[1.6] text-white/75">
        <p id={titelId} className="flex gap-2 font-semibold text-white">
          <span aria-hidden="true" className="text-[#8aa4ff]">
            ✻
          </span>
          Diese Seite ist für Desktop optimiert.
        </p>
        <p className="mt-2">
          Am Computer haben Sie mehr Platz für die Texte und Grafiken.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2 font-system min-[360px]:grid-cols-2">
          <button
            type="button"
            onClick={schliessen}
            className="btn-terminal min-h-11 rounded-md border border-white/20 px-3 font-semibold text-white/85 hover:bg-white/[0.08] hover:text-white active:bg-white/[0.14]"
          >
            Hier weiterlesen
          </button>
          <button
            type="button"
            onClick={senden}
            disabled={teilt}
            aria-busy={teilt}
            className="min-h-11 rounded-md bg-cta px-3 font-semibold text-cta-ink hover:bg-[var(--cta-hover)] active:bg-[var(--cta-active)] focus-visible:outline-cta disabled:opacity-60"
          >
            Link senden
          </button>
        </div>
        <output
          className={
            meldung ? "mt-3 block text-[11px] text-white/65" : "sr-only"
          }
        >
          {meldung}
        </output>
        {manuellerLink && (
          <label className="mt-2 block text-[11px] text-white/65">
            Link zum Kopieren
            <input
              type="url"
              readOnly
              value={manuellerLink}
              onFocus={(event) => event.currentTarget.select()}
              className="mt-1 min-h-11 w-full min-w-0 rounded-md border border-white/20 bg-black/20 px-3 font-terminal text-[12px] text-white focus-visible:outline-[#8aa4ff]"
            />
          </label>
        )}
      </div>
    </aside>
  );
}
