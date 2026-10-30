# gluestack: iOS accessibility audit, dark theme

Run 2026-10-30 on the iPhone 17 simulator (iOS 27.0, 11A84A8F-FDB1-4921-8105-D7B17EC3CBC1), Release build, dark theme, with `scripts/a11y-audit.mjs`. 35/66 checks passed.

Traits and sizes come from the view hierarchy (argent `native-describe-screen`). Reachability (what is exposed while an overlay is open) and taps come from the system accessibility tree (argent `describe`). Both show what VoiceOver is given, not what it speaks; spoken output needs a device.

| Component | Check | Result | Detail |
| --- | --- | --- | --- |
| Button | name, role, state | pass | label="Save workout" value="" traits=[button] 370×36pt |
| Button | target ≥ 44pt | **fail** | 370×36pt |
| Button (disabled) | name, role, state | pass | label="Unavailable" value="" traits=[button, notEnabled] 370×36pt |
| Button (disabled) | target ≥ 44pt | **fail** | 370×36pt |
| Button (loading) | name, role, state | pass | label="In progress, Saving" value="" traits=[button, notEnabled] 370×36pt |
| Button (loading) | target ≥ 44pt | **fail** | 370×36pt |
| Text field | name, role, state | pass | label="Email" value="" traits=[] 344×34pt |
| Switch | name, role, state | **fail** | label="" value="1" traits=[button, toggleButton] 63×28pt |
| Switch | target ≥ 44pt | **fail** | 63×28pt |
| Checkbox | name, role, state | **fail** | label="terms" value="checkbox, unchecked" traits=[] 370×22pt |
| Checkbox | target ≥ 44pt | **fail** | 370×22pt |
| Radio option | name, role, state | pass | label="Beginner" value="radio button, checked" traits=[] 370×22pt |
| Radio option | target ≥ 44pt | **fail** | 370×22pt |
| Select trigger | name, role, state | **fail** | label="" value="" traits=[button] 370×40pt |
| Select trigger | target ≥ 44pt | **fail** | 370×40pt |
| Tab (selected) | name, role, state | **fail** | label="Today" value="" traits=[selected] 64×29pt |
| Tab (selected) | target ≥ 44pt | **fail** | 64×29pt |
| Native switch (@expo/ui) | name, role, state | pass | label="Sync with Health (native control)" value="0" traits=[button, toggleButton] 317×28pt |
| Native switch (@expo/ui) | target ≥ 44pt | **fail** | 317×28pt |
| Radio group | all options exposed | pass | 3 options found |
| Radio group | group label read | pass | label text "Experience level" in tree |
| Text field | error shown | pass | error text in tree |
| Text field | error reachable from field | **fail** | label="Email" value="not-an-email" traits=[] 344×34pt hint="" |
| Dialog | opens | pass | title in tree |
| Dialog | screen behind is hidden from VoiceOver | **fail** | still exposed: test-theme-0, test-theme-1, test-theme-2, Buttons, test-button, test-button-disabled, test-button-loading, Form, test-textfield, test-switch, test-checkbox, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, test-select, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-expoui |
| Dialog | title is a heading | pass | AXHeading label="Delete this workout?" |
| Dialog | actions are buttons | pass | AXButton label="Cancel" |
| Dialog | closes | pass | title gone |
| Bottom sheet | opens | pass | sheet content in tree |
| Bottom sheet | title and body readable | pass | title in tree |
| Bottom sheet | screen behind is hidden from VoiceOver | **fail** | still exposed: test-button-disabled, test-button-loading, Form, test-textfield, test-switch, test-checkbox, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, test-select, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-expoui, test-sheet-open-gluestack, test-toast-show, Tabs |
| Bottom sheet | closes | pass | sheet gone |
| Bottom sheet | screen reachable again after close | pass | screen controls back in system tree |
| Bottom sheet (@expo/ui) | opens | pass | sheet content in tree |
| Bottom sheet (@expo/ui) | title and body readable | pass | title in tree |
| Bottom sheet (@expo/ui) | screen behind is hidden from VoiceOver | pass | nothing behind it in the system tree |
| Bottom sheet (@expo/ui) | closes | pass | sheet gone |
| Bottom sheet (@expo/ui) | screen reachable again after close | pass | screen controls back in system tree |
| Bottom sheet (gluestack BottomSheet) | opens | pass | sheet content in tree |
| Bottom sheet (gluestack BottomSheet) | title and body readable | **fail** | title and body text not in the system tree |
| Bottom sheet (gluestack BottomSheet) | screen behind is hidden from VoiceOver | **fail** | still exposed: test-button-disabled, test-button-loading, Form, test-textfield, test-switch, test-checkbox, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, test-select, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-expoui, test-sheet-open-gluestack, test-toast-show, Tabs |
| Bottom sheet (gluestack BottomSheet) | closes | **fail** | still open |
| Select | opens | pass | options in tree |
| Select | current option marked | **fail** | AXGroup label="60 seconds" |
| Select | options are actionable | **fail** | AXGroup label="30 seconds" \| AXGroup label="45 seconds" \| AXGroup label="60 seconds" \| AXGroup label="90 seconds" \| AXGroup label="2 minutes" |
| Select | screen behind is hidden from VoiceOver | **fail** | still exposed: test-theme-0, test-theme-1, test-theme-2, Buttons, test-button, test-button-disabled, test-button-loading, Form, test-textfield, test-switch, test-checkbox, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, Overlays, test-dialog-open, test-sheet-open |
| Select | new value read on trigger | **fail** | label="" value="" traits=[button] 370×40pt |
| Toast | in accessibility tree | pass | AXStaticText label="Set logged" |
| Slider | name, role, value | **fail** | label="Slider" value="" traits=[] 370×6pt (system tree) |
| Slider | target ≥ 44pt | **fail** | 370×6pt (system tree, ±0.4 pt) |
| Slider | dragging changes the value | **fail** | value "" → "" |
| Progress | name and value | **fail** | label="" value="38%" traits=[updatesFrequently] 370×8pt |
| Accordion | header is a button | pass | label="Warm-up" value="" traits=[button] 368×20pt |
| Accordion | target ≥ 44pt | **fail** | 368×20pt |
| Accordion | expanded state exposed | pass | closed: label="Warm-up" value="" traits=[button] 368×20pt; open: label="Warm-up" value="expanded" traits=[button] 368×20pt |
| Accordion | content shows and hides | pass | panel text appeared; gone after second tap |
| Menu | trigger name and role | pass | label="Workout options" value="" traits=[button] 370×38pt |
| Menu | target ≥ 44pt | **fail** | 370×38pt |
| Menu | opens | pass | all three actions in tree |
| Menu | items are buttons | **fail** | AXGroup label="Duplicate" \| AXGroup label="Share" \| AXGroup label="Archive" |
| Menu | screen behind is hidden from VoiceOver | **fail** | still exposed: test-sheet-open-gluestack, test-toast-show, Tabs, test-tabs-0, test-tabs-1, test-tabs-2, More components, test-progress, test-accordion-0, test-accordion-1, test-accordion-2, test-segmented-0, test-segmented-1, test-segmented-2, Native control (@expo/ui), test-native-switch, List, test-list-link |
| Menu | closes after an action | pass | actions gone |
| Segmented control | options have name and role | pass | label="Week" value="" traits=[button, selected] 121×44pt \| label="Month" value="" traits=[button] 121×44pt \| label="Year" value="" traits=[button] 121×44pt |
| Segmented control | selected option marked | pass | label="Week" value="" traits=[button, selected] 121×44pt \| label="Month" value="" traits=[button] 121×44pt \| label="Year" value="" traits=[button] 121×44pt |
| Segmented control | target ≥ 44pt | pass | 121×44pt |
| Segmented control | selection moves on tap | pass | label="Week" value="" traits=[button] 121×44pt \| label="Month" value="" traits=[button, selected] 121×44pt |
