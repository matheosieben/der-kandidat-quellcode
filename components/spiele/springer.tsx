"use client";

import { useEffect, useRef, useState } from "react";

/*
 * „Der Springer“: Die Schachfigur, die auf Deutsch heißt wie der Verlag,
 * springt durch den Alltag eines Agenten. Leertaste, Pfeil nach oben oder Tippen.
 *
 * Hindernisse: Mini-Rechenzentren, Merge-Konflikte, Rate-Limits und später
 * die Halluzination. Unterwegs liegen Tokens, Commits und zwei Werkzeuge:
 * Claude Code fängt im Review den nächsten Fehler ab, Codex startet einen
 * zweiten Agenten, der parallel mitläuft und die Tokens verdoppelt.
 */

const HOEHE = 240;
const BODEN = HOEHE - 42;
const SCHWERKRAFT = 2400;
const SPRUNG = -780;
const START_TEMPO = 330;
const MAX_TEMPO = 820;
const CODEX_DAUER = 6;
const STREIFEN = 20;

const CLAUDE = "#d97757";
const CODEX = "#4a5cf7";
const COMMIT = "#40c463";
const COMMIT_STUFEN = ["#9be9a8", "#40c463", "#30a14e", "#216e39"];

type Art = "rz" | "limit" | "konflikt" | "halluzination";
type Hindernis = {
  art: Art;
  x: number;
  y: number;
  b: number;
  h: number;
  racks: number;
};
type Gut = "token" | "commit" | "claude" | "codex";
type Fund = { art: Gut; x: number; y: number; weg: boolean };
type Zustand = "bereit" | "laeuft" | "aus";

const ENDE: Record<Art, string> = {
  rz: "Ins Rechenzentrum gelaufen. Die GPUs liefen heiß, der Springer nicht weiter.",
  limit: "429: Rate-Limit erreicht. Bitte später erneut versuchen.",
  konflikt: "Merge-Konflikt. Erst rebasen, dann springen.",
  halluzination: "Eine Halluzination. Klang überzeugend, war es nicht.",
};

function farben() {
  const s = getComputedStyle(document.documentElement);
  const v = (n: string) => s.getPropertyValue(n).trim();
  return {
    tinte: v("--ink"),
    tinte2: v("--ink-2"),
    papier: v("--paper"),
    linie: v("--rule"),
    ki: v("--ai"),
    rot: v("--live"),
    mono: `${v("--font-geist-mono") || "ui-monospace"}, ui-monospace, monospace`,
  };
}

/** Stufe eines Kästchens im Beitragsstreifen, wie im GitHub-Profil. */
function stufe(commits: number, i: number) {
  if (commits <= i) return -1;
  return Math.min(3, Math.floor((commits - 1 - i) / STREIFEN));
}

