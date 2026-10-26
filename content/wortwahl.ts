/*
 * Die Lösungen von „Wortwahl“: fünf Buchstaben, ohne Umlaute, aus meinem Alltag
 * mit Sprachmodellen. Jeder Hinweis ist ein Satz.
 */

export const loesungen: { wort: string; hinweis: string }[] = [
  { wort: "TOKEN", hinweis: "Die Währung, in der Sprachmodelle abrechnen." },
  { wort: "BELEG", hinweis: "Was jede Antwort dieser Zeitung haben muss." },
  {
    wort: "AGENT",
    hinweis: "Arbeitet selbstständig, solange man ihm Regeln gibt.",
  },
  { wort: "FRIST", hinweis: "In der Kanzlei heilig, im Kalender rot." },
  { wort: "CACHE", hinweis: "Spart beim Wiederholen das meiste Geld." },
  { wort: "MERGE", hinweis: "Der Moment, in dem ein Zweig zurückkehrt." },
  {
    wort: "HAIKU",
    hinweis: "Drei Zeilen Lyrik oder ein sehr schnelles Modell.",
  },
  {
    wort: "DEBUG",
    hinweis: "Die Suche nach dem Fehler, den man selbst gemacht hat.",
  },
  { wort: "INDEX", hinweis: "Ohne ihn ist jedes Archiv nur ein Keller." },
  {
    wort: "REGEL",
    hinweis: "Entsteht hier, wenn derselbe Fehler zweimal passiert.",
  },
  { wort: "SWIFT", hinweis: "Die Sprache meiner ersten App." },
  {
    wort: "FABLE",
    hinweis: "Eine Fabel, auf Englisch. Oder ein Modell, im Juli.",
  },
  { wort: "QUERY", hinweis: "Die Frage, die eine Datenbank versteht." },
  { wort: "PATCH", hinweis: "Ein kleiner Flicken für ein großes Problem." },
  { wort: "LAYER", hinweis: "Davon hat ein neuronales Netz viele." },
  { wort: "AKTEN", hinweis: "Womit BaseDash anfängt." },
  { wort: "EMBED", hinweis: "Verwandelt Wörter in Koordinaten." },
  {
    wort: "LOGIK",
    hinweis: "Was man prüfen muss, wenn ein Modell sehr überzeugt klingt.",
  },
  { wort: "TEMPO", hinweis: "Hundert Wörter pro Minute, gesprochen." },
  {
    wort: "CODEX",
    hinweis: "Ein altes Wort für ein Buch und ein neues für ein Werkzeug.",
  },
  { wort: "BUILD", hinweis: "Grün heißt weiter, Rot heißt Abendschicht." },
  { wort: "EPOCH", hinweis: "Ein Durchgang durch alle Trainingsdaten." },
  {
    wort: "ZEILE",
    hinweis: "Wird im Pull Request gezählt, in der Zeitung gesetzt.",
  },
  {
    wort: "MODEL",
    hinweis: "Davon habe ich in zwölf Monaten einundzwanzig benutzt.",
  },
];

/** Erste Ausgabe des Spiels; danach wechselt die Lösung täglich. */
export const START = "2026-10-17";
