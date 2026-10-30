# unistyles: startup, memory, scrolling and re-renders (Android)

Run 2026-10-28 on the Pixel 9 Pro 2 emulator (Android 16 (API 36), emulator-5554), Release build, with `scripts/metrics-run.mjs`.

| Measure | Result |
| --- | --- |
| Startup until readable: launch call to the title in the accessibility tree, median of 10 | 1907 ms (1883–1999) |
| of which the launch call itself, median | 667 ms |
| `am start -W` TotalTime (first frame of the activity, the splash screen), median | 616 ms (594–680) |
| Clock resolution (one describe poll, median) | 178 ms |
| Memory at idle, 5 s after launch (total PSS, dumpsys meminfo) | 136.2 MiB |
| Memory after the list and every overlay (total PSS, dumpsys meminfo) | 180.9 MiB |
| App CPU time during 5 list flings (7.5 s) | 3250 ms (main thread 650, JS thread 680) |
| Janky frames during the flings (dumpsys gfxinfo) | 9 of 409 (2.2%) |
| Frame time 50th / 90th / 99th percentile | 17 / 18 / 21 ms |

Overlays opened for the memory figure: test-dialog-open, test-sheet-open, test-sheet-open-expoui, test-select, test-menu-open, test-toast-show.

Memory is total PSS from `dumpsys meminfo`, which is not the same measure as iOS phys_footprint, so compare apps within a platform only. CPU time is utime + stime of the app's threads from /proc during the flings (10 ms ticks). Startup until readable is when TalkBack could first read the screen; TotalTime is Android's own first-frame time, which here is the splash screen.