export function Springer() {
  const leinwand = useRef<HTMLCanvasElement>(null);
  const rahmen = useRef<HTMLDivElement>(null);
  const [anzeige, setAnzeige] = useState({
    punkte: 0,
    commits: 0,
    rekord: 0,
    zustand: "bereit" as Zustand,
    ende: "",
    review: false,
    codex: 0,
  });

  useEffect(() => {
    const canvas = leinwand.current;
    const box = rahmen.current;
    if (!canvas || !box) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let breite = 0;
    let f = farben();
    // Der Springer aus der Wortmarke, gespiegelt, damit er in Laufrichtung blickt
    const figur = new Image();
    figur.src = "/bilder/springer.png";
    const claudeIcon = new Image();
    claudeIcon.src = "/bilder/claude.svg";
    const codexIcon = new Image();
    codexIcon.src = "/bilder/codex.webp";
    const groesse = () => {
      const dpr = window.devicePixelRatio || 1;
      breite = box.clientWidth;
      canvas.width = breite * dpr;
      canvas.height = HOEHE * dpr;
      canvas.style.width = `${breite}px`;
      canvas.style.height = `${HOEHE}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      f = farben();
    };
    groesse();
    const ro = new ResizeObserver(groesse);
    ro.observe(box);

    let rekord = 0;
    try {
      rekord = Number(localStorage.getItem("springer-rekord")) || 0;
    } catch {}

    let zustand: Zustand = "bereit";
    let y = BODEN;
    let vy = 0;
    let tempo = START_TEMPO;
    let weg = 0;
    let punkte = 0;
    let commits = 0;
    let review = false;
    let codex = 0;
    let naechstes = 520;
    let hindernisse: Hindernis[] = [];
    let funde: Fund[] = [];
    let spalten = [0, 160, 320, 480, 640, 800, 960, 1120];
    let meldung = "";
    let meldungBis = 0;
    let uhr = 0;
    let letzte = 0;
    let anfrage = 0;
    let sichtbar = true;
    let gemeldet = 0;

    const melde = (ende = "") =>
      setAnzeige({
        punkte: Math.floor(punkte),
        commits,
        rekord,
        zustand,
        ende,
        review,
        codex: Math.ceil(codex),
      });

    const terminal = (text: string) => {
      meldung = text;
      meldungBis = uhr + 2.2;
    };

    const neu = () => {
      y = BODEN;
      vy = 0;
      tempo = START_TEMPO;
      weg = 0;
      punkte = 0;
      commits = 0;
      review = false;
      codex = 0;
      naechstes = 520;
      hindernisse = [];
      funde = [];
    };

    const springen = () => {
      if (zustand !== "laeuft") {
        neu();
        zustand = "laeuft";
        terminal("$ git switch -c springer-lauf");
        melde();
        return;
      }
      if (y >= BODEN - 0.5) vy = SPRUNG;
    };

    const erzeuge = () => {
      const x = breite + 30;
      const z = Math.random();
      if (weg > 2400 && z < 0.18) {
        hindernisse.push({
          art: "halluzination",
          x,
          y: BODEN - 78,
          b: 58,
          h: 26,
          racks: 0,
        });
      } else if (z < 0.6) {
        // Mini-Rechenzentrum: ein oder zwei Racks, 4 bis 8 Höheneinheiten
        const racks = weg > 1200 && Math.random() < 0.4 ? 2 : 1;
        const einheiten = 4 + Math.floor(Math.random() * (weg > 1800 ? 5 : 3));
        const h = einheiten * 7 + 4;
        hindernisse.push({
          art: "rz",
          x,
          y: BODEN - h,
          b: racks * 24 + (racks - 1) * 3,
          h,
          racks,
        });
      } else if (z < 0.8) {
        hindernisse.push({
          art: "konflikt",
          x,
          y: BODEN - 20,
          b: 44,
          h: 20,
          racks: 0,
        });
      } else {
        const hoch = Math.random() < 0.5 ? 34 : 48;
        hindernisse.push({
          art: "limit",
          x,
          y: BODEN - hoch,
          b: 30,
          h: hoch,
          racks: 0,
        });
      }

      const fx = x + 120 + Math.random() * 80;
      const fy = BODEN - 70 - Math.random() * 40;
      const g = Math.random();
      if (!review && weg > 600 && g < 0.08) {
        funde.push({ art: "claude", x: fx, y: fy, weg: false });
      } else if (codex <= 0 && weg > 900 && g < 0.16) {
        funde.push({ art: "codex", x: fx, y: fy, weg: false });
      } else if (g < 0.45) {
        funde.push({ art: "commit", x: fx, y: fy, weg: false });
      } else if (g < 0.8) {
        funde.push({ art: "token", x: fx, y: fy, weg: false });
      }
      naechstes = 260 + Math.random() * 300 + tempo * 0.45;
    };

    const einsammeln = (fund: Fund) => {
      fund.weg = true;
      const faktor = codex > 0 ? 2 : 1;
      if (fund.art === "token") {
        punkte += 25 * faktor;
      } else if (fund.art === "commit") {
        commits += 1;
        punkte += 10 * faktor;
        if (commits % 10 === 0) {
          punkte += 100 * faktor;
          terminal(`$ git tag v0.${commits / 10}.0 · Release ausgeliefert`);
        }
      } else if (fund.art === "claude") {
        review = true;
        terminal("$ claude · Review aktiv, der nächste Fehler wird abgefangen");
      } else {
        codex = CODEX_DAUER;
        terminal("$ codex exec · zweiter Agent parallel, Tokens ×2");
      }
    };

    const zeichneRz = (o: Hindernis) => {
      for (let r = 0; r < o.racks; r++) {
        const rx = o.x + r * 27;
        ctx.fillStyle = f.tinte;
        ctx.fillRect(rx, o.y, 24, o.h);
        // Höheneinheiten mit Status-LED
        const einheiten = Math.floor((o.h - 4) / 7);
        for (let e = 0; e < einheiten; e++) {
          const ey = o.y + 3 + e * 7;
          ctx.globalAlpha = 0.28;
          ctx.fillStyle = f.papier;
          ctx.fillRect(rx + 3, ey + 2, 13, 1);
          ctx.globalAlpha = 1;
          const an = Math.floor(uhr * 4 + e * 1.7 + r * 3) % 5 !== 0;
          ctx.fillStyle = an ? COMMIT : "#e3b341";
          ctx.fillRect(rx + 18, ey + 1, 3, 3);
        }
      }
      // Abwärme über dem Dach
      ctx.strokeStyle = f.linie;
      ctx.lineWidth = 1.2;
      for (let w = 0; w < o.racks * 2; w++) {
        const wx = o.x + 6 + w * 12;
        ctx.beginPath();
        for (let s = 0; s <= 12; s++) {
          const py = o.y - 4 - s;
          const px = wx + Math.sin(s / 2 + uhr * 6 + w) * 2;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    };

    const zeichneHindernis = (o: Hindernis) => {
      if (o.art === "rz") {
        zeichneRz(o);
      } else if (o.art === "konflikt") {
        ctx.fillStyle = f.rot;
        ctx.fillRect(o.x, o.y, o.b, o.h);
        ctx.fillStyle = f.papier;
        ctx.font = `bold 9px ${f.mono}`;
        ctx.textAlign = "center";
        ctx.fillText("<<<<<<<", o.x + o.b / 2, o.y + 13);
      } else if (o.art === "limit") {
        ctx.fillStyle = f.tinte;
        ctx.fillRect(o.x, o.y, o.b, o.h);
        ctx.fillStyle = f.papier;
        ctx.font = `bold 11px ${f.mono}`;
        ctx.textAlign = "center";
        ctx.fillText("429", o.x + o.b / 2, o.y + 15);
      } else {
        ctx.fillStyle = f.rot;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.ellipse(o.x + 16, o.y + 15, 16, 11, 0, 0, Math.PI * 2);
        ctx.ellipse(o.x + 34, o.y + 11, 18, 13, 0, 0, Math.PI * 2);
        ctx.ellipse(o.x + 46, o.y + 16, 12, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = f.papier;
        ctx.font = "italic 10px Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText("sicher!", o.x + 30, o.y + 17);
      }
    };

    const zeichneFund = (t: Fund) => {
      ctx.textAlign = "center";
      if (t.art === "token") {
        ctx.strokeStyle = f.ki;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = f.ki;
        ctx.font = `bold 9px ${f.mono}`;
        ctx.fillText("T", t.x, t.y + 3);
      } else if (t.art === "commit") {
        ctx.fillStyle = COMMIT;
        ctx.beginPath();
        ctx.roundRect(t.x - 6, t.y - 6, 12, 12, 2);
        ctx.fill();
      } else if (t.art === "claude") {
        if (claudeIcon.complete && claudeIcon.naturalWidth) {
          ctx.save();
          ctx.translate(t.x, t.y);
          ctx.rotate(uhr * 1.5);
          ctx.drawImage(claudeIcon, -11, -11, 22, 22);
          ctx.restore();
        }
        ctx.fillStyle = CLAUDE;
        ctx.font = `8px ${f.mono}`;
        ctx.fillText("Claude Code", t.x, t.y + 22);
      } else {
        if (codexIcon.complete && codexIcon.naturalWidth) {
          // Das Icon hat Rand; 30 px ergeben eine Wolke so groß wie Claude
          ctx.drawImage(codexIcon, t.x - 15, t.y - 15, 30, 30);
        }
        ctx.fillStyle = CODEX;
        ctx.font = `8px ${f.mono}`;
        ctx.fillText("Codex", t.x, t.y + 22);
      }
    };

    const zeichneSpringer = (x: number, alpha: number) => {
      if (!figur.complete || !figur.naturalWidth) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(Math.max(-0.35, Math.min(0.25, vy / 2600)));
      ctx.scale(-1, 1);
      ctx.drawImage(figur, -12, -38, 23, 38);
      ctx.restore();
    };

    const zeichne = () => {
      ctx.clearRect(0, 0, breite, HOEHE);
      // Spaltenlinien der Zeitung als Hintergrund
      ctx.strokeStyle = f.linie;
      ctx.lineWidth = 1;
      for (const s of spalten) {
        ctx.beginPath();
        ctx.moveTo(s, 30);
        ctx.lineTo(s, BODEN - 10);
        ctx.stroke();
      }
      ctx.strokeStyle = f.tinte;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, BODEN + 1);
      ctx.lineTo(breite, BODEN + 1);
      ctx.stroke();
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(0, BODEN + 5);
      ctx.lineTo(breite, BODEN + 5);
      ctx.stroke();

      for (const t of funde) if (!t.weg) zeichneFund(t);
      for (const o of hindernisse) zeichneHindernis(o);

      // Codex: ein zweiter Agent läuft versetzt mit
      if (codex > 0) zeichneSpringer(38, 0.28);
      zeichneSpringer(64, 1);

      // Claude Code: das Review liegt als Ring um die Figur
      if (review) {
        ctx.strokeStyle = CLAUDE;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.lineDashOffset = -uhr * 20;
        ctx.beginPath();
        ctx.arc(64, y - 19, 26, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (meldung && uhr < meldungBis) {
        ctx.globalAlpha = Math.min(1, (meldungBis - uhr) * 2);
        ctx.fillStyle = f.tinte2;
        ctx.font = `11px ${f.mono}`;
        ctx.textAlign = "left";
        ctx.fillText(meldung, 10, 18);
        ctx.globalAlpha = 1;
      }
    };

    const ende = (art: Art) => {
      zustand = "aus";
      if (punkte > rekord) {
        rekord = Math.floor(punkte);
        try {
          localStorage.setItem("springer-rekord", String(rekord));
        } catch {}
      }
      melde(ENDE[art]);
    };

    const schritt = (zeit: number) => {
      const dt = Math.min(0.033, (zeit - letzte) / 1000 || 0);
      letzte = zeit;
      if (zustand === "laeuft" && sichtbar) {
        uhr += dt;
        tempo = Math.min(MAX_TEMPO, tempo + 11 * dt);
        const dx = tempo * dt;
        weg += dx;
        punkte += (dx / 12) * (codex > 0 ? 2 : 1);
        codex = Math.max(0, codex - dt);
        vy += SCHWERKRAFT * dt;
        y = Math.min(BODEN, y + vy * dt);
        if (y >= BODEN) vy = 0;
        spalten = spalten.map((s) =>
          s - dx * 0.3 < -10 ? s - dx * 0.3 + 1280 : s - dx * 0.3,
        );
        naechstes -= dx;
        if (naechstes <= 0) erzeuge();
        for (const o of hindernisse) o.x -= dx;
        for (const t of funde) t.x -= dx;
        hindernisse = hindernisse.filter((o) => o.x + o.b > -20);
        funde = funde.filter((t) => t.x > -20);

        for (const t of funde) {
          if (
            !t.weg &&
            Math.abs(t.x - 64) < 22 &&
            Math.abs(t.y - (y - 18)) < 28
          )
            einsammeln(t);
        }
        const k = { x: 52, y: y - 36, b: 23, h: 34 };
        const treffer = hindernisse.find(
          (o) =>
            k.x < o.x + o.b - 4 &&
            k.x + k.b > o.x + 4 &&
            k.y < o.y + o.h - 3 &&
            k.y + k.h > o.y + 3,
        );
        if (treffer && review) {
          review = false;
          hindernisse = hindernisse.filter((o) => o !== treffer);
          terminal("✓ Claude Code hat den Fehler im Review abgefangen");
          melde();
        } else if (treffer) {
          ende(treffer.art);
        } else if (zeit - gemeldet > 100) {
          gemeldet = zeit;
          melde();
        }
      }
      zeichne();
      anfrage = requestAnimationFrame(schritt);
    };
    anfrage = requestAnimationFrame(schritt);
    melde();

    const taste = (e: KeyboardEvent) => {
      const ziel = e.target;
      if (
        ziel instanceof Element &&
        ziel.closest("input, textarea, select, [contenteditable='true']")
      )
        return;
      if ((e.key === " " || e.key === "ArrowUp") && sichtbar) {
        const r = box.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        e.preventDefault();
        springen();
      }
    };
    const tippen = (e: PointerEvent) => {
      e.preventDefault();
      springen();
    };
    const sicht = () => {
      sichtbar = document.visibilityState === "visible";
    };
    window.addEventListener("keydown", taste);
    canvas.addEventListener("pointerdown", tippen);
    document.addEventListener("visibilitychange", sicht);
    return () => {
      cancelAnimationFrame(anfrage);
      ro.disconnect();
      window.removeEventListener("keydown", taste);
      canvas.removeEventListener("pointerdown", tippen);
      document.removeEventListener("visibilitychange", sicht);
    };
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-[0.78rem] tabular-nums">
        <span>
          <span className="text-ai">
            {anzeige.punkte.toLocaleString("de-DE")} Tokens
          </span>
          <span className="text-meta"> · </span>
          <span className="text-[#216e39]">
            {anzeige.commits} {anzeige.commits === 1 ? "Commit" : "Commits"}
          </span>
        </span>
        <span className="flex gap-3">
          {anzeige.review && (
            <span className="text-[#c15f3c]">claude · Review aktiv</span>
          )}
          {anzeige.codex > 0 && <span>codex · ×2 noch {anzeige.codex} s</span>}
        </span>
        <span className="text-meta">
          Rekord {anzeige.rekord.toLocaleString("de-DE")}
        </span>
      </div>
      <div
        ref={rahmen}
        className="relative mt-2 touch-manipulation select-none border-y border-rule"
      >
        <canvas
          ref={leinwand}
          className="block cursor-pointer"
          aria-label="Laufspiel Der Springer: über Rechenzentren, Merge-Konflikte und Rate-Limits springen. Leertaste oder Tippen zum Springen."
        />
        {anzeige.zustand !== "laeuft" && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div className="max-w-[26rem] bg-paper/90 px-4 py-2">
              {anzeige.zustand === "aus" && (
                <>
                  <p className="font-headline text-[1.15rem] font-bold italic">
                    {anzeige.ende}
                  </p>
                  <p className="mt-1 font-mono text-[0.72rem] text-meta">
                    git log: {anzeige.commits} Commits,{" "}
                    {anzeige.punkte.toLocaleString("de-DE")} Tokens
                  </p>
                </>
              )}
              <p className="mt-1 font-sans text-[0.8rem] text-ink-2">
                {anzeige.zustand === "aus" ? "Neuer Lauf: " : ""}Leertaste oder
                Tippen
              </p>
            </div>
          </div>
        )}
      </div>
      <div
        className="mt-3 flex items-center gap-2 font-mono text-[0.68rem] text-meta"
        title="Beiträge in diesem Lauf, wie im GitHub-Profil"
      >
        <span>Beiträge</span>
        <span className="flex gap-[3px]" aria-hidden="true">
          {Array.from({ length: STREIFEN }, (_, i) => {
            const s = stufe(anzeige.commits, i);
            return (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: feste Kästchenreihe
                key={i}
                className="size-[10px] rounded-[2px]"
                style={{ background: s < 0 ? "#ebedf0" : COMMIT_STUFEN[s] }}
              />
            );
          })}
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 font-sans text-[0.8rem] text-ink-2 sm:grid-cols-2">
        <div>
          <dt className="inline font-semibold text-ink">
            Rechenzentrum, 429, Merge-Konflikt
          </dt>{" "}
          <dd className="inline">überspringen, später kommt die Wolke.</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-[#c15f3c]">Claude Code</dt>{" "}
          <dd className="inline">fängt im Review den nächsten Fehler ab.</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-codex">Codex</dt>{" "}
          <dd className="inline">
            startet einen zweiten Agenten, {CODEX_DAUER} s doppelte Tokens.
          </dd>
        </div>
        <div>
          <dt className="inline font-semibold text-[#216e39]">Commits</dt>{" "}
          <dd className="inline">füllen den Graphen, alle zehn ein Release.</dd>
        </div>
      </dl>
    </div>
  );
}
