# baseline: startup, memory, scrolling and re-renders

Run 2026-10-27 on the iPhone 17 simulator (iOS 27.0, 11A84A8F-FDB1-4921-8105-D7B17EC3CBC1), Release build, with `scripts/metrics-run.mjs`.

| Measure | Result |
| --- | --- |
| Startup, launch-app to title in the accessibility tree, median of 10 | 4826 ms (4587–5190) |
| of which the launch-app call itself, median | 338 ms |
| Clock resolution (one describe poll, median) | 190 ms |
| Memory at idle, 5 s after launch (phys_footprint) | 62.6 MiB |
| Memory after the list and every overlay (phys_footprint) | 122.0 MiB |
| App CPU time during 5 list flings (7.5 s) | 1945 ms (main thread 943, JS thread 953) |
| Main-thread hangs during the flings | 0 |

Overlays opened for the memory figure: test-dialog-open, test-sheet-open, test-sheet-open-expoui, test-select, test-menu-open, test-toast-show.

Frame hitches were not measured: xctrace's Animation Hitches template fails on the simulator ("Hitches is not supported on this platform"). The startup time includes argent's launch-app call, which also prepares its native-devtools injection, so it is comparable between apps but larger than the app's own launch.
