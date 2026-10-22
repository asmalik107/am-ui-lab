# heroui: largest text size (AX5)

Run 2026-10-22 with `scripts/textsize-test.mjs`. Control heights at the default size (large) against the largest accessibility size (accessibility-extra-extra-extra-large).

- Controls that grew by more than 20%: 9 of 13
- Controls pushed past the screen edge: test-tabs-2, test-native-switch
- Overlapping controls: none
- Screenshots: textsize-1.png, textsize-2.png, textsize-3.png, textsize-4.png

| Control | Height at default (pt) | Height at AX5 (pt) | Ratio |
| --- | --- | --- | --- |
| test-button | 48 | 48 | 1.00 |
| test-textfield | 46 | 60 | 1.30 |
| test-switch | 24 | 172 | 7.15 |
| test-checkbox | 24 | 172 | 7.15 |
| test-radiogroup-0 | 24 | 86 | 3.58 |
| test-select | 50 | 112 | 2.24 |
| test-dialog-open | 48 | 48 | 1.00 |
| test-sheet-open | 48 | 48 | 1.00 |
| test-tabs-0 | 36 | 98 | 2.72 |
| test-tabs-1 | 36 | 98 | 2.72 |
| test-tabs-2 | 36 | 98 | 2.72 |
| test-native-switch | 28 | 63 | 2.26 |
| test-list-link | 48 | 48 | 1.00 |
