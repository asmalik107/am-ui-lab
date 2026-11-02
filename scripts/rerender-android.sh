#!/usr/bin/env bash
# Counts re-renders on a theme switch on an Android phone: builds the Debug
# .apk, installs it, starts Metro for the app and runs rerender-run.mjs.
# Usage: scripts/rerender-android.sh <serial> [apps...]
# SKIP_BUILD=1 reuses each app's existing Debug .apk.
set -uo pipefail
serial="$1"; shift
apps=("${@:-baseline unistyles uniwind nativewind tamagui gluestack heroui reusables}")
root="$(cd "$(dirname "$0")/.." && pwd)"
for app in ${apps[@]}; do
  bundle="dev.asimmalik.uilab.$app"
  echo "=== $app"
  [ -n "${SKIP_BUILD:-}" ] || "$root/scripts/build-android.sh" "$app" Debug >/dev/null || { echo "build failed"; continue; }
  adb -s "$serial" install -r "$root/apps/$app/android/app/build/outputs/apk/debug/app-debug.apk" >/dev/null || { echo "install failed"; continue; }
  # Only this app may be connected to Metro, or the profiler can't tell which to attach to.
  for other in baseline unistyles uniwind nativewind tamagui gluestack heroui reusables; do
    adb -s "$serial" shell am force-stop "dev.asimmalik.uilab.$other"
  done
  pkill -f "expo start --dev-client --port 8081" || true
  sleep 2
  (cd "$root/apps/$app" && npx expo start --dev-client --port 8081 >"${TMPDIR:-/tmp}/uilab-metro-$app.log" 2>&1 &)
  for _ in $(seq 1 60); do curl -s -m 1 localhost:8081/status | grep -q running && break; sleep 1; done
  adb -s "$serial" reverse tcp:8081 tcp:8081 >/dev/null
  # Warm-up: the first launch makes Metro build the bundle.
  argent run launch-app --json --args "{\"udid\":\"$serial\",\"bundleId\":\"$bundle\"}" >/dev/null 2>&1 || true
  argent run await-ui-element --json --args "{\"udid\":\"$serial\",\"condition\":\"visible\",\"selector\":{\"text\":\"Component test screen\"},\"timeoutMs\":120000}" >/dev/null || true
  sleep 5
  node "$root/scripts/rerender-run.mjs" "$app" "$bundle" "$serial" | node -e "let s='';process.stdin.on('data',(d)=>(s+=d)).on('end',()=>{const j=JSON.parse(s);console.log(j.error ?? j.switches.map((x)=>\`\${x.from} → \${x.to}: \${x.commits} commits, \${x.renders} renders\`).join('\n'))})"
done
pkill -f "expo start --dev-client --port 8081" || true
