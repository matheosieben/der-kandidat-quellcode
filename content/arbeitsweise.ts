/*
 * Die fünf Schritte. Jeder Fund ist im Repository von BaseDash belegt:
 * Richtung im Fahrplan (04.10.2026), Widerspruch im Review von PR #12,
 * Regeln in AGENTS.md, falscher Verweis in PR #42 (behoben in 0de4111),
 * abweichende Frist im Review von PR #14, Merge-Regel in PR #43.
 */

type Schritt = {
  titel: string;
  text: string;
  marke: string;
  beleg: string;
};

export const schritte: Schritt[] = [
  {
    titel: "Sprechen",
    text: "Meine Aufträge entstehen gesprochen, nicht getippt. Mit Wispr Flow rede ich frei, gerade dort, wo ich mir noch unsicher bin.",
    marke: "Entscheidung",
    beleg:
      "Bei BaseDash habe ich festgelegt: zuerst für Anwälte, alles andere später.",
  },
  {
    titel: "Planen",
    text: "Das Modell legt mir einen Plan in Alltagssprache vor. Gebaut wird erst, wenn ich zustimme.",
    marke: "Fund",
    beleg:
      "Zwei Dokumente im Fahrplan widersprachen sich: Das eine verlangte Quellen für Entwürfe, das andere schloss sie aus.",
  },
  {
    titel: "Bauen",
    text: "Eine Aufgabe, ein Zweig, ein kleiner Pull Request. Höchstens drei Sitzungen gleichzeitig, nie an denselben Dateien.",
    marke: "Regel",
    beleg:
      "Passiert derselbe Fehler zweimal, mache ich daraus eine Regel in der Datei, die beide Modelle lesen.",
  },
  {
    titel: "Prüfen",
    text: "Jeden Pull Request prüft das jeweils andere Modell. Ich prüfe das Ergebnis im laufenden Produkt.",
    marke: "Fund",
    beleg:
      "Codex fand einen Verweis, der nach einem Umbau ins Leere zeigte. In einem anderen Review stand dieselbe Frist zweimal verschieden: 14.10. und 29.10.",
  },
  {
    titel: "Abschließen",
    text: "Nach einem Review und höchstens einer Korrekturrunde wird zusammengeführt, nach Regeln, die ich festgelegt habe.",
    marke: "Grenze",
    beleg:
      "Für ein Demo mit erfundenen Daten genügt das. Sobald echte Mandantendaten im Spiel sind, gebe ich jeden Merge selbst frei.",
  },
];

export const berufsbezeichnung =
  "Monatelang nannte ich mich Agentic Engineer. Inzwischen halte ich Vibecoder für ehrlicher. Für diese Arbeit gab es vor einem Jahr kein Wort; beides sind Behelfsnamen. Ich komme vom Produkt, nicht vom Code: Den Nutzen bestimmt, wer etwas benutzt, nicht, wer es geschrieben hat.";

/**
 * Beispiel für die Werkstatt: derselbe Auftrag, einmal getippt, einmal
 * gesprochen. Nachgestellt, kein Protokollauszug; so klingen meine Diktate.
 */
export const diktatBeispiel = {
  getippt:
    "Ich möchte mich bei der KI-Einheit von Axel Springer bewerben. Statt eines Anschreibens denke ich an eine Website im Zeitungsstil. Bitte schlag mir ein Konzept vor.",
  gesprochen: [
    {
      rolle: "Ausgangspunkt",
      text: "Also, ich möchte mich bei Axel Springer bewerben, und zwar initiativ bei der KI-Einheit, also nicht auf eine ausgeschriebene Stelle.",
    },
    {
      rolle: "Offene Frage",
      text: "Ich weiß noch nicht genau, welche Form das haben soll. Hilf mir bitte dabei, das passende Format zu finden.",
    },
    {
      rolle: "Ziel und Freiraum",
      text: "Ich möchte herausstechen und schon in der Bewerbung zeigen, was ich kann. Du kannst die Richtung und mögliche Formate erst einmal frei erkunden.",
    },
    {
      rolle: "Kontext",
      text: "Schau dir dafür bitte die Daten an, die du über mich hast: meine GitHub-Repos, meine Notizen, unsere Chats und alles, was dir sonst hilft, ein Bild von mir zu bekommen.",
    },
  ],
};
