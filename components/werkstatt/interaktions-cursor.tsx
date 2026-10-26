"use client";

import { useEffect, useRef } from "react";
import "./interaktions-hinweis.css";

/*
 * Ein einziger Cursor für die ganze Seite. Er wandert zwischen allem, was
 * sich mit data-cursor-gruppe als bedienbar meldet, und tippt bei jeder
 * Ankunft einmal an. Wer eine Gruppe selbst bedient, nimmt sie bis zum
 * Neuladen aus der Runde.
 *
 * Arten einer Gruppe (data-cursor-art):
 * - „flaeche“: freie Punkte in der Gruppe oder in ihrem data-cursor-ziel
 * - „links“: zeigt von links auf jedes data-cursor-ziel, etwa auf Tabs
 * - „innen“: tippt in jedes data-cursor-ziel hinein; hat das Ziel
 *   data-cursor-pfeil, etwa eine Auswahlliste, fährt er von dort weiter nach
 *   rechts und klickt auf den Pfeil (Wert: Abstand der Pfeilmitte zum Rand)
 */

/** Lage der Pfeilspitze im Cursor, Bezugspunkt für Position, Neigung und Klick. */
const SPITZE = 2;
/** Abstand zum Rand einer Fläche, damit der Pfeil nie angeschnitten wird. */
const RAND = 18;

/** Gruppen, die schon jemand bedient hat; bis zum Neuladen bleibt der Cursor dort weg. */
const erledigt = new Set<string>();

const begrenzen = (wert: number, min: number, max: number) =>
  Math.max(min, Math.min(max, wert));

// Zieht schnell an und läuft lange aus, wie eine Hand an der Maus.
const gleiten = (t: number) => {
  const zeit = 1 - (1 - t) ** 1.35;
  return zeit < 0.5 ? 4 * zeit ** 3 : 1 - (-2 * zeit + 2) ** 3 / 2;
};

const mischen = <T,>(liste: T[]) => liste.sort(() => Math.random() - 0.5);

type Art = "flaeche" | "links" | "innen";

/** Ein Halt: Ziel samt Lage darin, damit der Cursor Scrollen und Umbrüchen folgt. */
type Halt = {
  gruppe: HTMLElement;
  element: HTMLElement;
  art: Art;
  /** Waagrecht: Anteil der Breite (flaeche) oder Abstand vom linken Rand, negativ vom rechten (innen) */
  x: number;
  /** Senkrecht: Anteil der Höhe */
  y: number;
};

type Punkt = { x: number; y: number };

function punkt(h: Halt): Punkt {
  const r = h.element.getBoundingClientRect();
  if (h.art === "links") return { x: r.left + 1, y: r.top + r.height / 2 };
  if (h.art === "innen")
    return {
      x: h.x < 0 ? r.right + h.x : r.left + Math.min(h.x, r.width - 8),
      y: r.top + r.height * h.y,
    };
  return { x: r.left + r.width * h.x, y: r.top + r.height * h.y };
}

