import { Absaetze, Ausgezeichnet } from "@/components/newspaper/ausgezeichnet";
import { RandZitat } from "@/components/werkstatt/rand-zitat";
import { fokus } from "@/content/werkstatt";
import { textstellenLink } from "@/lib/quellen";

const text = "space-y-3 fliesstext";
const ZITAT_QUELLE = textstellenLink(
  "https://lexfridman.com/dhh-2-transcript",
  "the actual skill I’m currently developing",
  "is not to overspecify things, is to get out of the system’s way.",
);

/*
 * Was ich aus der Arbeit mit KI gelernt habe. Belege stehen in den übrigen
 * Bereichen: Diktat unter „Wispr & Voice“, Ciprè und AHT unter „Was ich
 * gebaut habe“. Angeregt von Lex Fridman Podcast #501 mit DHH (Produktarbeit
 * 00:53:16, Varianten 00:59:21, jetzt einsteigen 01:17:11, Detail 02:10:06)
 * und #447 mit dem Cursor-Team (Geschmack 02:21:04, Ausprobieren 02:22:15).
 */

/* Der Text des Fokus; der Schluss löst ein, was Vorweg ankündigt, abgesetzt mit derselben Linie wie die Übersicht „Auf dieser Seite“. */
const fliesstext = (
  <>
    <div className={`mt-6 ${text}`}>
      <Absaetze absaetze={fokus.absaetze} />
    </div>
    <div className={`mt-8 border-t border-rule pt-6 ${text}`}>
      <p>
        <Ausgezeichnet text={fokus.schluss} />
      </p>
    </div>
  </>
);

/** Inhalt des Bereichs „Fokus“: was ich gelernt habe und woran ich arbeite. */
export function Fokus() {
  return <>{fliesstext}</>;
}

/** Das Zitat zum Fokus, in der Randspalte unter der Übersicht. */
export function FokusZitat() {
  return (
    <RandZitat
      zitat={{
        zeilen: [
          {
            von: "Lex Fridman",
            text: "The actual skill I’m currently developing […] is not to overspecify things, is to get out of the system’s way.",
          },
        ],
        quelle: "im Gespräch mit DHH, Lex Fridman Podcast #501, August 2026",
        href: ZITAT_QUELLE,
        kommentar:
          "Hier sehe ich meinen Vorteil gegenüber klassischen Programmierern: Ich denke vom Produkt aus und lasse den Modellen den Lösungsweg offen.",
      }}
    />
  );
}
