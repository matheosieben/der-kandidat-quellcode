import Image from "next/image";
import Link from "next/link";
import { TokenKalender } from "@/components/grafik/token-kalender";
import { InterviewTaste, Kuerzel } from "@/components/ki/interview-taste";
import { IconGames } from "@/components/newspaper/icons";
import { ZitatKommentar } from "@/components/newspaper/zitat-kommentar";
import { stationsgruppen } from "@/content/lebenslauf";
import {
  type Anriss,
  arbeitsweise,
  fitCheck,
  fokus,
  gebaut,
  gespraech,
  lebenslauf,
  modelle,
  spiele,
} from "@/content/titelseite";
import { daten } from "@/lib/daten";
import { textstellenLink } from "@/lib/quellen";
import { kalenderMitHochrechnung, monateMitSchaetzung } from "@/lib/schaetzung";
import { tokenKalender } from "@/lib/token-kalender";

function RessortKopf({
  id,
  titel,
  href,
  link,
}: {
  id: string;
  titel: string;
  href: string;
  link: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t-2 border-rule-strong pt-3">
      <h2 id={id} className="font-sans text-[1.4rem] font-semibold">
        {titel}
      </h2>
      <Link
        href={href}
        className="font-sans text-[0.82rem] underline-offset-4 hover:underline"
      >
        {link} ›
      </Link>
    </div>
  );
}

/** Eine Größe für alle Überschriften der Titelseite, fett kursiv wie in den Ressorts. */
const TITEL = "hl-feature text-[1.9rem]";

/** Ab dieser Breite füllt das Bild die freie Höhe, damit die Spalte mit der Nachbarspalte endet. */
const FUELLEN = {
  lg: "lg:aspect-auto lg:min-h-40 lg:flex-1",
};

function AnrissArtikel({
  anriss,
  fuellen,
  quer = false,
  className = "",
}: {
  anriss: Anriss;
  fuellen?: keyof typeof FUELLEN;
  /** Auf dem Tablet Bild links und Text rechts, ab lg wieder untereinander. */
  quer?: boolean;
  className?: string;
}) {
  return (
    <article className={`flex min-w-0 flex-col ${className}`}>
      <Link
        href={anriss.href}
        className={`story-link flex flex-1 flex-col ${quer ? "md:flex-row md:gap-6 lg:flex-col lg:gap-0" : ""}`}
      >
        {anriss.bild && (
          <div
            className={`relative mb-4 aspect-[16/9] w-full ${quer ? "md:mb-0 md:w-7/12 md:shrink-0 lg:mb-4 lg:w-full" : ""} ${fuellen ? FUELLEN[fuellen] : ""}`}
          >
            <Image
              src={anriss.bild.src}
              alt={anriss.bild.alt}
              fill
              sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw"
              placeholder="blur"
              className="object-cover"
            />
          </div>
        )}
        <div className="min-w-0">
          <p className="kicker">{anriss.dachzeile}</p>
          <h3 className={`mt-1 ${TITEL}`}>{anriss.titel}</h3>
          <p className="summary mt-2 text-[1rem]">{anriss.text}</p>
        </div>
      </Link>
    </article>
  );
}

