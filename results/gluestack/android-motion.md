# gluestack: Remove animations

Run 2026-10-31 on the SM-A156E (Android 16 (API 36)) with `scripts/motion-test.mjs`. Android's Remove animations sets the animator, transition and window animation scales to 0, which is what React Native's isReduceMotionEnabled and Reanimated read. The phone's variable-rate recording is resampled to 30 fps, so one frame is 33 ms as on iOS. Set before launch.

| Component | Reduce Motion off | Reduce Motion on |
| --- | --- | --- |
| Dialog | 267 ms | 67 ms |
| Bottom sheet | 233 ms | 33 ms |
