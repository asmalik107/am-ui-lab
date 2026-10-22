#!/usr/bin/env bash
# Installs one app's build on the simulator and runs the accessibility audit.
# Usage: scripts/audit-app.sh <app> <udid> [Release|Debug]
# Release is the default: the JS bundle is embedded, so no Metro is needed.
set -euo pipefail
app="$1"; udid="$2"; config="${3:-Release}"
root="$(cd "$(dirname "$0")/.." && pwd)"
bundle="dev.asimmalik.uilab.$app"
appPath=$(ls -d "$root/apps/$app/ios/build/Build/Products/$config-iphonesimulator/"*.app | head -1)
if [ "$config" = "Debug" ]; then
  pkill -f "expo start --dev-client --port 8081" || true
  sleep 2
  (cd "$root/apps/$app" && npx expo start --dev-client --port 8081 >"${TMPDIR:-/tmp}/uilab-metro-$app.log" 2>&1 &)
  for _ in $(seq 1 60); do curl -s -m 1 localhost:8081/status | grep -q running && break; sleep 1; done
fi
argent run reinstall-app --json --args "{\"udid\":\"$udid\",\"bundleId\":\"$bundle\",\"appPath\":\"$appPath\"}" >/dev/null
BUILD_CONFIG="$config" node "$root/scripts/a11y-audit.mjs" "$app" "$bundle" "$udid"
