#!/usr/bin/env bash
# Builds one lab app as a simulator .app, then deletes the build
# intermediates (4–6 GB per app) and keeps only the products.
# Usage: scripts/build-ios.sh <app> [Debug|Release]
# CocoaPods fails without a UTF-8 locale, so it is set here.
set -euo pipefail
export LANG=en_US.UTF-8
app="$1"
config="${2:-Debug}"
cd "$(dirname "$0")/../apps/$app"
npx expo prebuild -p ios --clean --no-install >/dev/null
(cd ios && pod install >/dev/null)
ws=$(ls -d ios/*.xcworkspace | head -1)
scheme=$(basename "$ws" .xcworkspace)
log="ios/build-$config.log"
status=0
xcodebuild -workspace "$ws" -scheme "$scheme" -configuration "$config" -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' -derivedDataPath ios/build >"$log" 2>&1 || status=$?
rm -rf ios/build/CompilationCache.noindex ios/build/Index.noindex ios/build/ModuleCache.noindex \
  ios/build/SDKExplicitPrecompiledModules ios/build/SDKStatCaches.noindex ios/build/Build/Intermediates.noindex
if [ "$status" -ne 0 ]; then
  echo "BUILD FAILED ($app $config). Errors from $log:"
  grep -E "error:" "$log" | sort -u | head -20
  exit "$status"
fi
ls -d "ios/build/Build/Products/$config-iphonesimulator/"*.app
