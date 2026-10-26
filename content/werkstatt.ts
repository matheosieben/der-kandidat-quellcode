import type { DockApp } from "@/components/werkstatt/dock";

/*
 * Die Texte der Werkstatt, Bereich für Bereich. Auszeichnung:
 * ==Textmarker== und [Verweis](#ziel), siehe lib/auszeichnung.ts.
 * Die Seite setzt sie, das Archiv der Redaktion liest sie als Klartext.
 */

/* Einladungslink an der Passworttür vorbei; der Schlüssel steht bei
   Vercel in EINLADUNG_SCHLUESSEL und lässt sich dort zurückziehen. */
const FORTIS_EINLADUNG =
  "https://fortismc.matheo-sieben.de/einladung/id34Jd4UFQf3wQrMPUL1BiW2Ty3mBqAA";

export const vorweg = [
  "Mich fasziniert, dass ich heute Dinge bauen kann, die mir vor zwei Jahren verschlossen waren. Ich bin technisch versiert, aber ich programmiere nicht, weder damals noch heute. Mein Zugang kommt vom Produkt und vom Design: Ich weiß, was entstehen soll und wie es sich anfühlen muss.",
  "Die Arbeit läuft meist gleich ab: Ich spreche, die Modelle planen und schreiben den Code, ==ich prüfe und entscheide.== Mein Blick fürs Detail ist dabei Stärke und Schwäche zugleich. Er macht die Ergebnisse besser, aber mich langsam: Ich feile an Kleinigkeiten, wo das Projekt längst rausgehen sollte. Daran möchte ich arbeiten: schneller shippen, echtes Feedback einholen, iterieren. Mehr dazu unter [Fokus](#fokus).",
];

export const tools = {
  einleitung:
    "Angefangen habe ich mit den CLIs von Claude Code und Codex im Terminal von Cursor und mit Cursors Composer-Modell. Heute arbeite ich nur noch in den Desktop-Apps von Claude und Codex, unterwegs auch vom iPhone.",
  /* Die Apps im Dock: links, was heute im Dock liegt, rechts vom Strich Cursor von früher. */
  dock: [
    {
      name: "Claude",
      icon: "/werkzeuge/claude.png",
      laeuft: true,
      zweck: "Mein Hauptwerkzeug: Claude Code in der Desktop-App",
    },
    {
      name: "Codex",
      icon: "/werkzeuge/codex.png",
      laeuft: true,
      zweck: "Für visuelle Änderungen, dazu das Review auf GitHub",
    },
    {
      name: "Wispr Flow",
      icon: "/werkzeuge/wispr-flow.png",
      laeuft: true,
      zweck: "Diktat: Fn drücken und sprechen",
    },
    {
      name: "T3 Code",
      icon: "/werkzeuge/t3-code.png",
      laeuft: false,
      zweck: "T3 probiere ich aktuell aus",
    },
    {
      name: "Terminal",
      icon: "/werkzeuge/terminal.png",
      laeuft: false,
      zweck: "Nur noch selten, für kurze Befehle",
    },
    {
      name: "Cursor",
      icon: "/werkzeuge/cursor.png",
      laeuft: false,
      frueher: true,
      zweck: "Mein Einstieg, heute nicht mehr im Einsatz",
    },
  ] satisfies DockApp[],
  /* Die Tools im Einzelnen, in der Reihenfolge des Docks; Cursor steht nur dort. */
  werkzeuge: [
    {
      id: "claude",
      name: "Claude Code",
      absaetze: [
        "Hier läuft der Großteil meiner Arbeit.",
        "Seit Opus 5.5 ist Claude für mich klar vorn. Nach Opus 4.5 ist es der erste große Wow-Moment, vergleichbar mit ChatGPT Ende 2022. Viel heißt das allerdings nicht: Morgen kann schon die nächste Codex-Generation vorn liegen.",
      ],
    },
    {
      id: "codex",
      name: "Codex",
      absaetze: [
        "Codex nutze ich vor allem für das Code-Review auf GitHub. Jeder PR löst automatisch ein Review aus. Claude prüft die Funde, behebt sie und merged nach einem Durchlauf.",
      ],
    },
    {
      id: "wispr",
      name: "Wispr Flow",
      absaetze: [
        "Mit Wispr Flow spreche ich meine Aufträge ein. Dabei erzähle ich auch, wo ich noch unsicher bin. Beim Tippen würde ich vieles davon weglassen. Mehr dazu unter [Wispr & Voice](#diktat).",
      ],
    },
    {
      id: "terminal",
      name: "Terminal",
      absaetze: [
        "Seit ich die CLIs nicht mehr nutze, brauche ich das Terminal nur noch für kurze Befehle, und dann meist im eingebauten Terminal von Claude.",
      ],
    },
  ],
};

