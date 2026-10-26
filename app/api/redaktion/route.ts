import Anthropic from "@anthropic-ai/sdk";
import { bremse } from "@/lib/ki/bremse";
import {
  MODELL,
  systemInterview,
  systemStellenCheck,
} from "@/lib/ki/redaktion";

/*
 * Die Maschinenebene: beantwortet Leserfragen („interview“) und prüft
 * Stellenanzeigen („stelle“). Antwortet als gestreamter Klartext.
 */

const GRENZEN = {
  frage: 500,
  verlauf: 12,
  verlaufText: 2_000,
  stelleMin: 150,
  stelleMax: 8_000,
};

type Nachricht = { rolle: "leser" | "redaktion"; text: string };
type Anfrage =
  | { modus: "interview"; verlauf: Nachricht[] }
  | { modus: "stelle"; text: string };

function fehler(status: number, meldung: string, warten?: number) {
  return Response.json(
    { meldung, warten },
    {
      status,
      headers: warten ? { "Retry-After": String(warten) } : undefined,
    },
  );
}

function pruefe(roh: unknown): Anfrage | string {
  if (!roh || typeof roh !== "object") return "Die Anfrage ist leer.";
  const a = roh as Record<string, unknown>;
  if (a.modus === "interview") {
    if (!Array.isArray(a.verlauf) || a.verlauf.length === 0)
      return "Es fehlt die Frage.";
    const verlauf = a.verlauf.slice(-GRENZEN.verlauf);
    const gueltig = verlauf.every(
      (n) =>
        n &&
        typeof n === "object" &&
        (n.rolle === "leser" || n.rolle === "redaktion") &&
        typeof n.text === "string" &&
        n.text.trim().length > 0 &&
        n.text.length <= GRENZEN.verlaufText,
    );
    const letzte = verlauf.at(-1) as Nachricht | undefined;
    if (!gueltig || letzte?.rolle !== "leser")
      return "Der Gesprächsverlauf ist ungültig.";
    if (letzte.text.length > GRENZEN.frage)
      return `Bitte fassen Sie Ihre Frage in höchstens ${GRENZEN.frage} Zeichen.`;
    // Der Verlauf muss mit einer Leserfrage beginnen.
    const start = verlauf.findIndex((n) => n.rolle === "leser");
    return { modus: "interview", verlauf: verlauf.slice(start) as Nachricht[] };
  }
  if (a.modus === "stelle") {
    if (typeof a.text !== "string") return "Es fehlt die Stellenanzeige.";
    const text = a.text.trim();
    if (text.length < GRENZEN.stelleMin)
      return "Die Stellenanzeige ist zu kurz für eine Prüfung.";
    if (text.length > GRENZEN.stelleMax)
      return `Bitte kürzen Sie die Stellenanzeige auf ${GRENZEN.stelleMax.toLocaleString("de-DE")} Zeichen.`;
    return { modus: "stelle", text };
  }
  return "Unbekannter Modus.";
}

function nachrichten(anfrage: Anfrage): Anthropic.Beta.BetaMessageParam[] {
  if (anfrage.modus === "stelle") {
    return [
      {
        role: "user",
        content: `<stellenanzeige>\n${anfrage.text.replaceAll("</stellenanzeige>", "")}\n</stellenanzeige>`,
      },
    ];
  }
  // Aufeinanderfolgende Beiträge derselben Rolle zusammenführen.
  const liste: Anthropic.Beta.BetaMessageParam[] = [];
  for (const n of anfrage.verlauf) {
    const role = n.rolle === "leser" ? "user" : "assistant";
    const vorige = liste.at(-1);
    if (vorige && vorige.role === role) {
      vorige.content = `${vorige.content}\n\n${n.text}`;
    } else {
      liste.push({ role, content: n.text });
    }
  }
  return liste;
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return fehler(
      503,
      "Die Redaktion ist gerade nicht besetzt. Schreiben Sie mir direkt.",
    );
  }

  let roh: unknown;
  try {
    roh = await request.json();
  } catch {
    return fehler(400, "Die Anfrage ließ sich nicht lesen.");
  }
  const anfrage = pruefe(roh);
  if (typeof anfrage === "string") return fehler(400, anfrage);

  const ip =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "lokal";
  const warten = bremse(ip, anfrage.modus === "stelle" ? 4 : 1);
  if (warten > 0) {
    return fehler(
      429,
      `Die Redaktion braucht eine kurze Pause. Bitte in ${warten} Sekunden erneut.`,
      warten,
    );
  }

  const client = new Anthropic();
  const stream = client.beta.messages.stream(
    {
      model: MODELL,
      max_tokens: anfrage.modus === "stelle" ? 8_000 : 4_000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: anfrage.modus === "stelle" ? "high" : "medium" },
      system: [
        {
          type: "text",
          text:
            anfrage.modus === "stelle" ? systemStellenCheck : systemInterview,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: nachrichten(anfrage),
    },
    { signal: request.signal },
  );

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const ereignis of stream) {
          if (
            ereignis.type === "content_block_delta" &&
            ereignis.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(ereignis.delta.text));
          }
        }
        const ende = await stream.finalMessage();
        if (ende.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode(
              "Diese Frage kann die Redaktion nicht beantworten. Schreiben Sie mir direkt.",
            ),
          );
        }
      } catch (e) {
        if (!request.signal.aborted) {
          console.error(
            "Redaktion:",
            e instanceof Anthropic.APIError ? e.status : e,
          );
          controller.enqueue(
            encoder.encode(
              "\n\nDie Leitung ist unterbrochen. Bitte versuchen Sie es gleich noch einmal.",
            ),
          );
        }
      } finally {
        try {
          controller.close();
        } catch {
          // Der Leser hat die Verbindung bereits geschlossen.
        }
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Modell": MODELL,
    },
  });
}
