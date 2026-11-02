# tamagui: startup, memory, scrolling and re-renders (iOS)

Run 2026-11-02 on the iPhone 12 Pro (iOS 26.6.1, 00008101-001E44222298001E), Release build, with `scripts/metrics-run.mjs`.

| Measure | Result |
| --- | --- |
| Startup until readable: launch call to the title in the accessibility tree, median of 10 | 1317 ms (1182–1496) |
| of which the launch call itself, median | 536 ms |
| Clock resolution (one describe poll, median) | 1357 ms |
| Memory at idle, 5 s after launch (phys_footprint) | 75.1 MiB |
| Memory after the list and every overlay (phys_footprint) | 143.7 MiB |
| App CPU time during 5 list flings (43.2 s) | 18586 ms (main thread 15277, JS thread 3036) |
| Frame hitches during the flings (Instruments Animation Hitches) | 1 hitches, 17 ms in all; hitch time ratio 0.4 ms/s |

Overlays opened for the memory figure: test-dialog-open, test-sheet-open, test-sheet-open-expoui, test-select, test-menu-open, test-toast-show.

Run on a cabled iPhone. Memory is phys_footprint from Instruments' Activity Monitor, the same measure as on the simulator. Frame hitches are from Instruments' Animation Hitches template, recorded during the flings. Each fling is injected by XCUITest, which takes a few seconds and makes the app answer accessibility queries, so CPU time includes that work: the same for every app, but not comparable with the simulator. Startup is when VoiceOver could first read the screen, not first paint.

## Re-renders on theme switch

Run 2026-10-30, Debug build with Metro, argent React profiler (`scripts/rerender-run.mjs`). Counts only: Debug timings aren't representative.

Not measured: the Debug build aborts on a React Native Yoga layout assertion (__assert_rtn in YogaLayoutableShadowNode::layout, crash report UILabTamagui-2026-10-30-171250.ips), as it did on 28 October; Release builds are unaffected
