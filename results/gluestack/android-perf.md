# gluestack: Android timings

Run 2026-10-30 on the SM-A156E (Android 16 (API 36), R5CXA2TFTKP) with `scripts/perf-run.mjs`, Release build. Times are from the tap to the second frame after the update (`src/perf.ts`).

| Measure | Runs | Median (ms) | Range (ms) |
| --- | --- | --- | --- |
| Theme switch | 10 | 158.1 | 137.4–237.7 |
| 200-row list mount | 10 | 153.6 | 123.7–199.6 |
