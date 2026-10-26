import { type Bild, bilder, kiBild } from "@/content/ausgabe";
import { interview } from "@/content/interview";
import ahtMockup from "@/public/projekte/aht-mockup.jpg";

export type Anriss = {
  href: string;
  dachzeile: string;
  titel: string;
  text: string;
  bild?: Bild;
};

export const gebaut: Anriss[] = [
  {
    href: "/werkstatt#cipre",
    dachzeile: "Hauptprojekt · KI für Kanzleien",
    titel: "Ciprè",
    text: "Frontier-KI für deutsche Kanzleien und Notariate. Ein eigenes RAG mit Gesetzen und Rechtsprechung liefert zu jeder Aussage die Fundstelle. Wie eine Frage durch das System läuft, zeigt das Terminal in der Werkstatt.",
    bild: bilder.recht,
  },
  {
    href: "/werkstatt#fortis",
    dachzeile: "Kundenauftrag · Website",
    titel: "Fortis Medical Consulting",
    text: "Mein erster Auftrag: eine Website für eine Beratung von Großpraxen, MVZ und Kliniken in Hannover, von der Konzeption bis zur Umsetzung mit Claude erarbeitet. Gebaut nach denselben Regeln wie alles andere: kleine Pull Requests, jedes Review durch ein zweites Modell, die Freigabe durch mich. Gelernt habe ich dabei, dass ein Kunde anders prüft als ein Modell: nicht den Code, sondern ob er sich wiedererkennt. Der Livegang steht kurz bevor.",
  },
  {
    href: "/werkstatt#aht",
    dachzeile: "Der Anfang · iPhone-App",
    titel: "Another Habit Tracker",
    text: "Meine erste App, gebaut in SwiftUI. Sie bündelt Gewohnheiten zu Routinen. Vor allem habe ich daran gelernt, mit den Modellen zu arbeiten.",
    bild: {
      src: ahtMockup,
      alt: "Eine Hand hält ein iPhone mit der App Another Habit Tracker: oben die Routinen, darunter Vorschläge",
      credit: `Mockup, ${kiBild}`,
    },
  },
];

export const arbeitsweise: Anriss[] = [
  {
    href: "/werkstatt#vorweg",
    dachzeile: "Vorweg",
    titel: "Ich prüfe und entscheide",
    text: "Mein Zugang kommt vom Produkt und vom Design. Ich spreche, die Modelle planen und schreiben den Code. Was entstehen soll und ob es funktioniert, entscheide ich.",
  },
  {
    href: "/werkstatt#tools",
    dachzeile: "Tools",
    titel: "Zwei Apps und ein Mikrofon",
    text: "Claude Code für den Großteil der Arbeit, Codex für Reviews und visuelle Anpassungen, Wispr Flow fürs Diktat. Was heute in meinem Dock liegt und was davon geblieben ist.",
  },
  {
    href: "/werkstatt#diktat",
    dachzeile: "Wispr & Voice",
    titel: "Gesprochen, nicht getippt",
    text: "Beim Reden bekommt das Modell den Zusammenhang, auch meine Zweifel. Oft merke ich erst dabei, wo das eigentliche Problem liegt. Ein Vergleich zum Ausprobieren.",
  },
];

export const modelle: Anriss = {
  href: "/werkstatt#modelle",
  dachzeile: "Modelle und Arbeitskalender",
  titel: "Ein Jahr Arbeit, Tag für Tag",
  text: "Von den ersten Versuchen in Xcode bis zu Claude Code und Codex. Jeder Tag ein Feld, jedes Werkzeug eine Farbe: So hat sich meine Arbeit seit September 2025 verändert.",
};

export const fokus: Anriss = {
  href: "/werkstatt#fokus",
  dachzeile: "Fokus",
  titel: "Wenn Code billig ist, zählt das Urteil",
  text: "Ich probiere mit den Modellen mehrere Varianten aus und prüfe die Ergebnisse. Dabei muss ich selbst entscheiden, wann ich aufhöre.",
};

export const gespraech: Anriss = {
  href: "/interview",
  dachzeile: interview.dachzeile,
  titel: interview.titel,
  text: "Eine Maschine vertritt mich. Sie kennt diese Ausgabe genau, denkt von ihr aus weiter und nennt zu jeder Antwort die Fundstelle. Fragen Sie nach Projekten, Motivation oder meinen Schwächen.",
  bild: bilder.interview,
};

export const fitCheck: Anriss = {
  href: "/interview#fit-check",
  dachzeile: "Fit Check",
  titel: "Passe ich zu Ihrer Stelle?",
  text: "Eine Stellenanzeige einfügen und sehen, wie ich dazu passe. Mit Belegen aus dieser Ausgabe, Lernfeldern und drei Fragen fürs Gespräch.",
};

export const spiele: (Anriss & { art: "springer" | "wortwahl" })[] = [
  {
    art: "springer",
    href: "/games#springer",
    dachzeile: "Endloslauf",
    titel: "Der Springer",
    text: "Über Rechenzentren, Merge-Konflikte und Rate-Limits: Die Schachfigur, die heißt wie der Verlag, läuft durch den Alltag eines Agenten.",
  },
  {
    art: "wortwahl",
    href: "/games#wortwahl",
    dachzeile: "Worträtsel",
    titel: "Wortwahl",
    text: "Fünf Buchstaben, sechs Versuche und nach drei Versuchen ein Hinweis. Jeden Tag drei neue Wörter aus meinem KI-Alltag.",
  },
];

export const lebenslauf: Anriss = {
  href: "/lebenslauf",
  dachzeile: "Lebenslauf",
  titel: "Woher ich komme",
  text: "Radiologie, Fitnessstudio, eigene Software: Betriebe von innen, in denen Termine, Menschen und Personal zählen.",
};
