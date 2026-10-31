# tamagui: Android timings

Run 2026-10-31 on the SM-A156E (Android 16 (API 36), R5CXA2TFTKP) with `scripts/perf-run.mjs`, Release build. Times are from the tap to the second frame after the update (`src/perf.ts`).

| Measure | Runs | Median (ms) | Range (ms) |
| --- | --- | --- | --- |
| Theme switch | 10 | 629.6 | 583.4–675.8 |
| 200-row list mount | 10 | 365.1 | 290.0–446.5 |
