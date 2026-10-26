import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  /* config options here */
  cacheComponents: true,
  // Zusammengelegte und umbenannte Ressorts: alte Links führen weiter
  redirects() {
    return [
      { source: "/programm", destination: "/leitartikel", permanent: true },
      { source: "/bilanz", destination: "/werkstatt#bilanz", permanent: true },
      { source: "/kolophon", destination: "/#entstehung", permanent: true },
      {
        source: "/fit-check",
        destination: "/interview#fit-check",
        permanent: true,
      },
    ];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
