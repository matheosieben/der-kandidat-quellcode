"""Erzeugt content/daten.json aus lokalen Arbeitsprotokollen.

Gelesen werden ausschließlich Zeitstempel, Modellnamen, Token-Zähler, Wortzahlen
und Sprechdauern. Gesprächs- und Diktatinhalte werden weder gelesen noch gespeichert.

Quellen:
  Codex        ~/.codex/sessions, ~/.codex/archived_sessions (rollout-*.jsonl[.zst])
  Claude Code  ~/.claude/projects/**/*.jsonl
  Commits      GitHub-API über `gh` (Standardzweig aller eigenen Repositories)
  Wispr Flow   ~/Library/Application Support/Wispr Flow/flow.sqlite (Tabelle History)

Aufruf:  python3 -I scripts/daten-erzeugen.py
"""

import collections
import datetime as dt
import glob
import json
import os
import re
import shutil
import sqlite3
import subprocess
import tempfile

HOME = os.path.expanduser("~")
ZIEL = os.path.join(os.path.dirname(__file__), "..", "content", "daten.json")
GITHUB_NUTZER = "matheosieben"
HEUTE = dt.date.today()

# Anzeigenamen; interne Hilfsmodelle (Code-Review-Automatik) zählen nicht als eigenes Modell.
NAMEN = {
    "gpt-5-codex": "GPT-5 Codex",
    "gpt-5.1-codex": "GPT-5.1 Codex",
    "gpt-5.1-codex-max": "GPT-5.1 Codex Max",
    "gpt-5.1-codex-mini": "GPT-5.1 Codex Mini",
    "gpt-5.2": "GPT-5.2",
    "gpt-5.2-codex": "GPT-5.2 Codex",
    "gpt-5.3-codex": "GPT-5.3 Codex",
    "gpt-5.4": "GPT-5.4",
    "gpt-5.5": "GPT-5.5",
    "gpt-5.6-sol": "GPT-5.6 Sol",
    "gpt-6-sol": "GPT-6 Sol",
    "gpt-6-astra": "GPT-6 Astra",
    "gpt-6.1-sol": "GPT-6.1 Sol",
    "claude-opus-4-8": "Claude Opus 4.8",
    "claude-fable-5": "Claude Fable 5",
    "claude-opus-5": "Claude Opus 5",
    "claude-sonnet-5": "Claude Sonnet 5",
    "claude-opus-5-5": "Claude Opus 5.5",
    "claude-sonnet-5-5": "Claude Sonnet 5.5",
}
IGNORIERT = {"codex-auto-review", "unbekannt"}
MINDEST_TOKENS = 1_000_000  # darunter gilt ein Modell nicht als „genutzt“


def jsonl(pfad):
    if pfad.endswith(".zst"):
        text = subprocess.run(["zstd", "-dc", pfad], capture_output=True, check=False).stdout.decode("utf-8", "replace")
    else:
        with open(pfad, encoding="utf-8", errors="replace") as f:
            text = f.read()
    for zeile in text.splitlines():
        try:
            yield json.loads(zeile)
        except json.JSONDecodeError:
            continue


def tag(ts):
    return ts[:10] if isinstance(ts, str) and len(ts) >= 10 else None


tokens_tag = collections.Counter()
tokens_monat_anbieter = collections.defaultdict(collections.Counter)
tokens_modell = collections.Counter()
erster_tag_modell = {}
tage_anbieter = collections.defaultdict(set)
tokens_modell_tag = collections.Counter()
ausgabe_tokens = 0


def merke(modell_id, datum, tokens, ausgabe, anbieter):
    global ausgabe_tokens
    tokens_tag[datum] += tokens
    tokens_monat_anbieter[datum[:7]][anbieter] += tokens
    tokens_modell[modell_id] += tokens
    tage_anbieter[anbieter].add(datum)
    tokens_modell_tag[(modell_id, datum, anbieter)] += tokens
    ausgabe_tokens += ausgabe
    if modell_id not in erster_tag_modell or datum < erster_tag_modell[modell_id]:
        erster_tag_modell[modell_id] = datum


