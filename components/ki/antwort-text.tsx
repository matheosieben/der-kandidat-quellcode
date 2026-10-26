import Link from "next/link";
import { Fragment } from "react";
import { fundstellen } from "@/lib/ki/fundstellen";

const muster = new RegExp(`\\[(${Object.keys(fundstellen).join("|")})\\]`, "g");

const FORM = {
  hell: "mx-0.5 inline-block border border-ai/40 px-1.5 text-[0.82em] whitespace-nowrap no-underline hover:bg-ai-tint",
  dunkel:
    "mx-0.5 inline-block rounded-[4px] border border-current/40 px-1.5 text-[0.82em] whitespace-nowrap no-underline hover:bg-white/10",
  terminal:
    "whitespace-nowrap underline decoration-current/40 underline-offset-[3px] hover:decoration-current",
};

/** Maschinentext mit klickbaren Fundstellen wie [Bilanz], je nach Umgebung gesetzt. */
export function AntwortText({
  text,
  form = "hell",
}: {
  text: string;
  form?: keyof typeof FORM;
}) {
  const teile = text.split(muster);
  return (
    <>
      {teile.map((teil, i) => {
        const ziel = fundstellen[teil as keyof typeof fundstellen];
        if (i % 2 === 1 && ziel) {
          return (
            <Link
              // biome-ignore lint/suspicious/noArrayIndexKey: Reihenfolge ist stabil
              key={i}
              href={ziel}
              className={FORM[form]}
            >
              {form === "terminal" ? `[${teil} ↗]` : `↗ ${teil}`}
            </Link>
          );
        }
        // biome-ignore lint/suspicious/noArrayIndexKey: Reihenfolge ist stabil
        return <Fragment key={i}>{teil}</Fragment>;
      })}
    </>
  );
}
