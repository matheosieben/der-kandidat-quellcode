import type { ReactNode } from "react";
import { type Teil, zerlege } from "@/lib/auszeichnung";

const verweis = "underline underline-offset-2 hover:text-ink";

function setze(teile: Teil[]): ReactNode[] {
  return teile.map((t, i) => {
    // Die Teile eines Absatzes ändern ihre Reihenfolge nie.
    const key = i;
    if (t.art === "text") return t.text;
    if (t.art === "verweis")
      return (
        <a key={key} href={t.ziel} className={verweis}>
          {t.text}
        </a>
      );
    return (
      <mark key={key} className="marker">
        {setze(t.teile)}
      </mark>
    );
  });
}

/** Ein Text aus den Inhaltsdateien mit Textmarkern und Verweisen. */
export function Ausgezeichnet({ text }: { text: string }) {
  return <>{setze(zerlege(text))}</>;
}

/** Mehrere Absätze, je als <p>. */
export function Absaetze({ absaetze }: { absaetze: string[] }) {
  return absaetze.map((a) => (
    <p key={a}>
      <Ausgezeichnet text={a} />
    </p>
  ));
}
