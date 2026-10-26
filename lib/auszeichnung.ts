/*
 * Die Auszeichnung der Inhaltsdateien: ==Textmarker== und [Verweis](#ziel).
 * Die Seite setzt daraus Marker und Links, das Archiv der Redaktion liest
 * denselben Text als Klartext.
 */

export type Teil =
  | { art: "text"; text: string }
  | { art: "marker"; teile: Teil[] }
  | { art: "verweis"; text: string; ziel: string };

const MARKER = /==(.+?)==/g;
const VERWEIS = /\[([^\]]+)\]\(([^)]+)\)/g;

function verweise(text: string): Teil[] {
  const teile: Teil[] = [];
  let ab = 0;
  for (const m of text.matchAll(VERWEIS)) {
    if (m.index > ab)
      teile.push({ art: "text", text: text.slice(ab, m.index) });
    teile.push({ art: "verweis", text: m[1], ziel: m[2] });
    ab = m.index + m[0].length;
  }
  if (ab < text.length) teile.push({ art: "text", text: text.slice(ab) });
  return teile;
}

export function zerlege(text: string): Teil[] {
  const teile: Teil[] = [];
  let ab = 0;
  for (const m of text.matchAll(MARKER)) {
    if (m.index > ab) teile.push(...verweise(text.slice(ab, m.index)));
    teile.push({ art: "marker", teile: verweise(m[1]) });
    ab = m.index + m[0].length;
  }
  if (ab < text.length) teile.push(...verweise(text.slice(ab)));
  return teile;
}

/** Der Text ohne Auszeichnung, für das Archiv. */
export function klartext(text: string) {
  return text.replace(MARKER, "$1").replace(VERWEIS, "$1");
}
