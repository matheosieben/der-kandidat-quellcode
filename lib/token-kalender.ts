import type { KalenderTag, Monat } from "@/lib/schaetzung";

type Werkzeug = "claude" | "cursor" | "codex";
type Volumen = Record<Werkzeug, number>;

export type TokenTag = {
  datum: string;
  tokens: number;
  werkzeug: Werkzeug | null;
  hochgerechnet: boolean;
};

export function tokenKalender(
  tage: KalenderTag[],
  monate: Monat[],
  gemessen: [string, number, number][],
): TokenTag[] {
  const werkzeuge: Werkzeug[] = ["claude", "cursor", "codex"];
  const jeTag = new Map(
    gemessen.map(([datum, codex, claude]) => [
      datum,
      { claude, codex, cursor: 0 },
    ]),
  );
  const jeMonat = new Map(
    monate.map((m) => {
      const beobachtet = gemessen
        .filter(([datum]) => datum.startsWith(m.monat))
        .reduce(
          (summe, [, codex, claude]) => ({
            claude: summe.claude + claude,
            codex: summe.codex + codex,
          }),
          { claude: 0, codex: 0 },
        );
      const rest = {
        claude: Math.max(0, m.claude - beobachtet.claude),
        cursor: m.cursor,
        codex: Math.max(0, m.codex - beobachtet.codex),
      };
      const summe = rest.claude + rest.cursor + rest.codex;
      return [m.monat, summe > 0 ? rest : m] as const;
    }),
  );

  return tage.map(([datum, tokens, , hochrechnung]) => {
    const bekannt = jeTag.get(datum) ?? { claude: 0, cursor: 0, codex: 0 };
    const bekanntSumme = bekannt.claude + bekannt.codex;
    const faktor = bekanntSumme > tokens ? tokens / bekanntSumme : 1;
    const fehlt = Math.max(0, tokens - bekanntSumme);
    const rest = jeMonat.get(datum.slice(0, 7));
    const restSumme = rest ? rest.claude + rest.cursor + rest.codex : 0;
    const volumen: Volumen = { claude: 0, cursor: 0, codex: 0 };
    for (const w of werkzeuge) {
      volumen[w] =
        bekannt[w] * faktor +
        (rest && restSumme > 0 ? (fehlt * rest[w]) / restSumme : 0);
    }
    return {
      datum,
      tokens,
      werkzeug:
        tokens > 0
          ? werkzeuge.reduce((a, b) => (volumen[b] > volumen[a] ? b : a))
          : null,
      hochgerechnet: Math.max(hochrechnung, fehlt) > tokens / 2,
    };
  });
}
