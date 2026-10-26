import {
  groesse,
  type Vorschau,
  verweis,
  vorschauAlt,
  vorschauBild,
} from "@/components/vorschau/vorschau-bild";

const vorschau: Vorschau = verweis("Lebenslauf");

export const alt = vorschauAlt(vorschau, "der Springer aus der Wortmarke");

export const size = groesse;
export const contentType = "image/png";

export default function Vorschaubild() {
  return vorschauBild(vorschau);
}
