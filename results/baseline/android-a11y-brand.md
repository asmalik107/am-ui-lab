# baseline: Android accessibility audit, brand theme

Run 2026-11-04 on the SM-A156E (Android 16 (API 36), R5CXA2TFTKP), Release build, brand theme, with `scripts/a11y-audit.mjs`. 65/67 checks passed.

Roles, states, sizes and reachability come from the accessibility tree of the active window, read through UiAutomation by `scripts/android-a11y-dump` (what TalkBack is given, not what it speaks). Touch targets are checked against 48 dp. Elements of an overlay's own window are reachable; anything else in that window counts as exposed behind it.

| Component | Check | Result | Detail |
| --- | --- | --- | --- |
| Button | name, role, state | pass | label="Save workout" value="" traits=[button] 352×48dp |
| Button | target ≥ 48dp | pass | 352×48dp |
| Button (disabled) | name, role, state | pass | label="Unavailable" value="" traits=[button, notEnabled] 352×48dp |
| Button (disabled) | target ≥ 48dp | pass | 352×48dp |
| Button (loading) | name, role, state | pass | label="Saving, busy" value="" traits=[button, notEnabled] 352×48dp |
| Button (loading) | target ≥ 48dp | pass | 352×48dp |
| Text field | name, role, state | pass | label="Email" value="" traits=[] 352×48dp |
| Switch | name, role, state | pass | label="Workout reminders" value="checked" traits=[toggleButton] 352×48dp |
| Switch | target ≥ 48dp | pass | 352×48dp |
| Checkbox | name, role, state | pass | label="I agree to the terms" value="unchecked" traits=[checkbox] 352×48dp |
| Checkbox | target ≥ 48dp | pass | 352×48dp |
| Radio option | name, role, state | pass | label="Beginner" value="checked" traits=[radio] 352×48dp |
| Radio option | target ≥ 48dp | pass | 352×48dp |
| Select trigger | name, role, state | pass | label="Rest time, 60 seconds" value="collapsed" traits=[combobox] role="Combo box" 352×48dp |
| Select trigger | target ≥ 48dp | pass | 352×48dp |
| Tab (selected) | name, role, state | pass | label="Today" value="selected" traits=[selected, tab] role="Tab" 117×48dp |
| Tab (selected) | target ≥ 48dp | pass | 117×48dp |
| Native switch (@expo/ui) | name, role, state | pass | label="" value="Off, unchecked" traits=[] 52×48dp |
| Native switch (@expo/ui) | target ≥ 48dp | **fail** | 52×47.6dp |
| Radio group | all options exposed | pass | 3 options found |
| Radio group | group label read | pass | label text "Experience level" in tree |
| Text field | error shown | pass | error text in tree |
| Text field | error reachable from field | pass | label="Email" value="not-an-email" traits=[] 352×48dp hint="Enter a valid email address." |
| Dialog | opens | pass | title in tree |
| Dialog | screen behind is hidden from TalkBack | pass | nothing behind it in the system tree |
| Dialog | every stop has a name | pass | every stop in the overlay has a name |
| Dialog | title is a heading | pass | AXHeading label="Delete this workout?" |
| Dialog | actions are buttons | pass | AXButton label="Cancel" |
| Dialog | closes | pass | title gone |
| Bottom sheet | opens | pass | sheet content in tree |
| Bottom sheet | title and body readable | pass | title in tree |
| Bottom sheet | screen behind is hidden from TalkBack | **fail** | still exposed: Component test screen, test-theme, test-theme-0, test-theme-1, test-theme-2, Buttons, test-button, test-button-disabled, test-button-loading, Form, test-textfield, test-switch, test-checkbox, test-radiogroup, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, test-select, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-expoui, test-toast-show, Tabs, test-tabs-0, test-tabs-1, test-tabs-2, More components, test-slider, test-progress, test-accordion-0, test-accordion-1, test-accordion-2, test-menu-open, test-segmented, test-segmented-0, test-segmented-1, test-segmented-2, Native control (@expo/ui), test-native-switch, List, test-list-link, perf-theme, perf-list |
| Bottom sheet | every stop has a name | pass | every stop in the overlay has a name |
| Bottom sheet | closes | pass | sheet gone |
| Bottom sheet | screen reachable again after close | pass | screen controls back in system tree |
| Bottom sheet (@expo/ui) | opens | pass | sheet content in tree |
| Bottom sheet (@expo/ui) | title and body readable | pass | title in tree |
| Bottom sheet (@expo/ui) | screen behind is hidden from TalkBack | pass | nothing behind it in the system tree |
| Bottom sheet (@expo/ui) | every stop has a name | pass | every stop in the overlay has a name |
| Bottom sheet (@expo/ui) | closes | pass | sheet gone |
| Bottom sheet (@expo/ui) | screen reachable again after close | pass | screen controls back in system tree |
| Select | opens | pass | options in tree |
| Select | current option marked | pass | AXRadioButton label="60 seconds" value="checked" |
| Select | options are actionable | pass | AXRadioButton label="30 seconds" value="unchecked" \| AXRadioButton label="45 seconds" value="unchecked" \| AXRadioButton label="60 seconds" value="checked" \| AXRadioButton label="90 seconds" value="unchecked" \| AXRadioButton label="2 minutes" value="unchecked" |
| Select | screen behind is hidden from TalkBack | pass | nothing behind it in the system tree |
| Select | every stop has a name | pass | every stop in the overlay has a name |
| Select | new value read on trigger | pass | label="Rest time, 90 seconds" value="collapsed" traits=[combobox] role="Combo box" 352×48dp |
| Toast | in accessibility tree | pass | AXTextView label="Set logged" |
| Slider | name, role, value | pass | label="Weight, 60 kg" value="60" traits=[adjustable] 352×48dp |
| Slider | target ≥ 48dp | pass | 352×48dp |
| Slider | dragging changes the value | pass | value "60" → "180" |
| Progress | name and value | pass | label="Workout progress, 3 of 8 exercises" value="3" traits=[] role="Progress bar" 352×8dp |
| Accordion | header is a button | pass | label="Warm-up" value="collapsed" traits=[button] 350×48dp |
| Accordion | target ≥ 48dp | pass | 350×48dp |
| Accordion | expanded state exposed | pass | closed: label="Warm-up" value="collapsed" traits=[button] 350×48dp; open: label="Warm-up" value="expanded" traits=[button] 350×48dp |
| Accordion | content shows and hides | pass | panel text appeared; gone after second tap |
| Menu | trigger name and role | pass | label="Workout options" value="" traits=[button] 352×48dp |
| Menu | target ≥ 48dp | pass | 352×48dp |
| Menu | opens | pass | all three actions in tree |
| Menu | items are buttons | pass | AXButton label="Duplicate" \| AXButton label="Share" \| AXButton label="Archive" |
| Menu | screen behind is hidden from TalkBack | pass | nothing behind it in the system tree |
| Menu | every stop has a name | pass | every stop in the overlay has a name |
| Menu | closes after an action | pass | actions gone |
| Segmented control | options have name and role | pass | label="Week" value="selected" traits=[button, selected] 116×48dp \| label="Month" value="" traits=[button] 115×48dp \| label="Year" value="" traits=[button] 116×48dp |
| Segmented control | selected option marked | pass | label="Week" value="selected" traits=[button, selected] 116×48dp \| label="Month" value="" traits=[button] 115×48dp \| label="Year" value="" traits=[button] 116×48dp |
| Segmented control | target ≥ 48dp | pass | 116×48dp |
| Segmented control | selection moves on tap | pass | label="Week" value="" traits=[button] 116×48dp \| label="Month" value="selected" traits=[button, selected] 115×48dp |
