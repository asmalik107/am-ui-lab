# tamagui: iOS timings

Run 2026-10-30 on the iPhone 17 simulator (iOS 27.0, 11A84A8F-FDB1-4921-8105-D7B17EC3CBC1) with `scripts/perf-run.mjs`, Release build. Times are from the tap to the second frame after the update (`src/perf.ts`).

| Measure | Runs | Median (ms) | Range (ms) |
| --- | --- | --- | --- |
| Theme switch | 9 | 99.2 | 98.7–115.7 |
| 200-row list mount | 10 | 115.2 | 98.6–115.6 |
