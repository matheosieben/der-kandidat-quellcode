/*
 * Konfetti über den ganzen Bildschirm, ohne Bibliothek: ein Canvas
 * über allem, das nach drei Sekunden wieder verschwindet. Wer im System
 * reduzierte Bewegung eingestellt hat, bekommt keins.
 */

const FARBEN = [
  "#6aaa64", // Wortwahl: richtig
  "#c9b458", // Wortwahl: enthalten
  "#b4a7f5", // Wortwahl-Lila
  "#f7da21", // Springer-Gelb
  "#d97757", // Claude
  "#4a5cf7", // Codex
  "#121212",
];

const DAUER = 3200;
const ANZAHL = 220;

type Teil = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  drehung: number;
  dreh: number;
  breite: number;
  hoehe: number;
  farbe: string;
  flattern: number;
};

export function konfetti() {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "2147483647",
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas.remove();

  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  // Zwei Kanonen unten links und rechts, dazu ein Regen von oben
  const teile: Teil[] = Array.from({ length: ANZAHL }, (_, i) => {
    const art = i % 3;
    const winkel =
      art === 0
        ? -Math.PI / 3 + (Math.random() - 0.5) * 0.6
        : art === 1
          ? (-2 * Math.PI) / 3 + (Math.random() - 0.5) * 0.6
          : Math.PI / 2;
    const tempo = art === 2 ? 1 + Math.random() * 2 : 11 + Math.random() * 9;
    return {
      x: art === 0 ? 0 : art === 1 ? w : Math.random() * w,
      y: art === 2 ? -20 - Math.random() * h * 0.5 : h,
      vx: Math.cos(winkel) * tempo,
      vy: Math.sin(winkel) * tempo,
      drehung: Math.random() * Math.PI,
      dreh: (Math.random() - 0.5) * 0.3,
      breite: 6 + Math.random() * 6,
      hoehe: 8 + Math.random() * 8,
      farbe: FARBEN[i % FARBEN.length],
      flattern: Math.random() * Math.PI * 2,
    };
  });

  const start = performance.now();
  const bild = (jetzt: number) => {
    const t = jetzt - start;
    ctx.clearRect(0, 0, w, h);
    // In der letzten halben Sekunde blendet alles aus
    ctx.globalAlpha = Math.min(1, (DAUER - t) / 500);
    for (const p of teile) {
      p.vy += 0.25;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.flattern += 0.15;
      p.x += p.vx + Math.sin(p.flattern) * 0.8;
      p.y += p.vy;
      p.drehung += p.dreh;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.drehung);
      // Gestauchte Höhe lässt die Schnipsel kippen
      ctx.scale(1, Math.cos(p.flattern));
      ctx.fillStyle = p.farbe;
      ctx.fillRect(-p.breite / 2, -p.hoehe / 2, p.breite, p.hoehe);
      ctx.restore();
    }
    if (t < DAUER) requestAnimationFrame(bild);
    else canvas.remove();
  };
  requestAnimationFrame(bild);
}
