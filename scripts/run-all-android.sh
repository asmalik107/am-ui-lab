#!/usr/bin/env bash
set -uo pipefail
serial="$1"; shift
apps=("${@:-baseline unistyles uniwind nativewind tamagui gluestack heroui reusables}")
root="$(cd "$(dirname "$0")/.." && pwd)"
"$root/scripts/android-a11y-dump/build.sh" "$serial" >/dev/null
adb -s "$serial" shell svc power stayon true
for app in ${apps[@]}; do
  bundle="dev.asimmalik.uilab.$app"
  echo "=== $app $(date +%T)"
  for theme in light dark brand; do
    node "$root/scripts/a11y-audit.mjs" "$app" "$bundle" "$serial" --theme "$theme" | grep -E "checks passed"
  done
  node "$root/scripts/textsize-test.mjs" "$app" "$bundle" "$serial" | sed -n '5,7p'
  node "$root/scripts/motion-test.mjs" "$app" "$bundle" "$serial" | tail -3
  node "$root/scripts/perf-run.mjs" "$app" "$bundle" "$serial" 10 | tail -3
  node "$root/scripts/metrics-run.mjs" "$app" "$bundle" "$serial" 10 | sed -n '5,12p'
  sleep 60
done
adb -s "$serial" shell svc power stayon false
