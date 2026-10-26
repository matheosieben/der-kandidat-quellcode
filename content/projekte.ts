/*
 * Die Bilanz, nur für das Archiv der Redaktion. Quellen: READMEs und Fahrpläne
 * der Repositories, Commit-Zahlen über die GitHub-API (Standardzweig, Stand der
 * Ausgabe).
 */

type Projekt = {
  dachzeile: string;
  titel: string;
  vorspann: string;
  absaetze: { titel: string; text: string }[];
  lehre: string;
  technik: string[];
  commits: number;
  zeitraum: string;
};

export const projekte: Projekt[] = [
  {
    dachzeile: "Hauptprojekt · KI für Kanzleien",
    titel: "Ciprè",
    vorspann:
      "Ciprè soll Kanzleien bei Recherche und Verträgen helfen und wollte anfangs zu viel auf einmal. Unter dem Arbeitstitel BaseDash denke ich es gerade neu: ein Fall nach dem anderen.",
    absaetze: [
      {
        titel: "Was entstand",
        text: "Eine Rechtsdatenbank mit 2.100 Gesetzen, die eine KI durchsucht. Zu jeder Antwort nennt sie die Quelle und zeigt, wie gut die Antwort belegt ist. Dazu zwei Vertragsvorlagen mit geführtem Dialog und ein Teil der proaktiven Arbeit an Verträgen und Terminen.",
      },
      {
        titel: "Was nicht trug",
        text: "Posteingang, Kalender, Akten und Vorlagen entstanden gleichzeitig. Echt war am Ende vor allem die Rechtsdatenbank, der Rest lief auf Beispieldaten. Und den geplanten Weg, die KI ausschließlich in der EU rechnen zu lassen, gab es so noch nicht; der Betrieb in der EU bleibt das Ziel.",
      },
      {
        titel: "Was sich änderte",
        text: "Mit BaseDash baue ich zuerst einen einzigen Fall ganz: Akte öffnen, einem Agenten einen Auftrag geben, ein Ergebnis mit Quellen erhalten, freigeben. Was nicht funktioniert, kommt nicht auf den Bildschirm. Eine Kanzlei hat zugesagt, das Produkt im Pilot zu testen.",
      },
    ],
    lehre:
      "Ein Fall, der von vorn bis hinten trägt, überzeugt mehr als zehn Bereiche, die halb fertig sind.",
    technik: [
      "Next.js",
      "TypeScript",
      "Supabase",
      "pgvector",
      "Claude",
      "Legal-RAG",
    ],
    commits: 286,
    zeitraum: "März bis Oktober 2026",
  },
  {
    dachzeile: "Auftrag · Website",
    titel: "Fortis Medical Consulting",
    vorspann:
      "Eine Website für eine Beratung medizinischer Einrichtungen in Hannover. Mein erster Kundenauftrag, gebaut nach denselben Regeln wie alles andere.",
    absaetze: [
      {
        titel: "Der Auftrag",
        text: "Leistungen, Vorgehen und Kontakt auf einer ruhigen, schnellen Seite, die zu einer Beratung für Großpraxen, MVZ und Kliniken passt.",
      },
      {
        titel: "Das Verfahren",
        text: "Plan in Alltagssprache, kleine Pull Requests, jedes Review durch ein zweites Modell, Freigabe durch mich. Die Seite liegt beim Kunden zur Abnahme.",
      },
    ],
    lehre:
      "Ein Kunde prüft anders als ein Modell: nicht den Code, sondern ob er sich wiedererkennt.",
    technik: ["Next.js 16", "CSS Modules", "Vercel"],
    commits: 83,
    zeitraum: "September 2026",
  },
  {
    dachzeile: "Der Anfang · iPhone-App",
    titel: "Another Habit Tracker",
    vorspann:
      "Meine erste eigene App, gebaut, um zu verstehen, wie Agenten programmieren. Gewohnheiten werden zu Routinen gebündelt, die Beständigkeit wird zu einer Zahl.",
    absaetze: [
      {
        titel: "Die Architektur",
        text: "Die Auswertung läuft nicht auf dem Gerät. Eine Supabase-Funktion stellt den Aufruf an die KI, der Schlüssel bleibt auf dem Server und nicht im App-Bündel.",
      },
      {
        titel: "Der Fehler",
        text: "Ich habe gebaut, bevor jemand danach gefragt hatte. Deshalb gibt es keine belastbaren Nutzungszahlen. Es fehlt nicht der Messwert, sondern die Messung.",
      },
    ],
    lehre: "Erst fragen, wer es braucht. Dann bauen.",
    technik: ["SwiftUI", "Supabase Edge Functions", "OpenAI-API"],
    commits: 3,
    zeitraum: "Januar bis Februar 2026",
  },
];

export const ausserdem = [
  {
    titel: "Praxis TV",
    text: "Eine Software, die die Bildschirme im Wartebereich der Radiologie automatisch bespielt. Darüber kann die Praxis ihre Patienten informieren, unterhalten und eigene Angebote bewerben. Neue Inhalte brauchen keinen Grafiker: Man sagt einem KI-Modell, was auf den Bildschirmen laufen soll, und es füllt die passende Vorlage aus.",
  },
];
