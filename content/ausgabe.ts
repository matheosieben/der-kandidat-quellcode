import type { StaticImageData } from "next/image";
import { textstellenLink } from "@/lib/quellen";
import rechtsbild from "@/public/bilder/cipre-hero.jpg";
import collage from "@/public/bilder/der-kandidat-projekt.jpg";
import feuilleton from "@/public/bilder/feuilleton.jpg";
import interviewBild from "@/public/bilder/interview-hero.png";
import leitartikelBild from "@/public/bilder/leitartikel-hero1.png";

/*
 * Alles, was in der Ausgabe steht, an einer Stelle.
 * Geschrieben in der Ich-Form. Regel: Jede Tatsachenbehauptung über mich muss
 * sich in meinen Unterlagen, Repositories oder Protokollen belegen lassen.
 */

export const ausgabe = {
  titel: "Der Kandidat",
  untertitel: "Sonderausgabe für Axel Springer",
  datumLang: "Samstag, 17. Oktober 2026",
  datumKurz: "17. Okt. 2026",
  nummer: "Ausgabe Nr. 1",
  autor: "Matheo Sieben",
  ort: "Hannover",
  mail: "mail@matheo-sieben.de",
  telefon: "0176 84575113",
  linkedin: "https://www.linkedin.com/in/matheo-sieben-32a929387",
  github: "https://github.com/matheosieben",
  repository: "https://github.com/matheosieben/der-kandidat-quellcode",
};

export const kontaktLink = `mailto:${ausgabe.mail}?subject=${encodeURIComponent("Der Kandidat – Gesprächsanfrage")}`;

export type Bild = {
  src: StaticImageData;
  alt: string;
  credit: string;
};

/** Herkunft aller Bilder der Ausgabe. */
export const kiBild = "KI-generiert mit ChatGPT Image 2";

export const bilder = {
  leitartikel: {
    src: leitartikelBild,
    alt: "Gemalte Ansicht des Axel-Springer-Neubaus in Berlin mit dunkler Glasfassade, diagonalem Tragwerk und Menschen auf dem Vorplatz",
    credit: `Illustration, ${kiBild}`,
  },
  interview: {
    src: interviewBild,
    alt: "Eine Interviewerin sitzt einer aufgeschlagenen Zeitung an einem Cafétisch gegenüber",
    credit: `Illustration, ${kiBild}`,
  },
  collage: {
    src: collage,
    alt: "Montage aus Titelseiten von WELT, POLITICO und Business Insider, Porträts aus der KI-Branche und dem Axel-Springer-Neubau",
    credit: `Montage, ${kiBild} · Schlagzeilen erfunden`,
  },
  feuilleton: {
    src: feuilleton,
    alt: "Antike Marmorbüste vor einem farbigen Feld aus Binärziffern",
    credit: `Illustration, ${kiBild}`,
  },
  recht: {
    src: rechtsbild,
    alt: "Illustration: Eine Juristin im Gespräch mit einer KI-Figur, daneben Bücher mit den Titeln Recht, Vertrauen, Verantwortung, Zukunft",
    credit: `Illustration, ${kiBild}`,
  },
} satisfies Record<string, Bild>;

type Rubrik = { name: string; href: string };

export const rubriken: Rubrik[] = [
  { name: "Titelseite", href: "/" },
  { name: "Leitartikel", href: "/leitartikel" },
  { name: "Werkstatt", href: "/werkstatt" },
  { name: "Interview", href: "/interview" },
  { name: "Games", href: "/games" },
  { name: "Lebenslauf", href: "/lebenslauf" },
];

/** Titel über „Das Wichtigste in Kürze“, die Überschrift der Titelseite. */
export const bewerbungTitel =
  "Eine Bewerbung für die KI-Einheit der Axel Springer SE";

/** WSJ „What's News“: ich in fünf Zeilen. */
export const dasWichtigste = [
  {
    marke: "Mein Ziel:",
    text: "KI-Produkte für journalistische Inhalte entwickeln, bei Axel Springer in Berlin.",
  },
  {
    marke: "Mein Zugang:",
    text: "Produkt und Design. Die Modelle schreiben den Code, ich prüfe und entscheide.",
  },
  {
    marke: "Meine Arbeitsweise:",
    text: "Ziel und Kontext vorgeben, im laufenden Produkt prüfen, den Code vom zweiten Modell gegenlesen lassen.",
  },
  {
    marke: "Mein nächster Schritt:",
    text: "Im Team an echten Aufgaben arbeiten, schneller veröffentlichen und mit Nutzerfeedback weiterlernen.",
  },
];

