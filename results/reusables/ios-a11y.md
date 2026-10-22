# reusables: iOS accessibility audit

Run 2026-10-22 on simulator 9B4311A6-178B-4879-9923-B2468FDE9675 (iOS 26.4, Release build) with `scripts/a11y-audit.mjs`. 18/39 checks passed.

Traits and sizes come from the view hierarchy (argent `native-describe-screen`). Reachability (what is exposed while an overlay is open) and taps come from the system accessibility tree (argent `describe`). Both show what VoiceOver is given, not what it speaks; spoken output needs a device.

| Component | Check | Result | Detail |
| --- | --- | --- | --- |
| Button | name, role, state | pass | label="Save workout" value="" traits=[button] 370×40pt |
| Button | target ≥ 44pt | **fail** | 370×40pt |
| Button (disabled) | name, role, state | pass | label="Unavailable" value="" traits=[button, notEnabled] 370×40pt |
| Button (disabled) | target ≥ 44pt | **fail** | 370×40pt |
| Button (loading) | name, role, state | **fail** | label="Saving" value="" traits=[button, notEnabled] 370×40pt |
| Button (loading) | target ≥ 44pt | **fail** | 370×40pt |
| Text field | name, role, state | **fail** | label="" value="" traits=[] 368×38pt |
| Switch | name, role, state | **fail** | label="" value="1" traits=[button, toggleButton] 32×19pt |
| Switch | target ≥ 44pt | **fail** | 32×19pt |
| Checkbox | name, role, state | **fail** | label="" value="checkbox, unchecked" traits=[] 16×16pt |
| Checkbox | target ≥ 44pt | **fail** | 16×16pt |
| Radio option | name, role, state | pass | label="" value="radio button, checked" traits=[] 16×16pt |
| Radio option | target ≥ 44pt | **fail** | 16×16pt |
| Select trigger | name, role, state | **fail** | label="60 seconds" value="" traits=[] 200×40pt |
| Select trigger | target ≥ 44pt | **fail** | 200×40pt |
| Tab (selected) | name, role, state | **fail** | label="Today" value="" traits=[selected] 58×30pt |
| Tab (selected) | target ≥ 44pt | **fail** | 58×30pt |
| Native switch (@expo/ui) | name, role, state | pass | label="Sync with Health (native control)" value="0" traits=[button, toggleButton] 317×28pt |
| Native switch (@expo/ui) | target ≥ 44pt | **fail** | 317×28pt |
| Radio group | all options exposed | pass | 3 options found |
| Radio group | group label read | pass | label text "Experience level" in tree |
| Text field | error shown | pass | error text in tree |
| Text field | error reachable from field | **fail** | label="" value="not-an-email" traits=[] 366×36pt hint="" |
| Dialog | opens | pass | title in tree |
| Dialog | screen behind is hidden from VoiceOver | **fail** | still exposed: test-button-disabled, test-button-loading, Form, test-textfield, test-switch, test-checkbox, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, test-select, Overlays, test-dialog-open, test-sheet-open, test-toast-show, Tabs, test-tabs-0, test-tabs-1, test-tabs-2, Native control (@expo/ui) |
| Dialog | title is a heading | **fail** | AXGroup label="Delete this workout?, This removes the workout and its logged sets. You cannot undo this., Cancel, Delete" |
| Dialog | actions are buttons | pass | AXButton label="Cancel" |
| Dialog | closes | pass | title gone |
| Bottom sheet | opens | pass | sheet content in tree |
| Bottom sheet | title and body readable | pass | title in tree |
| Bottom sheet | screen behind is hidden from VoiceOver | **fail** | still exposed: test-button-loading, Form, test-textfield, test-switch, test-checkbox, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, test-select, Overlays, test-dialog-open, test-sheet-open, test-toast-show, Tabs, test-tabs-0, test-tabs-1, test-tabs-2, Native control (@expo/ui), test-native-switch |
| Bottom sheet | closes | pass | sheet gone |
| Bottom sheet | screen reachable again after close | pass | screen controls back in system tree |
| Select | opens | pass | options in tree |
| Select | current option marked | **fail** | AXGroup label="60 seconds" |
| Select | options are actionable | **fail** | AXGroup label="30 seconds" \| AXGroup label="45 seconds" \| AXGroup label="60 seconds" \| AXGroup label="90 seconds" \| AXGroup label="2 minutes" |
| Select | screen behind is hidden from VoiceOver | pass | nothing behind it in the system tree |
| Select | new value read on trigger | pass | label="90 seconds" value="" traits=[] 200×40pt |
| Toast | in accessibility tree | pass | AXStaticText label="Set logged" |
