import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { EB_Garamond, Geist, Geist_Mono } from "next/font/google";
import { AblageBereinigen } from "@/components/ki/ablage-bereinigen";
import { InterviewSchwebefenster } from "@/components/ki/interview-schwebefenster";
import { DesktopHinweis } from "@/components/newspaper/desktop-hinweis";
import { Footer } from "@/components/newspaper/footer";
import { InteraktionsCursor } from "@/components/werkstatt/interaktions-cursor";
import { ausgabe } from "@/content/ausgabe";
import "./globals.css";

/*
 * Die Schriften der ersten Ausgabe: EB Garamond trägt Titel, Schlagzeilen und
 * Text, Geist die Redaktion (Dachzeilen, Navigation, Legenden), Geist Mono
 * alles, was eine Maschine sagt.
 */
const garamond = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-garamond",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

// Auf Vercel gesetzt; lokal reicht localhost für absolute Vorschau-URLs
const domain = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const metadata: Metadata = {
  metadataBase: new URL(domain ? `https://${domain}` : "http://localhost:3000"),
  title: {
    default: `${ausgabe.titel} · ${ausgabe.untertitel}`,
    template: `%s · ${ausgabe.titel}`,
  },
  description:
    "Meine Initiativbewerbung für die KI-Einheit von Axel Springer, gesetzt als Zeitung: wie ich mit KI arbeite, was ich damit gebaut habe und warum ich in Ihr Team will.",
  // Eine Bewerbung mit Telefonnummer gehört nicht in Suchmaschinen
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: ausgabe.titel,
  },
  icons: {
    icon: [
      // SVG wechselt selbst mit dem Farbschema; die PNGs fangen Browser ohne SVG-Favicons auf
      { url: "/favicon.svg", type: "image/svg+xml" },
      {
        url: "/favicon-hell.png",
        type: "image/png",
        sizes: "64x64",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-dunkel.png",
        type: "image/png",
        sizes: "64x64",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      className={`${garamond.variable} ${geist.variable} ${geistMono.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        <AblageBereinigen />
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2 font-sans text-sm"
        >
          Zum Inhalt springen
        </a>
        <div className="flex-1">{children}</div>
        <Footer />
        <InterviewSchwebefenster />
        <DesktopHinweis />
        <InteraktionsCursor />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
