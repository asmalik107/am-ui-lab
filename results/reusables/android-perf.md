# reusables: Android timings

Run 2026-10-31 on the SM-A156E (Android 16 (API 36), R5CXA2TFTKP) with `scripts/perf-run.mjs`, Release build. Times are from the tap to the second frame after the update (`src/perf.ts`).

| Measure | Runs | Median (ms) | Range (ms) |
| --- | --- | --- | --- |
| Theme switch | 10 | 96.8 | 82.2–123.2 |
| 200-row list mount | 10 | 161.3 | 143.4–198.9 |
