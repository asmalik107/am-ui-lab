# reusables: largest text size (font scale 2.0)

Run 2026-10-31 on the SM-A156E (Android 16 (API 36)) with `scripts/textsize-test.mjs`. Control heights at the default font scale (1.0) against the largest (2.0). Android clips bounds at the screen edge, so "pushed past the edge" means the control reaches the edge at 2.0 but not at 1.0.

- Controls that grew by more than 20%: 1 of 16
- Controls pushed past the screen edge: test-native-switch
- Overlapping controls: none
- Screenshots: android-textsize-1.png, android-textsize-2.png, android-textsize-3.png, android-textsize-4.png

| Control | Height at default (dp) | Height at 2.0 (dp) | Ratio |
| --- | --- | --- | --- |
| test-button | 40 | 40 | 1.00 |
| test-textfield | 40 | 40 | 1.00 |
| test-switch | 18 | 18 | 1.02 |
| test-checkbox | 16 | 16 | 1.00 |
| test-radiogroup-0 | 16 | 16 | 1.00 |
| test-select | 40 | 40 | 1.00 |
| test-dialog-open | 40 | 40 | 1.00 |
| test-sheet-open | 40 | 40 | 1.01 |
| test-tabs-0 | 30 | 30 | 1.00 |
| test-tabs-1 | 30 | 30 | 1.00 |
| test-tabs-2 | 30 | 30 | 1.00 |
| test-native-switch | 48 | missing | – |
| test-list-link | 40 | 40 | 1.00 |
| test-slider | 44 | 44 | 1.00 |
| test-accordion-0 | 52 | 66 | 1.27 |
| test-menu-open | 40 | 40 | 1.00 |
| test-segmented-0 | 40 | 40 | 1.00 |
