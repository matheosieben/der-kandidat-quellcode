import { Zilla_Slab } from "next/font/google";

/**
 * Die Spiele haben, wie bei der NYT, eine eigene Schrift: eine kräftige
 * Slab-Serif. Sie wird nur dort geladen, wo dieses Modul importiert wird.
 */
export const slab = Zilla_Slab({
  subsets: ["latin"],
  weight: ["500", "700"],
});