export function InteraktionsCursor() {
  const cursor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const knoten = cursor.current;
    if (!knoten) return;
    const element = knoten;
    const zeichen = element.querySelector(".interaktions-zeichen");
    const welle = element.querySelector(".interaktions-klick");
    const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)");
    const maus = window.matchMedia("(hover: hover) and (pointer: fine)");

    let halt: Halt | null = null;
    let fahrt: {
      von: Halt;
      nach: Halt;
      start: number;
      dauer: number;
      bogen: number;
    } | null = null;
    let ort: Punkt | null = null;
    let neigung = 0;
    let naechster = performance.now() + 1500;
    let takt = 0;
    let lauf = 0;

    function kennung(gruppe: HTMLElement) {
      return gruppe.dataset.cursorGruppe ?? "";
    }

    /** Gerade in Benutzung: überfahren oder mit Fokus darin. */
    function bedient(gruppe: HTMLElement) {
      return (
        (maus.matches && gruppe.matches(":hover")) ||
        (gruppe.dataset.cursorFokus !== "frei" &&
          gruppe.matches(":focus-within"))
      );
    }

    /** Ob der Halt noch angefahren werden kann: da, frei und nicht verdeckt. */
    function gueltig(h: Halt) {
      if (!h.element.isConnected || !h.gruppe.dataset.cursorGruppe)
        return false;
      if (erledigt.has(kennung(h.gruppe)) || bedient(h.gruppe)) return false;
      const r = h.element.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      const p = punkt(h);
      // Geprüft wird ein Punkt im Ziel; von links liegt die Spitze am Rand
      const probe = document.elementFromPoint(
        h.art === "links" ? r.left + 6 : p.x,
        p.y,
      );
      return !!probe && h.element.contains(probe);
    }

    /** Ein Halt in einer Gruppe, der nicht der jetzige ist. */
    function haltIn(gruppe: HTMLElement): Halt | null {
      const art = (gruppe.dataset.cursorArt ?? "flaeche") as Art;
      if (art === "flaeche") {
        const ziel =
          gruppe.querySelector<HTMLElement>("[data-cursor-ziel]") ?? gruppe;
        const r = ziel.getBoundingClientRect();
        // Nur im sichtbaren Teil, mit Abstand zum Rand
        const randX = Math.min(RAND, r.width / 4);
        const randY = Math.min(RAND, r.height / 4);
        const links = Math.max(r.left, 0) + randX;
        const rechts = Math.min(r.right, window.innerWidth) - randX;
        const oben = Math.max(r.top, 0) + randY;
        const unten = Math.min(r.bottom, window.innerHeight) - randY;
        if (rechts <= links || unten <= oben) return null;
        const mindest = Math.min(Math.hypot(r.width, r.height) * 0.3, 160);
        for (let versuch = 0; versuch < 10; versuch++) {
          const x = links + Math.random() * (rechts - links);
          const y = oben + Math.random() * (unten - oben);
          if (ort && Math.hypot(x - ort.x, y - ort.y) < mindest) continue;
          const h: Halt = {
            gruppe,
            element: ziel,
            art,
            x: (x - r.left) / r.width,
            y: (y - r.top) / r.height,
          };
          if (gueltig(h)) return h;
        }
        return null;
      }
      // Ein Ziel mit Pfeil hat zwei Stellen, Text und Pfeil, und bleibt darum
      // auch dann in der Wahl, wenn der Cursor schon darauf steht
      const alle = [
        ...gruppe.querySelectorAll<HTMLElement>("[data-cursor-ziel]"),
      ].filter((el) => el !== halt?.element || "cursorPfeil" in el.dataset);
      // Lieber auf das, was noch nicht gewählt ist
      const frei = alle.filter((el) => !el.hasAttribute("aria-current"));
      for (const el of mischen(frei.length > 0 ? frei : alle)) {
        const pfeil = Number(el.dataset.cursorPfeil);
        // Vom Text fährt er auf den Pfeil, vom Pfeil zurück in den Text
        const zumPfeil =
          art === "innen" && pfeil > 0 && halt?.element === el && halt.x >= 0;
        const h: Halt = {
          gruppe,
          element: el,
          art,
          x: zumPfeil
            ? -pfeil
            : art === "innen"
              ? 14 + Math.random() * Math.min(el.offsetWidth * 0.5, 200)
              : 0,
          y: zumPfeil ? 0.5 : art === "innen" ? 0.6 : 0.5,
        };
        if (gueltig(h)) return h;
      }
      return null;
    }

    /** Das nächste Ziel, lieber in einer anderen Gruppe als der jetzigen. */
    function naechstesZiel() {
      const gruppen = [
        ...document.querySelectorAll<HTMLElement>("[data-cursor-gruppe]"),
      ].filter((g) => !erledigt.has(kennung(g)));
      const andere = gruppen.filter((g) => g !== halt?.gruppe);
      const reihe = [...mischen(andere)];
      // Mal bleibt er in seiner Gruppe, mal wechselt er
      if (halt && gruppen.includes(halt.gruppe)) {
        if (Math.random() < 0.4 || reihe.length === 0)
          reihe.unshift(halt.gruppe);
        else reihe.push(halt.gruppe);
      }
      for (const g of reihe) {
        const h = haltIn(g);
        if (h) return h;
      }
      return null;
    }

    function zeigen(h: Halt | null) {
      if (h) {
        element.dataset.bereit = "true";
        if (h.art === "links") element.dataset.zeigen = "links";
        else delete element.dataset.zeigen;
      } else {
        delete element.dataset.bereit;
      }
    }

    function setzen(p: Punkt) {
      ort = p;
      element.style.transform = `translate3d(${p.x - SPITZE}px, ${p.y - SPITZE}px, 0) rotate(${neigung}deg)`;
    }

    function klicken() {
      zeichen?.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(0.8)", offset: 0.35 },
          { transform: "scale(1)" },
        ],
        { duration: 300, easing: "ease-out" },
      );
      welle?.animate(
        [
          { transform: "scale(0.2)", opacity: 0.85 },
          { transform: "scale(1)", opacity: 0 },
        ],
        { duration: 550, easing: "cubic-bezier(0.2, 0.6, 0.3, 1)" },
      );
    }

    function verschwinden(pause: number) {
      halt = null;
      fahrt = null;
      delete element.dataset.faehrt;
      zeigen(null);
      naechster = performance.now() + pause;
    }

    function planen(jetzt: number) {
      const nach = naechstesZiel();
      if (!nach) {
        if (halt) naechster = jetzt + 1500;
        else verschwinden(1500);
        return;
      }
      // Ist er gerade weg, taucht er gleich am Ziel auf, statt quer zu fliegen
      if (!halt || !ort || ruhig.matches) {
        if (halt && ruhig.matches) {
          naechster = Number.POSITIVE_INFINITY;
          return;
        }
        halt = nach;
        neigung = 0;
        setzen(punkt(nach));
        zeigen(nach);
        naechster = jetzt + 2500;
        return;
      }
      const von = punkt(halt);
      const ziel = punkt(nach);
      const strecke = Math.hypot(ziel.x - von.x, ziel.y - von.y);
      // Vor Tabs holt er immer nach außen aus, nie über den Text
      const richtung =
        nach.art === "links" && halt.art === "links"
          ? Math.sign(ziel.y - von.y) || 1
          : Math.random() < 0.5
            ? -1
            : 1;
      fahrt = {
        von: halt,
        nach,
        start: jetzt,
        dauer: begrenzen(520 + strecke * 1.6, 700, 1500),
        // Innerhalb eines Felds gleitet er fast gerade hinüber
        bogen:
          richtung *
          (nach.element === halt.element ? 0.04 : 0.1 + Math.random() * 0.15),
      };
      element.dataset.faehrt = "true";
      // Die Spiegelung wechselt schon beim Losfahren
      zeigen(nach);
    }

    function schritt(jetzt: number) {
      lauf = requestAnimationFrame(schritt);
      takt++;

      if (fahrt) {
        const { von, nach, start, dauer, bogen } = fahrt;
        const t = Math.min((jetzt - start) / dauer, 1);
        const e = gleiten(t);
        const u = 1 - e;
        // Beide Enden frisch gemessen, falls währenddessen gescrollt wird
        const a = von.element.isConnected ? punkt(von) : (ort ?? punkt(nach));
        const b = punkt(nach);
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const kurveX = (a.x + b.x) / 2 - dy * bogen;
        const kurveY = (a.y + b.y) / 2 + dx * bogen;
        const x = u * u * a.x + 2 * u * e * kurveX + e * e * b.x;
        const y = u * u * a.y + 2 * u * e * kurveY + e * e * b.y;
        const tempo = ort ? (x - ort.x) / 16 : 0;
        // Neigt sich in Fahrtrichtung und richtet sich danach wieder auf
        neigung += (begrenzen(tempo * 12, -10, 10) - neigung) * 0.2;
        setzen({ x, y });
        if (t === 1) {
          fahrt = null;
          halt = nach;
          delete element.dataset.faehrt;
          // Angekommen tippt er einmal an
          klicken();
          // Er verweilt eine Weile, bevor er weiterzieht
          naechster = jetzt + 3500 + Math.random() * 2500;
        }
        return;
      }

      if (halt) {
        // Hin und wieder prüfen, ob das Ziel noch frei und zu sehen ist
        if (takt % 6 === 0 && !gueltig(halt)) {
          verschwinden(500);
          return;
        }
        neigung *= 0.8;
        setzen(punkt(halt));
      }

      if (jetzt >= naechster) planen(jetzt);
    }

    /** Wer eine Gruppe selbst klickt oder bedient, braucht dort keinen Hinweis mehr. */
    function eingreifen(event: Event) {
      if (!(event.target instanceof Element)) return;
      const gruppe = event.target.closest<HTMLElement>("[data-cursor-gruppe]");
      if (!gruppe) return;
      erledigt.add(kennung(gruppe));
      if (halt && kennung(halt.gruppe) === kennung(gruppe)) verschwinden(800);
    }

    function sichtbarkeit() {
      cancelAnimationFrame(lauf);
      if (!document.hidden) lauf = requestAnimationFrame(schritt);
    }

    lauf = requestAnimationFrame(schritt);
    document.addEventListener("pointerdown", eingreifen, true);
    document.addEventListener("keydown", eingreifen, true);
    document.addEventListener("visibilitychange", sichtbarkeit);

    return () => {
      cancelAnimationFrame(lauf);
      document.removeEventListener("pointerdown", eingreifen, true);
      document.removeEventListener("keydown", eingreifen, true);
      document.removeEventListener("visibilitychange", sichtbarkeit);
    };
  }, []);

  return (
    <div ref={cursor} aria-hidden="true" className="interaktions-cursor">
      <span className="interaktions-koerper">
        <span className="interaktions-klick" />
        <svg
          aria-hidden="true"
          viewBox="0 0 50 54"
          className="interaktions-zeichen"
        >
          <path
            d="M11 7C7 5.5 5 8 6.5 12L17.5 45C19 49 24 49 26 45L32 31L45 25C49 23 49 18 45 16.5Z"
            fill="var(--ink)"
            stroke="var(--paper)"
            strokeWidth="8"
            strokeLinejoin="round"
          />
          <path
            d="M11 7C7 5.5 5 8 6.5 12L17.5 45C19 49 24 49 26 45L32 31L45 25C49 23 49 18 45 16.5Z"
            fill="var(--ink)"
            stroke="#d4d4d4"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}
