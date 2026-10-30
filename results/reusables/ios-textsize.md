# reusables: largest text size (AX5)

Run 2026-10-30 on the iPhone 17 simulator (iOS 27.0) with `scripts/textsize-test.mjs`. Control heights at the default size (large) against the largest accessibility size (accessibility-extra-extra-extra-large).

- Controls that grew by more than 20%: 2 of 17
- Controls pushed past the screen edge: test-tabs-0, test-tabs-2, test-native-switch
- Overlapping controls: none
- Screenshots: textsize-1.png, textsize-2.png, textsize-3.png, textsize-4.png

| Control | Height at default (pt) | Height at AX5 (pt) | Ratio |
| --- | --- | --- | --- |
| test-button | 40 | 40 | 1.00 |
| test-textfield | 38 | 38 | 1.00 |
| test-switch | 19 | 18 | 0.98 |
| test-checkbox | 16 | 16 | 1.00 |
| test-radiogroup-0 | 16 | 16 | 1.00 |
| test-select | 40 | 40 | 1.00 |
| test-dialog-open | 40 | 40 | 1.00 |
| test-sheet-open | 40 | 40 | 1.00 |
| test-tabs-0 | 30 | 30 | 1.00 |
| test-tabs-1 | 30 | 30 | 1.00 |
| test-tabs-2 | 30 | 30 | 1.00 |
| test-native-switch | 28 | 63 | 2.26 |
| test-list-link | 40 | 40 | 1.00 |
| test-slider | 44 | 44 | 1.00 |
| test-accordion-0 | 52 | 104 | 1.99 |
| test-menu-open | 40 | 40 | 1.00 |
| test-segmented-0 | 40 | 40 | 1.00 |
