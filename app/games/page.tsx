import type { Metadata } from "next";
import { ArticleHeader } from "@/components/newspaper/article-header";
import { IconGames } from "@/components/newspaper/icons";
import { Randkasten, Seite, Seitenkopf } from "@/components/newspaper/seite";
import { ZitatKommentar } from "@/components/newspaper/zitat-kommentar";
import { Spielbereich } from "@/components/spiele/spielbereich";
import { Springer } from "@/components/spiele/springer";
import { Wortwahl } from "@/components/spiele/wortwahl";
import { textstellenLink } from "@/lib/quellen";

export const metadata: Metadata = {
  title: "Games",
  description:
    "Wortwahl, das tägliche Rätsel aus dem KI-Alltag, und Der Springer, ein Lauf über Rechenzentren und Merge-Konflikte.",
};

/** Beispielzeile für die Anleitung von Wortwahl. */
function Beispiel({
  wort,
  feld,
  farbe,
}: {
  wort: string;
  feld: number;
  farbe: string;
}) {
  return (
    <span aria-hidden="true" className="my-1 flex gap-1">
      {wort.split("").map((b, i) => (
        <span
          key={b + String(i)}
          className={`grid size-8 place-items-center border-2 font-sans text-[1rem] font-bold ${
            i === feld ? "border-transparent text-white" : "border-rule"
          }`}
          style={i === feld ? { background: `var(${farbe})` } : undefined}
        >
          {b}
        </span>
      ))}
    </span>
  );
}

export default function Games() {
  return (
    <>
      <ArticleHeader ressort="Games" />
      <Seite
        rand={
          <Randkasten dachzeile="Zitat">
            <blockquote>
              <p className="hl-feature text-[1.35rem]">
                „Approach it in a playful way. Build something that you always
                wanted to build.“
              </p>
              <footer className="mt-3 border-l-2 border-opinion pl-3 font-sans text-[0.8rem] leading-snug text-meta">
                Peter Steinberger, Entwickler von OpenClaw, im OpenAI-Podcast
                „Builders Unscripted“, Februar 2026.{" "}
                <a
                  href={textstellenLink(
                    "https://techcrunch.com/2026/02/25/openclaw-creators-advice-to-ai-builders-is-to-be-more-playful-and-allow-yourself-time-to-improve/",
                    "approach it in a playful way. Build something that you always wanted to build.",
                  )}
                  className="underline underline-offset-2"
                >
                  Quelle: TechCrunch
                </a>
              </footer>
            </blockquote>
            <ZitatKommentar text="Die Spiele sind entstanden, weil ich ausprobieren wollte, was sich mit den Modellen bauen lässt." />
          </Randkasten>
        }
      >
        <Seitenkopf
          zeile={false}
          dachzeile="Games"
          titel="Für die Mittagspause"
          vorspann="Jede gute Zeitung hat einen Teil, den man zuerst liest. Hier sind es zwei Spiele, beide aus meinem Alltag mit Sprachmodellen."
        />
        <div className="mt-8 grid grid-cols-1 items-start gap-6 sm:grid-cols-2">
          <Spielbereich
            id="springer"
            art="springer"
            name="Der Springer"
            farbe="#f7da21"
            symbol={
              <span
                aria-hidden="true"
                className="grid size-[76px] place-items-center rounded-[16px] bg-[#121212] text-white"
              >
                <span className="wordmark-springer -scale-x-100 text-[3.2rem]" />
              </span>
            }
            unterzeile="Die Schachfigur, die heißt wie der Verlag, läuft durch den Alltag eines Agenten."
            anleitung={
              <>
                <p>
                  Springen mit Leertaste oder Pfeil nach oben, auf dem Telefon
                  mit Tippen. Das Tempo steigt mit der Zeit.
                </p>
                <p>
                  Hindernisse sind Mini-Rechenzentren, Merge-Konflikte und
                  Rate-Limits, später kommt die Halluzination.
                </p>
                <p>
                  Unterwegs liegen Tokens und Commits.{" "}
                  <strong>Claude Code</strong> fängt im Review den nächsten
                  Fehler ab, <strong>Codex</strong> startet einen zweiten
                  Agenten, der die Tokens verdoppelt.
                </p>
              </>
            }
          >
            <Springer />
          </Spielbereich>

          <Spielbereich
            id="wortwahl"
            art="wortwahl"
            name="Wortwahl"
            farbe="#b4a7f5"
            symbol={<IconGames width={76} height={76} />}
            unterzeile="Sechs Versuche für ein Wort aus meinem KI-Alltag."
            anleitung={
              <>
                <p>
                  Erraten Sie das Wort in sechs Versuchen. Jeder Versuch ist ein
                  Wort mit fünf Buchstaben, ohne Umlaute.
                </p>
                <Beispiel wort="TOKEN" feld={0} farbe="--wort-richtig" />
                <p>
                  <strong>T</strong> steht an der richtigen Stelle.
                </p>
                <Beispiel wort="MERGE" feld={2} farbe="--wort-enthalten" />
                <p>
                  <strong>R</strong> kommt vor, aber an anderer Stelle.
                </p>
                <Beispiel wort="CACHE" feld={4} farbe="--wort-falsch" />
                <p>
                  <strong>E</strong> kommt nicht vor.
                </p>
                <p>
                  Nach drei Versuchen gibt es einen Hinweis. Jeden Tag gibt es
                  drei neue Wörter.
                </p>
              </>
            }
          >
            <Wortwahl />
          </Spielbereich>
        </div>
      </Seite>
    </>
  );
}
