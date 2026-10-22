# tamagui: iOS timings

Run 2026-10-22 on simulator 9B4311A6-178B-4879-9923-B2468FDE9675 with `scripts/perf-run.mjs`, Release build. Times are from the tap to the second frame after the update (`src/perf.ts`).

| Measure | Runs | Median (ms) | Range (ms) |
| --- | --- | --- | --- |
| Theme switch | 7 | 82.4 | 82.2–115.8 |
| 200-row list mount | 10 | 115.1 | 98.0–1798.2 |