def codex():
    for unter in ("sessions", "archived_sessions"):
        for pfad in glob.glob(os.path.join(HOME, ".codex", unter, "**", "rollout-*.jsonl*"), recursive=True):
            datum, modelle, letzte = None, collections.Counter(), None
            for o in jsonl(pfad):
                p = o.get("payload") if isinstance(o.get("payload"), dict) else {}
                if o.get("type") == "session_meta":
                    datum = tag(p.get("timestamp") or o.get("timestamp"))
                elif o.get("type") == "turn_context" and p.get("model"):
                    modelle[p["model"]] += 1
                elif o.get("type") == "event_msg" and p.get("type") == "token_count":
                    letzte = (p.get("info") or {}).get("total_token_usage") or letzte
                datum = datum or tag(o.get("timestamp"))
            if not datum or not letzte or not modelle:
                continue
            modell = modelle.most_common(1)[0][0]
            if modell in IGNORIERT:
                continue
            merke(modell, datum, int(letzte.get("total_tokens") or 0), int(letzte.get("output_tokens") or 0), "openai")


def claude():
    gesehen = set()
    for pfad in glob.glob(os.path.join(HOME, ".claude", "projects", "**", "*.jsonl"), recursive=True):
        for o in jsonl(pfad):
            if o.get("type") != "assistant":
                continue
            m = o.get("message") or {}
            modell, usage = m.get("model"), m.get("usage") or {}
            schluessel = (m.get("id"), o.get("requestId"))
            datum = tag(o.get("timestamp"))
            if not modell or modell.startswith("<") or not datum or schluessel in gesehen:
                continue
            gesehen.add(schluessel)
            summe = sum(int(usage.get(k) or 0) for k in (
                "input_tokens", "cache_creation_input_tokens", "cache_read_input_tokens", "output_tokens"))
            merke(modell, datum, summe, int(usage.get("output_tokens") or 0), "anthropic")


def commits():
    repos = json.loads(subprocess.run(
        ["gh", "repo", "list", GITHUB_NUTZER, "--limit", "200", "--json", "name"],
        capture_output=True, check=True, text=True).stdout)
    pro_tag = collections.Counter()
    trailer_erster = {}
    claude_monat = collections.Counter()
    anzahl = 0
    for r in repos:
        ausgabe = subprocess.run(
            ["gh", "api", "--paginate", f"repos/{GITHUB_NUTZER}/{r['name']}/commits?per_page=100",
             "--jq", ".[] | [.commit.author.date, .commit.message] | @json"],
            capture_output=True, check=False, text=True).stdout
        for zeile in ausgabe.splitlines():
            datum, nachricht = json.loads(zeile)
            anzahl += 1
            pro_tag[datum[:10]] += 1
            namen = re.findall(r"Co-Authored-By:\s*(Claude [^<\n]+?)\s*<", nachricht, re.I)
            if namen:
                claude_monat[datum[:7]] += 1
            for name in namen:
                name = name.strip()
                if name not in trailer_erster or datum[:10] < trailer_erster[name]:
                    trailer_erster[name] = datum[:10]
    return anzahl, pro_tag, trailer_erster, claude_monat


