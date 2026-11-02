# nativewind: startup, memory, scrolling and re-renders (Android)

Run 2026-10-31 on the SM-A156E (Android 16 (API 36), R5CXA2TFTKP), Release build, with `scripts/metrics-run.mjs`.

| Measure | Result |
| --- | --- |
| Startup until readable: launch call to the title in the accessibility tree, median of 10 | 3023 ms (2881–3129) |
| of which the launch call itself, median | 1465 ms |
| `am start -W` TotalTime (first frame of the activity, the splash screen), median | 1334 ms (1304–1443) |
| Clock resolution (one describe poll, median) | 231 ms |
| Memory at idle, 5 s after launch (total PSS, dumpsys meminfo) | 164.4 MiB |
| Memory after the list and every overlay (total PSS, dumpsys meminfo) | 196.8 MiB |
| App CPU time during 5 list flings (7.7 s) | 8770 ms (main thread 2140, JS thread 2890) |
| Janky frames during the flings (dumpsys gfxinfo) | 0 of 1212 (0.0%) |
| Frame time 50th / 90th / 99th percentile | 11 / 16 / 20 ms |

Overlays opened for the memory figure: test-dialog-open, test-sheet-open, test-sheet-open-expoui, test-select, test-menu-open, test-toast-show.

Memory is total PSS from `dumpsys meminfo`, which is not the same measure as iOS phys_footprint, so compare apps within a platform only. CPU time is utime + stime of the app's threads from /proc during the flings (10 ms ticks). Startup until readable is when TalkBack could first read the screen; TotalTime is Android's own first-frame time, which here is the splash screen.

## Re-renders on theme switch

Run 2026-11-02, Debug build with Metro, argent React profiler (`scripts/rerender-run.mjs`). Counts only: Debug timings aren't representative.

| Switch | React commits | Component renders |
| --- | --- | --- |
| light → dark | 3 | 457 |
| dark → brand | 3 | 457 |
| brand → light | 3 | 453 |
