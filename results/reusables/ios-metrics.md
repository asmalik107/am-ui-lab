# reusables: startup, memory, scrolling and re-renders

Run 2026-10-30 on the iPhone 17 simulator (iOS 27.0, 11A84A8F-FDB1-4921-8105-D7B17EC3CBC1), Release build, with `scripts/metrics-run.mjs`.

| Measure | Result |
| --- | --- |
| Startup until readable: launch-app call to the title in the accessibility tree, median of 10 | 7855 ms (7809–8134) |
| of which the launch-app call itself, median | 318 ms |
| Clock resolution (one describe poll, median) | 186 ms |
| Memory at idle, 5 s after launch (phys_footprint) | 75.5 MiB |
| Memory after the list and every overlay (phys_footprint) | 143.0 MiB |
| App CPU time during 5 list flings (7.5 s) | 1908 ms (main thread 889, JS thread 969) |
| Main-thread hangs during the flings | 0 |

Overlays opened for the memory figure: test-dialog-open, test-sheet-open, test-sheet-open-expoui, test-select, test-menu-open, test-toast-show.

Frame hitches were not measured: xctrace's Animation Hitches template fails on the simulator ("Hitches is not supported on this platform"). Startup is when VoiceOver could first read the screen, not first paint, which can be seconds earlier; timing first paint with a screen recording slowed the launches down, so it isn't reported.

## Re-renders on theme switch

Run 2026-10-30, Debug build with Metro, argent React profiler (`scripts/rerender-run.mjs`). Counts only: Debug timings aren't representative.

| Switch | React commits | Component renders |
| --- | --- | --- |
| light → dark | 4 | 603 |
| dark → brand | 5 | 608 |
| brand → light | 4 | 356 |
