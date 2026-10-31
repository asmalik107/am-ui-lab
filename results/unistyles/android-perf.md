# unistyles: Android timings

Run 2026-10-31 on the SM-A156E (Android 16 (API 36), R5CXA2TFTKP) with `scripts/perf-run.mjs`, Release build. Times are from the tap to the second frame after the update (`src/perf.ts`).

| Measure | Runs | Median (ms) | Range (ms) |
| --- | --- | --- | --- |
| Theme switch | 10 | 70.6 | 54.2–138.5 |
| 200-row list mount | 10 | 150.4 | 137.2–173.2 |
