/** Fragt die Redaktion und meldet den wachsenden Antworttext. */
export async function frageRedaktion(
  anfrage: object,
  beiText: (text: string) => void,
  signal: AbortSignal,
): Promise<{ ok: true } | { ok: false; meldung: string; offline?: boolean }> {
  let antwort: Response;
  try {
    antwort = await fetch("/api/redaktion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(anfrage),
      signal,
    });
  } catch {
    if (signal.aborted) return { ok: true };
    return { ok: false, meldung: "Keine Verbindung zur Redaktion." };
  }
  if (!antwort.ok || !antwort.body) {
    const daten = await antwort.json().catch(() => ({}));
    return {
      ok: false,
      meldung: daten.meldung ?? "Die Redaktion antwortet gerade nicht.",
      offline: antwort.status === 503,
    };
  }
  const leser = antwort.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  try {
    while (true) {
      const { done, value } = await leser.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      beiText(text);
    }
  } catch {
    if (!signal.aborted)
      return { ok: false, meldung: "Die Leitung ist unterbrochen." };
  }
  return { ok: true };
}
