# heroui: Android timings

Run 2026-10-31 on the SM-A156E (Android 16 (API 36), R5CXA2TFTKP) with `scripts/perf-run.mjs`, Release build. Times are from the tap to the second frame after the update (`src/perf.ts`).

| Measure | Runs | Median (ms) | Range (ms) |
| --- | --- | --- | --- |
| Theme switch | 10 | 238.7 | 205.6–324.4 |
| 200-row list mount | 10 | 203.5 | 187.8–252.5 |
