# gluestack: startup, memory, scrolling and re-renders (Android)

Run 2026-10-31 on the SM-A156E (Android 16 (API 36), R5CXA2TFTKP), Release build, with `scripts/metrics-run.mjs`.

| Measure | Result |
| --- | --- |
| Startup until readable: launch call to the title in the accessibility tree, median of 10 | 3344 ms (3186–3420) |
| of which the launch call itself, median | 1665 ms |
| `am start -W` TotalTime (first frame of the activity, the splash screen), median | 1559 ms (1523–1634) |
| Clock resolution (one describe poll, median) | 198 ms |
| Memory at idle, 5 s after launch (total PSS, dumpsys meminfo) | 182.3 MiB |
| Memory after the list and every overlay (total PSS, dumpsys meminfo) | 285.7 MiB |
| App CPU time during 5 list flings (7.5 s) | 8890 ms (main thread 2280, JS thread 2670) |
| Janky frames during the flings (dumpsys gfxinfo) | 0 of 1232 (0.0%) |
| Frame time 50th / 90th / 99th percentile | 11 / 18 / 22 ms |

Overlays opened for the memory figure: test-dialog-open, test-sheet-open, test-sheet-open-expoui, test-select, test-menu-open, test-toast-show.

Memory is total PSS from `dumpsys meminfo`, which is not the same measure as iOS phys_footprint, so compare apps within a platform only. CPU time is utime + stime of the app's threads from /proc during the flings (10 ms ticks). Startup until readable is when TalkBack could first read the screen; TotalTime is Android's own first-frame time, which here is the splash screen.

## Re-renders on theme switch

Run 2026-11-02, Debug build with Metro, argent React profiler (`scripts/rerender-run.mjs`). Counts only: Debug timings aren't representative.

| Switch | React commits | Component renders |
| --- | --- | --- |
| light → dark | 5 | 520 |
| dark → brand | 5 | 515 |
| brand → light | 5 | 510 |
