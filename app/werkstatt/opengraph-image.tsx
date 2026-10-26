import {
  bildAlsDaten,
  groesse,
  type Vorschau,
  verweis,
  vorschauAlt,
  vorschauBild,
} from "@/components/vorschau/vorschau-bild";

const vorschau: Vorschau = {
  ...verweis("Werkstatt"),
  bild: await bildAlsDaten("cipre-hero.jpg"),
};

export const alt = vorschauAlt(
  vorschau,
  "eine Illustration: eine Juristin im Gespräch mit einer KI-Figur",
);

export const size = groesse;
export const contentType = "image/png";

export default function Vorschaubild() {
  return vorschauBild(vorschau);
}
