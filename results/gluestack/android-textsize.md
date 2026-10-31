# gluestack: largest text size (font scale 2.0)

Run 2026-10-31 on the SM-A156E (Android 16 (API 36)) with `scripts/textsize-test.mjs`. Control heights at the default font scale (1.0) against the largest (2.0). Android clips bounds at the screen edge, so "pushed past the edge" means the control reaches the edge at 2.0 but not at 1.0.

- Controls that grew by more than 20%: 13 of 16
- Controls pushed past the screen edge: test-native-switch
- Overlapping controls: none
- Screenshots: android-textsize-1.png, android-textsize-2.png, android-textsize-3.png, android-textsize-4.png

| Control | Height at default (dp) | Height at 2.0 (dp) | Ratio |
| --- | --- | --- | --- |
| test-button | 36 | 50 | 1.38 |
| test-textfield | 34 | 46 | 1.34 |
| test-switch | 27 | 35 | 1.29 |
| test-checkbox | 22 | 35 | 1.60 |
| test-radiogroup-0 | 22 | 35 | 1.60 |
| test-select | 40 | 40 | 1.00 |
| test-dialog-open | 36 | 50 | 1.38 |
| test-sheet-open | 38 | 52 | 1.36 |
| test-tabs-0 | 31 | 48 | 1.52 |
| test-tabs-1 | 31 | 48 | 1.52 |
| test-tabs-2 | 31 | 48 | 1.52 |
| test-native-switch | 48 | missing | – |
| test-list-link | 38 | 52 | 1.37 |
| test-slider | 6 | 6 | 1.00 |
| test-accordion-0 | 20 | 34 | 1.68 |
| test-menu-open | 38 | 52 | 1.36 |
| test-segmented-0 | 44 | 44 | 1.00 |
