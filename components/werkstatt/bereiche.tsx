"use client";

import { type ReactNode, useEffect, useState } from "react";
import { KapitelAuswahl } from "@/components/newspaper/kapitel-auswahl";
import { Randkasten, Seite } from "@/components/newspaper/seite";
import { cursorGruppe } from "@/components/werkstatt/interaktions-hinweis";

/* Die Bereiche der Werkstatt; Namen sind vorläufig. */
const bereiche = [
  {
    id: "vorweg",
    titel: "Vorweg",
    kurz: "Wer ich bin und wie ich arbeite.",
  },
  {
    id: "tools",
    titel: "Tools",
    kurz: "Womit ich arbeite und was davon geblieben ist.",
  },
  {
    id: "diktat",
    titel: "Wispr & Voice",
    kurz: "Warum ich meine Aufträge spreche, statt sie zu tippen.",
  },
  {
    id: "modelle",
    titel: "Modelle und Arbeitskalender",
    kurz: "Der Wechsel zwischen Claude und Codex, jeder Arbeitstag im Kalender.",
  },
  {
    id: "bilanz",
    titel: "Was ich gebaut habe",
    /* Anker der einzelnen Projekte, etwa von der Titelseite */
    anker: ["cipre", "fortis", "aht"],
    kurz: "Die Projekte, die dabei entstanden sind.",
  },
  {
    id: "fokus",
    titel: "Fokus",
    kurz: "Was ich gelernt habe und woran ich arbeite.",
  },
] as const;

export type BereichId = (typeof bereiche)[number]["id"];

/**
 * Die Werkstatt als Seite mit Bereichen: Rechts steht die Übersicht, in
 * der der aktive Bereich hervorgehoben ist, links dessen Inhalt. Einen
 * eigenen Seitenkopf gibt es nicht, der erste Bereich führt in die Seite
 * ein. Der Anker in der Adresse (#modelle) hält den Bereich beim Neuladen
 * und Teilen fest.
 */
export function WerkstattBereiche({
  inhalte,
  rand,
}: {
  /** Inhalt je Bereich; fehlt er, steht dort ein Hinweis. */
  inhalte: Partial<Record<BereichId, ReactNode>>;
  /** Zusätzliches in der Randspalte unter der Übersicht, je Bereich. */
  rand?: Partial<Record<BereichId, ReactNode>>;
}) {
  const [aktivId, setAktivId] = useState<string>(bereiche[0].id);
  const [ziel, setZiel] = useState<string | null>(null);

  useEffect(() => {
    /* Gibt zurück, ob der Anker zu einer Stelle innerhalb eines Bereichs führt. */
    const ausAnker = () => {
      const id = window.location.hash.slice(1);
      const bereich = bereiche.find(
        (b) =>
          b.id === id ||
          ("anker" in b && (b.anker as readonly string[]).includes(id)),
      );
      if (!bereich) return false;
      setAktivId(bereich.id);
      if (bereich.id === id) return false;
      setZiel(id);
      return true;
    };
    ausAnker();
    /* Links im Text (#tools) wechseln den Bereich und springen nach oben. */
    const beiWechsel = () => {
      if (!ausAnker()) window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", beiWechsel);
    return () => window.removeEventListener("hashchange", beiWechsel);
  }, []);

  // Eine Stelle im Bereich steht erst nach dem Umschalten auf der Seite
  useEffect(() => {
    if (!ziel) return;
    document.getElementById(ziel)?.scrollIntoView();
    setZiel(null);
  }, [ziel]);

  const aktivIndex = Math.max(
    0,
    bereiche.findIndex((b) => b.id === aktivId),
  );
  const aktiv = bereiche[aktivIndex];

  function waehle(id: string) {
    setAktivId(id);
    history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top: 0 });
  }

  const weiter = bereiche[aktivIndex + 1];
  const zurueck = bereiche[aktivIndex - 1];

  return (
    <Seite
      navigation={
        <KapitelAuswahl
          id="werkstatt-kapitel"
          beschriftung="Kapitel"
          ariaLabel="Kapitelauswahl der Werkstatt"
          kennung="werkstatt-bereiche"
          kapitel={bereiche}
          wert={aktiv.id}
          onWaehle={waehle}
        />
      }
      rand={
        <>
          <Randkasten
            dachzeile="Auf dieser Seite"
            meinung
            className="hidden lg:block"
          >
            <nav
              aria-label="Bereiche der Werkstatt"
              {...cursorGruppe("werkstatt-bereiche", { art: "links" })}
            >
              <ol className="font-sans text-[0.92rem] leading-snug">
                {bereiche.map((b, i) => {
                  const istAktiv = b.id === aktiv.id;
                  return (
                    <li
                      key={b.id}
                      className="border-b border-rule last:border-b-0"
                    >
                      <a
                        href={`#${b.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          waehle(b.id);
                        }}
                        aria-current={istAktiv ? "true" : undefined}
                        data-cursor-ziel
                        className={`section-link -mx-3 flex gap-3 border-l-4 px-3 py-2.5 ${
                          istAktiv
                            ? "border-ink bg-paper-2 font-semibold text-ink"
                            : "border-transparent text-ink-2 underline-offset-4 hover:text-ink hover:underline"
                        }`}
                      >
                        <span className="font-headline text-[1.1rem] leading-none font-bold text-meta">
                          {i + 1}
                        </span>
                        {b.titel}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </Randkasten>
          {rand?.[aktiv.id]}
        </>
      }
    >
      <section aria-labelledby="bereich-titel">
        <p className="kicker">
          Werkstatt · {aktivIndex + 1} von {bereiche.length}
        </p>
        <h1
          id="bereich-titel"
          className="hl-feature mt-2 text-[2.5rem] md:text-[3.3rem]"
        >
          {aktiv.titel}
        </h1>
        {inhalte[aktiv.id] ?? (
          <p className="mt-3 font-sans text-[0.9rem] text-meta">
            Inhalt folgt.
          </p>
        )}
      </section>

      <nav
        aria-label="Weiterlesen"
        className="mt-16 border-t-2 border-rule-strong pt-4 md:mt-20"
      >
        {weiter ? (
          <a
            href={`#${weiter.id}`}
            onClick={(e) => {
              e.preventDefault();
              waehle(weiter.id);
            }}
            className="group block"
          >
            <p className="kicker">
              Weiter · {aktivIndex + 2} von {bereiche.length}
            </p>
            <p className="hl mt-1 text-[1.6rem] underline-offset-4 group-hover:underline">
              {weiter.titel} →
            </p>
            <p className="mt-1 font-sans text-[0.9rem] text-meta">
              {weiter.kurz}
            </p>
          </a>
        ) : (
          <a
            href={`#${bereiche[0].id}`}
            onClick={(e) => {
              e.preventDefault();
              waehle(bereiche[0].id);
            }}
            className="group block"
          >
            <p className="kicker">Zurück zum Anfang</p>
            <p className="hl mt-1 text-[1.6rem] underline-offset-4 group-hover:underline">
              {bereiche[0].titel} ↑
            </p>
          </a>
        )}
        {zurueck && weiter && (
          <a
            href={`#${zurueck.id}`}
            onClick={(e) => {
              e.preventDefault();
              waehle(zurueck.id);
            }}
            className="mt-4 inline-block font-sans text-[0.85rem] text-meta underline-offset-4 hover:text-ink hover:underline"
          >
            ← Zurück: {zurueck.titel}
          </a>
        )}
      </nav>
    </Seite>
  );
}
