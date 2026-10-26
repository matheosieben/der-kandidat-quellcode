import datetime as dt
import json
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
HOME_DIR = Path.home()
PROJECT_NAMES = ("der kandidat bewerbung", "der-kandidat-bewerbung", "springerbewerbung")
PAUSE = 15 * 60


def project_path(value):
    return any(name in str(value).lower() for name in PROJECT_NAMES)


def rows(path):
    with path.open(encoding="utf-8", errors="replace") as stream:
        for line in stream:
            try:
                yield json.loads(line)
            except json.JSONDecodeError:
                continue


def generate():
    timestamps = []
    input_tokens = 0
    cached_tokens = 0
    output_tokens = 0
    claude_messages = {}
    codex_events = {}
    counters = set()
    sessions = {"claude": set(), "codex": set()}

    for directory in (HOME_DIR / ".claude" / "projects").glob("*"):
        if not project_path(directory.name):
            continue
        for path in directory.rglob("*.jsonl"):
            for row in rows(path):
                if row.get("type") != "assistant":
                    continue
                message = row.get("message") or {}
                usage = message.get("usage") or {}
                if not message.get("id") or not usage or str(message.get("model", "")).startswith("<"):
                    continue
                key = (message["id"], row.get("requestId"))
                measured = tuple(int(usage.get(field) or 0) for field in (
                    "input_tokens", "cache_creation_input_tokens", "cache_read_input_tokens", "output_tokens"
                ))
                previous = claude_messages.get(key, (0, 0, 0, 0))
                # Gestreamte Teilnachrichten derselben Antwort zählen nur einmal.
                claude_messages[key] = tuple(max(a, b) for a, b in zip(previous, measured))
                if row.get("timestamp"):
                    timestamps.append(row["timestamp"])
                sessions["claude"].add(row.get("sessionId") or path.stem)

    for folder in ("sessions", "archived_sessions"):
        for path in (HOME_DIR / ".codex" / folder).rglob("*.jsonl"):
            records = rows(path)
            first = next(records, {})
            meta = first.get("payload") or {}
            if first.get("type") != "session_meta" or not project_path(meta.get("cwd", "")):
                continue
            session_id = meta.get("id") or path.stem
            for row in records:
                payload = row.get("payload") or {}
                if row.get("type") != "event_msg" or payload.get("type") != "token_count":
                    continue
                info = payload.get("info") or {}
                total = info.get("total_token_usage") or {}
                usage = info.get("last_token_usage") or {}
                if not total or not usage:
                    continue
                counter = (session_id, total.get("input_tokens"), total.get("output_tokens"))
                if counter in counters:
                    continue
                counters.add(counter)
                # Fortgesetzte Sitzungen und kopierte Fork-Historien nicht doppelt addieren.
                key = (row.get("timestamp"), usage.get("input_tokens"), usage.get("output_tokens"))
                codex_events[key] = tuple(int(usage.get(field) or 0) for field in ("input_tokens", "cached_input_tokens", "output_tokens"))
                if row.get("timestamp"):
                    timestamps.append(row["timestamp"])
                sessions["codex"].add(session_id)

    # Input heißt hier alles, was ins Modell geht: neu, in den Cache geschrieben
    # und aus dem Cache gelesen. Bei Codex ist der Cache in input_tokens enthalten.
    for measured in claude_messages.values():
        input_tokens += sum(measured[:3])
        cached_tokens += measured[2]
        output_tokens += measured[3]
    for incoming, cached, outgoing in codex_events.values():
        input_tokens += incoming
        cached_tokens += cached
        output_tokens += outgoing
    if not timestamps or not input_tokens or not output_tokens:
        raise SystemExit("Keine vollständigen Projektzähler gefunden.")

    moments = sorted(dt.datetime.fromisoformat(value.replace("Z", "+00:00")) for value in timestamps)
    # Arbeitszeit: Abstände zwischen zwei Ereignissen zählen nur bis zu einer Pause von 15 Minuten.
    active = sum(
        gap for gap in ((b - a).total_seconds() for a, b in zip(moments, moments[1:])) if gap <= PAUSE
    )
    dates = [moment.astimezone(ZoneInfo("Europe/Berlin")).date() for moment in moments]
    result = {
        "von": min(dates).isoformat(),
        "bis": max(dates).isoformat(),
        "kalendertage": (max(dates) - min(dates)).days + 1,
        "arbeitsstunden": round(active / 3600),
        "eingabeTokens": input_tokens,
        "eingabeAusCache": cached_tokens,
        "ausgabeTokens": output_tokens,
        "sitzungen": {name: len(values) for name, values in sessions.items()},
    }
    target = ROOT / "content" / "entstehung.json"
    target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    generate()
