# reusables: iOS timings

Run 2026-11-02 on the iPhone 12 Pro (iOS 26.6.1, 00008101-001E44222298001E) with `scripts/perf-run.mjs`, Release build. Times are from the tap to the second frame after the update (`src/perf.ts`).

| Measure | Runs | Median (ms) | Range (ms) |
| --- | --- | --- | --- |
| Theme switch | 9 | 32.5 | 32.3–65.6 |
| 200-row list mount | 10 | 94.0 | 81.7–119.6 |
