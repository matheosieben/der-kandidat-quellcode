"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { heute, tagesraetsel } from "@/lib/wortwahl";
import { slab } from "./schrift";

type Art = "wortwahl" | "springer";

const datumLang = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Berlin",
});

/** Liest, was der Browser über frühere Partien weiß. Ohne Speicher bleibt es leer. */
function lies(art: Art) {
  try {
    if (art === "springer") {
      const rekord = Number(localStorage.getItem("springer-rekord")) || 0;
      return {
        zeilen: rekord
          ? [`Ihr Rekord: ${rekord.toLocaleString("de-DE")} Tokens`]
          : [],
        laufend: false,
      };
    }
    const d = heute();
    let gespielt = 0;
    let gewonnen = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k?.startsWith("wortwahl-")) continue;
      const s = JSON.parse(localStorage.getItem(k) ?? "null");
      if (s?.status === "gewonnen") gewonnen++;
      if (s?.status && s.status !== "laeuft") gespielt++;
    }
    const laufend = [1, 2, 3].some(
      (r) =>
        JSON.parse(localStorage.getItem(`wortwahl-${d}-${r}`) ?? "null")
          ?.versuche?.length,
    );
    return {
      zeilen: [
        `Nr. ${tagesraetsel(d).nummer}`,
        ...(gespielt
          ? [
              `${gespielt} gespielt · ${Math.round((gewonnen / gespielt) * 100)} % gelöst`,
            ]
          : []),
      ],
      laufend,
    };
  } catch {
    return { zeilen: [], laufend: false };
  }
}

/**
 * Startbildschirm wie bei NYT Games: Symbol, Name, ein Satz, „Spielen“ und
 * „Anleitung“, darunter Datum, Nummer und Redaktion. Erst nach dem Klick
 * erscheint das Spiel.
 */
export function Spielbereich({
  id,
  art,
  name,
  farbe,
  symbol,
  unterzeile,
  anleitung,
  children,
}: {
  id: string;
  art: Art;
  name: string;
  farbe: string;
  symbol: ReactNode;
  unterzeile: string;
  anleitung: ReactNode;
  children: ReactNode;
}) {
  const [gestartet, setGestartet] = useState(false);
  const rahmen = useRef<HTMLElement>(null);
  const spieltitel = useRef<HTMLHeadingElement>(null);
  const [hilfe, setHilfe] = useState(false);
  const [datum, setDatum] = useState("");
  const [info, setInfo] = useState<{ zeilen: string[]; laufend: boolean }>({
    zeilen: [],
    laufend: false,
  });

  useEffect(() => {
    if (!gestartet) return;
    spieltitel.current?.focus({ preventScroll: true });
    rahmen.current?.scrollIntoView({ block: "start" });
  }, [gestartet]);

  // Datum und Spielstand gibt es erst im Browser.
  // biome-ignore lint/correctness/useExhaustiveDependencies: beim Zurückkehren zum Start neu lesen
  useEffect(() => {
    setDatum(datumLang.format(new Date()));
    setInfo(lies(art));
  }, [art, gestartet]);

  const anleitungsKasten = hilfe && (
    <div
      id={`${id}-anleitung`}
      className="mx-auto mt-6 max-w-[32rem] rounded-lg border border-ink/10 bg-paper p-5 text-left font-sans text-[0.9rem] leading-relaxed text-ink shadow-sm"
    >
      <p className={`${slab.className} text-[1.4rem] font-bold`}>
        So wird gespielt
      </p>
      <div className="mt-2 space-y-2">{anleitung}</div>
    </div>
  );

  const hilfeKnopf = (klein: boolean) => (
    <button
      type="button"
      onClick={() => setHilfe((h) => !h)}
      aria-expanded={hilfe}
      aria-controls={`${id}-anleitung`}
      className={`btn-quiet rounded-full border border-ink font-sans font-semibold text-ink hover:bg-ink/5 aria-expanded:bg-ink/10 ${
        klein ? "h-9 px-4 text-[0.8rem]" : "h-10 px-4 text-[0.82rem]"
      }`}
    >
      Anleitung
    </button>
  );

  return (
    <section
      ref={rahmen}
      id={id}
      aria-labelledby={`${id}-titel`}
      className={`@container min-w-0 scroll-mt-20 ${gestartet ? "order-first sm:col-span-2" : ""}`}
    >
      {!gestartet ? (
        <>
          <div
            className="flex aspect-square flex-col items-center justify-center rounded-2xl p-4 text-center text-[#121212]"
            style={{ background: farbe }}
          >
            <span className="grid size-[clamp(48px,18cqw,76px)] shrink-0 place-items-center [&>span]:h-full [&>span]:w-full [&>svg]:h-full [&>svg]:w-full">
              {symbol}
            </span>
            <h2
              id={`${id}-titel`}
              className={`${slab.className} mt-3 text-[clamp(1.7rem,7cqw,2.8rem)] leading-none font-bold`}
            >
              {name}
            </h2>
            <p
              className={`${slab.className} mt-2 min-h-[3lh] max-w-[26ch] text-[clamp(1rem,4.2cqw,1.3rem)] leading-snug font-medium`}
            >
              {unterzeile}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setGestartet(true);
                  setHilfe(false);
                }}
                className="btn-dark h-10 min-w-[7rem] rounded-full bg-[#121212] px-4 font-sans text-[0.82rem] font-semibold text-white hover:bg-[#333] active:bg-[#454545]"
              >
                {info.laufend ? "Weiterspielen" : "Spielen"}
              </button>
              {hilfeKnopf(false)}
            </div>
          </div>
          <div className="mt-3 text-center font-sans text-[0.75rem] leading-relaxed text-ink-2">
            <p className="font-bold">{datum}</p>
            {info.zeilen.map((z) => (
              <p key={z}>{z}</p>
            ))}
            <p>Redaktion: Matheo Sieben</p>
          </div>
          {anleitungsKasten}
        </>
      ) : (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-3">
            <div className="flex items-center gap-3">
              {/* Das Symbol des Startbildschirms, auf die Hälfte verkleinert */}
              <span
                aria-hidden="true"
                className="relative size-[38px] shrink-0"
              >
                <span className="absolute top-0 left-0 block origin-top-left scale-50">
                  {symbol}
                </span>
              </span>
              <h2
                ref={spieltitel}
                tabIndex={-1}
                id={`${id}-titel`}
                className={`${slab.className} text-[1.8rem] leading-none font-bold outline-none`}
              >
                {name}
              </h2>
            </div>
            <div className="flex gap-2">
              {hilfeKnopf(true)}
              <button
                type="button"
                onClick={() => setGestartet(false)}
                className="btn-quiet h-9 rounded-full px-4 font-sans text-[0.8rem] font-semibold text-ink-2 hover:bg-paper-2"
              >
                Zum Start
              </button>
            </div>
          </div>
          {anleitungsKasten}
          <div className="mt-6">{children}</div>
        </div>
      )}
    </section>
  );
}
