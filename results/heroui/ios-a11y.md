# heroui: iOS accessibility audit

Run 2026-10-24 on simulator 9B4311A6-178B-4879-9923-B2468FDE9675 (iOS 26.4, Release build) with `scripts/a11y-audit.mjs`. 25/44 checks passed.

Traits and sizes come from the view hierarchy (argent `native-describe-screen`). Reachability (what is exposed while an overlay is open) and taps come from the system accessibility tree (argent `describe`). Both show what VoiceOver is given, not what it speaks; spoken output needs a device.

| Component | Check | Result | Detail |
| --- | --- | --- | --- |
| Button | name, role, state | pass | label="Save workout" value="" traits=[button] 370×48pt |
| Button | target ≥ 44pt | pass | 370×48pt |
| Button (disabled) | name, role, state | pass | label="Unavailable" value="" traits=[button, notEnabled] 370×48pt |
| Button (disabled) | target ≥ 44pt | pass | 370×48pt |
| Button (loading) | name, role, state | **fail** | label="Saving" value="" traits=[button, notEnabled] 370×48pt |
| Button (loading) | target ≥ 44pt | pass | 370×48pt |
| Text field | name, role, state | **fail** | label="" value="" traits=[] 368×46pt |
| Switch | name, role, state | **fail** | label="Workout reminders" value="" traits=[] 370×24pt |
| Switch | target ≥ 44pt | **fail** | 370×24pt |
| Checkbox | name, role, state | **fail** | label="I agree to the terms" value="" traits=[] 370×24pt |
| Checkbox | target ≥ 44pt | **fail** | 370×24pt |
| Radio option | name, role, state | pass | label="Beginner" value="radio button, checked" traits=[] 370×24pt |
| Radio option | target ≥ 44pt | **fail** | 370×24pt |
| Select trigger | name, role, state | **fail** | label="60 seconds" value="" traits=[] 370×50pt |
| Select trigger | target ≥ 44pt | pass | 370×50pt |
| Tab (selected) | name, role, state | **fail** | label="Today" value="" traits=[selected] 69×36pt |
| Tab (selected) | target ≥ 44pt | **fail** | 69×36pt |
| Native switch (@expo/ui) | name, role, state | pass | label="Sync with Health (native control)" value="0" traits=[button, toggleButton] 317×28pt |
| Native switch (@expo/ui) | target ≥ 44pt | **fail** | 317×28pt |
| Radio group | all options exposed | pass | 3 options found |
| Radio group | group label read | pass | label text "Experience level" in tree |
| Text field | error shown | pass | error text in tree |
| Text field | error reachable from field | **fail** | label="" value="not-an-email" traits=[] 368×46pt hint="" |
| Dialog | opens | pass | title in tree |
| Dialog | screen behind is hidden from VoiceOver | **fail** | still exposed: test-button-disabled, test-button-loading, Form, test-textfield, test-switch, test-checkbox, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, test-select, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-gorhom, test-toast-show |
| Dialog | title is a heading | pass | AXHeading label="Delete this workout?" |
| Dialog | actions are buttons | pass | AXButton label="Cancel" |
| Dialog | closes | pass | title gone |
| Bottom sheet | opens | pass | sheet content in tree |
| Bottom sheet | title and body readable | **fail** | title and body text not in the system tree |
| Bottom sheet | screen behind is hidden from VoiceOver | **fail** | still exposed: test-button-disabled, test-button-loading, Form, test-textfield, test-switch, test-checkbox, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, test-select, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-gorhom, test-toast-show |
| Bottom sheet | closes | pass | sheet gone |
| Bottom sheet | screen reachable again after close | pass | screen controls back in system tree |
| Bottom sheet (@gorhom, raw) | opens | pass | sheet content in tree |
| Bottom sheet (@gorhom, raw) | title and body readable | **fail** | title and body text not in the system tree |
| Bottom sheet (@gorhom, raw) | screen behind is hidden from VoiceOver | **fail** | still exposed: test-button-disabled, test-button-loading, Form, test-textfield, test-switch, test-checkbox, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, test-select, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-gorhom, test-toast-show, Tabs |
| Bottom sheet (@gorhom, raw) | closes | pass | sheet gone |
| Bottom sheet (@gorhom, raw) | screen reachable again after close | pass | screen controls back in system tree |
| Select | opens | pass | options in tree |
| Select | current option marked | pass | AXGroup label="60 seconds" value="checked, 60 seconds" |
| Select | options are actionable | **fail** | AXGroup label="30 seconds" value="unchecked, 30 seconds" \| AXGroup label="45 seconds" value="unchecked, 45 seconds" \| AXGroup label="60 seconds" value="checked, 60 seconds" \| AXGroup label="90 seconds" value="unchecked, 90 seconds" \| AXGroup label="2 minutes" value="unchecked, 2 minutes" |
| Select | screen behind is hidden from VoiceOver | **fail** | still exposed: test-button-disabled, test-button-loading, Form, test-textfield, test-switch, test-checkbox, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-gorhom, test-toast-show |
| Select | new value read on trigger | pass | label="90 seconds" value="" traits=[] 370×50pt |
| Toast | in accessibility tree | pass | AXStaticText label="Set logged" |
