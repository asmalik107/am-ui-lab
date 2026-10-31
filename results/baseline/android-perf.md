# baseline: Android timings

Run 2026-10-30 on the SM-A156E (Android 16 (API 36), R5CXA2TFTKP) with `scripts/perf-run.mjs`, Release build. Times are from the tap to the second frame after the update (`src/perf.ts`).

| Measure | Runs | Median (ms) | Range (ms) |
| --- | --- | --- | --- |
| Theme switch | 10 | 98.9 | 86.7–164.3 |
| 200-row list mount | 10 | 147.6 | 141.4–177.0 |
