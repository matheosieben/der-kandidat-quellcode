"use client";

import { useEffect } from "react";
import { initialisiereAblage } from "@/lib/ki/ablage";

export function AblageBereinigen() {
  useEffect(() => {
    initialisiereAblage();
  }, []);
  return null;
}
