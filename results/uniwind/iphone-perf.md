# uniwind: iOS timings

Run 2026-11-02 on the iPhone 12 Pro (iOS 26.6.1, 00008101-001E44222298001E) with `scripts/perf-run.mjs`, Release build. Times are from the tap to the second frame after the update (`src/perf.ts`).

| Measure | Runs | Median (ms) | Range (ms) |
| --- | --- | --- | --- |
| Theme switch | 9 | 32.7 | 20.1–32.8 |
| 200-row list mount | 10 | 101.3 | 69.3–102.8 |
