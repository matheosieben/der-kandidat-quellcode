import {
  bildAlsDaten,
  groesse,
  type Vorschau,
  vorschauAlt,
  vorschauBild,
} from "@/components/vorschau/vorschau-bild";
import { programm } from "@/content/programm";

const vorschau: Vorschau = {
  dachzeile: programm.dachzeile,
  titel: programm.titel,
  vorspann: programm.vorspann,
  bild: await bildAlsDaten("leitartikel-hero1.png"),
};

export const alt = vorschauAlt(
  vorschau,
  "eine gemalte Ansicht des Axel-Springer-Neubaus in Berlin",
);

export const size = groesse;
export const contentType = "image/png";

export default function Vorschaubild() {
  return vorschauBild(vorschau);
}
