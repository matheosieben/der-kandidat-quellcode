import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { ReactNode } from "react";
import { ausgabe } from "@/content/ausgabe";
import { programm } from "@/content/programm";

/*
 * Das Vorschaubild, das beim Teilen eines Links erscheint (Open Graph und
 * Twitter Card): ein Ausschnitt der Seite. Oben der Zeitungskopf, darunter
 * links die Illustration des Ressorts, rechts Dachzeile, Schlagzeile, Vorspann
 * und Autorenzeile. Jedes Ressort ruft diese Vorlage aus seiner
 * `opengraph-image.tsx` auf.
 */

export const groesse = { width: 1200, height: 630 };

/* Die Tokens aus globals.css; Satori kennt keine CSS-Variablen. */
const farbe = {
  paper: "#ffffff",
  paper2: "#f7f7f5",
  ink: "#121212",
  ink2: "#363636",
  meta: "#727272",
  rule: "#dfdfdf",
  opinion: "#7d5a2c",
  ai: "#2340a8",
  wortRichtig: "#6aaa64",
  wortEnthalten: "#c9b458",
  wortFalsch: "#787c7e",
};

/* Schriften und Springer liegen im Repository, gelesen einmal beim Laden. */
const schrift = (datei: string) =>
  readFile(join(process.cwd(), "components/vorschau/schriften", datei));

const [garamond400, garamond500, garamond700Kursiv, geist400, geist700] =
  await Promise.all([
    schrift("eb-garamond-400.ttf"),
    schrift("eb-garamond-500.ttf"),
    schrift("eb-garamond-700-kursiv.ttf"),
    schrift("geist-400.ttf"),
    schrift("geist-700.ttf"),
  ]);

const springer = await bildAlsDaten("springer.png");

/**
 * Liest ein Bild aus `public/bilder` als Data-URL. Die Ressorts rufen das beim
 * Laden des Moduls auf, damit ihr Vorschaubild beim Build entsteht und nicht
 * erst beim Aufruf.
 */
export async function bildAlsDaten(datei: string) {
  const daten = await readFile(join(process.cwd(), "public/bilder", datei));
  const typ = datei.endsWith(".png") ? "image/png" : "image/jpeg";
  return `data:${typ};base64,${daten.toString("base64")}`;
}

export type Vorschau = {
  dachzeile: string;
  titel: string;
  vorspann: string;
  /** Illustration im Seitenverhältnis 4:3, als Data-URL aus `bildAlsDaten`. */
  bild?: string;
  /** Statt einer Illustration ein gezeichnetes Motiv. */
  motiv?: ReactNode;
  /** Blau statt Braun für die Dachzeile: Hier spricht die Maschine. */
  maschine?: boolean;
};

/** Dachzeile, Titel und Text, mit denen der Leitartikel auf ein Ressort verweist. */
export function verweis(ressort: string) {
  const eintrag = programm.weiterlesen.find((w) => w.ressort === ressort);
  if (!eintrag) throw new Error(`Kein Verweis auf ${ressort} im Leitartikel`);
  return {
    dachzeile: eintrag.ressort,
    titel: eintrag.titel,
    vorspann: eintrag.text,
    maschine: eintrag.maschine,
  };
}

/** Alt-Text des Vorschaubilds: was darauf steht und was daneben zu sehen ist. */
export function vorschauAlt(
  { dachzeile, titel }: Pick<Vorschau, "dachzeile" | "titel">,
  daneben: string,
) {
  return `${ausgabe.titel}, ${ausgabe.untertitel}. ${dachzeile}: „${titel}“, von ${ausgabe.autor}. Daneben ${daneben}.`;
}