def wispr():
    quelle = os.path.join(HOME, "Library", "Application Support", "Wispr Flow", "flow.sqlite")
    if not os.path.exists(quelle):
        return None
    with tempfile.TemporaryDirectory() as tmp:
        kopie = os.path.join(tmp, "flow.sqlite")
        shutil.copy(quelle, kopie)
        db = sqlite3.connect(f"file:{kopie}?mode=ro&immutable=1", uri=True)
        zeilen = db.execute(
            "SELECT timestamp, numWords, speechDuration, app FROM History WHERE numWords > 0").fetchall()
        db.close()
    if not zeilen:
        return None
    limit_meldungen = None
    konfig = os.path.join(os.path.dirname(quelle), "config.json")
    if os.path.exists(konfig):
        with open(konfig, encoding="utf-8") as f:
            meldung = ((json.load(f).get("notifications") or {}).get("WeeklyWordsLimitReached") or {})
        limit_meldungen = meldung.get("numTimesShown")
    worte = sum(z[1] for z in zeilen)
    sekunden = sum(z[2] or 0 for z in zeilen)
    apps = collections.Counter(z[3] for z in zeilen)
    claude_anteil = sum(n for a, n in apps.items() if a and "anthropic" in a) / len(zeilen)
    laengen = sorted(z[1] for z in zeilen)
    return {
        "von": min(z[0] for z in zeilen)[:10],
        "bis": max(z[0] for z in zeilen)[:10],
        "diktate": len(zeilen),
        "worte": worte,
        "minuten": round(sekunden / 60),
        "wpm": round(worte / (sekunden / 60)) if sekunden else None,
        "medianWorte": laengen[len(laengen) // 2],
        "laengstesDiktat": laengen[-1],
        "anteilInClaude": round(claude_anteil * 100),
        "wochenlimitErreicht": limit_meldungen,
    }


codex()
claude()
commit_anzahl, commits_tag, trailer, claude_commits_monat = commits()

# Erster Einsatz je Modell: Protokolle und, für Claude vor Beginn der Protokolle, Co-Autor-Zeilen.
chronik = {}
for modell_id, menge in tokens_modell.items():
    if menge >= MINDEST_TOKENS:
        name = NAMEN.get(modell_id, modell_id)
        chronik[name] = erster_tag_modell[modell_id]
for name, datum in trailer.items():
    if name not in chronik or datum < chronik[name]:
        chronik[name] = datum

beginn = min(HEUTE - dt.timedelta(days=370), dt.date(2025, 7, 1))
kalender = []
d = beginn
while d <= HEUTE:
    s = d.isoformat()
    kalender.append([s, round(tokens_tag.get(s, 0) / 1e6, 1), commits_tag.get(s, 0)])
    d += dt.timedelta(days=1)

monate = []
for monat in sorted(tokens_monat_anbieter):
    werte = tokens_monat_anbieter[monat]
    monate.append({"monat": monat, "openai": round(werte["openai"] / 1e6), "anthropic": round(werte["anthropic"] / 1e6)})

# Grundlage für Schätzungen in Monaten ohne Claude-Protokolle (siehe lib/schaetzung.ts):
# Median der Tokens je Claude-Commit in vollen Monaten mit Protokollen.
claude_ab = min(tage_anbieter["anthropic"], default=None)
quoten = sorted(
    m["anthropic"] / claude_commits_monat[m["monat"]]
    for m in monate
    if claude_ab and m["monat"] > claude_ab[:7] and m["monat"] < HEUTE.isoformat()[:7]
    and claude_commits_monat[m["monat"]] and m["anthropic"]
)
mitte = len(quoten) // 2
tokens_je_commit = (quoten[mitte] if len(quoten) % 2 else (quoten[mitte - 1] + quoten[mitte]) / 2) if quoten else None

# Tokens je Tag und Anbieter, für die Wochenansicht der gemessenen Zeit.
je_tag = collections.defaultdict(lambda: {"openai": 0, "anthropic": 0})
for (_, datum, anb), menge in tokens_modell_tag.items():
    je_tag[datum][anb] += menge
anbieter_tag = [[t, round(w["openai"] / 1e6, 1), round(w["anthropic"] / 1e6, 1)] for t, w in sorted(je_tag.items())]

# Hauptmodell je Anbieter: meistes Volumen in den letzten 30 Tagen.
grenze = (HEUTE - dt.timedelta(days=30)).isoformat()
juengst = collections.defaultdict(collections.Counter)
for (modell_id, datum, anb), menge in tokens_modell_tag.items():
    if datum >= grenze:
        juengst[anb][NAMEN.get(modell_id, modell_id)] += menge
aktuell = {anb: zaehler.most_common(1)[0][0] for anb, zaehler in juengst.items()}

aktiv = {t for t, n in tokens_tag.items() if n} | {t for t, n in commits_tag.items() if n}

daten = {
    "stand": HEUTE.isoformat(),
    "summen": {
        "tokensMrd": round(sum(tokens_tag.values()) / 1e9, 2),
        "ausgabeMio": round(ausgabe_tokens / 1e6, 1),
        "aktiveTage": len(aktiv),
        "commits": commit_anzahl,
        "modelle": len(chronik),
    },
    "kalender": kalender,
    "anbieterTag": anbieter_tag,
    "monate": monate,
    "aktuell": aktuell,
    "chronik": sorted(([name, datum] for name, datum in chronik.items()), key=lambda x: x[1]),
    "wispr": wispr(),
    "quellen": {
        "codexAb": min(tage_anbieter["openai"], default=None),
        "claudeAb": claude_ab,
        "claudeTokensJeCommit": round(tokens_je_commit, 1) if tokens_je_commit else None,
        "claudeCommitsMonat": dict(sorted(claude_commits_monat.items())),
    },
}

with open(ZIEL, "w", encoding="utf-8") as f:
    json.dump(daten, f, ensure_ascii=False, indent=1)
    f.write("\n")

print(json.dumps(daten["summen"], ensure_ascii=False))
print("Chronik:", len(daten["chronik"]), "Modelle")
for name, datum in daten["chronik"]:
    print(f"  {datum}  {name}")
print("Wispr:", daten["wispr"])
