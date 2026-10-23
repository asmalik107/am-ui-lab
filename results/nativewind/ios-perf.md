# nativewind: iOS timings

Run 2026-10-23 on simulator 9B4311A6-178B-4879-9923-B2468FDE9675 with `scripts/perf-run.mjs`, Release build. Times are from the tap to the second frame after the update (`src/perf.ts`).

| Measure | Runs | Median (ms) | Range (ms) |
| --- | --- | --- | --- |
| Theme switch | 8 | 31.4 | 31.1–32.4 |
| 200-row list mount | 10 | 98.8 | 81.9–100.0 |
