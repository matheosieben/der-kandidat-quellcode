#!/bin/bash
# Zieht die Daten der Ausgabe täglich nach: erzeugt content/daten.json und
# content/entstehung.json aus den lokalen Protokollen neu und schiebt sie auf
# main, worauf Vercel neu veröffentlicht.
#
# Läuft in einem eigenen Klon außerhalb des Schreibtischs, den macOS für
# Hintergrunddienste sperrt, und lässt den Arbeitsordner unberührt.
# Eingerichtet wird es mit scripts/daten-taeglich-einrichten.sh.

set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

ORDNER="$HOME/Library/Application Support/DerKandidat"
KLON="$ORDNER/main"
REPOSITORY="https://github.com/matheosieben/der-kandidat-bewerbung.git"
DATEIEN=(content/daten.json content/entstehung.json)

echo "== $(date '+%Y-%m-%d %H:%M:%S') Daten nachziehen"

if [ ! -d "$KLON/.git" ]; then
  git clone --quiet "$REPOSITORY" "$KLON"
fi
cd "$KLON"

for versuch in 1 2; do
  git fetch --quiet origin main
  git checkout --quiet -B main origin/main
  git reset --quiet --hard origin/main

  python3 -I scripts/daten-erzeugen.py >/dev/null
  python3 -I scripts/entstehung-erzeugen.py >/dev/null
  # Dieselbe Formatierung wie im Projekt, sonst ändert sich jede Zeile
  npx --yes @biomejs/biome@2.4.2 format --write "${DATEIEN[@]}" >/dev/null

  if git diff --quiet -- "${DATEIEN[@]}"; then
    echo "Keine neuen Daten."
    exit 0
  fi

  stand=$(python3 -c "import json; print(json.load(open('content/daten.json'))['stand'])")
  git add -- "${DATEIEN[@]}"
  git commit --quiet -m "Daten bis ${stand} nachgezogen"

  if git push --quiet origin HEAD:main; then
    echo "Gepusht: Daten bis ${stand}."
    exit 0
  fi
  # main ist inzwischen weiter: neu aufsetzen und noch einmal erzeugen
  echo "Push abgelehnt, neuer Versuch."
done

echo "Push fehlgeschlagen." >&2
exit 1
