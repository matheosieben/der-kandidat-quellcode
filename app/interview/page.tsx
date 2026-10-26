import type { Metadata } from "next";
import Link from "next/link";
import { Redaktion } from "@/components/ki/redaktion";
import { ArticleHeader } from "@/components/newspaper/article-header";
import { Randkasten, Seite, Seitenkopf } from "@/components/newspaper/seite";
import { Weiterlesen } from "@/components/newspaper/weiterlesen";
import { kontaktLink } from "@/content/ausgabe";
import { interview } from "@/content/interview";
import { MODELLNAME } from "@/lib/ki/modell";

export const metadata: Metadata = {
  title: "Interview",
  description:
    "Fragen Sie mich: Eine Maschine antwortet für mich auf Grundlage dieser Ausgabe, mit Fundstelle. Im Fit Check legt sie meine Erfahrung neben Ihre Stellenanzeige.",
};

export default function InterviewSeite() {
  return (
    <>
      <ArticleHeader ressort="Interview" />
      <Seite
        breit
        rand={
          <>
            <Randkasten dachzeile="So arbeitet die Maschine">
              <ul className="space-y-3 font-sans text-[0.85rem] leading-snug text-ink-2">
                <li>
                  <strong className="text-ink">Modell:</strong> {MODELLNAME}{" "}
                  über die API von Anthropic.
                </li>
                <li>
                  <strong className="text-ink">Wissen:</strong> Diese Ausgabe
                  und Hintergründe, die nicht im Blatt stehen: wie ich lerne, im
                  Team arbeite und was mich antreibt.
                </li>
                <li>
                  <strong className="text-ink">Regel:</strong> Einschätzungen
                  leitet die Maschine aus dem ab, was sie über mich weiß.
                  Zahlen, Stationen und Abschlüsse nennt sie nur, wenn sie
                  belegt sind. Zu jeder Antwort gibt sie die Fundstelle an.
                </li>
                <li>
                  <strong className="text-ink">Fit Check:</strong> Die Maschine
                  legt Ihre Stellenanzeige neben meine Erfahrung. Sie zeigt, was
                  dafür spricht, wo ich noch dazulerne und welche Fragen sich
                  fürs Gespräch lohnen.
                </li>
                <li>
                  <strong className="text-ink">Datenschutz:</strong> Fragen und
                  Stellenanzeigen gehen an Anthropic. Gespräche und Prüfungen
                  bleiben nur bis zum Neuladen im Arbeitsspeicher. Bitte keine
                  personenbezogenen Daten eingeben.
                </li>
              </ul>
            </Randkasten>
            <Randkasten dachzeile="Lieber persönlich?">
              <p className="font-body text-[1.05rem] leading-relaxed text-ink-2">
                Die Maschine weiß einiges über mich, aber nicht alles, und ein
                Gespräch ersetzt sie nicht. Ideen für Axel Springer und alles,
                was Sie genauer wissen wollen, bespreche ich am liebsten
                persönlich.
              </p>
              <p className="mt-4 flex flex-wrap items-center gap-4">
                <a href={kontaktLink} className="btn-cta">
                  Schreiben Sie mir
                </a>
                <Link
                  href="/lebenslauf"
                  className="font-sans text-[0.82rem] font-semibold underline-offset-4 hover:underline"
                >
                  Lebenslauf →
                </Link>
              </p>
            </Randkasten>
          </>
        }
        fuss={<Weiterlesen verweise={interview.weiterlesen} />}
      >
        <Seitenkopf
          dachzeile={interview.dachzeile}
          titel={interview.titel}
          vorspann={interview.vorspann}
          zeile={false}
        />
        <div className="mt-8">
          <Redaktion />
        </div>
      </Seite>
    </>
  );
}
