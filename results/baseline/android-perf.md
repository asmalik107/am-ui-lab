# baseline: Android timings

Run 2026-10-28 on the Pixel 9 Pro 2 emulator (Android 16 (API 36), emulator-5554) with `scripts/perf-run.mjs`, Release build. Times are from the tap to the second frame after the update (`src/perf.ts`).

| Measure | Runs | Median (ms) | Range (ms) |
| --- | --- | --- | --- |
| Theme switch | 10 | 33.5 | 31.5–40.6 |
| 200-row list mount | 10 | 101.0 | 100.1–117.3 |
