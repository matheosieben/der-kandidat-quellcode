import type { Metadata } from "next";
import { EingabeVerlauf } from "@/components/grafik/eingabe-verlauf";
import { AnteilZeile } from "@/components/grafik/modell-index";
import {
  NutzungsVerlauf,
  VerlaufLegende,
} from "@/components/grafik/nutzungs-verlauf";
import { TokenKalender } from "@/components/grafik/token-kalender";
import { ArticleHeader } from "@/components/newspaper/article-header";
import { Absaetze, Ausgezeichnet } from "@/components/newspaper/ausgezeichnet";
import { WerkstattBereiche } from "@/components/werkstatt/bereiche";
import { Dock } from "@/components/werkstatt/dock";
import { FnSperre } from "@/components/werkstatt/fn-sperre";
import { Fokus, FokusZitat } from "@/components/werkstatt/fokus";
import { Gebaut } from "@/components/werkstatt/gebaut";
import { InteraktionsHinweis } from "@/components/werkstatt/interaktions-hinweis";
import { RandZitat } from "@/components/werkstatt/rand-zitat";
import { TippTerminal } from "@/components/werkstatt/tipp-terminal";
import { ausgabe } from "@/content/ausgabe";
import { diktat, modelle, tools, vorweg } from "@/content/werkstatt";
import { werkstattZitate } from "@/content/werkstatt-zitate";
import { daten } from "@/lib/daten";
import { kalenderMitHochrechnung, monateMitSchaetzung } from "@/lib/schaetzung";
import { tokenKalender } from "@/lib/token-kalender";

export const metadata: Metadata = {
  title: "Werkstatt",
  description:
    "Wie ich mit KI arbeite: meine Werkzeuge, Diktat statt Tippen, der Wechsel zwischen Codex und Claude seit September 2025, jeder Arbeitstag im Kalender, die Projekte, die dabei entstanden sind, und was ich daraus gelernt habe.",
};

export default function Werkstatt() {
  const verlauf = monateMitSchaetzung();
  const kalender = kalenderMitHochrechnung();
  const tokenTage = tokenKalender(kalender, verlauf, daten.anbieterTag);

  return (
    <>
      <ArticleHeader ressort="Werkstatt" />
      <WerkstattBereiche
        rand={{
          ...Object.fromEntries(
            Object.entries(werkstattZitate).map(([id, z]) => [
              id,
              z && <RandZitat key={id} zitat={z} />,
            ]),
          ),
          fokus: <FokusZitat />,
        }}
        inhalte={{
          vorweg: (
            <>
              <p className="mt-6 border-t border-rule pt-4 font-sans text-[0.9rem]">
                <span className="font-bold">Von {ausgabe.autor}</span>
                <span className="text-meta"> · {ausgabe.datumKurz}</span>
              </p>
              <div className="mt-6 space-y-3 fliesstext">
                <Absaetze absaetze={vorweg} />
              </div>
            </>
          ),
          fokus: <Fokus />,
          bilanz: <Gebaut />,
          modelle: (
            <>
              <div className="mt-6 fliesstext">
                <p>
                  <Ausgezeichnet text={modelle.anfang} />
                </p>
                <TippTerminal />
                <p>{modelle.heute}</p>
              </div>

              <div className="mt-8">
                <NutzungsVerlauf
                  monate={verlauf}
                  kopfRechts={<AnteilZeile monate={verlauf} />}
                />
                <div className="mt-2 space-y-1.5 font-sans text-[0.72rem] leading-snug text-meta">
                  <VerlaufLegende />
                  <p>
                    Flächen: Token-Anteile oder Volumen je Monat, inklusive
                    Cache. Punkte: erster Modelleinsatz. Schraffur:
                    hochgerechnet.
                  </p>
                </div>
              </div>

              <div className="mt-10 border-t border-rule pt-6">
                <TokenKalender tage={tokenTage} spalten={42} />
              </div>

              <p className="mt-6 font-sans text-[0.72rem] leading-snug text-meta">
                Die Zahlen stammen aus meinen eigenen Protokollen; wo sie
                fehlen, ist hochgerechnet und gekennzeichnet.
              </p>
            </>
          ),
          diktat: (
            <>
              <div className="mt-3 space-y-3 fliesstext">
                <Absaetze absaetze={diktat.absaetze} />
              </div>

              <section aria-labelledby="rennen-titel" className="mt-8">
                <h2
                  id="rennen-titel"
                  className="mb-2 font-sans text-[0.9rem] font-semibold"
                >
                  Derselbe Auftrag, getippt und gesprochen
                </h2>
                <FnSperre />
              </section>

              <EingabeVerlauf />

              <section
                aria-labelledby="voice-titel"
                className="mt-10 border-t border-rule pt-4"
              >
                <p className="kicker">{diktat.voice.dachzeile}</p>
                <h2 id="voice-titel" className="hl mt-1 text-[1.45rem]">
                  {diktat.voice.titel}
                </h2>
                <p className="mt-2 fliesstext">{diktat.voice.text}</p>
              </section>
            </>
          ),
          tools: (
            <>
              <p className="mt-6 fliesstext">{tools.einleitung}</p>
              <figure className="mt-8">
                <Dock apps={tools.dock} />
                <figcaption className="mt-2 font-sans text-[0.72rem] leading-snug text-meta">
                  Mein Dock. Punkt: im täglichen Einsatz. Rechts vom Strich:
                  früher genutzt.
                  <span className="mt-2 block">
                    <InteraktionsHinweis>
                      Mit der Maus über die Apps fahren.
                    </InteraktionsHinweis>
                  </span>
                </figcaption>
              </figure>
              <div className="mt-8 space-y-6">
                {tools.werkzeuge.map((w) => (
                  <section key={w.name} aria-labelledby={`tool-${w.id}`}>
                    <h2
                      id={`tool-${w.id}`}
                      className="font-sans text-[1rem] font-semibold"
                    >
                      {w.name}
                    </h2>
                    <div className="mt-1 space-y-2 fliesstext">
                      <Absaetze absaetze={w.absaetze} />
                    </div>
                  </section>
                ))}
              </div>
            </>
          ),
        }}
      />
    </>
  );
}
