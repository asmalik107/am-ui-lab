#!/usr/bin/env bash
# Builds one lab app as an Android .apk for the emulator (arm64 only),
# then prints the .apk path. Release builds are signed with the debug key
# from Expo's template, so they install without a keystore.
# Usage: scripts/build-android.sh <app> [Debug|Release]
set -euo pipefail
app="$1"
config="${2:-Debug}"
variant=$(echo "$config" | tr '[:upper:]' '[:lower:]')
cd "$(dirname "$0")/../apps/$app"
npx expo prebuild -p android --clean --no-install >/dev/null
log="android/build-$config.log"
status=0
(cd android && ./gradlew "app:assemble$config" -PreactNativeArchitectures=arm64-v8a) >"$log" 2>&1 || status=$?
if [ "$status" -ne 0 ]; then
  echo "BUILD FAILED ($app $config). Errors from $log:"
  grep -E "error:|FAILURE|What went wrong" -A3 "$log" | head -30
  exit "$status"
fi
ls "android/app/build/outputs/apk/$variant/"*.apk
