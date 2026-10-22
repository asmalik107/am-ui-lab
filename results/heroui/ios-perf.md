# heroui: iOS timings

Run 2026-10-22 on simulator 9B4311A6-178B-4879-9923-B2468FDE9675 with `scripts/perf-run.mjs`, Release build. Times are from the tap to the second frame after the update (`src/perf.ts`).

| Measure | Runs | Median (ms) | Range (ms) |
| --- | --- | --- | --- |
| Theme switch | 10 | 32.0 | 30.6–48.8 |
| 200-row list mount | 10 | 82.5 | 80.2–114.6 |
