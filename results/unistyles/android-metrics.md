# unistyles: startup, memory, scrolling and re-renders (Android)

Run 2026-10-31 on the SM-A156E (Android 16 (API 36), R5CXA2TFTKP), Release build, with `scripts/metrics-run.mjs`.

| Measure | Result |
| --- | --- |
| Startup until readable: launch call to the title in the accessibility tree, median of 10 | 2871 ms (2475–2948) |
| of which the launch call itself, median | 1288 ms |
| `am start -W` TotalTime (first frame of the activity, the splash screen), median | 1166 ms (1140–1217) |
| Clock resolution (one describe poll, median) | 229 ms |
| Memory at idle, 5 s after launch (total PSS, dumpsys meminfo) | 170.5 MiB |
| Memory after the list and every overlay (total PSS, dumpsys meminfo) | 224.6 MiB |
| App CPU time during 5 list flings (7.6 s) | 8950 ms (main thread 2320, JS thread 2730) |
| Janky frames during the flings (dumpsys gfxinfo) | 0 of 1244 (0.0%) |
| Frame time 50th / 90th / 99th percentile | 11 / 18 / 22 ms |

Overlays opened for the memory figure: test-dialog-open, test-sheet-open, test-sheet-open-expoui, test-select, test-menu-open, test-toast-show.

Memory is total PSS from `dumpsys meminfo`, which is not the same measure as iOS phys_footprint, so compare apps within a platform only. CPU time is utime + stime of the app's threads from /proc during the flings (10 ms ticks). Startup until readable is when TalkBack could first read the screen; TotalTime is Android's own first-frame time, which here is the splash screen.

## Re-renders on theme switch

Run 2026-11-02, Debug build with Metro, argent React profiler (`scripts/rerender-run.mjs`). Counts only: Debug timings aren't representative.

| Switch | React commits | Component renders |
| --- | --- | --- |
| light → dark | 4 | 123 |
| dark → brand | 4 | 123 |
| brand → light | 4 | 121 |
