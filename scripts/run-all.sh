#!/usr/bin/env bash
# Runs every test against every app's Release build on one booted simulator:
# accessibility audit in all three themes, largest text size, Reduce Motion,
# timings, and startup/memory/scrolling. Re-render counts need a Debug build
# and are run separately with scripts/rerender-run.mjs.
# Build first with scripts/build-ios.sh <app> Release. Nothing else should be
# running on the machine while the timings run.
# Usage: scripts/run-all.sh <udid> [apps...]
set -uo pipefail
udid="$1"; shift
apps=("${@:-baseline unistyles uniwind nativewind tamagui gluestack heroui reusables}")
root="$(cd "$(dirname "$0")/.." && pwd)"
for app in ${apps[@]}; do
  bundle="dev.asimmalik.uilab.$app"
  echo "=== $app"
  "$root/scripts/audit-app.sh" "$app" "$udid" Release | grep -E "checks passed"
  for theme in dark brand; do
    BUILD_CONFIG=Release node "$root/scripts/a11y-audit.mjs" "$app" "$bundle" "$udid" --theme "$theme" | grep -E "checks passed"
  done
  node "$root/scripts/textsize-test.mjs" "$app" "$bundle" "$udid" | sed -n '5,7p'
  node "$root/scripts/motion-test.mjs" "$app" "$bundle" "$udid" | tail -3
  node "$root/scripts/perf-run.mjs" "$app" "$bundle" "$udid" 10 | tail -3
  node "$root/scripts/metrics-run.mjs" "$app" "$bundle" "$udid" 10 | sed -n '5,12p'
done
