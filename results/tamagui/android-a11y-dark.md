# tamagui: Android accessibility audit, dark theme

Run 2026-11-02 on the SM-A156E (Android 16 (API 36), R5CXA2TFTKP), Release build, dark theme, with `scripts/a11y-audit.mjs`. 42/67 checks passed.

Roles, states, sizes and reachability come from the accessibility tree of the active window, read through UiAutomation by `scripts/android-a11y-dump` (what TalkBack is given, not what it speaks). Touch targets are checked against 48 dp. Elements of an overlay's own window are reachable; anything else in that window counts as exposed behind it.

| Component | Check | Result | Detail |
| --- | --- | --- | --- |
| Button | name, role, state | pass | label="Save workout" value="" traits=[button] 352×44dp |
| Button | target ≥ 48dp | **fail** | 352×44dp |
| Button (disabled) | name, role, state | pass | label="Unavailable" value="" traits=[button, notEnabled] 352×44dp |
| Button (disabled) | target ≥ 48dp | **fail** | 352×44dp |
| Button (loading) | name, role, state | **fail** | label="Saving" value="" traits=[button, notEnabled] 352×44dp |
| Button (loading) | target ≥ 48dp | **fail** | 352×44dp |
| Text field | name, role, state | pass | label="Email" value="" traits=[] 352×44dp |
| Switch | name, role, state | **fail** | label="" value="" traits=[] 42×22dp |
| Switch | target ≥ 48dp | **fail** | 42×22dp |
| Checkbox | name, role, state | **fail** | label="" value="unchecked" traits=[checkbox] 22×22dp |
| Checkbox | target ≥ 48dp | **fail** | 22×22dp |
| Radio option | name, role, state | pass | label="" value="checked" traits=[radio] 22×22dp |
| Radio option | target ≥ 48dp | **fail** | 22×22dp |
| Select trigger | name, role, state | **fail** | label="60 seconds" value="collapsed" traits=[combobox] role="Combo box" 352×44dp |
| Select trigger | target ≥ 48dp | **fail** | 352×44dp |
| Tab (selected) | name, role, state | pass | label="Today" value="selected" traits=[selected, tab] role="Tab" 117×44dp |
| Tab (selected) | target ≥ 48dp | **fail** | 117×44dp |
| Native switch (@expo/ui) | name, role, state | pass | label="" value="Off, unchecked" traits=[] 52×48dp |
| Native switch (@expo/ui) | target ≥ 48dp | **fail** | 52×47.6dp |
| Radio group | all options exposed | pass | 3 options found |
| Radio group | group label read | pass | label text "Experience level" in tree |
| Text field | error shown | pass | error text in tree |
| Text field | error reachable from field | pass | label="Email" value="not-an-email" traits=[] 352×44dp hint="We'll send your plan here. Enter a valid email address." |
| Dialog | opens | pass | title in tree |
| Dialog | screen behind is hidden from TalkBack | **fail** | still exposed: test-sheet-tamagui-close, Component test screen, test-theme-0, test-theme-1, test-theme-2, Buttons, test-button, test-button-disabled, test-button-loading, Form, test-textfield, test-switch, test-checkbox, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, test-select, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-tamagui, test-sheet-open-expoui, test-toast-show, Tabs, test-tabs, test-tabs-0, test-tabs-1, test-tabs-2, More components, test-slider, test-progress, test-accordion-0, test-accordion-1, test-accordion-2, test-menu-open, test-segmented, test-segmented-0, test-segmented-1, test-segmented-2, Native control (@expo/ui), test-native-switch, List, test-list-link, perf-theme, perf-list |
| Dialog | title is a heading | pass | AXHeading label="Delete this workout?" |
| Dialog | actions are buttons | pass | AXButton label="Dialog Close" |
| Dialog | closes | pass | title gone |
| Bottom sheet | opens | pass | sheet content in tree |
| Bottom sheet | title and body readable | pass | title in tree |
| Bottom sheet | screen behind is hidden from TalkBack | **fail** | still exposed: test-sheet-tamagui-close, Component test screen, test-theme-0, test-theme-1, test-theme-2, Buttons, test-button, test-button-disabled, test-button-loading, Form, test-textfield, test-switch, test-checkbox, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, test-select, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-tamagui, test-sheet-open-expoui, test-toast-show, Tabs, test-tabs, test-tabs-0, test-tabs-1, test-tabs-2, More components, test-slider, test-progress, test-accordion-0, test-accordion-1, test-accordion-2, test-menu-open, test-segmented, test-segmented-0, test-segmented-1, test-segmented-2, Native control (@expo/ui), test-native-switch, List, test-list-link, perf-theme, perf-list |
| Bottom sheet | closes | pass | sheet gone |
| Bottom sheet | screen reachable again after close | pass | screen controls back in system tree |
| Bottom sheet (@expo/ui) | opens | pass | sheet content in tree |
| Bottom sheet (@expo/ui) | title and body readable | pass | title in tree |
| Bottom sheet (@expo/ui) | screen behind is hidden from TalkBack | pass | nothing behind it in the system tree |
| Bottom sheet (@expo/ui) | closes | pass | sheet gone |
| Bottom sheet (@expo/ui) | screen reachable again after close | pass | screen controls back in system tree |
| Bottom sheet (Tamagui Sheet) | opens | pass | sheet content in tree |
| Bottom sheet (Tamagui Sheet) | title and body readable | pass | title in tree |
| Bottom sheet (Tamagui Sheet) | screen behind is hidden from TalkBack | **fail** | still exposed: Component test screen, test-theme-0, test-theme-1, test-theme-2, Buttons, test-button, test-button-disabled, test-button-loading, Form, test-textfield, test-switch, test-checkbox, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, test-select, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-tamagui, test-sheet-open-expoui, test-toast-show, Tabs, test-tabs, test-tabs-0, test-tabs-1, test-tabs-2, More components, test-slider, test-progress, test-accordion-0, test-accordion-1, test-accordion-2, test-menu-open, test-segmented, test-segmented-0, test-segmented-1, test-segmented-2, Native control (@expo/ui), test-native-switch, List, test-list-link, perf-theme, perf-list |
| Bottom sheet (Tamagui Sheet) | closes | pass | sheet gone |
| Bottom sheet (Tamagui Sheet) | screen reachable again after close | pass | screen controls back in system tree |
| Select | opens | pass | options in tree |
| Select | current option marked | pass | AXButton label="60 seconds" value="selected" |
| Select | options are actionable | pass | AXButton label="30 seconds" \| AXButton label="45 seconds" \| AXButton label="60 seconds" value="selected" \| AXButton label="90 seconds" \| AXButton label="2 minutes" |
| Select | screen behind is hidden from TalkBack | **fail** | still exposed: test-sheet-tamagui-close, Component test screen, test-theme-0, test-theme-1, test-theme-2, Buttons, test-button, test-button-disabled, test-button-loading, Form, test-textfield, test-switch, test-checkbox, test-radiogroup-0, test-radiogroup-1, test-radiogroup-2, Overlays, test-dialog-open, test-sheet-open, test-sheet-open-tamagui, test-sheet-open-expoui, test-toast-show, Tabs, test-tabs, test-tabs-0, test-tabs-1, test-tabs-2, More components, test-slider, test-progress, test-accordion-0, test-accordion-1, test-accordion-2, test-menu-open, test-segmented, test-segmented-0, test-segmented-1, test-segmented-2, Native control (@expo/ui), test-native-switch, List, test-list-link, perf-theme, perf-list |
| Select | new value read on trigger | pass | label="90 seconds" value="collapsed" traits=[combobox] role="Combo box" 352×44dp |
| Toast | in accessibility tree | pass | AXViewGroup label="Set logged" |
| Slider | name, role, value | pass | label="Weight" value="60" traits=[adjustable] 28×28dp |
| Slider | target ≥ 48dp | **fail** | 28×28dp |
| Slider | dragging changes the value | pass | value "60" → "67" |
| Progress | name and value | pass | label="Workout progress, 3 of 8 exercises" value="3" traits=[] role="Progress bar" 352×9dp |
| Accordion | header is a button | **fail** | label="Warm-up, ▾" value="collapsed" traits=[] 99×53dp |
| Accordion | target ≥ 48dp | pass | 99×53dp |
| Accordion | expanded state exposed | pass | closed: label="Warm-up, ▾" value="collapsed" traits=[] 99×53dp; open: label="Warm-up, ▴" value="expanded" traits=[] 99×53dp |
| Accordion | content shows and hides | pass | panel text appeared; gone after second tap |
| Menu | trigger name and role | pass | label="Workout options" value="" traits=[button] 147×44dp |
| Menu | target ≥ 48dp | **fail** | 147×44dp |
| Menu | opens | pass | all three actions in tree |
| Menu | items are buttons | **fail** | AXView label="Duplicate" \| AXView label="Share" \| AXView label="Archive" |
| Menu | screen behind is hidden from TalkBack | pass | nothing behind it in the system tree |
| Menu | closes after an action | pass | actions gone |
| Segmented control | options have name and role | **fail** | label="Week" value="" traits=[] 117×44dp \| label="Month" value="" traits=[] 117×44dp \| label="Year" value="" traits=[] 117×44dp |
| Segmented control | selected option marked | **fail** | label="Week" value="" traits=[] 117×44dp \| label="Month" value="" traits=[] 117×44dp \| label="Year" value="" traits=[] 117×44dp |
| Segmented control | target ≥ 48dp | **fail** | 117×44dp |
| Segmented control | selection moves on tap | **fail** | label="Week" value="" traits=[] 117×44dp \| label="Month" value="" traits=[] 117×44dp |
