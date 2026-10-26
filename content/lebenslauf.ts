/* Lebenslauf, übernommen aus der ersten Fassung von „Der Kandidat“. */

type Station = {
  zeitraum: string;
  titel: string;
  untertitel: string;
  beschreibung?: string;
};

type Stationsgruppe = {
  id: string;
  titel: string;
  stationen: Station[];
};

export const stationsgruppen: Stationsgruppe[] = [
  {
    id: "berufserfahrung",
    titel: "Berufserfahrung",
    stationen: [
      {
        zeitraum: "Seit 08/26",
        titel: "Projektleitung und Koordination",
        untertitel: "Radiologie am Raschplatz · Hannover",
        beschreibung:
          "Projektleitung bei der Modernisierung der Praxistechnik und Koordination der beteiligten Gewerke. Entwicklung von Praxis Dashboard zur KI-gestützten Datenanalyse sowie von Praxis TV für den Wartebereich.",
      },
      {
        zeitraum: "Seit 10/25",
        titel: "KI-gestützte Softwareentwicklung",
        untertitel: "BaseDash, Ciprè, Another Habit Tracker",
        beschreibung:
          "Konzeption und Umsetzung eigener Anwendungen mit KI-Agenten.",
      },
      {
        zeitraum: "06/25 – 08/26",
        titel: "Stellvertretung der Studioleitung",
        untertitel: "McFIT Vio Plaza · Wien",
        beschreibung:
          "Verantwortung für den laufenden Betrieb, dazu Service, Mitgliederberatung und Personal Training.",
      },
      {
        zeitraum: "03/24 – 04/25",
        titel: "Patientenbetreuung, Office & HR",
        untertitel: "Radiologie am Raschplatz · Hannover",
        beschreibung:
          "Patientenbetreuung, Terminorganisation sowie Büro- und Personalaufgaben.",
      },
      {
        zeitraum: "Seit 03/21",
        titel: "Selbstständige Projekte",
        untertitel: "E-Commerce & Webdesign",
        beschreibung:
          "Aufbau eigener Shopify-Stores mit Vertrieb, Marketing und Social Media. Dazu Websites für Kunden, zuletzt 2026 für Fortis Medical Consulting in Hannover.",
      },
      {
        zeitraum: "Seit 09/17 · nebenbei",
        titel: "Diverse Service-Tätigkeiten",
        untertitel: "Gastronomie, Verkauf, Bau, Lager",
        beschreibung:
          "Nebenjobs seit der Schulzeit, dazu Veranstaltungsservice, unter anderem als Tresenchef auf dem Schützenfest.",
      },
    ],
  },
  {
    id: "ausbildung",
    titel: "Ausbildung",
    stationen: [
      {
        zeitraum: "Ohne Abschluss",
        titel: "BWL und Nachhaltiges Management",
        untertitel: "Hochschule Harz",
        beschreibung:
          "Zunächst BWL, anschließend Nachhaltiges Management studiert. Das Studium zugunsten der Arbeit mit KI beendet. Die Gründe stehen im Leitartikel.",
      },
      {
        zeitraum: "08/22 – 07/24",
        titel: "Allg. Hochschulreife – Wirtschaft",
        untertitel: "Dr. Buhmann Akademie · Hannover",
        beschreibung:
          "Berufsbildende Schule mit begleitendem Praktikum, Schwerpunkte Wirtschaft, Management und Sprachen.",
      },
      {
        zeitraum: "08/10 – 07/22",
        titel: "Erweiterter Sek.-I-Abschluss",
        untertitel: "Freie Waldorfschule · Hannover-Maschsee",
      },
    ],
  },
  {
    id: "praktika",
    titel: "Praktika",
    stationen: [
      {
        zeitraum: "08/22 – 07/23",
        titel: "Continental AG",
        untertitel: "Marketing, Social Media & E-Business",
        beschreibung:
          "Internationale Webprojekte, SEO und Content-Koordination, dazu Mitarbeit an Social-Media-Kampagnen und Produktionen.",
      },
      {
        zeitraum: "07/22 · 4 Wochen",
        titel: "Bartels, Mehring & Petry",
        untertitel: "Anwaltskanzlei & Notariat",
        beschreibung:
          "Vorbereitung und Begleitung von Mandantenterminen, Mitarbeit im Tagesgeschäft und bei notariellen Vorgängen.",
      },
      {
        zeitraum: "08/21 · 5 Wochen",
        titel: "Fortis Venture Capital GmbH",
        untertitel: "Unternehmensberatung",
        beschreibung:
          "Marktrecherche, Analyse von Wirtschafts- und Unternehmensdaten und Aufbereitung der Ergebnisse.",
      },
    ],
  },
];
