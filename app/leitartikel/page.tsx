import type { Metadata } from "next";
import Link from "next/link";
import { ArticleHeader } from "@/components/newspaper/article-header";
import { Randkasten, Seite, Seitenkopf } from "@/components/newspaper/seite";
import { Weiterlesen } from "@/components/newspaper/weiterlesen";
import { programm } from "@/content/programm";

export const metadata: Metadata = {
  title: "Leitartikel",
  description: programm.vorspann,
};

const textmarker =
  /(auch beruflich daran arbeiten|Daran möchte ich bei Axel Springer mitarbeiten)/;

function mitTextmarker(text: string) {
  return text.split(textmarker).map((teil) =>
    textmarker.test(teil) ? (
      <mark className="marker" key={teil}>
        {teil}
      </mark>
    ) : (
      teil
    ),
  );
}

export default function Leitartikel() {
  return (
    <>
      <ArticleHeader ressort="Leitartikel" />
      <Seite
        rand={
          <Randkasten dachzeile="Auf einen Blick">
            <table className="w-full font-sans text-[0.82rem]">
              <tbody>
                {programm.steckbrief.map(([feld, wert]) => (
                  <tr key={feld} className="border-t border-rule">
                    <th
                      scope="row"
                      className="py-2 pr-3 text-left align-top font-semibold"
                    >
                      {feld}
                    </th>
                    <td className="py-2 text-ink-2">{wert}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 flex gap-4 font-sans text-[0.82rem] font-semibold">
              <Link
                href="/lebenslauf"
                className="underline-offset-4 hover:underline"
              >
                Lebenslauf →
              </Link>
              <Link
                href="/werkstatt#bilanz"
                className="underline-offset-4 hover:underline"
              >
                Projekte →
              </Link>
            </p>
          </Randkasten>
        }
        fuss={<Weiterlesen verweise={programm.weiterlesen} />}
      >
        <article>
          <Seitenkopf
            dachzeile={programm.dachzeile}
            titel={programm.titel}
            vorspann={programm.vorspann}
          />

          <div className="fliesstext mt-8">
            {programm.absaetze.map((text, i) => (
              <p
                key={text.slice(0, 24)}
                className={i === 0 ? "dropcap" : "mt-[1.15em]"}
              >
                {mitTextmarker(text)}
              </p>
            ))}
          </div>
        </article>
      </Seite>
    </>
  );
}
