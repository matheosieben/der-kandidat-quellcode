import type { Metadata } from "next";
import { LebenslaufBereiche } from "@/components/lebenslauf/bereiche";
import { ArticleHeader } from "@/components/newspaper/article-header";
import { IconGithub, IconLinkedin } from "@/components/newspaper/icons";
import { Randkasten, Seitenkopf } from "@/components/newspaper/seite";
import { ausgabe, kontaktLink } from "@/content/ausgabe";
import { stationsgruppen } from "@/content/lebenslauf";

export const metadata: Metadata = {
  title: "Lebenslauf",
  description: `Lebenslauf von ${ausgabe.autor}: Berufserfahrung, Ausbildung, Praktika.`,
};

export default function Lebenslauf() {
  return (
    <>
      <ArticleHeader ressort="Lebenslauf" />
      <LebenslaufBereiche
        kopf={
          <Seitenkopf
            dachzeile="Lebenslauf"
            titel={ausgabe.autor}
            zeile={false}
          />
        }
        kontakt={
          <Randkasten dachzeile="Kontakt" titel="Gespräch vereinbaren">
            <ul className="space-y-1.5 font-sans text-[0.88rem]">
              <li className="font-semibold">{ausgabe.autor}</li>
              <li>
                <a href={kontaktLink} className="underline underline-offset-2">
                  {ausgabe.mail}
                </a>
              </li>
              <li>
                <a
                  href={`tel:+49${ausgabe.telefon.replace(/\s/g, "").slice(1)}`}
                  className="underline underline-offset-2"
                >
                  {ausgabe.telefon}
                </a>
              </li>
            </ul>
            <ul className="mt-4 space-y-2 border-t border-rule pt-3 font-sans text-[0.88rem]">
              {[
                { name: "GitHub", href: ausgabe.github, Icon: IconGithub },
                {
                  name: "LinkedIn",
                  href: ausgabe.linkedin,
                  Icon: IconLinkedin,
                },
              ].map(({ name, href, Icon }) => (
                <li key={name}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-semibold underline-offset-4 hover:underline"
                  >
                    <Icon width={18} height={18} />
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </Randkasten>
        }
        gruppen={stationsgruppen.map((gruppe) => ({
          id: gruppe.id,
          titel: gruppe.titel,
          inhalt: (
            <section
              id={gruppe.id}
              aria-labelledby={`${gruppe.id}-titel`}
              className="mt-10 border-t-2 border-rule-strong pt-5"
            >
              <h2 id={`${gruppe.id}-titel`} className="hl text-[2rem]">
                {gruppe.titel}
              </h2>
              <ol className="mt-5 divide-y divide-rule">
                {gruppe.stationen.map((station) => (
                  <li
                    key={station.titel + station.zeitraum}
                    className="grid gap-x-6 gap-y-2 py-6 first:pt-0 sm:grid-cols-[8rem_minmax(0,1fr)]"
                  >
                    <p className="pt-1 font-mono text-[0.75rem] text-meta tabular-nums">
                      {station.zeitraum}
                    </p>
                    <div className="min-w-0">
                      <h3 className="hl text-[1.4rem]">{station.titel}</h3>
                      <p className="mt-1 font-sans text-[0.85rem] font-semibold text-ink-2">
                        {station.untertitel}
                      </p>
                      {station.beschreibung && (
                        <p className="mt-2 fliesstext">
                          {station.beschreibung}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ),
        }))}
      />
    </>
  );
}
