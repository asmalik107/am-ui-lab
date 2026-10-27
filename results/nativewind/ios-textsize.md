# nativewind: largest text size (AX5)

Run 2026-10-27 on the iPhone 17 simulator (iOS 27.0) with `scripts/textsize-test.mjs`. Control heights at the default size (large) against the largest accessibility size (accessibility-extra-extra-extra-large).

- Controls that grew by more than 20%: 16 of 17
- Controls pushed past the screen edge: test-native-switch
- Overlapping controls: none
- Screenshots: textsize-1.png, textsize-2.png, textsize-3.png, textsize-4.png

| Control | Height at default (pt) | Height at AX5 (pt) | Ratio |
| --- | --- | --- | --- |
| test-button | 44 | 72 | 1.63 |
| test-textfield | 42 | 79 | 1.87 |
| test-switch | 44 | 157 | 3.58 |
| test-checkbox | 44 | 157 | 3.58 |
| test-radiogroup-0 | 44 | 79 | 1.79 |
| test-select | 44 | 81 | 1.83 |
| test-dialog-open | 44 | 143 | 3.25 |
| test-sheet-open | 44 | 216 | 4.92 |
| test-tabs-0 | 44 | 146 | 3.32 |
| test-tabs-1 | 44 | 146 | 3.32 |
| test-tabs-2 | 44 | 146 | 3.32 |
| test-native-switch | 28 | 63 | 2.26 |
| test-list-link | 44 | 145 | 3.30 |
| test-slider | 44 | 44 | 1.00 |
| test-accordion-0 | 44 | 72 | 1.63 |
| test-menu-open | 44 | 145 | 3.30 |
| test-segmented-0 | 44 | 143 | 3.25 |
