import Image from "next/image";
import Link from "next/link";
import type { Bild } from "@/content/ausgabe";

type Verweis = {
  ressort: string;
  href: string;
  titel: string;
  text: string;
  bild?: Bild;
  maschine?: boolean;
};

export function Weiterlesen({ verweise }: { verweise: Verweis[] }) {
  if (verweise.length === 0) return null;

  return (
    <section
      id="weiterlesen"
      aria-labelledby="weiterlesen-titel"
      className="mt-20 scroll-mt-24 border-t-2 border-rule-strong pt-4 md:mt-24"
    >
      <h2 id="weiterlesen-titel" className="hl text-[1.6rem]">
        Weiterlesen
      </h2>
      <ul className="mt-5 grid grid-cols-1 lg:grid-cols-3">
        {verweise.map((verweis) => (
          <li
            key={verweis.href}
            className="border-t border-rule py-5 first:border-t-0 first:pt-0 last:pb-0 lg:border-t-0 lg:border-l lg:px-6 lg:py-0 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
          >
            <Link href={verweis.href} className="nav-link flex gap-4">
              {verweis.bild && (
                <div className="relative size-32 shrink-0">
                  <Image
                    src={verweis.bild.src}
                    alt={verweis.bild.alt}
                    fill
                    sizes="128px"
                    placeholder="blur"
                    className="object-cover"
                  />
                </div>
              )}
              {/* Genau so hoch wie das Bild: Ressort, eine Zeile Titel, zwei Zeilen Text, Link */}
              <div className="flex h-32 min-w-0 flex-1 flex-col gap-1.5">
                <div>
                  <p
                    className={`font-sans text-[0.78rem] font-semibold ${verweis.maschine ? "text-ai" : "text-opinion"}`}
                  >
                    {verweis.ressort}
                  </p>
                  <h3 className="hl mt-0.5 truncate text-[1.3rem] leading-tight">
                    {verweis.titel}
                  </h3>
                </div>
                <p className="summary line-clamp-2 text-[0.95rem] leading-snug">
                  {verweis.text}
                </p>
                <span className="mt-auto font-sans text-[0.8rem] font-semibold">
                  <span className="nav-link-label">
                    {verweis.ressort} lesen
                  </span>{" "}
                  <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
