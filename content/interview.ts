import { bilder } from "@/content/ausgabe";
import { programm } from "@/content/programm";

/*
 * Das Interview: ein Terminal, in dem eine Maschine mich vertritt, und daneben
 * der Fit Check gegen eine Stellenanzeige. Beides in einem Finder-Fenster.
 */

export const interview = {
  dachzeile: "Interview",
  titel: "Fragen an mich",
  vorspann:
    "Was Sie über mich wissen wollen, können Sie hier schon vor dem ersten Gespräch fragen. Eine Maschine antwortet für mich: Sie kennt diese Ausgabe und einige Hintergründe, die ich ihr mitgegeben habe, und nennt zu jeder Antwort die Fundstelle. Im Fit Check legt sie meine Erfahrung neben Ihre Stellenanzeige.",
  /** Vorschläge im Terminal, je mit Thema. */
  vorschlaege: [
    ["Projekte", "Was haben Sie bisher gebaut?"],
    ["Motivation", "Warum Axel Springer?"],
    ["Ehrlich", "Wo liegen Ihre Schwächen?"],
    ["Werkzeuge", "Mit welchen Modellen arbeiten Sie?"],
  ] as const,
  weiterlesen: [
    {
      ressort: "Leitartikel",
      href: "/leitartikel",
      titel: programm.titel,
      text: "Warum ich mein Studium beendet habe und mich jetzt bewerbe.",
      bild: bilder.leitartikel,
    },
    ...programm.weiterlesen.filter((a) => a.href !== "/interview"),
  ],
};
