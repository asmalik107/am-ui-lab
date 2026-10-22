# tamagui: largest text size (AX5)

Run 2026-10-22 with `scripts/textsize-test.mjs`. Control heights at the default size (large) against the largest accessibility size (accessibility-extra-extra-extra-large).

- Controls that grew by more than 20%: 9 of 11
- Controls pushed past the screen edge: test-native-switch
- Overlapping controls: none
- Screenshots: textsize-1.png, textsize-2.png, textsize-3.png, textsize-4.png

| Control | Height at default (pt) | Height at AX5 (pt) | Ratio |
| --- | --- | --- | --- |
| test-button | 44 | 90 | 2.04 |
| test-textfield | 42 | 84 | 2.01 |
| test-switch | 22 | 22 | 1.00 |
| test-checkbox | missing | missing | – |
| test-radiogroup-0 | 22 | 22 | 1.00 |
| test-select | missing | missing | – |
| test-dialog-open | 44 | 161 | 3.66 |
| test-sheet-open | 44 | 232 | 5.28 |
| test-tabs-0 | 44 | 233 | 5.30 |
| test-tabs-1 | 44 | 233 | 5.30 |
| test-tabs-2 | 44 | 233 | 5.30 |
| test-native-switch | 28 | 63 | 2.26 |
| test-list-link | 44 | 161 | 3.66 |
