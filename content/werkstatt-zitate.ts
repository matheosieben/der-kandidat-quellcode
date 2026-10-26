import type { BereichId } from "@/components/werkstatt/bereiche";
import { type Zitat, zitate } from "@/content/ausgabe";
import { textstellenLink } from "@/lib/quellen";

const cursor = "https://lexfridman.com/cursor-team-transcript/";

/** Ein Zitat der Titelseite, gefunden am Anfang seiner ersten Zeile. */
function titelseite(anfang: string): Zitat {
  const z = zitate.find((x) => x.zeilen[0].text.startsWith(anfang));
  if (!z) throw new Error(`Zitat fehlt auf der Titelseite: ${anfang}`);
  return z;
}

export const werkstattZitate: Partial<Record<BereichId, Zitat>> = {
  vorweg: {
    zeilen: [
      {
        von: "Sam Altman",
        text: "Listen to what your users tell you, improve your product, and then listen again.",
      },
    ],
    quelle: "Startup advice, briefly · eigener Blog",
    href: textstellenLink(
      "https://blog.samaltman.com/startup-advice-briefly",
      "Listen to what your users tell you, improve your product, and then listen again.",
    ),
    kommentar:
      "Ich möchte früher veröffentlichen, echtes Nutzerfeedback einholen und meine Produkte daran weiterentwickeln.",
  },
  tools: {
    zeilen: [
      {
        von: "Cursor",
        text: "They will iterate at the speed of their judgment, even in the most complex systems.",
      },
    ],
    quelle: "aus dem Manifest, vorgelesen im Lex Fridman Podcast #447",
    href: textstellenLink(
      cursor,
      "They will iterate at the speed of their judgment, even in the most complex systems.",
    ),
    kommentar:
      "Die Modelle liefern schnell neue Varianten; ich muss beurteilen, welche davon besser ist.",
  },
  diktat: titelseite("I’m not telling it where we’re going"),
  modelle: titelseite("We have seen decades of progress"),
  bilanz: {
    zeilen: [
      {
        von: "Sam Altman",
        text: "No matter what you choose, build stuff and be around smart people.",
      },
    ],
    quelle: "Advice for ambitious 19 year olds · eigener Blog",
    href: textstellenLink(
      "https://blog.samaltman.com/advice-for-ambitious-19-year-olds",
      "No matter what you choose, build stuff and be around smart people.",
    ),
    kommentar:
      "Ich lerne, indem ich eigene Projekte baue, und möchte jetzt mit erfahrenen Leuten im Team weiterlernen.",
  },
};