function WerkstattUebersicht() {
  const tokenTage = tokenKalender(
    kalenderMitHochrechnung(),
    monateMitSchaetzung(),
    daten.anbieterTag,
  );

  return (
    <section aria-labelledby="werkstatt" className="mt-12">
      <RessortKopf
        id="werkstatt"
        titel="Werkstatt"
        href="/werkstatt"
        link="Alle Kapitel"
      />
      <div className="mt-5 grid min-w-0 gap-7 lg:grid-cols-12 lg:gap-0">
        <div className="min-w-0 lg:col-span-8 lg:pr-6">
          <AnrissArtikel anriss={modelle} />
          {/* Nur das Mosaik: Farben und Details zeigt der Tooltip und das Kapitel */}
          <div className="mt-5">
            <TokenKalender
              tage={tokenTage}
              spalten={48}
              kennzahlen={false}
              schlicht
            />
          </div>
          <Link
            href={modelle.href}
            className="mt-3 inline-block font-sans text-[0.82rem] font-semibold underline underline-offset-4"
          >
            Zum Verlauf und Arbeitskalender
          </Link>
        </div>
        <div className="flex min-w-0 flex-col lg:col-span-4 lg:border-l lg:border-rule lg:pl-6">
          <AnrissArtikel anriss={fokus} />
          {/* Statt eines Bildes ein Satz aus dem Kapitel, wörtlich */}
          <div className="mt-6 border-t-2 border-ink pt-4 lg:mt-auto">
            <Link href={fokus.href} className="story-link block">
              <blockquote className="hl-feature text-[1.3rem] leading-snug">
                „Ich will besser einschätzen können, wo sich weitere Arbeit
                lohnt und wann ein Ergebnis gut genug ist.“
              </blockquote>
            </Link>
            <a
              href={textstellenLink(
                fokus.href,
                "Ich will besser einschätzen können, wo sich weitere Arbeit lohnt und wann ein Ergebnis gut genug ist.",
              )}
              className="mt-3 block border-l-2 border-opinion pl-3 font-sans text-[0.72rem] text-meta underline-offset-2 hover:underline"
            >
              Aus dem Kapitel Fokus
            </a>
            <ZitatKommentar text="Je mehr ich ausprobieren kann, desto bewusster muss ich auswählen, woran ich weiterarbeite." />
          </div>
        </div>
      </div>

      <div className="mt-7 grid gap-5 border-t border-rule pt-5 md:grid-cols-3 md:gap-0">
        {arbeitsweise.map((anriss) => (
          <AnrissArtikel
            key={anriss.href}
            anriss={anriss}
            className="border-b border-rule pb-5 last:border-b-0 last:pb-0 md:border-b-0 md:border-l md:pb-0 md:px-6 md:first:border-l-0 md:first:pl-0 md:last:pr-0"
          />
        ))}
      </div>

      <div className="mt-8 border-t border-rule pt-4">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="font-sans text-[1rem] font-semibold">
            Was ich gebaut habe
          </h3>
          <Link
            href="/werkstatt#bilanz"
            className="font-sans text-[0.82rem] underline-offset-4 hover:underline"
          >
            Alle Projekte ›
          </Link>
        </div>
        {/*
         * Breit: Ciprè links, rechts zwei schmale Spalten mit Bild und darunter
         * eine Zeile für das, was noch entsteht. Auf dem Tablet ist dafür zu
         * wenig Platz: Ciprè steht quer über die ganze Breite, darunter die
         * beiden anderen Projekte nebeneinander und dann die Zeile.
         */}
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-0">
          <AnrissArtikel
            anriss={gebaut[0]}
            fuellen="lg"
            quer
            className="lg:col-span-6 lg:pr-6"
          />
          <div className="md:border-t md:border-rule md:pt-6 lg:col-span-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
            <div className="grid gap-6 sm:grid-cols-2 sm:gap-0">
              {gebaut.slice(1).map((anriss) => (
                <AnrissArtikel
                  key={anriss.href}
                  anriss={anriss}
                  className="sm:odd:pr-5 sm:even:border-l sm:even:border-rule sm:even:pl-5"
                />
              ))}
            </div>
            <Link
              href="/werkstatt#bilanz"
              className="story-link mt-5 block border-t border-rule pt-4"
            >
              <p className="kicker">Außerdem in Arbeit</p>
              <h3 className={`mt-1 ${TITEL}`}>
                Praxis Dashboard und Praxis TV
              </h3>
              <p className="summary mt-2 text-[1rem]">
                Statistiken einer Radiologie mit KI auswerten und Bildschirme im
                Wartebereich automatisch bespielen. Zwei weitere Projekte aus
                meinem Arbeitsalltag.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Links das Interview, rechts Lebenslauf und Games, zusammen gleich hoch. */
function InterviewLebenslaufGames() {
  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-0">
      <section
        aria-labelledby="interview"
        className="min-w-0 lg:col-span-8 lg:pr-6"
      >
        <RessortKopf
          id="interview"
          titel="Interview"
          href="/interview"
          link="Zur Redaktion"
        />
        <Link href={gespraech.href} className="story-link mt-5 block">
          {gespraech.bild && (
            <Image
              src={gespraech.bild.src}
              alt={gespraech.bild.alt}
              sizes="(min-width: 1280px) 800px, (min-width: 1024px) 64vw, 100vw"
              placeholder="blur"
              className="aspect-[16/9] w-full object-cover"
            />
          )}
        </Link>
        <div className="mt-5 grid gap-6 md:grid-cols-2 md:gap-0">
          <div className="min-w-0 md:pr-6">
            <Link href={gespraech.href} className="story-link block">
              <p className="kicker">{gespraech.dachzeile}</p>
              <h3 className={`mt-1 ${TITEL}`}>{gespraech.titel}</h3>
              <p className="summary mt-2 text-[1rem]">{gespraech.text}</p>
            </Link>
            <InterviewTaste className="mt-4 hidden items-center gap-2 font-sans text-[0.82rem] font-semibold underline-offset-4 hover:underline pointer-fine:inline-flex">
              <Kuerzel /> öffnet das Interview als Fenster
            </InterviewTaste>
          </div>
          <Link
            href={fitCheck.href}
            className="story-link block min-w-0 border-t border-rule pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-6"
          >
            <p className="kicker">{fitCheck.dachzeile}</p>
            <h3 className={`mt-1 ${TITEL}`}>{fitCheck.titel}</h3>
            <p className="summary mt-2 text-[1rem]">{fitCheck.text}</p>
          </Link>
        </div>
      </section>
      <div className="flex min-w-0 flex-col gap-10 lg:col-span-4 lg:justify-between lg:border-l lg:border-rule lg:pl-6">
        <LebenslaufVorschau />
        <Games />
      </div>
    </div>
  );
}

/** Nur ein Anriss: wer ich bin und die zwei Stationen von heute. */
function LebenslaufVorschau() {
  const stationen = stationsgruppen[0].stationen.slice(0, 2);
  return (
    <section aria-labelledby="lebenslauf" className="min-w-0">
      <RessortKopf
        id="lebenslauf"
        titel="Lebenslauf"
        href="/lebenslauf"
        link="Ganzer Lebenslauf"
      />
      <Link href={lebenslauf.href} className="story-link mt-5 block">
        <h3 className={TITEL}>{lebenslauf.titel}</h3>
        <p className="summary mt-2 text-[1rem]">{lebenslauf.text}</p>
      </Link>
      <ul className="mt-4 font-sans text-[0.82rem] leading-snug">
        {stationen.map((st) => (
          <li
            key={`${st.zeitraum}${st.titel}`}
            className="flex gap-3 border-t border-rule py-2"
          >
            <span className="w-[4.5rem] shrink-0 text-meta tabular-nums">
              {st.zeitraum}
            </span>
            <span className="min-w-0 font-semibold">{st.titel}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Die beiden Spiele, untereinander in der rechten Spalte. */
function Games() {
  return (
    <section aria-labelledby="spiele" className="min-w-0">
      <RessortKopf id="spiele" titel="Games" href="/games" link="Alle Spiele" />
      <ul className="mt-5 divide-y divide-rule">
        {spiele.map((spiel) => (
          <li key={spiel.art} className="py-5 first:pt-0 last:pb-0">
            <Link href={spiel.href} className="story-link group block">
              <div className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="grid size-14 shrink-0 place-items-center rounded-[13px]"
                  style={{
                    background:
                      spiel.art === "springer" ? "#f7da21" : "#b4a7f5",
                  }}
                >
                  {spiel.art === "springer" ? (
                    <span className="wordmark-springer -scale-x-100 text-[2.4rem] text-ink" />
                  ) : (
                    <IconGames width={38} height={38} />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="kicker">{spiel.dachzeile}</p>
                  <h3 className={`mt-0.5 ${TITEL}`}>{spiel.titel}</h3>
                </div>
                <span
                  aria-hidden="true"
                  className="ml-auto font-sans text-lg text-meta group-hover:text-ink"
                >
                  ↗
                </span>
              </div>
              <p className="summary mt-3 text-[1rem]">{spiel.text}</p>
              <p className="mt-2.5 font-sans text-[0.82rem] font-semibold underline underline-offset-4">
                Jetzt spielen
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Unter dem Aufmacher: Interview neben Lebenslauf und Games, dann die Werkstatt. */
export function RessortUebersicht() {
  return (
    <>
      <InterviewLebenslaufGames />
      <WerkstattUebersicht />
    </>
  );
}
