#!/usr/bin/env bash
# Builds one lab app as a Debug simulator .app.
# Usage: scripts/build-ios.sh <app>   (e.g. baseline, unistyles)
# CocoaPods fails without a UTF-8 locale, so it is set here.
set -euo pipefail
export LANG=en_US.UTF-8
app="$1"
cd "$(dirname "$0")/../apps/$app"
npx expo prebuild -p ios --clean --no-install >/dev/null
(cd ios && pod install >/dev/null)
ws=$(ls -d ios/*.xcworkspace | head -1)
scheme=$(basename "$ws" .xcworkspace)
xcodebuild -workspace "$ws" -scheme "$scheme" -configuration Debug -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' -derivedDataPath ios/build -quiet 2>&1 | grep -E "error:|BUILD FAILED" || true
ls -d ios/build/Build/Products/Debug-iphonesimulator/*.app
