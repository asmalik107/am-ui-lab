# unistyles: iOS timings

Run 2026-10-22 on simulator 9B4311A6-178B-4879-9923-B2468FDE9675 with `scripts/perf-run.mjs`, Release build. Times are from the tap to the second frame after the update (`src/perf.ts`).

| Measure | Runs | Median (ms) | Range (ms) |
| --- | --- | --- | --- |
| Theme switch | 9 | 31.6 | 31.3–32.5 |
| 200-row list mount | 10 | 83.1 | 82.0–114.9 |
