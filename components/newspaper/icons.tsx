import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function IconGithub(props: IconProps) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
      aria-hidden="true"
    >
      <path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.03-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.15a10.8 10.8 0 0 1 5.63 0c2.15-1.46 3.1-1.15 3.1-1.15.61 1.55.23 2.7.11 2.98a4.34 4.34 0 0 1 1.16 3.02c0 4.32-2.63 5.28-5.14 5.56.4.35.76 1.04.76 2.1v3.08c0 .3.2.65.77.54A11.25 11.25 0 0 0 12 .75Z" />
    </svg>
  );
}

export function IconLinkedin(props: IconProps) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
      aria-hidden="true"
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/**
 * Games: ein Wortwahl-Raster ohne Rahmen, wie ein halb gelöstes Rätsel.
 * Leere Felder sind weiß mit grauem Rand, damit das Symbol auf hellem wie
 * farbigem Grund steht.
 */
export function IconGames(props: IconProps) {
  const leer = "leer";
  const felder = [
    leer,
    leer,
    "var(--wort-enthalten)",
    "var(--wort-enthalten)",
    "var(--wort-richtig)",
    leer,
    "var(--wort-richtig)",
    "var(--wort-richtig)",
    "var(--wort-richtig)",
  ];
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      {...props}
      aria-hidden="true"
    >
      {felder.map((farbe, i) => (
        <rect
          // biome-ignore lint/suspicious/noArrayIndexKey: festes Raster
          key={i}
          x={1.25 + (i % 3) * 7.5}
          y={1.25 + Math.floor(i / 3) * 7.5}
          width="6.5"
          height="6.5"
          rx="1.2"
          fill={farbe === leer ? "#fff" : farbe}
          stroke={farbe === leer ? "#c9cbcf" : "none"}
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...base} {...props} aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconChevron(props: IconProps) {
  return (
    <svg {...base} {...props} aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base} {...props} aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}
