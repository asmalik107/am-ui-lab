# nativewind: largest text size (AX5)

Run 2026-10-23 with `scripts/textsize-test.mjs`. Control heights at the default size (large) against the largest accessibility size (accessibility-extra-extra-extra-large).

- Controls that grew by more than 20%: 13 of 13
- Controls pushed past the screen edge: test-native-switch
- Overlapping controls: none
- Screenshots: textsize-1.png, textsize-2.png, textsize-3.png, textsize-4.png

| Control | Height at default (pt) | Height at AX5 (pt) | Ratio |
| --- | --- | --- | --- |
| test-button | 300 | 1071 | 3.57 |
| test-textfield | 352 | 1257 | 3.57 |
| test-switch | 352 | 2514 | 7.14 |
| test-checkbox | 352 | 2514 | 7.14 |
| test-radiogroup-0 | 352 | 1257 | 3.57 |
| test-select | 354 | 1259 | 3.56 |
| test-dialog-open | 300 | 2143 | 7.14 |
| test-sheet-open | 302 | 3216 | 10.65 |
| test-tabs-0 | 303 | 2146 | 7.08 |
| test-tabs-1 | 303 | 2146 | 7.08 |
| test-tabs-2 | 303 | 2146 | 7.08 |
| test-native-switch | 28 | 63 | 2.26 |
| test-list-link | 302 | 2145 | 7.10 |
