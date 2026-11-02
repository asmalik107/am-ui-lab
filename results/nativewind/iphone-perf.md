# nativewind: iOS timings

Run 2026-11-02 on the iPhone 12 Pro (iOS 26.6.1, 00008101-001E44222298001E) with `scripts/perf-run.mjs`, Release build. Times are from the tap to the second frame after the update (`src/perf.ts`).

| Measure | Runs | Median (ms) | Range (ms) |
| --- | --- | --- | --- |
| Theme switch | 8 | 32.6 | 32.0–36.8 |
| 200-row list mount | 10 | 118.1 | 98.5–136.3 |
