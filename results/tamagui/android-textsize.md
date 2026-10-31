# tamagui: largest text size (font scale 2.0)

Run 2026-10-31 on the SM-A156E (Android 16 (API 36)) with `scripts/textsize-test.mjs`. Control heights at the default font scale (1.0) against the largest (2.0). Android clips bounds at the screen edge, so "pushed past the edge" means the control reaches the edge at 2.0 but not at 1.0.

- Controls that grew by more than 20%: 5 of 16
- Controls pushed past the screen edge: test-native-switch
- Overlapping controls: none
- Screenshots: android-textsize-1.png, android-textsize-2.png, android-textsize-3.png, android-textsize-4.png

| Control | Height at default (dp) | Height at 2.0 (dp) | Ratio |
| --- | --- | --- | --- |
| test-button | 44 | 52 | 1.19 |
| test-textfield | 44 | 56 | 1.27 |
| test-switch | 22 | 22 | 1.00 |
| test-checkbox | 22 | 22 | 1.00 |
| test-radiogroup-0 | 22 | 22 | 1.00 |
| test-select | 44 | 52 | 1.19 |
| test-dialog-open | 44 | 52 | 1.19 |
| test-sheet-open | 44 | 52 | 1.19 |
| test-tabs-0 | 44 | 87 | 1.98 |
| test-tabs-1 | 44 | 87 | 1.98 |
| test-tabs-2 | 44 | 87 | 1.98 |
| test-native-switch | 48 | missing | – |
| test-list-link | 44 | 52 | 1.19 |
| test-slider | 28 | 28 | 0.99 |
| test-accordion-0 | 53 | 69 | 1.30 |
| test-menu-open | 44 | 52 | 1.19 |
| test-segmented-0 | 44 | 44 | 1.01 |
