type TeilenErgebnis = "geteilt" | "kopiert" | "abgebrochen" | "manuell";

export async function teileLink(url: string): Promise<TeilenErgebnis> {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: "Der Kandidat",
        text: "Diese Bewerbung am Computer weiterlesen.",
        url,
      });
      return "geteilt";
    } catch (fehler) {
      if (fehler instanceof DOMException && fehler.name === "AbortError") {
        return "abgebrochen";
      }
    }
  }

  try {
    if (!navigator.clipboard?.writeText) return "manuell";
    await navigator.clipboard.writeText(url);
    return "kopiert";
  } catch {
    return "manuell";
  }
}
