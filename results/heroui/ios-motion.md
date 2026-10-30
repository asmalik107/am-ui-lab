# heroui: Reduce Motion

Run 2026-10-30 on the iPhone 17 simulator (iOS 27.0) with `scripts/motion-test.mjs`. Transition duration of the open, from a real-time 30 fps screen recording: the run of visibly changing frames (mean luma difference above 1.0) around the largest change, which is the overlay appearing. An instant change is one frame (33 ms); an animation lasts as long as it runs. Reduce Motion was set before launch; switching it while the app runs was not tested.

| Component | Reduce Motion off | Reduce Motion on |
| --- | --- | --- |
| Dialog | 233 ms | 33 ms |
| Bottom sheet | 567 ms | 67 ms |
