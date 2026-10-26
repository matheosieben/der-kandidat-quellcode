import {
  bildAlsDaten,
  groesse,
  type Vorschau,
  vorschauAlt,
  vorschauBild,
} from "@/components/vorschau/vorschau-bild";
import { bewerbungTitel, dasWichtigste } from "@/content/ausgabe";

const vorschau: Vorschau = {
  dachzeile: "Initiativbewerbung",
  titel: bewerbungTitel,
  vorspann: dasWichtigste[0].text,
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
