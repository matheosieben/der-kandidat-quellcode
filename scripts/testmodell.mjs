// Lokaler Ersatz für die Messages-API: streamt feste Antworten im Anthropic-Format.
// Start:  node scripts/testmodell.mjs        (Port 3199)
// Dann:   ANTHROPIC_BASE_URL=http://127.0.0.1:3199 ANTHROPIC_API_KEY=lokal npm run dev
import { createServer } from "node:http";

const PORT = Number(process.env.PORT ?? 3199);

const INTERVIEW =
  "Testmodell: Ihre Frage ist angekommen. Die echte Redaktion antwortet hier auf Grundlage der Ausgabe, in zwei bis vier Sätzen. [Bilanz] [Werkstatt]";

const STELLE = `PASSUNG: hoch, mit Lernkurve – Testmodell, keine echte Prüfung.
DAFÜR:
- Prototypen mit KI-Agenten, gebaut nach festen Regeln. [Werkstatt]
- Erfahrung mit Fundstellen und Legal-RAG. [Bilanz]
LERNFELDER:
- Kein abgeschlossenes Informatikstudium, dafür zwölf Monate, in denen er sich Modell um Modell selbst erarbeitet hat. [Lebenslauf]
FRAGEN FÜRS GESPRÄCH:
- Wie prüfen Sie Code, den ein Modell geschrieben hat?
- Was würden Sie an Ciprè heute anders machen?
- Wie messen Sie, ob ein KI-Feature wirkt?`;

function ereignis(res, typ, daten) {
  res.write(
    `event: ${typ}\ndata: ${JSON.stringify({ type: typ, ...daten })}\n\n`,
  );
}

const server = createServer((req, res) => {
  if (req.method !== "POST" || !req.url?.startsWith("/v1/messages")) {
    res.writeHead(404).end();
    return;
  }
  let roh = "";
  req.on("data", (teil) => {
    roh += teil;
  });
  req.on("end", async () => {
    const anfrage = JSON.parse(roh || "{}");
    const system = Array.isArray(anfrage.system)
      ? anfrage.system.map((b) => b.text).join("")
      : String(anfrage.system ?? "");
    console.log(
      JSON.stringify({
        modell: anfrage.model,
        beta: req.headers["anthropic-beta"],
        fallbacks: anfrage.fallbacks,
        effort: anfrage.output_config?.effort,
        cache: anfrage.system?.[0]?.cache_control,
        systemZeichen: system.length,
        nachrichten: anfrage.messages?.length,
      }),
    );
    const text = system.includes("<stellenanzeige>") ? STELLE : INTERVIEW;
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    });
    ereignis(res, "message_start", {
      message: {
        id: "msg_test",
        type: "message",
        role: "assistant",
        model: anfrage.model,
        content: [],
        stop_reason: null,
        stop_sequence: null,
        usage: { input_tokens: 12, output_tokens: 1 },
      },
    });
    ereignis(res, "content_block_start", {
      index: 0,
      content_block: { type: "text", text: "" },
    });
    for (const stueck of text.match(/.{1,12}/gs) ?? []) {
      ereignis(res, "content_block_delta", {
        index: 0,
        delta: { type: "text_delta", text: stueck },
      });
      await new Promise((r) => setTimeout(r, 25));
    }
    ereignis(res, "content_block_stop", { index: 0 });
    ereignis(res, "message_delta", {
      delta: { stop_reason: "end_turn", stop_sequence: null },
      usage: { output_tokens: 40 },
    });
    ereignis(res, "message_stop", {});
    res.end();
  });
});

server.listen(PORT, "127.0.0.1", () =>
  console.log(`Testmodell auf http://127.0.0.1:${PORT}`),
);
