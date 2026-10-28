# nativewind: startup, memory, scrolling and re-renders

Run 2026-10-27 on the iPhone 17 simulator (iOS 27.0, 11A84A8F-FDB1-4921-8105-D7B17EC3CBC1), Release build, with `scripts/metrics-run.mjs`.

| Measure | Result |
| --- | --- |
| Startup until readable: launch-app call to the title in the accessibility tree, median of 10 | 9381 ms (8447–10059) |
| of which the launch-app call itself, median | 364 ms |
| Clock resolution (one describe poll, median) | 281 ms |
| Memory at idle, 5 s after launch (phys_footprint) | 66.9 MiB |
| Memory after the list and every overlay (phys_footprint) | 135.2 MiB |
| App CPU time during 5 list flings (7.5 s) | 1983 ms (main thread 809, JS thread 1115) |
| Main-thread hangs during the flings | 0 |

Overlays opened for the memory figure: test-dialog-open, test-sheet-open, test-sheet-open-expoui, test-select, test-menu-open, test-toast-show.

Frame hitches were not measured: xctrace's Animation Hitches template fails on the simulator ("Hitches is not supported on this platform"). Startup is when VoiceOver could first read the screen, not first paint, which can be seconds earlier; timing first paint with a screen recording slowed the launches down, so it isn't reported.

## Re-renders on theme switch

Run 2026-10-28, Debug build with Metro, argent React profiler (`scripts/rerender-run.mjs`). Counts only: Debug timings aren't representative.

| Switch | React commits | Component renders |
| --- | --- | --- |
| light → dark | 3 | 460 |
| dark → brand | 3 | 460 |
| brand → light | 3 | 456 |