export const diktat = {
  absaetze: [
    "Es geht mir weniger um Tempo als um die Art, wie ich denke. Beim Reden fange ich an, bevor ich genau weiß, was ich will: Ich erzähle, wofür etwas gedacht ist, wo ich unsicher bin und was auf keinen Fall passieren darf.",
    "Getippt hätte ich vieles davon weggelassen und den Auftrag knapper formuliert. Gesprochen bekommt das Modell den Zusammenhang, auch meine Zweifel. ==Oft merke ich erst beim Reden, wo das eigentliche Problem liegt.==",
  ],
  voice: {
    dachzeile: "ChatGPT Voice",
    titel: "Wenn selbst die Richtung noch offen ist",
    text: "Habe ich nur eine grobe Idee oder noch gar keinen Ansatz, nutze ich ChatGPT Voice. Im direkten Gespräch erzähle ich, lasse nachfragen und taste mich intuitiv vor.",
  },
};

export const modelle = {
  /** Vor dem Terminal, in dem die erste Zeile getippt wird. */
  anfang:
    "Angefangen hat es in Xcode: Mit dem integrierten Coding-Agent habe ich dort meine erste App [AHT](#bilanz) in SwiftUI gebaut. Kurz darauf, etwa ein halbes Jahr nach dem initialen Release von Claude Code, habe ich diese Zeile ins Terminal getippt:",
  /** So wurde Claude Code im Sommer 2025 installiert; der curl-Installer kam später. */
  befehl: "npm install -g @anthropic-ai/claude-code",
  heute:
    "Mit jedem größeren Release prüfe ich neu, ob Claude oder Codex für meine Arbeit besser passt. Der Maßstab bleibt derselbe: meine Absicht verstehen, mitdenken, zuverlässig umsetzen. Aktuell liegt Opus 5.5 für mich klar vorn.",
};

