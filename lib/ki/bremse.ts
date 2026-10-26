/*
 * Frequenzbremse je IP als Eimer mit Nachfüllung, im Speicher der Serverinstanz.
 * Für eine instanzübergreifende Grenze braucht es einen gemeinsamen Zähler
 * (z. B. Upstash Redis); bis dahin bremst zusätzlich das Ausgabenlimit des API-Kontos.
 */

const VORRAT = 8;
const NACHFUELLEN_MS = 20_000;
const MAX_EIMER = 5_000;

type Eimer = { stand: number; zeit: number };
const eimer = new Map<string, Eimer>();

/** Zieht `kosten` Einheiten ab. Gibt die Wartezeit in Sekunden zurück, 0 bei Erfolg. */
export function bremse(ip: string, kosten: number): number {
  const jetzt = Date.now();
  let e = eimer.get(ip);
  if (!e) {
    if (eimer.size >= MAX_EIMER) {
      for (const [schluessel, alt] of eimer) {
        if (jetzt - alt.zeit > VORRAT * NACHFUELLEN_MS)
          eimer.delete(schluessel);
      }
      if (eimer.size >= MAX_EIMER) return 60;
    }
    e = { stand: VORRAT, zeit: jetzt };
    eimer.set(ip, e);
  }
  const nachgefuellt = Math.floor((jetzt - e.zeit) / NACHFUELLEN_MS);
  if (nachgefuellt > 0) {
    e.stand = Math.min(VORRAT, e.stand + nachgefuellt);
    e.zeit += nachgefuellt * NACHFUELLEN_MS;
  }
  if (e.stand < kosten) {
    return Math.ceil(
      ((kosten - e.stand) * NACHFUELLEN_MS - (jetzt - e.zeit)) / 1000,
    );
  }
  e.stand -= kosten;
  return 0;
}
