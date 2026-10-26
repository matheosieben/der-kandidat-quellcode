#!/bin/bash
# Richtet den täglichen Lauf von daten-taeglich.sh als launchd-Job ein
# (jeden Abend um 23:50; schläft der Mac, holt launchd den Lauf beim
# Aufwachen nach). Erneut ausführen übernimmt Änderungen am Skript.
#
# Abschalten:  launchctl bootout gui/$(id -u)/de.matheosieben.der-kandidat.daten
#              rm ~/Library/LaunchAgents/de.matheosieben.der-kandidat.daten.plist

set -euo pipefail

NAME="de.matheosieben.der-kandidat.daten"
ORDNER="$HOME/Library/Application Support/DerKandidat"
SKRIPT="$ORDNER/daten-taeglich.sh"
PLIST="$HOME/Library/LaunchAgents/$NAME.plist"
PROTOKOLL="$HOME/Library/Logs/der-kandidat-daten.log"

mkdir -p "$ORDNER" "$HOME/Library/LaunchAgents" "$HOME/Library/Logs"
# Eine Kopie außerhalb des Schreibtischs, den launchd nicht lesen darf
cp "$(dirname "$0")/daten-taeglich.sh" "$SKRIPT"
chmod +x "$SKRIPT"

cat >"$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$NAME</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$SKRIPT</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>23</integer>
    <key>Minute</key>
    <integer>50</integer>
  </dict>
  <key>StandardOutPath</key>
  <string>$PROTOKOLL</string>
  <key>StandardErrorPath</key>
  <string>$PROTOKOLL</string>
</dict>
</plist>
EOF

launchctl bootout "gui/$(id -u)/$NAME" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "Eingerichtet: $NAME, täglich 23:50. Protokoll: $PROTOKOLL"
