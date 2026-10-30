# uniwind: Android timings

Run 2026-10-28 on the Pixel 9 Pro 2 emulator (Android 16 (API 36), emulator-5554) with `scripts/perf-run.mjs`, Release build. Times are from the tap to the second frame after the update (`src/perf.ts`).

| Measure | Runs | Median (ms) | Range (ms) |
| --- | --- | --- | --- |
| Theme switch | 10 | 35.9 | 31.8–40.0 |
| 200-row list mount | 10 | 100.8 | 99.8–102.8 |
