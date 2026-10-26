const WISPR = "#005146";
const TIPPEN = "var(--marker)";

const aufgaben = [
  {
    name: "Neue Aufgaben und offene Fragen",
    beschreibung:
      "Noch kein Lösungsweg? Ich spreche, um meine Gedanken zu ordnen.",
    wispr: 95,
    einordnung: "Fast immer Wispr Flow",
  },
  {
    name: "Kontext, Ideen und Anforderungen",
    beschreibung:
      "Ich erkläre ausführlich, was ich vorhabe und worauf es ankommt.",
    wispr: 90,
    einordnung: "Überwiegend Wispr Flow",
  },
  {
    name: "Kleine Korrekturen und kurze Antworten",
    beschreibung:
      "Ein Wort ändern, etwas bestätigen, kurz nachjustieren: Das tippe ich.",
    wispr: 20,
    einordnung: "Überwiegend getippt",
  },
];

export function EingabeVerlauf() {
  return (
    <figure className="mt-6 border-t border-rule pt-4 font-sans">
      <figcaption className="text-[0.9rem] font-semibold">
        Große Gedanken sprechen, Kleinigkeiten tippen
      </figcaption>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[0.75rem]">
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5" style={{ background: WISPR }} />
          Wispr Flow
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5" style={{ background: TIPPEN }} />
          Tippen
        </span>
      </div>
      <ul className="mt-4 space-y-4">
        {aufgaben.map((a) => (
          <li key={a.name}>
            <p className="text-[0.8rem] font-semibold">{a.name}</p>
            <p className="mt-0.5 text-[0.75rem] leading-snug text-muted">
              {a.beschreibung}
            </p>
            <span className="sr-only">{a.einordnung}</span>
            <div aria-hidden="true" className="mt-2 flex h-2.5 overflow-hidden">
              <span style={{ width: `${a.wispr}%`, background: WISPR }} />
              <span
                style={{ width: `${100 - a.wispr}%`, background: TIPPEN }}
              />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[0.72rem] leading-snug text-meta">
        Der Großteil meiner Aufträge entsteht mit Wispr Flow. Die Balken zeigen
        meine Arbeitsweise schematisch, keine gemessenen Anteile.
      </p>
    </figure>
  );
}
