#!/usr/bin/env bash
# Runs every test against every app's Release build on one booted simulator:
# accessibility audit, largest text size, Reduce Motion and timings.
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
  node "$root/scripts/textsize-test.mjs" "$app" "$bundle" "$udid" | sed -n '5,7p'
  node "$root/scripts/motion-test.mjs" "$app" "$bundle" "$udid" | tail -3
  node "$root/scripts/perf-run.mjs" "$app" "$bundle" "$udid" 10 | tail -3
done
