"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useSyncExternalStore } from "react";
import { interviewUmschalten, istMac, useFenster } from "@/lib/ki/fenster";

const nichts = () => () => {};

/** Das Tastenkürzel, auf dem Mac ⌘K, sonst Strg K. */
export function Kuerzel({ className = "" }: { className?: string }) {
  const mac = useSyncExternalStore(nichts, istMac, () => true);
  return (
    <kbd
      className={`inline-flex items-center gap-0.5 rounded-[3px] border border-current/25 px-1 font-sans text-[0.72em] leading-[1.5] font-semibold tracking-normal ${className}`}
    >
      {mac ? "⌘" : "Strg"}
      <span className={mac ? "" : "ml-0.5"}>K</span>
    </kbd>
  );
}

/**
 * Öffnet das Interview als Fenster unten rechts. Nur mit Maus oder Trackpad
 * sichtbar: Wer tippt, hat kein ⌘K und kommt über das Interview-Ressort hin.
 */
export function InterviewTaste({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const pfad = usePathname();
  const fenster = useFenster();
  const istFenster = pfad !== "/interview";
  return (
    <button
      type="button"
      onClick={() => interviewUmschalten(pfad)}
      aria-haspopup={istFenster ? "dialog" : undefined}
      aria-expanded={istFenster ? fenster === "offen" : undefined}
      aria-controls={
        istFenster && fenster === "offen" ? "interview-fenster" : undefined
      }
      className={className}
    >
      {children}
    </button>
  );
}
