import type { ReactNode } from "react";
import { ausgabe } from "@/content/ausgabe";

export function Seite({
  rand,
  breit = false,
  fuss,
  navigation,
  children,
}: {
  /** Inhalt der Randspalte; ohne sie läuft die Seite einspaltig. */
  rand?: ReactNode;
  /** Für Grafiken und Bildstrecken: Textspalte ohne Lesebreite. */
  breit?: boolean;
  /** Volle Breite unter Text und Randspalte, etwa zum Weiterlesen. */
  fuss?: ReactNode;
  navigation?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main id="inhalt" className="mx-auto max-w-[1280px] px-4 md:px-6">
      {navigation && (
        <div className="sticky top-[var(--kopfhoehe,3.3125rem)] z-20 mx-auto max-w-[768px] bg-paper pt-4 pb-3 lg:hidden">
          {navigation}
        </div>
      )}
      <div
        className={`grid grid-cols-1 gap-x-6 gap-y-12 pt-8 xl:gap-x-12 ${rand ? "lg:grid-cols-[minmax(0,1fr)_256px] xl:grid-cols-[minmax(0,1fr)_320px]" : ""}`}
      >
        <div
          className={`min-w-0 ${breit ? "" : "mx-auto w-full max-w-[768px] xl:mx-0 xl:ml-[72px]"}`}
        >
          {children}
        </div>
        {rand && (
          <aside className="min-w-0 space-y-8 lg:sticky lg:top-28 lg:self-start lg:border-l lg:border-rule lg:pl-6 xl:top-24 xl:pl-8 [&>section:first-child]:border-t-4 [&>section:first-child]:border-opinion">
            {rand}
          </aside>
        )}
      </div>
      {fuss}
    </main>
  );
}

/** Kopf einer Innenseite: Dachzeile, kursive Schlagzeile, Vorspann, Zeile. */
export function Seitenkopf({
  dachzeile,
  titel,
  vorspann,
  zeile = true,
  vorspannWieText = true,
}: {
  dachzeile?: ReactNode;
  titel: ReactNode;
  vorspann?: ReactNode;
  /** Autorenzeile unter dem Vorspann. */
  zeile?: boolean;
  /** Vorspann in der Größe des Fließtexts statt größer. */
  vorspannWieText?: boolean;
}) {
  return (
    <header className="max-w-[46rem]">
      {dachzeile && <p className="kicker">{dachzeile}</p>}
      <h1 className="hl-feature mt-2 text-[2.5rem] md:text-[3.3rem]">
        {titel}
      </h1>
      {vorspann && (
        <p
          className={
            vorspannWieText
              ? "mt-4 fliesstext"
              : "mt-4 font-body text-[1.3rem] leading-snug text-ink-2 md:text-[1.5rem]"
          }
        >
          {vorspann}
        </p>
      )}
      {zeile && (
        <p className="mt-6 border-t border-rule pt-4 font-sans text-[0.9rem]">
          <span className="font-bold">Von {ausgabe.autor}</span>
          <span className="text-meta"> · {ausgabe.datumKurz}</span>
        </p>
      )}
    </header>
  );
}

/** Ein Kasten der Randspalte. „meinung“ setzt ihn braun wie die Gegenrede. */
export function Randkasten({
  dachzeile,
  titel,
  meinung = false,
  className = "",
  children,
}: {
  dachzeile: ReactNode;
  titel?: ReactNode;
  meinung?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`${
        meinung
          ? "border-t-4 border-opinion pt-3"
          : "border-t-2 border-ink pt-3"
      } ${className}`}
    >
      <p className="kicker">{dachzeile}</p>
      {titel && <h2 className="hl-feature mt-1 text-[1.5rem]">{titel}</h2>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** Fließtext der Randspalte. */
export function Randtext({ children }: { children: ReactNode }) {
  return (
    <p className="font-body text-[1.05rem] leading-relaxed text-ink-2">
      {children}
    </p>
  );
}
