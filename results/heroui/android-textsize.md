# heroui: largest text size (font scale 2.0)

Run 2026-10-31 on the SM-A156E (Android 16 (API 36)) with `scripts/textsize-test.mjs`. Control heights at the default font scale (1.0) against the largest (2.0). Android clips bounds at the screen edge, so "pushed past the edge" means the control reaches the edge at 2.0 but not at 1.0.

- Controls that grew by more than 20%: 9 of 16
- Controls pushed past the screen edge: test-native-switch
- Overlapping controls: none
- Screenshots: android-textsize-1.png, android-textsize-2.png, android-textsize-3.png, android-textsize-4.png

| Control | Height at default (dp) | Height at 2.0 (dp) | Ratio |
| --- | --- | --- | --- |
| test-button | 48 | 48 | 1.00 |
| test-textfield | 48 | 60 | 1.24 |
| test-switch | 24 | 36 | 1.50 |
| test-checkbox | 24 | 36 | 1.50 |
| test-radiogroup-0 | 24 | 36 | 1.50 |
| test-select | 50 | 62 | 1.24 |
| test-dialog-open | 48 | 48 | 1.00 |
| test-sheet-open | 48 | 48 | 1.00 |
| test-tabs-0 | 36 | 48 | 1.33 |
| test-tabs-1 | 36 | 48 | 1.33 |
| test-tabs-2 | 36 | 48 | 1.33 |
| test-native-switch | 48 | missing | – |
| test-list-link | 48 | 48 | 1.00 |
| test-slider | 20 | 20 | 0.98 |
| test-accordion-0 | 52 | 66 | 1.27 |
| test-menu-open | 48 | 48 | 1.00 |
| test-segmented-0 | 44 | 44 | 0.99 |
