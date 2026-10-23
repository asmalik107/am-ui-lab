# nativewind: iOS accessibility audit

Run 2026-10-23 on simulator 9B4311A6-178B-4879-9923-B2468FDE9675 (iOS 26.4, Release build) with `scripts/a11y-audit.mjs`. 18/26 checks passed.

Traits and sizes come from the view hierarchy (argent `native-describe-screen`). Reachability (what is exposed while an overlay is open) and taps come from the system accessibility tree (argent `describe`). Both show what VoiceOver is given, not what it speaks; spoken output needs a device.

| Component | Check | Result | Detail |
| --- | --- | --- | --- |
| Button | name, role, state | pass | label="Save workout" value="" traits=[button] 370×300pt |
| Button | target ≥ 44pt | pass | 370×300pt |
| Button (disabled) | name, role, state | pass | label="Unavailable" value="" traits=[button, notEnabled] 370×300pt |
| Button (disabled) | target ≥ 44pt | pass | 370×300pt |
| Button (loading) | name, role, state | pass | label="In progress, Saving" value="busy" traits=[button, notEnabled] 370×300pt |
| Button (loading) | target ≥ 44pt | pass | 370×300pt |
| Text field | name, role, state | pass | label="Email" value="" traits=[] 368×352pt |
| Switch | name, role, state | pass | label="Workout reminders" value="1" traits=[button, toggleButton] 370×352pt |
| Switch | target ≥ 44pt | pass | 370×352pt |
| Checkbox | name, role, state | pass | label="I agree to the terms" value="checkbox, unchecked" traits=[] 370×352pt |
| Checkbox | target ≥ 44pt | pass | 370×352pt |
| Radio option | name, role, state | pass | label="Beginner" value="radio button, checked" traits=[] 370×352pt |
| Radio option | target ≥ 44pt | pass | 370×352pt |
| Select trigger | name, role, state | **fail** | label="Rest time, 60 seconds" value="" traits=[] 370×354pt |
| Select trigger | target ≥ 44pt | pass | 370×354pt |
| Tab (selected) | name, role, state | **fail** | label="Today" value="" traits=[selected] 123×303pt |
| Tab (selected) | target ≥ 44pt | pass | 123×303pt |
| Native switch (@expo/ui) | name, role, state | pass | label="Sync with Health (native control)" value="0" traits=[button, toggleButton] 317×28pt |
| Native switch (@expo/ui) | target ≥ 44pt | **fail** | 317×28pt |
| Radio group | all options exposed | pass | 3 options found |
| Radio group | group label read | pass | label text "Experience level" in tree |
| Text field | test could run | **fail** | could not scroll test-textfield into view |
| Dialog | test could run | **fail** | could not scroll test-dialog-open into view |
| Bottom sheet | test could run | **fail** | could not scroll test-sheet-open into view |
| Select | test could run | **fail** | could not scroll test-select into view |
| Toast | test could run | **fail** | could not scroll test-toast-show into view |
