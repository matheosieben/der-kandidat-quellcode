import Image from "next/image";
import Link from "next/link";
import { Entstehung } from "@/components/newspaper/entstehung";
import { Masthead } from "@/components/newspaper/masthead";
import { RessortUebersicht } from "@/components/newspaper/ressort-uebersicht";
import {
  ausgabe,
  bewerbungTitel,
  bilder,
  dasWichtigste,
  kontaktLink,
} from "@/content/ausgabe";
import { programm } from "@/content/programm";

export default function Titelseite() {
  return (
    <>
      <Masthead />
      <main id="inhalt" className="mx-auto max-w-[1280px] px-4 pt-6 md:px-6">
        <section
          aria-label="Aufmacher"
          className="min-w-0 border border-rule-strong p-4 md:p-6"
        >
          {/*
           * Breit: Leitartikel links über beide Zeilen, rechts „Das Wichtigste“
           * und darunter die Entstehung. Mittel, etwa auf dem Tablet: Leitartikel
           * und „Das Wichtigste“ nebeneinander, die Entstehung quer darunter, sonst
           * bliebe unter dem kürzeren Leitartikel viel Platz frei. Schmal:
           * Leitartikel zuerst, danach „Das Wichtigste“ und die Entstehung.
           */}
          <div className="grid min-w-0 gap-8 md:grid-cols-[minmax(0,7.4fr)_minmax(0,4.6fr)] md:gap-0 xl:grid-rows-[auto_1fr]">
            <article className="min-w-0 md:col-start-1 md:row-start-1 md:border-r md:border-rule md:pr-6 xl:row-span-2">
              <figure>
                <Link
                  href="/leitartikel"
                  aria-label={`Leitartikel lesen: ${programm.titel}`}
                >
                  <Image
                    src={bilder.leitartikel.src}
                    alt={bilder.leitartikel.alt}
                    sizes="(min-width: 1280px) 720px, (min-width: 768px) 60vw, 100vw"
                    preload
                    placeholder="blur"
                    className="aspect-[16/10] w-full object-cover"
                  />
                </Link>
                <figcaption className="credit mt-1.5 text-right">
                  {bilder.leitartikel.credit}
                </figcaption>
              </figure>
              <Link href="/leitartikel" className="story-link mt-3 block">
                <p className="kicker">{programm.dachzeile}</p>
                <h2 className="hl-feature mt-1 text-[2.1rem] md:text-[2.5rem]">
                  {programm.titel}
                </h2>
              </Link>
              <p className="summary mt-2 text-[1.08rem]">{programm.vorspann}</p>
              <p className="mt-3 font-body text-[1.02rem] leading-relaxed text-ink-2">
                {programm.absaetze[0]}{" "}
                <Link
                  href="/leitartikel"
                  className="font-sans text-[0.82rem] font-semibold whitespace-nowrap text-ink underline underline-offset-4"
                >
                  Weiterlesen
                </Link>
              </p>
            </article>

            <div className="min-w-0 md:col-start-2 md:row-start-1 md:pl-6">
              <p className="kicker">Das Wichtigste in Kürze</p>
              <h1 className="hl-feature mt-2 text-[1.9rem]">
                {bewerbungTitel}
              </h1>
              <ul className="mt-4">
                {dasWichtigste.map((p) => (
                  <li
                    key={p.marke}
                    className="border-t border-rule py-2.5 font-sans text-[0.88rem] leading-snug"
                  >
                    <strong>{p.marke}</strong> {p.text}
                  </li>
                ))}
                <li className="border-t border-rule py-2.5 font-sans text-[0.88rem] break-words">
                  <strong>Schreiben Sie mir:</strong>{" "}
                  <a
                    href={kontaktLink}
                    className="underline underline-offset-2"
                  >
                    {ausgabe.mail}
                  </a>
                </li>
              </ul>
              <p className="mt-3 border-t border-rule pt-3 font-sans text-[0.75rem] leading-snug text-ink-2">
                <strong className="text-ink">Lesehilfe.</strong> Was ich
                geschrieben habe, steht in Schwarz.{" "}
                <span className="text-ai">
                  Was eine Maschine erzeugt, steht in Blau.
                </span>
              </p>
            </div>
            <Entstehung className="md:col-span-2 md:row-start-2 md:mt-6 xl:col-span-1 xl:col-start-2 xl:self-end xl:pl-6" />
          </div>
        </section>
        <RessortUebersicht />
      </main>
    </>
  );
}
