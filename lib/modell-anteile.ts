import type { Monat } from "@/lib/schaetzung";

export function modellAnteile(monate: readonly Monat[]) {
  const claude = monate.reduce((summe, m) => summe + m.claude, 0);
  const codex = monate.reduce((summe, m) => summe + m.codex, 0);
  const gesamt = claude + codex;
  const claudeProzent = gesamt ? Math.round((claude / gesamt) * 100) : 0;
  return {
    claude: claudeProzent,
    codex: gesamt ? 100 - claudeProzent : 0,
  };
}
