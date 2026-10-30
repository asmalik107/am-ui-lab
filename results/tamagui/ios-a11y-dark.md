# tamagui: iOS accessibility audit, dark theme

Run 2026-10-30 on the iPhone 17 simulator (iOS 27.0, 11A84A8F-FDB1-4921-8105-D7B17EC3CBC1), Release build, dark theme, with `scripts/a11y-audit.mjs`. 36/57 checks passed.

Traits and sizes come from the view hierarchy (argent `native-describe-screen`). Reachability (what is exposed while an overlay is open) and taps come from the system accessibility tree (argent `describe`). Both show what VoiceOver is given, not what it speaks; spoken output needs a device.

| Component | Check | Result | Detail |
| --- | --- | --- | --- |
| Button | name, role, state | pass | label="Save workout" value="" traits=[button] 370×44pt |
| Button | target ≥ 44pt | pass | 370×44pt |
| Button (disabled) | name, role, state | **fail** | missing |
| Button (loading) | name, role, state | **fail** | missing |
| Text field | name, role, state | pass | label="Email" value="" traits=[] 368×42pt |
| Switch | name, role, state | **fail** | label="" value="" traits=[] 42×22pt |
| Switch | target ≥ 44pt | **fail** | 42×22pt |
| Checkbox | name, role, state | **fail** | missing |
| Radio option | name, role, state | pass | label="" value="radio button, checked" traits=[] 22×22pt |
| Radio option | target ≥ 44pt | **fail** | 22×22pt |
| Select trigger | name, role, state | **fail** | missing |
| Tab (selected) | name, role, state | **fail** | label="Today" value="" traits=[selected] 123×44pt |
| Tab (selected) | target ≥ 44pt | pass | 123×44pt |
| Native switch (@expo/ui) | name, role, state | pass | label="Sync with Health (native control)" value="0" traits=[button, toggleButton] 317×28pt |
| Native switch (@expo/ui) | target ≥ 44pt | **fail** | 317×28pt |
| Radio group | all options exposed | pass | 3 options found |
| Radio group | group label read | pass | label text "Experience level" in tree |
| Text field | error shown | pass | error text in tree |
| Text field | error reachable from field | pass | label="Email" value="not-an-email" traits=[] 368×42pt hint="We'll send your plan here. Enter a valid email address." |
| Dialog | opens | pass | title in tree |
| Dialog | screen behind is hidden from VoiceOver | **fail** | still exposed: Form, test-textfield, test-switch, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-tamagui, test-sheet-open-expoui, test-toast-show, Tabs |
| Dialog | title is a heading | pass | AXHeading label="Delete this workout?" |
| Dialog | actions are buttons | pass | AXButton label="Dialog Close" |
| Dialog | closes | pass | title gone |
| Bottom sheet | opens | pass | sheet content in tree |
| Bottom sheet | title and body readable | pass | title in tree |
| Bottom sheet | screen behind is hidden from VoiceOver | **fail** | still exposed: test-textfield, test-switch, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-tamagui, test-sheet-open-expoui, test-toast-show, Tabs, test-tabs-0, test-tabs-1, test-tabs-2 |
| Bottom sheet | closes | pass | sheet gone |
| Bottom sheet | screen reachable again after close | pass | screen controls back in system tree |
| Bottom sheet (@expo/ui) | opens | pass | sheet content in tree |
| Bottom sheet (@expo/ui) | title and body readable | pass | title in tree |
| Bottom sheet (@expo/ui) | screen behind is hidden from VoiceOver | pass | nothing behind it in the system tree |
| Bottom sheet (@expo/ui) | closes | pass | sheet gone |
| Bottom sheet (@expo/ui) | screen reachable again after close | pass | screen controls back in system tree |
| Bottom sheet (Tamagui Sheet) | opens | pass | sheet content in tree |
| Bottom sheet (Tamagui Sheet) | title and body readable | pass | title in tree |
| Bottom sheet (Tamagui Sheet) | screen behind is hidden from VoiceOver | **fail** | still exposed: test-textfield, test-switch, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-tamagui, test-sheet-open-expoui, test-toast-show, Tabs, test-tabs-0, test-tabs-1, test-tabs-2 |
| Bottom sheet (Tamagui Sheet) | closes | pass | sheet gone |
| Bottom sheet (Tamagui Sheet) | screen reachable again after close | pass | screen controls back in system tree |
| Select | test could run | **fail** | element test-select not in tree |
| Toast | in accessibility tree | pass | AXGroup label="Set logged" |
| Slider | name, role, value | **fail** | label="Weight" value="30%" traits=[] 28×28pt |
| Slider | target ≥ 44pt | **fail** | 28×28pt |
| Slider | dragging changes the value | pass | value "30%" → "34%" |
| Progress | name and value | pass | label="Workout progress" value="3 of 8 exercises" traits=[] 370×9pt (system tree) |
| Accordion | header is a button | **fail** | missing |
| Accordion | test could run | **fail** | element test-accordion-0 not in tree |
| Menu | trigger name and role | pass | label="Workout options" value="" traits=[button] 152×44pt (system tree) |
| Menu | target ≥ 44pt | pass | 152×44pt (system tree, ±0.4 pt) |
| Menu | opens | pass | all three actions in tree |
| Menu | items are buttons | pass | AXButton label="Duplicate" \| AXButton label="Share" \| AXButton label="Archive" |
| Menu | screen behind is hidden from VoiceOver | **fail** | still exposed: test-sheet-open-tamagui, test-sheet-open-expoui, test-toast-show, Tabs, test-tabs-0, test-tabs-1, test-tabs-2, More components, test-slider, test-segmented-0, test-segmented-1, test-segmented-2, Native control (@expo/ui), test-native-switch |
| Menu | closes after an action | pass | actions gone |
| Segmented control | options have name and role | **fail** | label="Week" value="" traits=[] 123×44pt \| label="Month" value="" traits=[] 123×44pt \| label="Year" value="" traits=[] 123×44pt |
| Segmented control | selected option marked | **fail** | label="Week" value="" traits=[] 123×44pt \| label="Month" value="" traits=[] 123×44pt \| label="Year" value="" traits=[] 123×44pt |
| Segmented control | target ≥ 44pt | pass | 123×44pt |
| Segmented control | selection moves on tap | **fail** | label="Week" value="" traits=[] 123×44pt \| label="Month" value="" traits=[] 123×44pt |