export function vorschauBild({
  dachzeile,
  titel,
  vorspann,
  bild,
  motiv,
  maschine,
}: Vorschau) {
  const [vorn, ...rest] = ausgabe.titel.split(" ");
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: farbe.paper,
        color: farbe.ink,
        padding: "34px 56px 48px",
        fontFamily: "Geist",
      }}
    >
      {/* Zeitungskopf wie auf der Seite */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 28,
          fontSize: 15,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        <span style={{ fontWeight: 700 }}>{ausgabe.untertitel}</span>
        <span style={{ color: farbe.ink2 }}>{ausgabe.nummer}</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 18,
          marginTop: 14,
          fontFamily: "EB Garamond",
          fontWeight: 500,
          fontSize: 92,
          lineHeight: 0.92,
          letterSpacing: 1.6,
          textTransform: "uppercase",
        }}
      >
        <span>{vorn}</span>
        {/* biome-ignore lint/performance/noImgElement: Satori zeichnet nur einfache Elemente */}
        <img src={springer} alt="" width={52} height={86} />
        <span>{rest.join(" ")}</span>
      </div>
      <div
        style={{
          display: "flex",
          height: 7,
          marginTop: 24,
          borderTop: `2px solid ${farbe.ink}`,
          borderBottom: `2px solid ${farbe.ink}`,
        }}
      />

      {/* Aufmacher */}
      <div style={{ display: "flex", flex: 1, gap: 44, marginTop: 34 }}>
        <div
          style={{
            display: "flex",
            width: 456,
            height: 342,
            background: farbe.paper2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {bild ? (
            // biome-ignore lint/performance/noImgElement: Satori zeichnet nur einfache Elemente
            <img
              src={bild}
              alt=""
              width={456}
              height={342}
              style={{ objectFit: "cover" }}
            />
          ) : (
            (motiv ?? (
              // biome-ignore lint/performance/noImgElement: Satori zeichnet nur einfache Elemente
              <img src={springer} alt="" width={120} height={198} />
            ))
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            paddingTop: 4,
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: 1.6,
              textTransform: "uppercase",
              color: maschine ? farbe.ai : farbe.opinion,
            }}
          >
            {dachzeile}
          </span>
          <span
            style={{
              marginTop: 12,
              fontFamily: "EB Garamond",
              fontWeight: 700,
              fontStyle: "italic",
              fontSize: titel.length > 34 ? 50 : 60,
              lineHeight: 1.08,
              letterSpacing: -0.5,
              textWrap: "balance",
            }}
          >
            {titel}
          </span>
          <span
            style={{
              marginTop: 16,
              fontFamily: "EB Garamond",
              fontSize: 26,
              lineHeight: 1.3,
              color: farbe.ink2,
              textWrap: "balance",
            }}
          >
            {vorspann}
          </span>
          <span
            style={{
              marginTop: "auto",
              paddingTop: 14,
              borderTop: `1px solid ${farbe.rule}`,
              fontSize: 19,
            }}
          >
            <span style={{ fontWeight: 700 }}>Von {ausgabe.autor}</span>
            <span style={{ color: farbe.meta }}>
              &nbsp;· {ausgabe.ort} · {ausgabe.datumKurz}
            </span>
          </span>
        </div>
      </div>
    </div>,
    {
      ...groesse,
      fonts: [
        {
          name: "EB Garamond",
          data: garamond400,
          weight: 400,
          style: "normal",
        },
        {
          name: "EB Garamond",
          data: garamond500,
          weight: 500,
          style: "normal",
        },
        {
          name: "EB Garamond",
          data: garamond700Kursiv,
          weight: 700,
          style: "italic",
        },
        { name: "Geist", data: geist400, weight: 400, style: "normal" },
        { name: "Geist", data: geist700, weight: 700, style: "normal" },
      ],
    },
  );
}

/** Drei Zeilen Wortwahl, die letzte gelöst: das Motiv der Games. */
export function WortwahlMotiv() {
  const zeilen: [string, string][] = [
    ["LEISE", "eeref"],
    ["STIEL", "rfrrr"],
    ["SPIEL", "rrrrr"],
  ];
  const ton = {
    r: farbe.wortRichtig,
    e: farbe.wortEnthalten,
    f: farbe.wortFalsch,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {zeilen.map(([wort, wertung]) => (
        <div key={wort} style={{ display: "flex", gap: 8 }}>
          {wort.split("").map((buchstabe, i) => (
            <div
              key={buchstabe + String(i)}
              style={{
                display: "flex",
                width: 62,
                height: 62,
                alignItems: "center",
                justifyContent: "center",
                background: ton[wertung[i] as keyof typeof ton],
                color: farbe.paper,
                fontWeight: 700,
                fontSize: 32,
              }}
            >
              {buchstabe}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
