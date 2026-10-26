import { Randkasten } from "@/components/newspaper/seite";
import { ZitatKommentar } from "@/components/newspaper/zitat-kommentar";
import type { Zitat } from "@/content/ausgabe";

/** Ein Zitat als Kasten der Randspalte, gesetzt wie die Zitate der Titelseite. */
export function RandZitat({
  zitat,
  dachzeile = "Zitat",
}: {
  zitat: Zitat;
  dachzeile?: string;
}) {
  const mehrere = new Set(zitat.zeilen.map((z) => z.von)).size > 1;
  return (
    <Randkasten dachzeile={dachzeile}>
      <figure>
        <blockquote
          lang="en"
          cite={zitat.href}
          className="font-headline text-[1.15rem] leading-snug italic"
        >
          {zitat.zeilen.map((z) => (
            <p key={z.text} className="mt-2 first:mt-0">
              {mehrere && (
                <span className="mr-1 font-sans text-[0.72rem] font-bold tracking-wide not-italic uppercase">
                  {z.von}:
                </span>
              )}
              “{z.text}”
            </p>
          ))}
        </blockquote>
        <figcaption className="mt-3 border-l-2 border-opinion pl-3 font-sans text-[0.78rem] leading-snug">
          {!mehrere && <span className="font-bold">{zitat.zeilen[0].von}</span>}
          {!mehrere && <span className="text-meta"> · </span>}
          <a
            href={zitat.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-meta underline-offset-2 hover:underline"
          >
            {zitat.quelle}
          </a>
        </figcaption>
      </figure>
      <ZitatKommentar key={zitat.zeilen[0].text} text={zitat.kommentar} />
    </Randkasten>
  );
}
