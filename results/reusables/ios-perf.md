# reusables: iOS timings

Run 2026-10-22 on simulator 9B4311A6-178B-4879-9923-B2468FDE9675 with `scripts/perf-run.mjs`, Release build. Times are from the tap to the second frame after the update (`src/perf.ts`).

| Measure | Runs | Median (ms) | Range (ms) |
| --- | --- | --- | --- |
| Theme switch | 8 | 32.5 | 31.2–48.7 |
| 200-row list mount | 10 | 96.5 | 77.9–346.0 |
