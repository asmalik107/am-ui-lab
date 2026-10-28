# heroui: iOS accessibility audit, light theme

Run 2026-10-28 on the iPhone 17 simulator (iOS 27.0, 11A84A8F-FDB1-4921-8105-D7B17EC3CBC1), Release build, light theme, with `scripts/a11y-audit.mjs`. 44/67 checks passed.

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
| Dialog | screen behind is hidden from VoiceOver | **fail** | still exposed: test-button-disabled, test-button-loading, Form, test-textfield, test-switch, test-checkbox, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, test-select, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-gorhom, test-sheet-open-expoui |
| Dialog | title is a heading | pass | AXHeading label="Delete this workout?" |
| Dialog | actions are buttons | pass | AXButton label="Cancel" |
| Dialog | closes | pass | title gone |
| Bottom sheet | opens | pass | sheet content in tree |
| Bottom sheet | title and body readable | **fail** | title and body text not in the system tree |
| Bottom sheet | screen behind is hidden from VoiceOver | **fail** | still exposed: test-button-disabled, test-button-loading, Form, test-textfield, test-switch, test-checkbox, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, test-select, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-gorhom, test-sheet-open-expoui, test-toast-show |
| Bottom sheet | closes | pass | sheet gone |
| Bottom sheet | screen reachable again after close | pass | screen controls back in system tree |
| Bottom sheet (@expo/ui) | opens | pass | sheet content in tree |
| Bottom sheet (@expo/ui) | title and body readable | pass | title in tree |
| Bottom sheet (@expo/ui) | screen behind is hidden from VoiceOver | pass | nothing behind it in the system tree |
| Bottom sheet (@expo/ui) | closes | pass | sheet gone |
| Bottom sheet (@expo/ui) | screen reachable again after close | pass | screen controls back in system tree |
| Bottom sheet (@gorhom, raw) | opens | pass | sheet content in tree |
| Bottom sheet (@gorhom, raw) | title and body readable | **fail** | title and body text not in the system tree |
| Bottom sheet (@gorhom, raw) | screen behind is hidden from VoiceOver | **fail** | still exposed: test-textfield, test-switch, test-checkbox, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, test-select, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-gorhom, test-sheet-open-expoui, test-toast-show, Tabs, test-tabs-0, test-tabs-1, test-tabs-2 |
| Bottom sheet (@gorhom, raw) | closes | pass | sheet gone |
| Bottom sheet (@gorhom, raw) | screen reachable again after close | pass | screen controls back in system tree |
| Select | opens | pass | options in tree |
| Select | current option marked | pass | AXGroup label="60 seconds" value="checked, 60 seconds" |
| Select | options are actionable | **fail** | AXGroup label="30 seconds" value="unchecked, 30 seconds" \| AXGroup label="45 seconds" value="unchecked, 45 seconds" \| AXGroup label="60 seconds" value="checked, 60 seconds" \| AXGroup label="90 seconds" value="unchecked, 90 seconds" \| AXGroup label="2 minutes" value="unchecked, 2 minutes" |
| Select | screen behind is hidden from VoiceOver | **fail** | still exposed: test-button, test-button-disabled, test-button-loading, Form, test-textfield, test-switch, test-checkbox, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-gorhom |
| Select | new value read on trigger | pass | label="90 seconds" value="" traits=[] 370×50pt |
| Toast | in accessibility tree | pass | AXStaticText label="Set logged" |
| Slider | name, role, value | **fail** | label="Weight" value="60" traits=[] 28×20pt (system tree) |
| Slider | target ≥ 44pt | **fail** | 28×20pt (system tree, ±0.4 pt) |
| Slider | dragging changes the value | pass | value "60" → "67.5" |
| Progress | name and value | pass | label="Workout progress" value="3 of 8 exercises" traits=[updatesFrequently] 370×8pt |
| Accordion | header is a button | pass | label="Warm-up" value="" traits=[button] 370×52pt |
| Accordion | target ≥ 44pt | pass | 370×52pt |
| Accordion | expanded state exposed | pass | closed: label="Warm-up" value="" traits=[button] 370×52pt; open: label="Warm-up" value="expanded" traits=[button] 370×52pt |
| Accordion | content shows and hides | pass | panel text appeared; gone after second tap |
| Menu | trigger name and role | pass | label="Workout options" value="" traits=[button] 370×48pt |
| Menu | target ≥ 44pt | pass | 370×48pt |
| Menu | opens | pass | all three actions in tree |
| Menu | items are buttons | **fail** | AXGroup label="Duplicate" \| AXGroup label="Share" \| AXGroup label="Archive" |
| Menu | screen behind is hidden from VoiceOver | **fail** | still exposed: test-sheet-open-gorhom, test-sheet-open-expoui, test-toast-show, Tabs, test-tabs-0, test-tabs-1, test-tabs-2, More components, test-progress, test-accordion-0, test-accordion-1, test-accordion-2, test-segmented-0, test-segmented-1, test-segmented-2, Native control (@expo/ui) |
| Menu | closes after an action | pass | actions gone |
| Segmented control | options have name and role | pass | label="Week" value="" traits=[button, selected] 121×44pt \| label="Month" value="" traits=[button] 121×44pt \| label="Year" value="" traits=[button] 121×44pt |
| Segmented control | selected option marked | pass | label="Week" value="" traits=[button, selected] 121×44pt \| label="Month" value="" traits=[button] 121×44pt \| label="Year" value="" traits=[button] 121×44pt |
| Segmented control | target ≥ 44pt | pass | 121×44pt |
| Segmented control | selection moves on tap | pass | label="Week" value="" traits=[button] 121×44pt \| label="Month" value="" traits=[button, selected] 121×44pt |
