import type { Metadata } from "next";
import { ArticleHeader } from "@/components/newspaper/article-header";
import { Randkasten, Seite, Seitenkopf } from "@/components/newspaper/seite";
import { ausgabe, kontaktLink } from "@/content/ausgabe";

export const metadata: Metadata = { title: "Impressum und Datenschutz" };

export default function Impressum() {
  return (
    <>
      <ArticleHeader ressort="Impressum" />
      <Seite
        rand={
          <Randkasten dachzeile="In Kürze">
            <ul className="space-y-2 font-sans text-[0.88rem] leading-snug text-ink-2">
              <li>Keine Cookies.</li>
              <li>Spielstände bleiben in Ihrem Browser.</li>
              <li>Gespräche und Fit Checks werden beim Neuladen verworfen.</li>
            </ul>
          </Randkasten>
        }
      >
        <Seitenkopf
          dachzeile="In eigener Sache"
          titel="Impressum und Datenschutz"
          zeile={false}
        />
        <div className="fliesstext mt-8 [&>p+p]:mt-[1.15em] border-t-2 border-rule-strong pt-6">
          <h2>Verantwortlich</h2>
          <p>
            {ausgabe.autor}, {ausgabe.ort}.{" "}
            <a href={kontaktLink} className="underline underline-offset-2">
              {ausgabe.mail}
            </a>
          </p>
          <p>
            Diese Seite ist meine private Bewerbung und kein Angebot der Axel
            Springer SE. Genannte Marken gehören ihren Inhabern.
          </p>
          <h2>Datenschutz</h2>
          <p>
            Die Seite setzt keine Cookies. Im Browser werden die Spielstände und
            die Größe des Interview-Fensters dauerhaft gespeichert. Ob Sie den
            Smartphone-Hinweis geschlossen haben, wird für die Dauer der Sitzung
            gespeichert. Beim Aufruf verarbeitet der Hoster Vercel technisch
            notwendige Daten wie die IP-Adresse in Server-Protokollen.
          </p>
          <p>
            Vercel Web Analytics erfasst Seitenaufrufe; Vercel Speed Insights
            erfasst Leistungsdaten der Seite. Dabei werden unter anderem die
            aufgerufene URL, Browser, Gerätetyp und das Herkunftsland an Vercel
            übermittelt. Diese Dienste verwenden keine Cookies. Weitere Angaben
            finden Sie bei Vercel zum{" "}
            <a
              href="https://vercel.com/docs/analytics/privacy-policy"
              className="underline underline-offset-2"
            >
              Datenschutz von Web Analytics
            </a>{" "}
            und zum{" "}
            <a
              href="https://vercel.com/docs/speed-insights/privacy-policy"
              className="underline underline-offset-2"
            >
              Datenschutz von Speed Insights
            </a>
            .
          </p>
          <p>
            Fragen an die Redaktion und eingefügte Stellenanzeigen werden zur
            Beantwortung an Anthropic übermittelt und von mir nicht dauerhaft
            gespeichert. Im Browser bleiben Gespräche und Fit Checks im
            Arbeitsspeicher verfügbar, bis Sie die Seite neu laden. Bitte geben
            Sie dort keine personenbezogenen Daten ein.
          </p>
        </div>
      </Seite>
    </>
  );
}
