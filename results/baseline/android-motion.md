# baseline: Remove animations

Run 2026-11-02 on the SM-A156E (Android 16 (API 36)) with `scripts/motion-test.mjs`. Android's Remove animations sets the animator, transition and window animation scales to 0, which is what React Native's isReduceMotionEnabled and Reanimated read. The phone's variable-rate recording is resampled to 30 fps, so one frame is 33 ms as on iOS. Set before launch.

Each figure is the median of 3 recordings; every recording is in brackets.

| Component | Reduce Motion off | Reduce Motion on |
| --- | --- | --- |
| Dialog | 233 ms (233, 233, 233) | 33 ms (33, 33, 67) |
| Bottom sheet | 233 ms (200, 233, 233) | 67 ms (33, 67, 100) |
