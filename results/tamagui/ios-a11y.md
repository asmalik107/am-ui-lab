# tamagui: iOS accessibility audit

Run 2026-10-24 on simulator 9B4311A6-178B-4879-9923-B2468FDE9675 (iOS 26.4, Release build) with `scripts/a11y-audit.mjs`. 28/41 checks passed.

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
| Dialog | screen behind is hidden from VoiceOver | **fail** | still exposed: test-textfield, test-switch, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-tamagui, test-sheet-open-expoui, test-toast-show, Tabs, test-tabs-0, test-tabs-1, test-tabs-2 |
| Dialog | title is a heading | pass | AXHeading label="Delete this workout?" |
| Dialog | actions are buttons | pass | AXButton label="Dialog Close" |
| Dialog | closes | pass | title gone |
| Bottom sheet | opens | pass | sheet content in tree |
| Bottom sheet | title and body readable | pass | title in tree |
| Bottom sheet | screen behind is hidden from VoiceOver | **fail** | still exposed: Form, test-textfield, test-switch, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-tamagui, test-sheet-open-expoui, test-toast-show, Tabs |
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
