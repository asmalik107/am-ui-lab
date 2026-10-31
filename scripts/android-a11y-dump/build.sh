#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
sdk="${ANDROID_HOME:?ANDROID_HOME is not set}"
bt="$sdk/build-tools/36.0.0"
jar="$sdk/platforms/android-36/android.jar"
rm -rf build && mkdir -p build/classes
javac -source 17 -target 17 -cp "$jar" -d build/classes $(find src -name '*.java')
"$bt/d8" --lib "$jar" --min-api 30 --output build $(find build/classes -name '*.class')
"$bt/aapt2" link -o build/unsigned.apk --manifest AndroidManifest.xml -I "$jar"
(cd build && zip -q unsigned.apk classes.dex)
"$bt/zipalign" -f 4 build/unsigned.apk build/aligned.apk
"$bt/apksigner" sign --ks "$HOME/.android/debug.keystore" --ks-pass pass:android --key-pass pass:android --out build/a11y-dump.apk build/aligned.apk
if [ -n "${1:-}" ]; then adb -s "$1" install -r build/a11y-dump.apk; fi
