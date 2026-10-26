"use client";

import { type ReactNode, useEffect, useState } from "react";
import { KapitelAuswahl } from "@/components/newspaper/kapitel-auswahl";
import { Randkasten, Seite } from "@/components/newspaper/seite";
import { cursorGruppe } from "@/components/werkstatt/interaktions-hinweis";

type Gruppe = {
  id: string;
  titel: string;
  inhalt: ReactNode;
};

export function LebenslaufBereiche({
  gruppen,
  kopf,
  kontakt,
}: {
  gruppen: Gruppe[];
  kopf: ReactNode;
  kontakt: ReactNode;
}) {
  const [aktivId, setAktivId] = useState(gruppen[0].id);

  useEffect(() => {
    function ausAnker() {
      const id = window.location.hash.slice(1) || gruppen[0].id;
      const gruppe = gruppen.find((g) => g.id === id);
      if (!gruppe) return false;
      setAktivId(gruppe.id);
      return true;
    }

    function beiWechsel() {
      if (ausAnker()) window.scrollTo({ top: 0 });
    }

    ausAnker();
    window.addEventListener("hashchange", beiWechsel);
    return () => window.removeEventListener("hashchange", beiWechsel);
  }, [gruppen]);

  const aktivIndex = Math.max(
    0,
    gruppen.findIndex((g) => g.id === aktivId),
  );
  const aktiv = gruppen[aktivIndex];

  function waehle(id: string) {
    if (!gruppen.some((g) => g.id === id)) return;
    setAktivId(id);
    window.history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top: 0 });
  }

  return (
    <Seite
      navigation={
        <KapitelAuswahl
          id="lebenslauf-bereich"
          beschriftung="Bereich"
          ariaLabel="Bereichsauswahl des Lebenslaufs"
          kennung="lebenslauf-bereiche"
          kapitel={gruppen}
          wert={aktiv.id}
          onWaehle={waehle}
        />
      }
      rand={
        <>
          <Randkasten
            dachzeile="Abschnitte"
            meinung
            className="hidden lg:block"
          >
            <nav
              aria-label="Abschnitte des Lebenslaufs"
              {...cursorGruppe("lebenslauf-bereiche", { art: "links" })}
            >
              <ol className="font-sans text-[0.92rem] leading-snug">
                {gruppen.map((gruppe, index) => {
                  const istAktiv = gruppe.id === aktiv.id;
                  return (
                    <li
                      key={gruppe.id}
                      className="border-b border-rule last:border-b-0"
                    >
                      <a
                        href={`#${gruppe.id}`}
                        onClick={(event) => {
                          event.preventDefault();
                          waehle(gruppe.id);
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
                          {index + 1}
                        </span>
                        {gruppe.titel}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </Randkasten>
          {kontakt}
        </>
      }
    >
      {kopf}
      {aktiv.inhalt}
    </Seite>
  );
}
