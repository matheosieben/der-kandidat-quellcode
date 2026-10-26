// biome-ignore-all lint/correctness/useHookAtTopLevel: Die React-Hooks werden hier durch einen Adapter für den isolierten Store-Test ersetzt.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const SCHLUESSEL = "der-kandidat:ablage";
const SPIEL = "wortwahl-test";
const basis = new URL("../lib/ki/", import.meta.url);

function umgebung(speicher = new Map(), gesperrt = false) {
  const zugriffe = { lesen: 0, schreiben: 0, melden: 0 };
  const module = new Map();
  const fenster = {};
  Object.defineProperty(fenster, "localStorage", {
    get() {
      if (gesperrt) throw new Error("Browserspeicher gesperrt");
      return {
        getItem(key) {
          zugriffe.lesen++;
          return speicher.get(key) ?? null;
        },
        setItem(key, value) {
          zugriffe.schreiben++;
          speicher.set(key, value);
        },
        removeItem(key) {
          speicher.delete(key);
        },
      };
    },
  });

  function laden(name) {
    if (name === "react") {
      return {
        useEffect(effect) {
          effect();
        },
        useSyncExternalStore(abonnieren, lesen) {
          abonnieren(() => zugriffe.melden++);
          return lesen();
        },
      };
    }
    if (name === "@/lib/ki/ablage") return laden("./ablage");
    if (name === "./lesen") {
      return {
        async frageRedaktion(_anfrage, beiText) {
          beiText("Testantwort mit Fundstelle. [Werkstatt]");
          return { ok: true };
        },
      };
    }
    if (module.has(name)) return module.get(name).exports;
    const modul = { exports: {} };
    module.set(name, modul);
    const datei =
      name === "bereinigung"
        ? new URL("../components/ki/ablage-bereinigen.tsx", import.meta.url)
        : new URL(`${name.slice(2)}.ts`, basis);
    const source = readFileSync(datei, "utf8");
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    });
    runInNewContext(outputText, {
      module: modul,
      exports: modul.exports,
      require: laden,
      window: fenster,
      AbortController,
    });
    return modul.exports;
  }

  return {
    ablage: laden("./ablage"),
    gespraech: laden("./gespraech"),
    bereinigen: laden("bereinigung").AblageBereinigen,
    zugriffe,
  };
}

test("Altablagen werden auf Startseite und Interview entfernt, ohne sie zu lesen", () => {
  for (const alt of [
    JSON.stringify([{ id: "alt", stelle: "Vertrauliche Testanzeige" }]),
    "{ungültiges JSON",
  ]) {
    for (const einstieg of ["startseite", "interview", "andere-seite"]) {
      const speicher = new Map([
        [SCHLUESSEL, alt],
        [SPIEL, "Spielstand"],
      ]);
      const app = umgebung(speicher);
      if (einstieg === "startseite") app.gespraech.useGespraech();
      else if (einstieg === "interview") app.ablage.useAblage();
      else app.bereinigen();
      assert.equal(speicher.has(SCHLUESSEL), false);
      assert.equal(speicher.get(SPIEL), "Spielstand");
      assert.equal(app.zugriffe.lesen, 0);
      assert.equal(app.zugriffe.schreiben, 0);
      assert.equal(app.ablage.useAblage().length, 0);
    }
  }
});

test("Interview und Fit Check lassen sich flüchtig öffnen und fortsetzen", async () => {
  const app = umgebung();
  app.gespraech.useGespraech();
  app.ablage.useAblage();
  await app.gespraech.fragen("Meine Testfrage");
  const interview = app.ablage.useAblage()[0];
  assert.equal(interview.verlauf[0].text, "Meine Testfrage");
  app.ablage.ablegen({
    id: "fit",
    art: "fit-check",
    titel: "Teststelle",
    stelle: "Testanzeige mit Umlauten: Ärztin 👩‍💻",
    antwort: "Testgutachten",
  });
  assert.equal(app.ablage.useAblage().length, 2);
  app.ablage.oeffnen(interview.id);
  assert.equal(app.ablage.useAblage()[0].id, interview.id);
  app.gespraech.neuesGespraech();
  app.gespraech.gespraechLaden(interview.id, interview.verlauf);
  await app.gespraech.fragen("Meine Rückfrage");
  assert.equal(app.ablage.useAblage().length, 2);
  assert.equal(app.ablage.useAblage()[0].verlauf.length, 4);
  assert.equal(app.zugriffe.lesen, 0);
  assert.equal(app.zugriffe.schreiben, 0);
  assert.ok(app.zugriffe.melden > 0);
});

test("Ein neu geladener Client stellt keine Gesprächsinhalte wieder her", async () => {
  const speicher = new Map();
  const vorher = umgebung(speicher);
  await vorher.gespraech.fragen("Testfrage vor dem Neuladen");
  vorher.ablage.ablegen({
    id: "fit",
    art: "fit-check",
    titel: "Teststelle",
    stelle: "Vollständige Testanzeige",
    antwort: "Testgutachten",
  });
  const nachher = umgebung(speicher);
  assert.equal(nachher.ablage.useAblage().length, 0);
  assert.equal(nachher.gespraech.useGespraech().verlauf.length, 0);
  assert.equal(speicher.has(SCHLUESSEL), false);
});

test("Gesperrter Browserspeicher verhindert keine flüchtigen Gespräche", async () => {
  const app = umgebung(new Map(), true);
  app.gespraech.useGespraech();
  await app.gespraech.fragen("Testfrage ohne Browserspeicher");
  assert.equal(app.ablage.useAblage().length, 1);
  assert.equal(app.gespraech.useGespraech().verlauf.length, 2);
});
