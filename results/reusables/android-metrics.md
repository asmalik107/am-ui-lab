# reusables: startup, memory, scrolling and re-renders (Android)

Run 2026-10-31 on the SM-A156E (Android 16 (API 36), R5CXA2TFTKP), Release build, with `scripts/metrics-run.mjs`.

| Measure | Result |
| --- | --- |
| Startup until readable: launch call to the title in the accessibility tree, median of 10 | 3213 ms (3129–3397) |
| of which the launch call itself, median | 1664 ms |
| `am start -W` TotalTime (first frame of the activity, the splash screen), median | 1555 ms (1493–1718) |
| Clock resolution (one describe poll, median) | 192 ms |
| Memory at idle, 5 s after launch (total PSS, dumpsys meminfo) | 173.8 MiB |
| Memory after the list and every overlay (total PSS, dumpsys meminfo) | 221.8 MiB |
| App CPU time during 5 list flings (7.6 s) | 8390 ms (main thread 2220, JS thread 2540) |
| Janky frames during the flings (dumpsys gfxinfo) | 1 of 1240 (0.1%) |
| Frame time 50th / 90th / 99th percentile | 11 / 16 / 21 ms |

Overlays opened for the memory figure: test-dialog-open, test-sheet-open, test-sheet-open-expoui, test-select, test-menu-open, test-toast-show.

Memory is total PSS from `dumpsys meminfo`, which is not the same measure as iOS phys_footprint, so compare apps within a platform only. CPU time is utime + stime of the app's threads from /proc during the flings (10 ms ticks). Startup until readable is when TalkBack could first read the screen; TotalTime is Android's own first-frame time, which here is the splash screen.
