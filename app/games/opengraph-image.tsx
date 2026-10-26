import {
  groesse,
  type Vorschau,
  vorschauAlt,
  vorschauBild,
  WortwahlMotiv,
} from "@/components/vorschau/vorschau-bild";

const vorschau: Vorschau = {
  dachzeile: "Games",
  titel: "Für die Mittagspause",
  vorspann:
    "Wortwahl, das tägliche Rätsel aus dem KI-Alltag, und Der Springer, ein Lauf durch den Alltag eines Agenten.",
  motiv: <WortwahlMotiv />,
};

export const alt = vorschauAlt(
  vorschau,
  "drei Zeilen Wortwahl in Grün, Gelb und Grau, die letzte gelöst",
);

export const size = groesse;
export const contentType = "image/png";

export default function Vorschaubild() {
  return vorschauBild(vorschau);
}
