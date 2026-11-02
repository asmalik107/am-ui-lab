#!/usr/bin/env bash
# Runs the performance tests (timings, startup, memory, scrolling and frame
# hitches) against every app's Release build on a cabled iPhone. The other
# checks don't depend on the hardware and stay on the simulator (run-all.sh).
# Build and install first with scripts/build-ios.sh <app> Release <udid>.
# Keep the phone unlocked (Auto-Lock: Never), plugged in and out of Low Power
# Mode, and nothing else running on the Mac.
# Usage: scripts/run-all-iphone.sh <udid> [apps...]
set -uo pipefail
udid="$1"; shift
apps=("${@:-baseline unistyles uniwind nativewind tamagui gluestack heroui reusables}")
root="$(cd "$(dirname "$0")/.." && pwd)"
for app in ${apps[@]}; do
  bundle="dev.asimmalik.uilab.$app"
  echo "=== $app"
  node "$root/scripts/perf-run.mjs" "$app" "$bundle" "$udid" 10 | tail -3
  node "$root/scripts/metrics-run.mjs" "$app" "$bundle" "$udid" 10 | sed -n '5,14p'
done
