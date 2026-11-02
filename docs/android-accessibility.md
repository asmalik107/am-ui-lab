<a id="android-accessibility-what-failed"></a>

# Android accessibility: what failed

<!-- begin:nav -->
**The docs:**

- [README](../README.md): the answer, the scorecard and each library
- [Site](https://asmalik107.github.io/am-ui-lab/): the scorecard, every check and the charts, sortable and filterable
- [Results](results.md): every check, with the iOS and Android numbers
- [Method](method.md): how each check was measured, its limits, and how to reproduce it
- [iOS accessibility](ios-accessibility.md): every iOS accessibility failure, with the line of code that causes it
- **Android accessibility** (this page): every Android accessibility failure, from the audit’s output
- [All checks](checks.md): every accessibility check for every app, one table per component, plus the charts
<!-- end:nav -->

Every Android accessibility failure, from the audit’s own output. Generated from `results/` by `scripts/checks-md.mjs`.

- **Not checked by hand.** Unlike [iOS accessibility](ios-accessibility.md), these failures weren’t traced to the code that causes them. Each one is what the audit read from the tree TalkBack is given.
- **Device:** Samsung Galaxy A15 5G (SM-A156E), Android 16 (API 36).
- **Touch targets** are checked against Google’s 48 × 48 dp.
- **Per-check results for each app:**
  - Light theme: `results/<app>/android-a11y.md`
  - Dark theme: `android-a11y-dark.md`
  - Brand theme: `android-a11y-brand.md`
  - Side by side with iOS: [All checks](checks.md)

<a id="contents"></a>

## Contents

- [Failures in every app](#failures-in-every-app)
- [Failures by library](#failures-by-library)
- [Where Android and iOS differ](#where-android-and-ios-differ)

<a id="failures-in-every-app"></a>

## Failures in every app

The baseline included, so no library fixes these.

- **Native switch (@expo/ui)**
  - touch target: 52×47.6dp
- **@gorhom bottom sheet**
  - screen behind is hidden from the screen reader: still exposed: 44 elements, such as Component test screen, test-theme, test-theme-0

<a id="failures-by-library"></a>

## Failures by library

Each library’s failures beyond the ones above.

<a id="baseline"></a>

### Baseline

**60 of 62** checks pass on Android.

- **No failures** beyond those every app has.

<a id="unistyles"></a>

### Unistyles

**60 of 62** checks pass on Android.

- **Same failures as the baseline.** It restyles the baseline’s components, so it keeps their accessibility.

<a id="uniwind"></a>

### Uniwind

**60 of 62** checks pass on Android.

- **Same failures as the baseline.** It restyles the baseline’s components, so it keeps their accessibility.

<a id="nativewind"></a>

### NativeWind

**60 of 62** checks pass on Android.

- **Same failures as the baseline.** It restyles the baseline’s components, so it keeps their accessibility.

<a id="heroui"></a>

### HeroUI

**47 of 67** checks pass on Android.

- **Button (loading)**
  - name, role, state: label="Saving" value="" traits=[button, notEnabled] 352×48dp
- **Text field**
  - name, role, state: label="" value="" traits=[] 352×48dp
  - error reachable from field: label="not-an-email" value="not-an-email" traits=[] 352×48dp hint=""
- **Switch**
  - name, role, state: label="" value="" traits=[] 352×24dp
  - touch target: 352×24dp
- **Checkbox**
  - name, role, state: label="" value="" traits=[] 352×24dp
  - touch target: 352×24dp
- **Radio option**
  - touch target: 352×24dp
- **Select trigger**
  - name, role, state: label="60 seconds" value="" traits=[combobox] role="Combo box" 352×50dp
- **Tab (selected)**
  - touch target: 68×36dp
- **Dialog**
  - screen behind is hidden from the screen reader: still exposed: 46 elements, such as test-sheet-close, Component test screen, test-theme
  - title is a heading: AXViewGroup label="Delete this workout?, This removes the workout and its logged sets. You cannot undo this."
- **HeroUI’s own bottom sheet**
  - screen behind is hidden from the screen reader: still exposed: 45 elements, such as Component test screen, test-theme, test-theme-0
- **Select**
  - options are actionable: AXViewGroup label="30 seconds" value="unchecked", and 4 more like it
  - screen behind is hidden from the screen reader: still exposed: 45 elements, such as test-sheet-close, Component test screen, test-theme
- **Slider**
  - touch target: 28×20dp
- **Menu**
  - screen behind is hidden from the screen reader: still exposed: 45 elements, such as test-sheet-close, Component test screen, test-theme
- **Segmented control**
  - touch target: 116×44dp

<a id="gluestack"></a>

### gluestack

**36 of 66** checks pass on Android.

- **Button**
  - touch target: 352×36dp
- **Button (disabled)**
  - touch target: 352×36dp
- **Button (loading)**
  - name, role, state: label="Saving" value="" traits=[button, notEnabled] 352×36dp
  - touch target: 352×36dp
- **Switch**
  - name, role, state: label="" value="ON, checked" traits=[toggleButton] 47×27dp
  - touch target: 47×27dp
- **Checkbox**
  - name, role, state: label="terms" value="unchecked" traits=[checkbox] 352×22dp
  - touch target: 352×22dp
- **Radio option**
  - touch target: 352×22dp
- **Select trigger**
  - name, role, state: label="" value="" traits=[button] 352×40dp
  - touch target: 352×40dp
- **Tab (selected)**
  - touch target: 63×31dp
- **Text field**
  - error reachable from field: label="Email" value="not-an-email" traits=[] 326×34dp hint=""
- **Dialog**
  - screen behind is hidden from the screen reader: still exposed: 45 elements, such as Component test screen, test-theme, test-theme-0
- **Bottom sheet (gluestack BottomSheet)**
  - screen behind is hidden from the screen reader: still exposed: 45 elements, such as Component test screen, test-theme, test-theme-0
  - closes: still open
- **Select**
  - current option marked: AXViewGroup label="60 seconds"
  - options are actionable: AXViewGroup label="30 seconds", and 4 more like it
  - screen behind is hidden from the screen reader: still exposed: 44 elements, such as Component test screen, test-theme, test-theme-0
  - new value read on trigger: label="" value="" traits=[button] 352×40dp
- **Slider**
  - name, role, value: label="Slider" value="" traits=[] 352×6dp
  - touch target: 352×6dp
  - dragging changes the value: value "" → ""
- **Progress**
  - name and value: label="38%" value="" traits=[] role="Progress bar" 352×8dp
- **Accordion**
  - touch target: 350×20dp
- **Menu**
  - touch target: 352×38dp
  - screen behind is hidden from the screen reader: still exposed: 44 elements, such as Component test screen, test-theme, test-theme-0
- **Segmented control**
  - touch target: 116×44dp

<a id="tamagui"></a>

### Tamagui

**42 of 67** checks pass on Android.

- **Button**
  - touch target: 352×44dp
- **Button (disabled)**
  - touch target: 352×44dp
- **Button (loading)**
  - name, role, state: label="Saving" value="" traits=[button, notEnabled] 352×44dp
  - touch target: 352×44dp
- **Switch**
  - name, role, state: label="" value="" traits=[] 42×22dp
  - touch target: 42×22dp
- **Checkbox**
  - name, role, state: label="" value="unchecked" traits=[checkbox] 22×22dp
  - touch target: 22×22dp
- **Radio option**
  - touch target: 22×22dp
- **Select trigger**
  - name, role, state: label="60 seconds" value="collapsed" traits=[combobox] role="Combo box" 352×44dp
  - touch target: 352×44dp
- **Tab (selected)**
  - touch target: 117×44dp
- **Dialog**
  - screen behind is hidden from the screen reader: still exposed: 45 elements, such as test-sheet-tamagui-close, Component test screen, test-theme-0
- **Bottom sheet (Tamagui Sheet)**
  - screen behind is hidden from the screen reader: still exposed: 44 elements, such as Component test screen, test-theme-0, test-theme-1
- **Select**
  - screen behind is hidden from the screen reader: still exposed: 44 elements, such as test-sheet-tamagui-close, Component test screen, test-theme-0
- **Slider**
  - touch target: 28×28dp
- **Accordion**
  - header is a button: label="Warm-up, ▾" value="collapsed" traits=[] 99×53dp
- **Menu**
  - touch target: 147×44dp
  - items are buttons: AXView label="Duplicate", and 2 more like it
- **Segmented control**
  - options have name and role: label="Week" value="" traits=[] 117×44dp, and 2 more like it
  - selected option marked: label="Week" value="" traits=[] 117×44dp, and 2 more like it
  - touch target: 117×44dp
  - selection moves on tap: label="Week" value="" traits=[] 117×44dp | label="Month" value="" traits=[] 117×44dp

<a id="reusables"></a>

### Reusables

**37 of 62** checks pass on Android.

- **Button**
  - touch target: 352×40dp
- **Button (disabled)**
  - touch target: 352×40dp
- **Button (loading)**
  - name, role, state: label="Saving" value="" traits=[button, notEnabled] 352×40dp
  - touch target: 352×40dp
- **Text field**
  - name, role, state: label="" value="" traits=[] 352×40dp
  - error reachable from field: label="not-an-email" value="not-an-email" traits=[] 352×40dp hint=""
- **Switch**
  - name, role, state: label="on" value="checked" traits=[toggleButton] 32×18dp
  - touch target: 32×18dp
- **Checkbox**
  - name, role, state: label="" value="unchecked" traits=[checkbox] 16×16dp
  - touch target: 16×16dp
- **Radio option**
  - touch target: 16×16dp
- **Select trigger**
  - name, role, state: label="60 seconds" value="collapsed" traits=[combobox] role="Combo box" 200×40dp
  - touch target: 200×40dp
- **Tab (selected)**
  - touch target: 57×30dp
- **Dialog**
  - screen behind is hidden from the screen reader: still exposed: 41 elements, such as Component test screen, test-theme-0, test-theme-1
  - title is a heading: AXViewGroup label="Delete this workout?, This removes the workout and its logged sets. You cannot undo this."
- **Select**
  - options are actionable: AXViewGroup label="30 seconds", and 4 more like it
  - screen behind is hidden from the screen reader: still exposed: 40 elements, such as Component test screen, test-theme-0, test-theme-1
- **Slider**
  - touch target: 352×44dp
- **Progress**
  - name and value: label="0%" value="0" traits=[] role="Progress bar" 352×8dp
- **Menu**
  - touch target: 352×40dp
  - screen behind is hidden from the screen reader: still exposed: 40 elements, such as Component test screen, test-theme-0, test-theme-1
- **Segmented control**
  - touch target: 118×40dp

<a id="where-android-and-ios-differ"></a>

## Where Android and iOS differ

Checks that pass on one platform and fail on the other.

- **Baseline**
  - **Passes on Android only:**
    - Select trigger, name, role, state
    - Tab (selected), name, role, state
- **Unistyles**
  - **Passes on Android only:**
    - Select trigger, name, role, state
    - Tab (selected), name, role, state
- **Uniwind**
  - **Passes on Android only:**
    - Select trigger, name, role, state
    - Tab (selected), name, role, state
- **NativeWind**
  - **Passes on Android only:**
    - Select trigger, name, role, state
    - Tab (selected), name, role, state
- **HeroUI**
  - **Passes on Android only:**
    - Tab (selected), name, role, state
    - HeroUI’s own bottom sheet, title and body readable
    - Slider, name, role, value
    - Menu, items are buttons
    - @gorhom bottom sheet, title and body readable
  - **Passes on iOS only:**
    - Dialog, title is a heading
    - Segmented control, touch target
- **gluestack**
  - **Passes on Android only:**
    - Tab (selected), name, role, state
    - Menu, items are buttons
    - Bottom sheet (gluestack BottomSheet), title and body readable
  - **Passes on iOS only:**
    - Button (loading), name, role, state
    - Segmented control, touch target
- **Tamagui**
  - **Passes on Android only:**
    - Button (disabled), name, role, state
    - Tab (selected), name, role, state
    - Slider, name, role, value
    - Menu, screen behind is hidden from the screen reader
  - **Passes on iOS only:**
    - Button, touch target
    - Tab (selected), touch target
    - Menu, touch target
    - Menu, items are buttons
    - Segmented control, touch target
- **Reusables**
  - **Passes on Android only:**
    - Tab (selected), name, role, state
    - Select, current option marked
    - Menu, items are buttons
  - **Passes on iOS only:**
    - Select, screen behind is hidden from the screen reader
    - Slider, touch target
    - Menu, screen behind is hidden from the screen reader

<!-- begin:navfoot -->

---

← [Back to README](../README.md)
<!-- end:navfoot -->
