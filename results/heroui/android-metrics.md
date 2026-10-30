# heroui: startup, memory, scrolling and re-renders (Android)

Run 2026-10-30 on the SM-A156E (Android 16 (API 36), R5CXA2TFTKP), Release build, with `scripts/metrics-run.mjs`.

| Measure | Result |
| --- | --- |
| Startup until readable: launch call to the title in the accessibility tree, median of 10 | 3345 ms (3197–3419) |
| of which the launch call itself, median | 1696 ms |
| `am start -W` TotalTime (first frame of the activity, the splash screen), median | 1583 ms (1555–1696) |
| Clock resolution (one describe poll, median) | 1390 ms |
| Memory at idle, 5 s after launch (total PSS, dumpsys meminfo) | 197.8 MiB |
| Memory after the list and every overlay (total PSS, dumpsys meminfo) | 416.3 MiB |
| App CPU time during 5 list flings (7.5 s) | 10310 ms (main thread 3530, JS thread 2570) |
| Janky frames during the flings (dumpsys gfxinfo) | 0 of 1260 (0.0%) |
| Frame time 50th / 90th / 99th percentile | 18 / 20 / 25 ms |

Overlays opened for the memory figure: test-dialog-open, test-sheet-open, test-sheet-open-expoui, test-select, test-menu-open, test-toast-show.

Memory is total PSS from `dumpsys meminfo`, which is not the same measure as iOS phys_footprint, so compare apps within a platform only. CPU time is utime + stime of the app's threads from /proc during the flings (10 ms ticks). Startup until readable is when TalkBack could first read the screen; TotalTime is Android's own first-frame time, which here is the splash screen.