export const gebaut = {
  einleitung:
    "Ich lerne am besten, wenn ich etwas baue. Deshalb habe ich KI von Anfang an an eigenen Projekten ausprobiert.",
  projekte: [
    {
      id: "cipre",
      dachzeile: "Hauptprojekt · KI für Kanzleien",
      titel: "Ciprè",
      absaetze: [
        "Ciprè soll Frontier-KI für deutsche Kanzleien und Notariate nutzbar machen, und zwar so, wie Berufsrecht und Datenschutz es verlangen. Das Ziel: Nichts verlässt die EU. Die Modelle sollen in Rechenzentren in Europa laufen, die Daten in Frankfurt liegen.",
        "Die Software soll proaktiv arbeiten: Verträge und Schreiben aufsetzen und prüfen, Termine vor- und nachbereiten. Ein Teil davon ist gebaut, der Rest geplant. Akten, Fristen und Abrechnung bleiben weitgehend in der bestehenden Kanzleisoftware.",
        "Gerade denke ich Ciprè unter dem Arbeitstitel BaseDash neu: zuerst ein einziger Fall, der von vorn bis hinten trägt. ==Eine Kanzlei hat zugesagt, ihn im Pilot zu testen.==",
        "Ein weiterer Teil ist die Recherche. Dafür habe ich ein RAG entwickelt: Hinter Ciprè liegt eine eigene Datenbank mit deutschen Gesetzen und Rechtsprechung. Statt bei jeder Frage lange das Internet zu durchsuchen, bekommt die KI direkt die Stellen, die sie für genau diese Anfrage braucht, und antwortet nur auf ihrer Grundlage, ==mit einer Fundstelle zu jeder Aussage.==",
        "Das spart Zeit und Kosten und macht die Arbeit nachvollziehbar. Wie eine Frage durch das System läuft, zeigt das Terminal.",
      ],
    },
    {
      id: "fortis",
      dachzeile: "Kundenauftrag · Website",
      titel: "Fortis Medical Consulting",
      absaetze: [
        "Für eine Beratung medizinischer Einrichtungen habe ich die neue Website entwickelt, die einen alten Baukasten-Auftritt ablöst. Von der Konzeption bis zur Umsetzung habe ich alles in Zusammenarbeit mit Claude erarbeitet.",
        `Gerade stimmen wir die letzten Inhalte ab, ==der Livegang steht kurz bevor.== Bis dahin liegt die Seite hinter einem Passwort; über diesen Link geht es direkt ==[zur Website](${FORTIS_EINLADUNG})==.`,
      ],
    },
    {
      id: "aht",
      dachzeile: "Der Anfang · iPhone-App",
      titel: "Another Habit Tracker",
      absaetze: [
        "Mein erstes Projekt: eine native iPhone-App in SwiftUI. Angefangen habe ich mit dem Coding-Agent, der damals in Xcode steckte; später bin ich zu Codex und Claude Code gewechselt. Die App bündelt Gewohnheiten zu Routinen und schlägt vor, was den Routinen noch fehlt.",
        "Dabei ging es weniger um die App selbst als darum, zu verstehen, wie die Modelle arbeiten, und zu lernen, mit ihnen zu arbeiten.",
      ],
    },
  ],
  /** Steht unter „Außerdem in Arbeit“ vor den übrigen Projekten. */
  praxisDashboard: {
    titel: "Praxis Dashboard",
    text: "Für die Radiologie, in der ich aktuell arbeite, baue ich ein Werkzeug, das die Statistiken der Praxis nutzbar macht. Es zieht Statistiken aus der Telefonanlage und aus Doctolib, und eine KI wertet sie aus. Sie erkennt Schwachstellen in den Abläufen und macht konkrete Vorschläge, wie sie sich beheben lassen. So wird sichtbar, wann Patienten am Telefon nicht durchkommen und wo Termine ungenutzt bleiben, und die Praxis kann gezielt gegensteuern.",
  },
};

export const fokus = {
  absaetze: [
    "Gut ein Jahr mit LLMs hat meinen Blick darauf verändert, worin die eigentliche Arbeit besteht, und mit jeder Modellgeneration verschiebt er sich weiter. Für die aktuellen Modelle gilt: Je genauer ich den Weg vorschreibe, desto schlechter das Ergebnis. Ich beschreibe deshalb das Problem und das Ziel und lasse den Modellen den Weg. Was zählt, ist der Kontext: wofür etwas gedacht ist, wer es benutzt, was auf keinen Fall passieren darf.",
    "Dass ich nicht programmiere, hilft mir dabei eher, als dass es schadet. Wer gelernt hat, jeden Schritt selbst festzulegen, schreibt den Modellen leicht auch heute noch den Weg vor. Ich denke vom Produkt aus: Was soll es leisten, für wen, und was zuerst? ==Wenn Code billig ist, zählen Urteil und Geschmack mehr denn je.== Ein Versuch kostet kaum noch etwas, also baue ich lieber, als lange zu planen: Ich lasse mir zwei oder drei Varianten zeigen und entscheide, oft aus dem Bauch heraus.",
    "Ebenso wichtig ist ein gesundes Misstrauen. Ein Modell klingt immer sicher, auch wenn es sich irrt. Ich prüfe, was und wo ich kann, und lasse den Code vom jeweils anderen Modell gegenlesen.",
    "Ich will besser einschätzen können, wo sich weitere Arbeit lohnt und wann ein Ergebnis gut genug ist.",
  ],
  /** Löst ein, was Vorweg ankündigt; abgesetzt unter einer Linie. */
  schluss:
    "Daraus folgt, was ich unter [Vorweg](#vorweg) angekündigt habe: schneller shippen, früh echtes Feedback einholen, iterieren.",
};
