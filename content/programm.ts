import { ausgabe, bilder } from "@/content/ausgabe";

/*
 * Der Leitartikel: warum ich mich bewerbe, als durchgehender Fließtext in
 * Matheos Fassung. Die Randspalte trägt statt eines Kommentars den
 * Steckbrief mit den Fakten, die der Text bewusst weglässt.
 */

export const programm = {
  dachzeile: "Leitartikel",
  titel: "Der beste Zeitpunkt ist jetzt",
  vorspann:
    "Warum ich mein Studium beendet habe und mich in der KI-Einheit der Axel Springer SE bewerbe.",
  absaetze: [
    "Wie künstliche Intelligenz unseren Alltag in den nächsten zwei Jahren verändern wird, kann niemand sagen. Wahrscheinlich wissen wir nicht einmal, wo wir in zwei Monaten stehen.",
    "Ich beschäftige mich jeden Tag mit KI. Deshalb möchte ich auch beruflich daran arbeiten.",
    "Im Wirtschaftsstudium hat mir dieses Interesse gefehlt. Darüber hinaus hat ein Studienabschluss im vergangenen Jahr für mich an Stellenwert verloren. Da ich praktisch veranlagt bin, halte ich meine Zeit anderswo für sinnvoller investiert.",
    "Bisher habe ich mir vieles selbst beigebracht. Jetzt möchte ich in einem Team lernen, wie KI-Produkte für viele Menschen entwickelt und betrieben werden.",
    "Mich interessiert, wie KI verändert, wie Menschen Nachrichten finden, verstehen und hören. Daran möchte ich bei Axel Springer mitarbeiten.",
  ],
  steckbrief: [
    ["Name", ausgabe.autor],
    ["Ort", `${ausgabe.ort}, künftig Berlin`],
    ["Ziel", "KI-Einheit von Axel Springer"],
    ["Zugang", "Produkt und Design"],
    ["Arbeitsweise", "Ausprobieren, prüfen, verbessern"],
    ["Gesucht", "Team, Austausch, Ziele"],
  ],
  weiterlesen: [
    {
      ressort: "Werkstatt",
      href: "/werkstatt",
      titel: "Wie ich arbeite",
      text: "Meine Arbeitsweise, meine Werkzeuge und die Projekte, die daraus entstanden sind.",
      bild: bilder.recht,
    },
    {
      ressort: "Interview",
      href: "/interview",
      titel: "Fragen an mich",
      text: "Fragen an meine KI-Redaktion und ein Fit Check mit Ihrer Stellenanzeige.",
      bild: bilder.interview,
      maschine: true,
    },
    {
      ressort: "Lebenslauf",
      href: "/lebenslauf",
      titel: "Woher ich komme",
      text: "Meine Stationen in Beruf, Ausbildung und Praktika.",
    },
  ],
};
