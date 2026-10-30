# unistyles: startup, memory, scrolling and re-renders

Run 2026-10-30 on the iPhone 17 simulator (iOS 27.0, 11A84A8F-FDB1-4921-8105-D7B17EC3CBC1), Release build, with `scripts/metrics-run.mjs`.

| Measure | Result |
| --- | --- |
| Startup until readable: launch-app call to the title in the accessibility tree, median of 10 | 7948 ms (7768–8687) |
| of which the launch-app call itself, median | 338 ms |
| Clock resolution (one describe poll, median) | 182 ms |
| Memory at idle, 5 s after launch (phys_footprint) | 64.2 MiB |
| Memory after the list and every overlay (phys_footprint) | 125.2 MiB |
| App CPU time during 5 list flings (7.6 s) | 1694 ms (main thread 863, JS thread 804) |
| Main-thread hangs during the flings | 0 |

Overlays opened for the memory figure: test-dialog-open, test-sheet-open, test-sheet-open-expoui, test-select, test-menu-open, test-toast-show.

Frame hitches were not measured: xctrace's Animation Hitches template fails on the simulator ("Hitches is not supported on this platform"). Startup is when VoiceOver could first read the screen, not first paint, which can be seconds earlier; timing first paint with a screen recording slowed the launches down, so it isn't reported.

## Re-renders on theme switch

Run 2026-10-28, Debug build with Metro, argent React profiler (`scripts/rerender-run.mjs`). Counts only: Debug timings aren't representative.

| Switch | React commits | Component renders |
| --- | --- | --- |
| light → dark | 4 | 128 |
| dark → brand | 5 | 128 |
| brand → light | 5 | 126 |
