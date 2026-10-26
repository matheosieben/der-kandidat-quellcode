import {
  bildAlsDaten,
  groesse,
  type Vorschau,
  verweis,
  vorschauAlt,
  vorschauBild,
} from "@/components/vorschau/vorschau-bild";

const vorschau: Vorschau = {
  ...verweis("Interview"),
  bild: await bildAlsDaten("interview-hero.png"),
};

export const alt = vorschauAlt(
  vorschau,
  "eine Zeichnung: eine Interviewerin sitzt einer aufgeschlagenen Zeitung an einem Cafétisch gegenüber",
);

export const size = groesse;
export const contentType = "image/png";

export default function Vorschaubild() {
  return vorschauBild(vorschau);
}
