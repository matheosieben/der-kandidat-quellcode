import { ausgabe } from "@/content/ausgabe";
import { entstehung } from "@/content/entstehung";
import { datumKurz, zahl } from "@/lib/daten";
import { IconGithub } from "./icons";

/**
 * Im Aufmacher rechts unter „Das Wichtigste“: Satz, Zähler und Quellcode.
 * Auf mittleren Breiten steht der Kasten quer unter Leitartikel und „Das
 * Wichtigste“, dann links der Satz und rechts die Zähler.
 */
export function Entstehung({ className = "" }: { className?: string }) {
  return (
    <section
      id="entstehung"
      aria-labelledby="entstehung-titel"
      className={`min-w-0 scroll-mt-24 border-t-2 border-ink pt-4 md:grid md:grid-cols-2 md:gap-x-8 xl:block ${className}`}
    >
      <div className="min-w-0">
        <h2 id="entstehung-titel" className="kicker">
          {entstehung.titel}
        </h2>
        <p className="summary mt-2 text-[1rem]">{entstehung.text}</p>
      </div>
      <div className="mt-4 min-w-0 md:mt-0 xl:mt-4">
        <dl className="grid grid-cols-3 gap-x-4 border-y border-rule py-3 font-sans">
          {[
            {
              name: "Arbeitszeit",
              wert: `${entstehung.arbeitsstunden} Std.`,
            },
            {
              name: "Input-Tokens",
              wert: `${zahl(entstehung.eingabeTokens / 1_000_000)} Mio.`,
            },
            {
              name: "Output-Tokens",
              wert: `${zahl(entstehung.ausgabeTokens / 1_000_000, 1)} Mio.`,
            },
          ].map(({ name, wert }) => (
            <div key={name} className="min-w-0">
              <dt className="text-[0.7rem] text-ink-2">{name}</dt>
              <dd className="hl-feature mt-1 text-[1.3rem] whitespace-nowrap tabular-nums sm:text-[1.45rem]">
                {wert}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 font-sans text-[0.68rem] leading-snug text-meta">
          {datumKurz(entstehung.von, false)} bis {datumKurz(entstehung.bis)},
          gemessen aus den Projektprotokollen. Arbeitszeit zählt Abschnitte mit
          höchstens 15 Minuten Pause. Der Input enthält den Verlauf, den jede
          Anfrage erneut mitschickt.
        </p>
        <a
          href={ausgabe.repository}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 font-sans text-[0.8rem] font-semibold underline-offset-4 hover:underline"
        >
          <IconGithub width={18} height={18} />
          Quellcode auf GitHub
        </a>
      </div>
    </section>
  );
}
