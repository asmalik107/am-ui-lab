# baseline: iOS timings

Run 2026-10-27 on the iPhone 17 simulator (iOS 27.0, 11A84A8F-FDB1-4921-8105-D7B17EC3CBC1) with `scripts/perf-run.mjs`, Release build. Times are from the tap to the second frame after the update (`src/perf.ts`).

| Measure | Runs | Median (ms) | Range (ms) |
| --- | --- | --- | --- |
| Theme switch | 9 | 32.0 | 29.8–32.4 |
| 200-row list mount | 10 | 81.8 | 81.2–98.8 |
