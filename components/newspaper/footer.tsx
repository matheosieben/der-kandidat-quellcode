import Link from "next/link";
import { ausgabe, kontaktLink, rubriken } from "@/content/ausgabe";
import { IconGithub } from "./icons";
import { Wortmarke } from "./wortmarke";

export function Footer() {
  return (
    <footer className="no-print mt-24 border-t border-rule-strong md:mt-32">
      <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Link href="/" className="wordmark text-[2rem]">
            <Wortmarke />
          </Link>
          <a href={kontaktLink} className="btn-cta">
            {ausgabe.mail}
          </a>
        </div>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-sans text-[0.85rem]">
          {rubriken.map((r) => (
            <li key={r.href}>
              <Link href={r.href} className="hover:underline">
                {r.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap justify-between gap-4 border-t border-rule pt-4 font-sans text-[0.75rem] text-meta">
          <p>
            © 2026 {ausgabe.autor} · {ausgabe.nummer}. Eine Bewerbung, kein
            Produkt der Axel Springer SE.
          </p>
          <ul className="flex gap-5">
            <li>
              <a
                href={ausgabe.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:underline"
              >
                <IconGithub width={14} height={14} /> Quellcode
              </a>
            </li>
            <li>
              <Link href="/impressum" className="hover:underline">
                Impressum und Datenschutz
              </Link>
            </li>
          </ul>
        </div>
        <p className="mt-3 font-sans text-[0.72rem] text-meta">
          Lesehilfe: Was ich geschrieben habe, steht in Schwarz.{" "}
          <span className="text-ai">
            Was eine Maschine erzeugt, steht in Blau.
          </span>
        </p>
      </div>
    </footer>
  );
}
