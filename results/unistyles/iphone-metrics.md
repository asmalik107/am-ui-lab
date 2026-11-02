# unistyles: startup, memory, scrolling and re-renders (iOS)

Run 2026-11-02 on the iPhone 12 Pro (iOS 26.6.1, 00008101-001E44222298001E), Release build, with `scripts/metrics-run.mjs`.

| Measure | Result |
| --- | --- |
| Startup until readable: launch call to the title in the accessibility tree, median of 10 | 1302 ms (825–1513) |
| of which the launch call itself, median | 562 ms |
| Clock resolution (one describe poll, median) | 484 ms |
| Memory at idle, 5 s after launch (phys_footprint) | 56.6 MiB |
| Memory after the list and every overlay (phys_footprint) | 123.8 MiB |
| App CPU time during 5 list flings (25.1 s) | 7216 ms (main thread 4927, JS thread 2115) |
| Frame hitches during the flings (Instruments Animation Hitches) | 1 hitches, 17 ms in all; hitch time ratio 0.7 ms/s |

Overlays opened for the memory figure: test-dialog-open, test-sheet-open, test-sheet-open-expoui, test-select, test-menu-open, test-toast-show.

Run on a cabled iPhone. Memory is phys_footprint from Instruments' Activity Monitor, the same measure as on the simulator. Frame hitches are from Instruments' Animation Hitches template, recorded during the flings. Each fling is injected by XCUITest, which takes a few seconds and makes the app answer accessibility queries, so CPU time includes that work: the same for every app, but not comparable with the simulator. Startup is when VoiceOver could first read the screen, not first paint.

## Re-renders on theme switch

Run 2026-10-30, Debug build with Metro, argent React profiler (`scripts/rerender-run.mjs`). Counts only: Debug timings aren't representative.

| Switch | React commits | Component renders |
| --- | --- | --- |
| light → dark | 4 | 128 |
| dark → brand | 5 | 128 |
| brand → light | 5 | 126 |
