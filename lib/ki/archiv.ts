import { berufsbezeichnung, schritte } from "@/content/arbeitsweise";
import { ausgabe, dasWichtigste } from "@/content/ausgabe";
import { entstehung } from "@/content/entstehung";
import { hintergrund } from "@/content/hintergrund";
import { stationsgruppen } from "@/content/lebenslauf";
import { programm } from "@/content/programm";
import { ausserdem, projekte } from "@/content/projekte";
import {
  diktat,
  fokus,
  gebaut,
  modelle,
  tools,
  vorweg,
} from "@/content/werkstatt";
import { klartext } from "@/lib/auszeichnung";
import { daten, datumKurz, zahl } from "@/lib/daten";
import { monateMitSchaetzung } from "@/lib/schaetzung";
import { MODELLNAME } from "./modell";

/*
 * Das Archiv der Redaktion: alles, was die Maschine über den Kandidaten weiß.
 * Es wird aus denselben Dateien erzeugt wie die Zeitung selbst, damit Blatt und
 * Antworten nicht auseinanderlaufen. Einschätzungen darf sie daraus ableiten,
 * Fakten nur hier entnehmen.
 */

const s = daten.summen;
const w = daten.wispr;

const abschnitte: [string, string[]][] = [
  [
    "Kandidat",
    [
      `${ausgabe.autor} bewirbt sich initiativ bei der KI-Einheit der Axel Springer SE. Er arbeitet in ${ausgabe.ort}.`,
      ...dasWichtigste.map((p) => `${p.marke} ${p.text}`),
      `Kontakt: ${ausgabe.mail}, Telefon ${ausgabe.telefon}, LinkedIn ${ausgabe.linkedin}. Eine Anschrift steht nicht in dieser Ausgabe.`,
    ],
  ],
  [
    "Leitartikel",
    [
      `Leitartikel „${programm.titel}“: ${programm.vorspann}`,
      ...programm.absaetze,
      `Steckbrief neben dem Leitartikel: ${programm.steckbrief.map(([feld, wert]) => `${feld}: ${wert}`).join("; ")}.`,
    ],
  ],
  [
    "Bilanz",
    [
      klartext(gebaut.einleitung),
      ...gebaut.projekte.map(
        (p) =>
          `${p.titel} (${p.dachzeile}) in der Werkstatt: ${p.absaetze.map(klartext).join(" ")}`,
      ),
      "Der Link bei Fortis in der Werkstatt führt an der Passwortabfrage vorbei direkt zur Website; ein Passwort braucht man dafür nicht.",
      `Außerdem in Arbeit, ${gebaut.praxisDashboard.titel}: ${gebaut.praxisDashboard.text}`,
      ...projekte.flatMap((p) => [
        `${p.titel} (${p.dachzeile}, ${p.zeitraum}, ${p.commits} Commits, Technik: ${p.technik.join(", ")}): ${p.vorspann}`,
        ...p.absaetze.map((a) => `${p.titel}, ${a.titel}: ${a.text}`),
        `${p.titel}, Lehre: ${p.lehre}`,
      ]),
      ...ausserdem.map((a) => `Außerdem ${a.titel}: ${a.text}`),
      "Bildschirmfotos von Ciprè, BaseDash und Fortis stehen nicht im Blatt. Die Titelseite zeigt ein Mockup von Another Habit Tracker; alle Bilder der Ausgabe sind KI-generiert und so gekennzeichnet.",
    ],
  ],
  [
    "Werkstatt",
    [
      `Vorweg: ${vorweg.map(klartext).join(" ")}`,
      `Tools: ${tools.einleitung} Im Dock: ${tools.dock.map((a) => `${a.name} (${a.zweck})`).join("; ")}.`,
      ...tools.werkzeuge.map(
        (w) => `Tools, ${w.name}: ${w.absaetze.map(klartext).join(" ")}`,
      ),
      `Wispr & Voice: ${diktat.absaetze.map(klartext).join(" ")} ${diktat.voice.dachzeile}, ${diktat.voice.titel}: ${diktat.voice.text}`,
      `Modelle: ${klartext(modelle.anfang)} „${modelle.befehl}“. ${modelle.heute}`,
      `Fokus, „Wenn Code billig ist, zählt das Urteil“: ${fokus.absaetze.map(klartext).join(" ")} ${klartext(fokus.schluss)}`,
      ...schritte.map(
        (x) => `Schritt ${x.titel}: ${x.text} ${x.marke}: ${x.beleg}`,
      ),
      `Berufsbezeichnung: ${berufsbezeichnung}`,
      `Diktat mit Wispr Flow, gemessen an den letzten ${w.diktate} Diktaten (${datumKurz(w.von, false)} bis ${datumKurz(w.bis)}): ${zahl(w.worte)} Wörter in ${w.minuten} Minuten Sprechzeit, also rund ${w.wpm} Wörter pro Minute. Der Median liegt bei ${w.medianWorte} Wörtern je Diktat. Er spricht seine Aufträge vor allem, weil er dabei laut denkt und das Modell so Ziel, Rahmen und Zweifel mitbekommt; das Tempo ist Nebensache. ${w.anteilInClaude} Prozent der Diktate gingen direkt an Claude. Das längste Diktat hatte ${w.laengstesDiktat} Wörter.${w.wochenlimitErreicht ? ` ${w.wochenlimitErreicht}-mal meldete das Programm, das Wochenkontingent an Wörtern sei erschöpft.` : ""}`,
      `Gemessen aus den lokalen Protokollen von Codex (ab ${datumKurz(daten.quellen.codexAb)}) und Claude Code (ab ${datumKurz(daten.quellen.claudeAb)}) sowie aus ${s.commits} Commits: ${zahl(s.tokensMrd, 2)} Milliarden verarbeitete Tokens, davon der größte Teil aus dem Zwischenspeicher, ${zahl(s.ausgabeMio, 1)} Millionen erzeugte Tokens, ${s.aktiveTage} aktive Tage.`,
      `In zwölf Monaten setzte er ${s.modelle} Modellversionen ein. Erster Einsatz je Modell: ${daten.chronik.map(([n, d]) => `${n} ${datumKurz(d)}`).join("; ")}.`,
      `Token-Volumen je Monat in Millionen (OpenAI/Anthropic): ${daten.monate.map((m) => `${m.monat} ${m.openai}/${m.anthropic}`).join(", ")}. Claude-Protokolle liegen erst ab Juli 2026 vor, weil Claude Code seine Protokolle nach 30 Tagen löscht; frühere Claude-Nutzung ist über Co-Autor-Zeilen der Commits belegt. Für September 2025 bis Juni 2026 gibt es auf der Seite eine Hochrechnung (Annahme nach meiner Einschätzung der Modelle, nicht gemessen; bis Herbst 2025 bei Claude vor allem Sonnet, dazu Cursor mit dem Composer-Modell), Claude/Cursor Composer/Codex in Mio.: ${monateMitSchaetzung()
        .filter((m) => m.claudeGeschaetzt)
        .map((m) => `${m.monat} ${m.claude}/${m.cursor}/${m.codex}`)
        .join(", ")}.`,
      "Aktuell schreibt er Code fast ausschließlich mit Claude Opus 5.5. Nach eigener Aussage war nach dem Erscheinen von GPT-5.6 Sol im Juli 2026 eine Zeit lang dieses Modell sein Hauptwerkzeug. Gewechselt wird, wenn ein Update die Ergebnisse spürbar verändert.",
    ],
  ],
  [
    "Lebenslauf",
    stationsgruppen.flatMap((g) =>
      g.stationen.map(
        (st) =>
          `${g.titel}, ${st.zeitraum}: ${st.titel}, ${st.untertitel}.${st.beschreibung ? ` ${st.beschreibung}` : ""}`,
      ),
    ),
  ],
  [
    "Entstehung",
    [
      "Die Ausgabe ist eine Next.js-16-Anwendung mit React 19 und Tailwind CSS 4. Die Gestaltung folgt der New York Times und dem Wall Street Journal, mit freien Schriften und eigener Wordmark.",
      "Die Ressorts: Titelseite, Leitartikel, Werkstatt (Vorweg, Tools, Wispr & Voice, Modelle und Arbeitskalender, Was ich gebaut habe und Fokus), Interview mit Fit Check, Games (Wortwahl und Der Springer) und Lebenslauf.",
      `${entstehung.text} Gemessener Projektzeitraum: ${entstehung.von} bis ${entstehung.bis}, rund ${entstehung.arbeitsstunden} Stunden aktive Arbeitszeit. ${zahl(entstehung.eingabeTokens)} Input-Tokens, davon ${zahl(entstehung.eingabeAusCache)} erneut aus dem Cache gelesen, und ${zahl(entstehung.ausgabeTokens)} Output-Tokens. Der Quellcode steht unter ${ausgabe.repository}.`,
      "Leitidee: Schwarz steht für den Menschen, Blau für die Maschine. Alles, was eine Maschine erzeugt, ist blau gesetzt.",
      `Die Redaktion, die diese Fragen beantwortet, läuft auf ${MODELLNAME}. Sie antwortet auf Grundlage dieses Archivs und denkt von ihm aus weiter, erfindet aber keine Fakten.`,
    ],
  ],
  // Erscheint erst, wenn es Einträge gibt.
  ...(hintergrund.length > 0
    ? [["Hintergrund", hintergrund] as [string, string[]]]
    : []),
];

export const archivText = abschnitte
  .map(
    ([titel, zeilen]) =>
      `## ${titel}\n${zeilen.map((z) => `- ${z}`).join("\n")}`,
  )
  .join("\n\n");