/**
 * Zitate aus der Branche im Originalwortlaut, jeweils mit Quelle. Die
 * Podcast-Zitate stammen aus den Transkripten auf lexfridman.com.
 */
export type Zitat = {
  /** Ein Satz oder ein kurzer Wortwechsel, in der Reihenfolge des Gesprächs. */
  zeilen: { von: string; text: string }[];
  quelle: string;
  href: string;
  kommentar: string;
};

const steinberger = "https://lexfridman.com/peter-steinberger-transcript/";
const dhh = "https://lexfridman.com/dhh-2-transcript";

export const zitate: Zitat[] = [
  {
    zeilen: [
      {
        von: "Peter Steinberger",
        text: "I do agentic engineering, and then maybe after 3:00 AM I switch to vibe coding, and then I have regrets on the next day.",
      },
      { von: "Lex Fridman", text: "Yeah. Walk, walk of shame." },
    ],
    quelle: "Lex Fridman Podcast #491, February 2026",
    href: steinberger,
    kommentar:
      "Für mich gehört zum Arbeiten mit KI, Ergebnisse auch dann zu prüfen, wenn das Bauen gerade leichtfällt.",
  },
  {
    zeilen: [
      {
        von: "DHH",
        text: "I’m not telling it where we’re going. I’m telling it the problem I have.",
      },
    ],
    quelle: "Lex Fridman Podcast #501, August 2026",
    href: textstellenLink(
      dhh,
      "I’m not telling it where we’re going. I’m telling it the problem I have.",
    ),
    kommentar:
      "Beim Sprechen beschreibe ich das Problem samt Kontext, statt dem Modell jeden Schritt vorzuschreiben.",
  },
  {
    zeilen: [
      {
        von: "Lex Fridman",
        text: "So you for real with all those terminals are using voice?",
      },
      {
        von: "Peter Steinberger",
        text: "Yeah. I used to do it very extensively to the point where there was a period where I lost my voice.",
      },
    ],
    quelle: "Lex Fridman Podcast #491, February 2026",
    href: steinberger,
    kommentar:
      "Ich diktiere meine Aufträge, weil ich sprechend mehr Kontext und auch meine Zweifel mitgeben kann.",
  },
  {
    zeilen: [
      { von: "Lex Fridman", text: "Vibe coding feels wrong, too." },
      {
        von: "DHH",
        text: "It does, because vibe coding to me smells exactly like script kiddies did in the early 2000s.",
      },
    ],
    quelle: "Lex Fridman Podcast #501, August 2026",
    href: dhh,
    kommentar:
      "Die Bezeichnung ist für mich zweitrangig; entscheidend ist, ob ich das Ergebnis prüfen und verantworten kann.",
  },
  {
    zeilen: [
      {
        von: "Andrej Karpathy",
        text: "There’s a new kind of coding I call “vibe coding”, where you fully give in to the vibes, embrace exponentials, and forget that the code even exists.",
      },
    ],
    quelle: "on X, February 2, 2025",
    href: "https://x.com/karpathy/status/1886192184808149383",
    kommentar:
      "Die Modelle schreiben meinen Code; was entstehen soll und ob es funktioniert, entscheide ich.",
  },
  {
    zeilen: [
      {
        von: "Peter Steinberger",
        text: "I know I have one blog post where I say, “I don’t read the code.” But if you read it more closely, I mean, I don’t read the boring parts of code.",
      },
    ],
    quelle: "Lex Fridman Podcast #491, February 2026",
    href: steinberger,
    kommentar:
      "Ich programmiere nicht selbst und lasse den Code deshalb vom jeweils anderen Modell gegenlesen.",
  },
  {
    zeilen: [
      {
        von: "Lex Fridman",
        text: "The actual skill I’m currently developing […] is not to overspecify things, is to get out of the system’s way.",
      },
    ],
    quelle: "Lex Fridman Podcast #501, August 2026",
    href: textstellenLink(
      dhh,
      "the actual skill I’m currently developing",
      "is not to overspecify things, is to get out of the system’s way.",
    ),
    kommentar:
      "Hier sehe ich meinen Vorteil gegenüber klassischen Programmierern: Ich denke vom Produkt aus und lasse den Modellen den Lösungsweg offen.",
  },
  {
    zeilen: [
      {
        von: "DHH",
        text: "We have seen decades of progress happen in the last nine months.",
      },
    ],
    quelle: "Lex Fridman Podcast #501, August 2026",
    href: textstellenLink(
      dhh,
      "we have seen decades of progress happen in the last nine months.",
    ),
    kommentar:
      "Der schnelle Modellfortschritt ist für mich ein Grund, täglich mit den Werkzeugen zu arbeiten.",
  },
];
