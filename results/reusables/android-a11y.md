# reusables: Android accessibility audit, light theme

Run 2026-11-04 on the SM-A156E (Android 16 (API 36), R5CXA2TFTKP), Release build, light theme, with `scripts/a11y-audit.mjs`. 41/62 checks passed.

Roles, states, sizes and reachability come from the accessibility tree of the active window, read through UiAutomation by `scripts/android-a11y-dump` (what TalkBack is given, not what it speaks). Touch targets are checked against 48 dp. Elements of an overlay's own window are reachable; anything else in that window counts as exposed behind it.

| Component | Check | Result | Detail |
| --- | --- | --- | --- |
| Button | name, role, state | pass | label="Save workout" value="" traits=[button] 352×40dp |
| Button | target ≥ 48dp | **fail** | 352×40dp |
| Button (disabled) | name, role, state | pass | label="Unavailable" value="" traits=[button, notEnabled] 352×40dp |
| Button (disabled) | target ≥ 48dp | **fail** | 352×40dp |
| Button (loading) | name, role, state | **fail** | label="Saving" value="" traits=[button, notEnabled] 352×40dp |
| Button (loading) | target ≥ 48dp | **fail** | 352×40dp |
| Text field | name, role, state | pass | label="Email" value="" traits=[] 352×40dp |
| Switch | name, role, state | pass | label="on, Workout reminders" value="checked" traits=[toggleButton] 32×18dp |
| Switch | target ≥ 48dp | **fail** | 32×18dp |
| Checkbox | name, role, state | pass | label="I agree to the terms" value="unchecked" traits=[checkbox] 16×16dp |
| Checkbox | target ≥ 48dp | **fail** | 16×16dp |
| Radio option | name, role, state | pass | label="Beginner" value="checked" traits=[radio] 16×16dp |
| Radio option | target ≥ 48dp | **fail** | 16×16dp |
| Select trigger | name, role, state | pass | label="60 seconds, Rest time" value="collapsed" traits=[combobox] role="Combo box" 200×40dp |
| Select trigger | target ≥ 48dp | **fail** | 200×40dp |
| Tab (selected) | name, role, state | pass | label="Today" value="selected" traits=[selected, tab] role="Tab" 57×30dp |
| Tab (selected) | target ≥ 48dp | **fail** | 57×30dp |
| Native switch (@expo/ui) | name, role, state | pass | label="" value="Off, unchecked" traits=[] 52×48dp |
| Native switch (@expo/ui) | target ≥ 48dp | **fail** | 52×47.6dp |
| Radio group | all options exposed | pass | 3 options found |
| Radio group | group label read | pass | label text "Experience level" in tree |
| Text field | error shown | pass | error text in tree |
| Text field | error reachable from field | **fail** | label="Email" value="not-an-email" traits=[] 352×40dp hint="" |
| Dialog | opens | pass | title in tree |
| Dialog | screen behind is hidden from TalkBack | **fail** | still exposed: Component test screen, test-theme-0, test-theme-1, test-theme-2, Buttons, test-button, test-button-disabled, test-button-loading, Form, test-textfield, test-switch, test-checkbox, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, test-select, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-expoui, test-toast-show, Tabs, test-tabs-0, test-tabs-1, test-tabs-2, More components, test-slider, test-progress, test-accordion-0, test-accordion-1, test-accordion-2, test-menu-open, test-segmented-0, test-segmented-1, test-segmented-2, Native control (@expo/ui), test-native-switch, List, test-list-link, perf-theme, perf-list |
| Dialog | title is a heading | **fail** | AXViewGroup label="Delete this workout?, This removes the workout and its logged sets. You cannot undo this." |
| Dialog | actions are buttons | pass | AXButton label="Cancel" |
| Dialog | closes | pass | title gone |
| Bottom sheet | opens | pass | sheet content in tree |
| Bottom sheet | title and body readable | pass | title in tree |
| Bottom sheet | screen behind is hidden from TalkBack | **fail** | still exposed: Component test screen, test-theme-0, test-theme-1, test-theme-2, Buttons, test-button, test-button-disabled, test-button-loading, Form, test-textfield, test-switch, test-checkbox, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, test-select, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-expoui, test-toast-show, Tabs, test-tabs-0, test-tabs-1, test-tabs-2, More components, test-slider, test-progress, test-accordion-0, test-accordion-1, test-accordion-2, test-menu-open, test-segmented-0, test-segmented-1, test-segmented-2, Native control (@expo/ui), test-native-switch, List, test-list-link, perf-theme, perf-list |
| Bottom sheet | closes | pass | sheet gone |
| Bottom sheet | screen reachable again after close | pass | screen controls back in system tree |
| Bottom sheet (@expo/ui) | opens | pass | sheet content in tree |
| Bottom sheet (@expo/ui) | title and body readable | pass | title in tree |
| Bottom sheet (@expo/ui) | screen behind is hidden from TalkBack | pass | nothing behind it in the system tree |
| Bottom sheet (@expo/ui) | closes | pass | sheet gone |
| Bottom sheet (@expo/ui) | screen reachable again after close | pass | screen controls back in system tree |
| Select | opens | pass | options in tree |
| Select | current option marked | pass | AXViewGroup label="60 seconds" value="selected" |
| Select | options are actionable | **fail** | AXViewGroup label="30 seconds" \| AXViewGroup label="45 seconds" \| AXViewGroup label="60 seconds" value="selected" \| AXViewGroup label="90 seconds" \| AXViewGroup label="2 minutes" |
| Select | screen behind is hidden from TalkBack | **fail** | still exposed: Component test screen, test-theme-0, test-theme-1, test-theme-2, Buttons, test-button, test-button-disabled, test-button-loading, Form, test-textfield, test-switch, test-checkbox, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-expoui, test-toast-show, Tabs, test-tabs-0, test-tabs-1, test-tabs-2, More components, test-slider, test-progress, test-accordion-0, test-accordion-1, test-accordion-2, test-menu-open, test-segmented-0, test-segmented-1, test-segmented-2, Native control (@expo/ui), test-native-switch, List, test-list-link, perf-theme, perf-list |
| Select | new value read on trigger | pass | label="90 seconds, Rest time" value="collapsed" traits=[combobox] role="Combo box" 200×40dp |
| Toast | in accessibility tree | pass | AXTextView label="Set logged" |
| Slider | name, role, value | pass | label="Weight, 60 kg" value="60" traits=[adjustable] 352×44dp |
| Slider | target ≥ 48dp | **fail** | 352×44dp |
| Slider | dragging changes the value | pass | value "60" → "180" |
| Progress | name and value | **fail** | label="0%" value="0" traits=[] role="Progress bar" 352×8dp |
| Accordion | header is a button | pass | label="Warm-up" value="collapsed" traits=[button] 352×52dp |
| Accordion | target ≥ 48dp | pass | 352×52dp |
| Accordion | expanded state exposed | pass | closed: label="Warm-up" value="collapsed" traits=[button] 352×52dp; open: label="Warm-up" value="expanded" traits=[button] 352×52dp |
| Accordion | content shows and hides | pass | panel text appeared; gone after second tap |
| Menu | trigger name and role | pass | label="Workout options" value="collapsed" traits=[button] 352×40dp |
| Menu | target ≥ 48dp | **fail** | 352×40dp |
| Menu | opens | pass | all three actions in tree |
| Menu | items are buttons | pass | AXMenuItem label="Duplicate" \| AXMenuItem label="Share" \| AXMenuItem label="Archive" |
| Menu | screen behind is hidden from TalkBack | **fail** | still exposed: Component test screen, test-theme-0, test-theme-1, test-theme-2, Buttons, test-button, test-button-disabled, test-button-loading, Form, test-textfield, test-switch, test-checkbox, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, test-select, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-expoui, test-toast-show, Tabs, test-tabs-0, test-tabs-1, test-tabs-2, More components, test-slider, test-progress, test-accordion-0, test-accordion-1, test-accordion-2, test-segmented-0, test-segmented-1, test-segmented-2, Native control (@expo/ui), test-native-switch, List, test-list-link, perf-theme, perf-list |
| Menu | closes after an action | pass | actions gone |
| Segmented control | options have name and role | pass | label="Week" value="checked" traits=[radio] 118×40dp \| label="Month" value="unchecked" traits=[radio] 117×40dp \| label="Year" value="unchecked" traits=[radio] 117×40dp |
| Segmented control | selected option marked | pass | label="Week" value="checked" traits=[radio] 118×40dp \| label="Month" value="unchecked" traits=[radio] 117×40dp \| label="Year" value="unchecked" traits=[radio] 117×40dp |
| Segmented control | target ≥ 48dp | **fail** | 118×40dp |
| Segmented control | selection moves on tap | pass | label="Week" value="unchecked" traits=[radio] 118×40dp \| label="Month" value="checked" traits=[radio] 117×40dp |
