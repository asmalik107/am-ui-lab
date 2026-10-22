# gluestack: largest text size (AX5)

Run 2026-10-22 with `scripts/textsize-test.mjs`. Control heights at the default size (large) against the largest accessibility size (accessibility-extra-extra-extra-large).

- Controls that grew by more than 20%: 12 of 13
- Controls pushed past the screen edge: test-tabs-2, test-native-switch
- Overlapping controls: none
- Screenshots: textsize-1.png, textsize-2.png, textsize-3.png, textsize-4.png

| Control | Height at default (pt) | Height at AX5 (pt) | Ratio |
| --- | --- | --- | --- |
| test-button | 36 | 88 | 2.44 |
| test-textfield | 34 | 76 | 2.25 |
| test-switch | 28 | 28 | 1.00 |
| test-checkbox | 22 | 157 | 7.15 |
| test-radiogroup-0 | 22 | 79 | 3.58 |
| test-select | 40 | 70 | 1.76 |
| test-dialog-open | 36 | 159 | 4.42 |
| test-sheet-open | 38 | 232 | 6.11 |
| test-tabs-0 | 29 | 72 | 2.47 |
| test-tabs-1 | 29 | 72 | 2.47 |
| test-tabs-2 | 29 | 72 | 2.47 |
| test-native-switch | 28 | 63 | 2.26 |
| test-list-link | 38 | 161 | 4.24 |
