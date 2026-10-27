# baseline: iOS accessibility audit, brand theme

Run 2026-10-27 on the iPhone 17 simulator (iOS 27.0, 11A84A8F-FDB1-4921-8105-D7B17EC3CBC1), Release build, brand theme, with `scripts/a11y-audit.mjs`. 58/62 checks passed.

Traits and sizes come from the view hierarchy (argent `native-describe-screen`). Reachability (what is exposed while an overlay is open) and taps come from the system accessibility tree (argent `describe`). Both show what VoiceOver is given, not what it speaks; spoken output needs a device.

| Component | Check | Result | Detail |
| --- | --- | --- | --- |
| Button | name, role, state | pass | label="Save workout" value="" traits=[button] 370×44pt |
| Button | target ≥ 44pt | pass | 370×44pt |
| Button (disabled) | name, role, state | pass | label="Unavailable" value="" traits=[button, notEnabled] 370×44pt |
| Button (disabled) | target ≥ 44pt | pass | 370×44pt |
| Button (loading) | name, role, state | pass | label="In progress, Saving" value="busy" traits=[button, notEnabled] 370×44pt |
| Button (loading) | target ≥ 44pt | pass | 370×44pt |
| Text field | name, role, state | pass | label="Email" value="" traits=[] 368×42pt |
| Switch | name, role, state | pass | label="Workout reminders" value="1" traits=[button, toggleButton] 370×44pt |
| Switch | target ≥ 44pt | pass | 370×44pt |
| Checkbox | name, role, state | pass | label="I agree to the terms" value="checkbox, unchecked" traits=[] 370×44pt |
| Checkbox | target ≥ 44pt | pass | 370×44pt |
| Radio option | name, role, state | pass | label="Beginner" value="radio button, checked" traits=[] 370×44pt |
| Radio option | target ≥ 44pt | pass | 370×44pt |
| Select trigger | name, role, state | **fail** | label="Rest time, 60 seconds" value="" traits=[] 370×44pt |
| Select trigger | target ≥ 44pt | pass | 370×44pt |
| Tab (selected) | name, role, state | **fail** | label="Today" value="" traits=[selected] 123×44pt |
| Tab (selected) | target ≥ 44pt | pass | 123×44pt |
| Native switch (@expo/ui) | name, role, state | pass | label="Sync with Health (native control)" value="0" traits=[button, toggleButton] 317×28pt |
| Native switch (@expo/ui) | target ≥ 44pt | **fail** | 317×28pt |
| Radio group | all options exposed | pass | 3 options found |
| Radio group | group label read | pass | label text "Experience level" in tree |
| Text field | error shown | pass | error text in tree |
| Text field | error reachable from field | pass | label="Email" value="not-an-email" traits=[] 366×40pt hint="Enter a valid email address." |
| Dialog | opens | pass | title in tree |
| Dialog | screen behind is hidden from VoiceOver | pass | nothing behind it in the system tree |
| Dialog | title is a heading | pass | AXHeading label="Delete this workout?" |
| Dialog | actions are buttons | pass | AXButton label="Cancel" |
| Dialog | closes | pass | title gone |
| Bottom sheet | opens | pass | sheet content in tree |
| Bottom sheet | title and body readable | pass | title in tree |
| Bottom sheet | screen behind is hidden from VoiceOver | **fail** | still exposed: test-textfield, test-switch, test-checkbox, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, test-select, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-expoui, test-toast-show, Tabs, test-tabs-0, test-tabs-1, test-tabs-2 |
| Bottom sheet | closes | pass | sheet gone |
| Bottom sheet | screen reachable again after close | pass | screen controls back in system tree |
| Bottom sheet (@expo/ui) | opens | pass | sheet content in tree |
| Bottom sheet (@expo/ui) | title and body readable | pass | title in tree |
| Bottom sheet (@expo/ui) | screen behind is hidden from VoiceOver | pass | nothing behind it in the system tree |
| Bottom sheet (@expo/ui) | closes | pass | sheet gone |
| Bottom sheet (@expo/ui) | screen reachable again after close | pass | screen controls back in system tree |
| Select | opens | pass | options in tree |
| Select | current option marked | pass | AXGroup label="60 seconds" value="radio button, checked" |
| Select | options are actionable | pass | AXGroup label="30 seconds" value="radio button, unchecked" \| AXGroup label="45 seconds" value="radio button, unchecked" \| AXGroup label="60 seconds" value="radio button, checked" \| AXGroup label="90 seconds" value="radio button, unchecked" \| AXGroup label="2 minutes" value="radio button, unchecked" |
| Select | screen behind is hidden from VoiceOver | pass | nothing behind it in the system tree |
| Select | new value read on trigger | pass | label="Rest time, 90 seconds" value="" traits=[] 370×44pt |
| Toast | in accessibility tree | pass | AXStaticText label="Set logged" |
| Slider | name, role, value | pass | label="Weight" value="60 kg" traits=[adjustable] 370×44pt |
| Slider | target ≥ 44pt | pass | 370×44pt |
| Slider | dragging changes the value | pass | value "60 kg" → "180 kg" |
| Progress | name and value | pass | label="Workout progress" value="3 of 8 exercises" traits=[updatesFrequently] 370×8pt |
| Accordion | header is a button | pass | label="Warm-up" value="" traits=[button] 368×44pt |
| Accordion | target ≥ 44pt | pass | 368×44pt |
| Accordion | expanded state exposed | pass | closed: label="Warm-up" value="" traits=[button] 368×44pt; open: label="Warm-up" value="expanded" traits=[button] 368×44pt |
| Accordion | content shows and hides | pass | panel text appeared; gone after second tap |
| Menu | trigger name and role | pass | label="Workout options" value="" traits=[button] 370×44pt |
| Menu | target ≥ 44pt | pass | 370×44pt |
| Menu | opens | pass | all three actions in tree |
| Menu | items are buttons | pass | AXButton label="Duplicate" \| AXButton label="Share" \| AXButton label="Archive" |
| Menu | screen behind is hidden from VoiceOver | pass | nothing behind it in the system tree |
| Menu | closes after an action | pass | actions gone |
| Segmented control | options have name and role | pass | label="Week" value="" traits=[button, selected] 121×44pt \| label="Month" value="" traits=[button] 121×44pt \| label="Year" value="" traits=[button] 121×44pt |
| Segmented control | selected option marked | pass | label="Week" value="" traits=[button, selected] 121×44pt \| label="Month" value="" traits=[button] 121×44pt \| label="Year" value="" traits=[button] 121×44pt |
| Segmented control | target ≥ 44pt | pass | 121×44pt |
| Segmented control | selection moves on tap | pass | label="Week" value="" traits=[button] 121×44pt \| label="Month" value="" traits=[button, selected] 121×44pt |
