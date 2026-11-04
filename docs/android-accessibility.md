<a id="android-accessibility-what-failed-and-why"></a>

# Android accessibility: what failed and why

<!-- begin:nav -->
**The docs:**

- [README](../README.md): the answer, the scorecard and each library
- [Site](https://asmalik107.github.io/am-ui-lab/): the scorecard, every check and the charts, sortable and filterable
- [Results](results.md): every check, with the iOS and Android numbers
- [Method](method.md): how each check was measured, its limits, and how to reproduce it
- [iOS accessibility](ios-accessibility.md): every iOS accessibility failure, with the line of code that causes it
- **Android accessibility** (this page): every Android accessibility failure, with the line of code that causes it
- [All checks](checks.md): every accessibility check for every app, one table per component, plus the charts
- [To do](../TODO.md): what is left to measure, and how
<!-- end:nav -->

Every Android accessibility failure, from the audit’s own output, with the code that causes it. Generated from `results/` by `scripts/checks-md.mjs`.

- **Traced by hand.** Each failure was traced to the code that causes it, as on the [iOS page](ios-accessibility.md). Confirmed means the line that does it was read, or the phone showed it. **Heard** quotes TalkBack itself, read from its Display speech output setting on the A15. Two causes are still Likely.
- **Paths** are relative to `apps/<app>/` unless they say otherwise. `RN/` is `node_modules/react-native/`, and `RN/…/uimanager/` is `RN/ReactAndroid/src/main/java/com/facebook/react/uimanager/`.
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

**Why:**

- **@gorhom bottom sheet: screen behind still exposed.** Confirmed.
  - `BottomSheetModal` mounts through `@gorhom/portal` into the app’s own window (`node_modules/@gorhom/bottom-sheet/src/components/bottomSheetModal/BottomSheetModal.tsx:537`), so the screen stays in the tree TalkBack reads.
  - `aria-modal` does nothing on Android. It’s mapped only in `RN/Libraries/NativeComponent/BaseViewConfig.ios.js:198`, and no Android code reads `accessibilityViewIsModal`.
  - The baseline’s Dialog, Select and Menu pass because they use React Native’s `Modal`, a separate window.
  - **Fix:** set `importantForAccessibility="no-hide-descendants"` on the screen while the sheet is open.
- **Native switch (@expo/ui) 52 × 47.6 dp.** Confirmed: a one-pixel rounding artifact.
  - It’s a plain Material 3 `Switch` (`node_modules/@expo/ui/android/src/main/java/expo/modules/ui/SwitchView.kt:55-103`), which Material pads to 48 dp.
  - At the A15’s density (2.8125), 48 dp is 135 px. The `Host` row is 135 px (`uiautomator dump`: 1501–1636); the switch node inside it starts one pixel lower, so it’s 134 px, 47.64 dp. The pixel is lost inside the Compose layout, not at `Host`.
  - Not caught by the audit: the switch node has no name. Its label is a separate Compose `Text` beside it.

<a id="failures-by-library"></a>

## Failures by library

Each library’s failures beyond the ones above.

<a id="baseline"></a>

### Baseline

**60 of 62** checks pass on Android.

- **No failures** beyond those every app has.

**Why** (Confirmed): the loading button sets `aria-busy` and no `accessibilityLabel`, so React Native replaces its name with just “busy” (`RN/…/uimanager/BaseViewManager.java:415-446`). Heard: “busy, Button, disabled”, so “Saving” is lost. **Fix:** give the loading button an explicit `accessibilityLabel`.

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

**46 of 67** checks pass on Android.

- **Button (loading)**
  - name, role, state: label="Saving" value="" traits=[button, notEnabled] 352×48dp
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
- **Text field**
  - error reachable from field: label="Email" value="not-an-email" traits=[] 352×48dp hint=""
- **Dialog**
  - screen behind is hidden from the screen reader: still exposed: 46 elements, such as test-sheet-close, Component test screen, test-theme
  - title is a heading: AXViewGroup label="Delete this workout?, This removes the workout and its logged sets. You cannot undo this., Delete this workout?"
- **HeroUI’s own bottom sheet**
  - title and body readable: title and body text not in the system tree
  - screen behind is hidden from the screen reader: still exposed: 45 elements, such as Component test screen, test-theme, test-theme-0
- **@gorhom bottom sheet**
  - title and body readable: title and body text not in the system tree
- **Select**
  - options are actionable: AXViewGroup label="30 seconds" value="unchecked", and 4 more like it
  - screen behind is hidden from the screen reader: still exposed: 45 elements, such as test-sheet-close, Component test screen, test-theme
- **Slider**
  - touch target: 28×20dp
- **Menu**
  - screen behind is hidden from the screen reader: still exposed: 45 elements, such as test-sheet-close, Component test screen, test-theme
- **Segmented control**
  - touch target: 116×44dp

**Why:**

- **[A] Portal overlays stay in the app’s window.** The screen behind stays in TalkBack’s tree, and Android has no `aria-modal` (see above).
- **[B] `role="option"` has no Android mapping.** It falls to `else -> null` in `RN/…/uimanager/ReactAccessibilityDelegate.kt:543`, so options get no role.
- **[C] Loading is disabled + spinner, with no busy state.** React Native adds “busy” to the name only when `accessibilityState.busy` is set (`RN/…/uimanager/BaseViewManager.java:432-435`). No library sets it. Heard in Reusables and gluestack: “Saving, Button, disabled”.
- **Screen behind exposed (Dialog, BottomSheet, Select, Menu):** [A]. HeroUI’s `FullWindowOverlay` is a bare fragment unless `Platform.OS === 'ios'` (`node_modules/heroui-native/src/helpers/internal/components/full-window-overlay.tsx:56-62`).
- **Both sheets’ title and body unread.** Heard: TalkBack focuses the whole sheet and says only “Bottom Sheet, Slider”; the title and body inside aren’t focusable. gorhom makes the content `accessible` (`@gorhom/bottom-sheet/src/components/bottomSheet/constants.ts:29-31`), and neither HeroUI’s sheet nor the app’s raw one opts out (`src/components/exercise-sheet.tsx:22-26`).
- **Switch and Checkbox: row and control are separate.** `ControlField` is a bare `Pressable` with no role or state (`node_modules/heroui-native/src/components/control-field/control-field.tsx:127`). TalkBack gets a row with no role, then a control with no name.
- **Touch targets:** library size tokens. Switch 24 (`src/styles/components/switch.css:3-4`), Checkbox and Radio 24 (`checkbox.css:3-4`, `radio.css:11-12`), Slider thumb 28 × 20 (`slider.css:78-81`), Tab 36 (`tabs.css:61`). Segmented 44 is lab code (`src/components/segmented.tsx:26`).
- **Button (loading):** [C]. Only `disabled` is set (`node_modules/heroui-native/src/components/button/button.tsx:297`).
- **Select trigger: no name.** It’s a `combobox` with no label (`src/primitives/select/select.tsx:242`), and the “Rest time” label isn’t linked (`src/app/index.tsx:177-179`). Options are `role="option"`: [B].
- **Dialog title “not a heading”:** an audit artifact. `aria-labelledby` makes React Native give the dialog container a name joined from its children, which the audit matches first. The real title is a heading: heard “Delete this workout?, Heading”.
- **Dialog backdrop is an unlabelled stop.** Heard: “Unlabelled”. A full-screen focusable, clickable view with no name sits behind the dialog. The audit doesn’t check for this. Whether swiping reads the title twice wasn’t checked: TalkBack’s swipe gestures can’t be sent over adb.
- **Text field error not reachable:** React Native has no `aria-describedby`; `FieldError` is plain text.

<a id="gluestack"></a>

### gluestack

**35 of 66** checks pass on Android.

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
  - title and body readable: title and body text not in the system tree
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

**Why:**

- **[A] Portal overlays stay in the app’s window.** The screen behind stays in TalkBack’s tree, and Android has no `aria-modal` (see above).
- **[B] `role="option"` has no Android mapping.** It falls to `else -> null` in `RN/…/uimanager/ReactAccessibilityDelegate.kt:543`, so options get no role.
- **[C] Loading is disabled + spinner, with no busy state.** React Native adds “busy” to the name only when `accessibilityState.busy` is set (`RN/…/uimanager/BaseViewManager.java:432-435`). No library sets it. Heard in Reusables and gluestack: “Saving, Button, disabled”.
- **Screen behind exposed (Dialog, BottomSheet, Select, Menu):** [A]. `Overlay` defaults to `useRNModal = false` and renders into a portal in the same window (`node_modules/@gluestack-ui/core/lib/esm/overlay/creator/index.jsx:10`, `:37`). `useRNModalOnAndroid` would fix it, but nothing sets it.
- **BottomSheet title and body unread.** Confirmed in the tree; the same structure as HeroUI’s sheet, which was heard. gorhom makes the sheet content `accessible`, labelled “Bottom Sheet” (`@gorhom/bottom-sheet/src/components/bottomSheet/constants.ts:29-31`), which TalkBack reads as one stop. The baseline opts out with `accessible={false}` (`apps/baseline/src/components/exercise-sheet.tsx:18`); gluestack’s wrapper doesn’t (`components/ui/bottomsheet/index.tsx:222-243`).
- **BottomSheet doesn’t close.** Confirmed in the code. `close()` only sets `index` to -1 (`components/ui/bottomsheet/index.tsx:113-115`). When the prop changes, gorhom 5.2.14 calls `handleSnapToIndex(-1)`, which animates to `detents[-1]`, undefined (`node_modules/@gorhom/bottom-sheet/src/components/bottomSheet/BottomSheet.tsx:1123`, `:1789`). Only the first mount maps -1 to the closed position (`:875-877`). Same on iOS. **Fix:** call the sheet ref’s `close()`.
- **Touch targets:** library sizes. Button and Menu trigger 36 (`components/ui/button/index.tsx:39`), Select trigger 40 (`select/index.tsx:60`), Tab 31 (`tabs/index.tsx:42`), Accordion 20 (the padding is on the header, not the trigger: `accordion/index.tsx:39`, `:48`), Checkbox and Radio 22. Segmented 44 is lab code (`src/components/segmented.tsx:21`).
- **Button (loading):** [C]. `ButtonSpinner` has `aria-label="loading"`, but it isn’t read: heard “Saving, Button, disabled”.
- **Switch: no name.** React Native’s `Switch` with a `Text` beside it, as the docs show (`src/components/switch-row.tsx:11-19`).
- **Checkbox named “terms”:** `aria-label || value` (`node_modules/@gluestack-ui/core/lib/esm/checkbox/creator/Checkbox.jsx:30`).
- **Select trigger: an empty button.** The value sits in a hidden `TextInput` (`select/creator/SelectInput.jsx:28-30`). Options pass `checked` only as a style state (`SelectItem.jsx:24-40`).
- **Slider: no role or value.** They’re in `inputProps`, rendered on web only (`slider/creator/SliderThumb.jsx:122-124`).
- **Progress: no name.** It sets `progressbar` and “38%” but no label (`progress/creator/Progress.jsx:21-28`).
- **Text field error not reachable:** React Native has no `aria-describedby`, and `FormControlError` isn’t linked.

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

**Why:**

- **[A] Portal overlays stay in the app’s window.** The screen behind stays in TalkBack’s tree, and Android has no `aria-modal` (see above).
- **[B] `role="option"` has no Android mapping.** It falls to `else -> null` in `RN/…/uimanager/ReactAccessibilityDelegate.kt:543`, so options get no role.
- **[C] Loading is disabled + spinner, with no busy state.** React Native adds “busy” to the name only when `accessibilityState.busy` is set (`RN/…/uimanager/BaseViewManager.java:432-435`). No library sets it. Heard in Reusables and gluestack: “Saving, Button, disabled”.
- **Screen behind exposed (Dialog, Sheet, Select):** [A]. Dialog content goes through `PortalItem` (`node_modules/@tamagui/dialog/src/Dialog.tsx:205`) and a modal Sheet through `<Portal>` (`@tamagui/sheet/src/SheetImplementationCustom.tsx:1201`).
- **Touch targets at 44:** lab code. The app hard-codes `minH={44}` (`src/components/button.tsx:29`, `select.tsx:15`, `tabs.tsx:20`, `segmented.tsx:13`). The baseline uses 48 on Android.
- **Checkbox, Radio 22 and Switch 42 × 22:** Tamagui’s default size `md` (`node_modules/tamagui/src/components/Checkbox.tsx:19-20`, `RadioGroup.tsx:18-19`, `Switch.tsx:18-19`). Slider thumb 28: lab code (`src/components/slider.tsx:16`).
- **Switch: no name, role or state.** On native, `useSwitch` returns only `onPress` (`node_modules/@tamagui/switch-headless/src/useSwitch.tsx:89-96`); the role and state are set on web only.
- **Checkbox and Select trigger: no name.** `Label htmlFor` links the control on web only (`node_modules/@tamagui/label/src/Label.tsx:54`).
- **Button (loading):** [C]. Tamagui’s Button has no loading prop; the app adds a `Spinner` icon (`src/components/button.tsx:26-28`).
- **Accordion header isn’t a button.** The trigger’s “button” is `render: 'button'` (`@tamagui/collapsible/src/Collapsible.tsx:87`), an HTML element that gives no native role.
- **Menu items aren’t buttons.** Confirmed in the tree. On Android the menu is a Compose `DropdownMenu` (`node_modules/@tamagui/native/src/setup-expo-ui-menu.ts:17-22`). Each item is a clickable, focusable `android.view.View` with no role, its text in a child: TalkBack can activate it but can’t call it a button or menu item.
- **Segmented control: no role or selected state.** `ToggleGroup` items only use `aria-pressed` (`node_modules/@tamagui/toggle-group/src/Toggle.tsx:71`), which single mode drops (`ToggleGroup.tsx:101`) and React Native doesn’t support anyway.

<a id="reusables"></a>

### Reusables

**41 of 62** checks pass on Android.

- **Button**
  - touch target: 352×40dp
- **Button (disabled)**
  - touch target: 352×40dp
- **Button (loading)**
  - name, role, state: label="Saving" value="" traits=[button, notEnabled] 352×40dp
  - touch target: 352×40dp
- **Switch**
  - touch target: 32×18dp
- **Checkbox**
  - touch target: 16×16dp
- **Radio option**
  - touch target: 16×16dp
- **Select trigger**
  - touch target: 200×40dp
- **Tab (selected)**
  - touch target: 57×30dp
- **Text field**
  - error reachable from field: label="Email" value="not-an-email" traits=[] 352×40dp hint=""
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

**Why:**

- **[A] Portal overlays stay in the app’s window.** The screen behind stays in TalkBack’s tree, and Android has no `aria-modal` (see above).
- **[B] `role="option"` has no Android mapping.** It falls to `else -> null` in `RN/…/uimanager/ReactAccessibilityDelegate.kt:543`, so options get no role.
- **[C] Loading is disabled + spinner, with no busy state.** React Native adds “busy” to the name only when `accessibilityState.busy` is set (`RN/…/uimanager/BaseViewManager.java:432-435`). No library sets it. Heard in Reusables and gluestack: “Saving, Button, disabled”.
- **Screen behind exposed (Dialog, Select, Menu):** [A]. The copied components use `FullWindowOverlay` on iOS only (`src/components/ui/alert-dialog.tsx:17`, `select.tsx:68`, `dropdown-menu.tsx:88`).
- **Touch targets:** the library’s Tailwind sizes, kept on purpose (NOTES.md). Button and Menu trigger `h-10` (`src/components/ui/button.tsx:43`), Switch 32 × 18 (`switch.tsx:12`), Checkbox and Radio `size-4` (`checkbox.tsx:23`, `radio-group.tsx:19`), Tab 30 (`tabs.tsx:20`), Segmented `h-10` (`toggle.tsx:28`). Slider 44 is lab code (`src/components/slider.tsx:40`).
- **Button (loading):** [C]. RNR’s Button has no `aria-busy` (NOTES.md).
- **Dialog title isn’t a heading.** The copied overlay wraps the content in a full-screen `Pressable` (`src/components/ui/alert-dialog.tsx:37-41`), which absorbs title and description into one stop.
- **Select options:** `role="option"`: [B]. Selection still comes through, so “current option marked” passes.
- **Progress reads “0%”:** `value` goes only to the indicator, never to the root (`src/components/ui/progress.tsx:14-24`).
- **Text field error not reachable:** React Native has no `aria-describedby`.

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
    - Text field, name, role, state
    - Tab (selected), name, role, state
    - Slider, name, role, value
    - Menu, items are buttons
  - **Passes on iOS only:**
    - Dialog, title is a heading
    - Segmented control, touch target
- **gluestack**
  - **Passes on Android only:**
    - Tab (selected), name, role, state
    - Menu, items are buttons
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
    - Text field, name, role, state
    - Switch, name, role, state
    - Checkbox, name, role, state
    - Select trigger, name, role, state
    - Tab (selected), name, role, state
    - Select, current option marked
    - Menu, items are buttons
  - **Passes on iOS only:**
    - Select, screen behind is hidden from the screen reader
    - Slider, touch target
    - Menu, screen behind is hidden from the screen reader

**Why they differ** (Confirmed unless marked):

- **Select trigger, Tab, Menu items and Slider pass on Android only.** Android maps `combobox`, `tab`, `menuitem` and `slider` to roles (`RN/…/uimanager/ReactAccessibilityDelegate.kt:520-539`). iOS’s trait table has none of them (`RN/ReactCommon/react/renderer/components/view/accessibilityPropsConversions.h`).
- **Bottom sheets’ title and body no longer differ.** They fail on both platforms in HeroUI and gluestack, for the same reason: gorhom’s `accessible` sheet content is one stop.
- **Tamagui Menu: screen behind hidden passes on Android only.** Android’s menu is a Compose popup in its own window; iOS’s is a SwiftUI context menu over the screen.
- **Reusables Select and Menu: screen behind hidden passes on iOS only.** `FullWindowOverlay` is iOS only.
- **Reusables Text field, Checkbox, Switch and Select trigger pass on Android only.** Android honours `aria-labelledby`; iOS doesn’t.
  - TalkBack reads the linked label after the control’s own description. Heard: “off, Switch for Workout reminders” and “collapsed, 60 seconds, Combo box for Rest time”.
  - The switch’s own description is “on” or “off”, from the `aria-valuetext` that @rn-primitives sets (`node_modules/@rn-primitives/switch/dist/switch.mjs:27`, applied at `RN/…/uimanager/BaseViewManager.java:437-442`). The trigger’s is its value.
- **Reusables Select: current option marked passes on Android only.** `aria-selected` becomes `setSelected` on Android (`ReactAccessibilityDelegate.kt:633`); on iOS the `option` has no trait to carry it.
- **Tamagui Button (disabled) passes on Android only.** Disabled sets `tabIndex: -1` (`@tamagui/button/src/Button.tsx:172-175`), which removes it on iOS. On Android the node is `focusable: false` but still clickable, which TalkBack stops on: heard “Unavailable, Button, disabled”.
- **gluestack Button (loading) passes on iOS only.** VoiceOver folds the spinner into the button as “In progress” (Likely); on Android the spinner isn’t read (heard “Saving, Button, disabled”).
- **HeroUI Dialog: title is a heading passes on iOS only.** An audit artifact on Android (see HeroUI above).
- **Touch targets at 44 pass on iOS only.** 44 pt is Apple’s minimum; Google’s is 48 dp.

<!-- begin:navfoot -->

---

← [Back to README](../README.md)
<!-- end:navfoot -->
