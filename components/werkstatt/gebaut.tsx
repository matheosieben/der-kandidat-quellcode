import type { ReactNode } from "react";
import { Absaetze } from "@/components/newspaper/ausgezeichnet";
import { RagTerminal } from "@/components/werkstatt/rag-terminal";
import { ausserdem } from "@/content/projekte";
import { gebaut } from "@/content/werkstatt";

const text = "space-y-3 fliesstext";

function Projekt({
  id,
  dachzeile,
  titel,
  children,
}: {
  id: string;
  dachzeile: string;
  titel: string;
  children: ReactNode;
}) {
  return (
    <article
      id={id}
      aria-labelledby={`${id}-titel`}
      className="mt-12 scroll-mt-40 border-t-2 border-rule-strong pt-4 lg:scroll-mt-24"
    >
      <p className="kicker">{dachzeile}</p>
      <h2 id={`${id}-titel`} className="hl mt-1 text-[2rem]">
        {titel}
      </h2>
      {children}
    </article>
  );
}

/** Inhalt des Bereichs „Was ich gebaut habe“. Ciprè zeigt danach das RAG-Terminal. */
export function Gebaut() {
  return (
    <>
      <div className={`mt-6 ${text}`}>
        <p>{gebaut.einleitung}</p>
      </div>

      {gebaut.projekte.map((p) => (
        <Projekt key={p.id} id={p.id} dachzeile={p.dachzeile} titel={p.titel}>
          <div className={`mt-3 ${text}`}>
            <Absaetze absaetze={p.absaetze} />
          </div>
          {p.id === "cipre" && <RagTerminal />}
        </Projekt>
      ))}

      <section
        aria-labelledby="ausserdem-titel"
        className="mt-12 border-t-2 border-rule-strong pt-4"
      >
        <h2 id="ausserdem-titel" className="kicker">
          Außerdem in Arbeit
        </h2>
        <ul className="mt-3 divide-y divide-rule">
          {[gebaut.praxisDashboard, ...ausserdem].map((a) => (
            <li key={a.titel} className="py-3">
              <h3 className="hl-sans text-[1.05rem]">{a.titel}</h3>
              <p className="mt-1 fliesstext">{a.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
