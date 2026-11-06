<a id="all-checks"></a>

# All checks

<!-- begin:nav -->
**The docs:**

- [README](../README.md): the answer, the scorecard and each library
- [Site](https://asmalik107.github.io/am-ui-lab/): the scorecard, every check and the charts, sortable and filterable
- [Results](results.md): every check, with the iOS and Android numbers
- [Method](method.md): how each check was measured, its limits, and how to reproduce it
- [iOS accessibility](ios-accessibility.md): every iOS accessibility failure, with the line of code that causes it
- [Android accessibility](android-accessibility.md): every Android accessibility failure, with the line of code that causes it
- **All checks** (this page): every accessibility check for every app, one table per component, plus the charts
- [To do](../TODO.md): what is left to measure, and how
<!-- end:nav -->

Every accessibility check, for every app, with iOS and Android side by side. Generated from `results/` by `scripts/checks-md.mjs`.

- **The summary tables** (scores, text size, reduced motion, speed, memory, developer cost) are in [Results](results.md).
- **How each check works** is in [Method](method.md#accessibility-checks).

<a id="contents"></a>

## Contents

- [How to read the tables](#how-to-read-the-tables)
- [Accessibility checks](#accessibility-checks)
- [Dark and brand themes](#dark-and-brand-themes)
- [Charts](#charts)

<a id="how-to-read-the-tables"></a>

## How to read the tables

- **Each cell** is iOS / Android.
- **Measured on** iOS: iPhone 17 simulator (iOS 27.0). Android: Galaxy A15 5G (Android 16).
- ✅ pass, ❌ fail.
- ➖ not applicable: the app has no such element.
- **n/r** not run: the test could not start.
- ⚠️ the two platforms give different results.
- **Under each table**, two fold-outs say what each check means, with a picture of a pass and a fail, and why any check failed.
- **NativeWind** results use a line-height workaround. See `apps/nativewind/NOTES.md`.

<a id="accessibility-checks"></a>

## Accessibility checks

**Checks that give a different result on iOS and Android,** per app:

- **Baseline:** 2
- **Unistyles:** 2
- **Uniwind:** 2
- **NativeWind:** 2
- **HeroUI:** 8
- **gluestack:** 5
- **Tamagui:** 5
- **Reusables:** 11

<a id="button"></a>

### Button

| Check | Baseline<br>iOS / Android | Unistyles<br>iOS / Android | Uniwind<br>iOS / Android | NativeWind<br>iOS / Android | HeroUI<br>iOS / Android | gluestack<br>iOS / Android | Tamagui<br>iOS / Android | Reusables<br>iOS / Android |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| name, role, state | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| touch target | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ✅ / ✅ | ❌ / ❌ |

<details>
<summary>What each check means</summary>

![A button read with its label and the button role passes. Read with its label only, the user isn’t told it can be activated.](checks/pictures/button-nrs.svg)

- **name, role, state:** Reads the control from the accessibility tree.
  - **Passes:** It has a label, the right role (button, switch, checkbox…) and its current state: disabled, busy, on/off, checked or selected.
  - **Fails:** Any of the three is missing or wrong, e.g. a switch read as just “Workout reminders”.

![Button: the tappable area is at least 44 pt tall (48 dp on Android). When it fails, it is smaller than the dashed minimum.](checks/pictures/target-button.svg)

- **touch target:** Measures the control’s frame in the accessibility tree.
  - **Passes:** At least 44 × 44 pt on iOS (Apple’s default control size) and 48 × 48 dp on Android (Google’s minimum).
  - **Fails:** Either side is smaller, so it is easy to miss with a finger.

All checks, with their pictures: [Method](method.md#checks-in-pictures).

</details>

<details>
<summary>Why checks failed</summary>

- **gluestack**
  - iOS, touch target: 370×36pt
  - Android, touch target: 352×36dp
- **Reusables**
  - iOS, touch target: 370×40pt
  - Android, touch target: 352×40dp

</details>

<a id="button-disabled"></a>

### Button (disabled)

| Check | Baseline<br>iOS / Android | Unistyles<br>iOS / Android | Uniwind<br>iOS / Android | NativeWind<br>iOS / Android | HeroUI<br>iOS / Android | gluestack<br>iOS / Android | Tamagui<br>iOS / Android | Reusables<br>iOS / Android |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| name, role, state | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ✅ ⚠️ | ✅ / ✅ |
| touch target | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ➖ / ✅ | ❌ / ❌ |

<details>
<summary>What each check means</summary>

![A disabled button is read as dimmed or disabled. When it fails, it sounds like a button that works.](checks/pictures/button-disabled-nrs.svg)

- **name, role, state:** Reads the control from the accessibility tree.
  - **Passes:** It has a label, the right role (button, switch, checkbox…) and its current state: disabled, busy, on/off, checked or selected.
  - **Fails:** Any of the three is missing or wrong, e.g. a switch read as just “Workout reminders”.

![Button: the tappable area is at least 44 pt tall (48 dp on Android). When it fails, it is smaller than the dashed minimum.](checks/pictures/target-button.svg)

- **touch target:** Measures the control’s frame in the accessibility tree.
  - **Passes:** At least 44 × 44 pt on iOS (Apple’s default control size) and 48 × 48 dp on Android (Google’s minimum).
  - **Fails:** Either side is smaller, so it is easy to miss with a finger.

All checks, with their pictures: [Method](method.md#checks-in-pictures).

</details>

<details>
<summary>Why checks failed</summary>

- **gluestack**
  - iOS, touch target: 370×36pt
  - Android, touch target: 352×36dp
- **Tamagui**
  - iOS, name, role, state: missing
- **Reusables**
  - iOS, touch target: 370×40pt
  - Android, touch target: 352×40dp

</details>

<a id="button-loading"></a>

### Button (loading)

| Check | Baseline<br>iOS / Android | Unistyles<br>iOS / Android | Uniwind<br>iOS / Android | NativeWind<br>iOS / Android | HeroUI<br>iOS / Android | gluestack<br>iOS / Android | Tamagui<br>iOS / Android | Reusables<br>iOS / Android |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| name, role, state | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ✅ / ❌ ⚠️ | ❌ / ❌ | ❌ / ❌ |
| touch target | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ➖ / ✅ | ❌ / ❌ |

<details>
<summary>What each check means</summary>

![A button that is saving says it is busy. When it fails, nothing says it is working.](checks/pictures/button-loading-nrs.svg)

- **name, role, state:** Reads the control from the accessibility tree.
  - **Passes:** It has a label, the right role (button, switch, checkbox…) and its current state: disabled, busy, on/off, checked or selected.
  - **Fails:** Any of the three is missing or wrong, e.g. a switch read as just “Workout reminders”.

![Button: the tappable area is at least 44 pt tall (48 dp on Android). When it fails, it is smaller than the dashed minimum.](checks/pictures/target-button.svg)

- **touch target:** Measures the control’s frame in the accessibility tree.
  - **Passes:** At least 44 × 44 pt on iOS (Apple’s default control size) and 48 × 48 dp on Android (Google’s minimum).
  - **Fails:** Either side is smaller, so it is easy to miss with a finger.

All checks, with their pictures: [Method](method.md#checks-in-pictures).

</details>

<details>
<summary>Why checks failed</summary>

- **HeroUI**
  - iOS, name, role, state: label="Saving" value="" traits=[button, notEnabled] 370×48pt
  - Android, name, role, state: label="Saving" value="" traits=[button, notEnabled] 352×48dp
- **gluestack**
  - Android, name, role, state: label="Saving" value="" traits=[button, notEnabled] 352×36dp
  - iOS, touch target: 370×36pt
  - Android, touch target: 352×36dp
- **Tamagui**
  - iOS, name, role, state: missing
  - Android, name, role, state: label="Saving" value="" traits=[button, notEnabled] 352×48dp
- **Reusables**
  - iOS, name, role, state: label="Saving" value="" traits=[button, notEnabled] 370×40pt
  - Android, name, role, state: label="Saving" value="" traits=[button, notEnabled] 352×40dp
  - iOS, touch target: 370×40pt
  - Android, touch target: 352×40dp

</details>

<a id="text-field"></a>

### Text field

| Check | Baseline<br>iOS / Android | Unistyles<br>iOS / Android | Uniwind<br>iOS / Android | NativeWind<br>iOS / Android | HeroUI<br>iOS / Android | gluestack<br>iOS / Android | Tamagui<br>iOS / Android | Reusables<br>iOS / Android |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| name, role, state | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ✅ ⚠️ | ✅ / ✅ | ✅ / ✅ | ❌ / ✅ ⚠️ |
| error shown | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| error reachable from field | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ❌ / ❌ | ✅ / ✅ | ❌ / ❌ |

<details>
<summary>What each check means</summary>

![A text field read with its label passes. Without it, the user hears an unnamed field.](checks/pictures/field-nrs.svg)

- **name, role, state:** Reads the control from the accessibility tree.
  - **Passes:** It has a label, the right role (button, switch, checkbox…) and its current state: disabled, busy, on/off, checked or selected.
  - **Fails:** Any of the three is missing or wrong, e.g. a switch read as just “Workout reminders”.

![After an invalid email, the error message is in the tree. When it fails, it never appears there.](checks/pictures/field-error-shown.svg)

- **error shown:** Types “not-an-email” into the email field, moves focus away, then looks for the error.
  - **Passes:** The message “Enter a valid email” appears in the tree.
  - **Fails:** The error never appears in the tree.

![The error is part of what the field reads, so it is heard with the field. When it fails, the field is read without it.](checks/pictures/field-error-linked.svg)

- **error reachable from field:** Reads the email field after the error appears.
  - **Passes:** The error is part of the field’s label, value or hint, so it is read with the field.
  - **Fails:** The field is read without the error, so a screen reader user has to go looking for it.

All checks, with their pictures: [Method](method.md#checks-in-pictures).

</details>

<details>
<summary>Why checks failed</summary>

- **HeroUI**
  - iOS, name, role, state: label="" value="" traits=[] 368×46pt
  - iOS, error reachable from field: label="" value="not-an-email" traits=[] 368×46pt hint=""
  - Android, error reachable from field: label="Email" value="not-an-email" traits=[] 352×48dp hint=""
- **gluestack**
  - iOS, error reachable from field: label="Email" value="not-an-email" traits=[] 344×34pt hint=""
  - Android, error reachable from field: label="Email" value="not-an-email" traits=[] 326×34dp hint=""
- **Reusables**
  - iOS, name, role, state: label="" value="" traits=[] 368×38pt
  - iOS, error reachable from field: label="" value="not-an-email" traits=[] 366×36pt hint=""
  - Android, error reachable from field: label="Email" value="not-an-email" traits=[] 352×40dp hint=""

</details>

<a id="switch"></a>

### Switch

| Check | Baseline<br>iOS / Android | Unistyles<br>iOS / Android | Uniwind<br>iOS / Android | NativeWind<br>iOS / Android | HeroUI<br>iOS / Android | gluestack<br>iOS / Android | Tamagui<br>iOS / Android | Reusables<br>iOS / Android |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| name, role, state | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ❌ / ❌ | ❌ / ❌ | ❌ / ✅ ⚠️ |
| touch target | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ❌ / ❌ | ❌ / ❌ | ❌ / ❌ |

<details>
<summary>What each check means</summary>

![A switch read with its label, the switch role and on or off passes. Read with its label only, it fails.](checks/pictures/switch-nrs.svg)

- **name, role, state:** Reads the control from the accessibility tree.
  - **Passes:** It has a label, the right role (button, switch, checkbox…) and its current state: disabled, busy, on/off, checked or selected.
  - **Fails:** Any of the three is missing or wrong, e.g. a switch read as just “Workout reminders”.

![Switch row: the tappable area is at least 44 pt tall (48 dp on Android). When it fails, it is smaller than the dashed minimum.](checks/pictures/target-switch.svg)

- **touch target:** Measures the control’s frame in the accessibility tree.
  - **Passes:** At least 44 × 44 pt on iOS (Apple’s default control size) and 48 × 48 dp on Android (Google’s minimum).
  - **Fails:** Either side is smaller, so it is easy to miss with a finger.

All checks, with their pictures: [Method](method.md#checks-in-pictures).

</details>

<details>
<summary>Why checks failed</summary>

- **HeroUI**
  - iOS, name, role, state: label="Workout reminders" value="" traits=[] 370×24pt
  - Android, name, role, state: label="" value="" traits=[] 352×24dp
  - iOS, touch target: 370×24pt
  - Android, touch target: 352×24dp
- **gluestack**
  - iOS, name, role, state: label="" value="1" traits=[button, toggleButton] 63×28pt
  - Android, name, role, state: label="" value="ON, checked" traits=[toggleButton] 47×27dp
  - iOS, touch target: 63×28pt
  - Android, touch target: 47×27dp
- **Tamagui**
  - iOS, name, role, state: label="" value="" traits=[] 42×22pt
  - Android, name, role, state: label="" value="" traits=[] 42×22dp
  - iOS, touch target: 42×22pt
  - Android, touch target: 42×22dp
- **Reusables**
  - iOS, name, role, state: label="" value="1" traits=[button, toggleButton] 32×19pt
  - iOS, touch target: 32×19pt
  - Android, touch target: 32×18dp

</details>

<a id="checkbox"></a>

### Checkbox

| Check | Baseline<br>iOS / Android | Unistyles<br>iOS / Android | Uniwind<br>iOS / Android | NativeWind<br>iOS / Android | HeroUI<br>iOS / Android | gluestack<br>iOS / Android | Tamagui<br>iOS / Android | Reusables<br>iOS / Android |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| name, role, state | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ❌ / ❌ | ❌ / ❌ | ❌ / ✅ ⚠️ |
| touch target | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ❌ / ❌ | ➖ / ❌ | ❌ / ❌ |

<details>
<summary>What each check means</summary>

![A checkbox read with its label, the checkbox role and checked passes. Without its role or state, it fails.](checks/pictures/checkbox-nrs.svg)

- **name, role, state:** Reads the control from the accessibility tree.
  - **Passes:** It has a label, the right role (button, switch, checkbox…) and its current state: disabled, busy, on/off, checked or selected.
  - **Fails:** Any of the three is missing or wrong, e.g. a switch read as just “Workout reminders”.

![Checkbox: the tappable area is at least 44 pt tall (48 dp on Android). When it fails, it is smaller than the dashed minimum.](checks/pictures/target-checkbox.svg)

- **touch target:** Measures the control’s frame in the accessibility tree.
  - **Passes:** At least 44 × 44 pt on iOS (Apple’s default control size) and 48 × 48 dp on Android (Google’s minimum).
  - **Fails:** Either side is smaller, so it is easy to miss with a finger.

All checks, with their pictures: [Method](method.md#checks-in-pictures).

</details>

<details>
<summary>Why checks failed</summary>

- **HeroUI**
  - iOS, name, role, state: label="I agree to the terms" value="" traits=[] 370×24pt
  - Android, name, role, state: label="" value="" traits=[] 352×24dp
  - iOS, touch target: 370×24pt
  - Android, touch target: 352×24dp
- **gluestack**
  - iOS, name, role, state: label="terms" value="checkbox, unchecked" traits=[] 370×22pt
  - Android, name, role, state: label="terms" value="unchecked" traits=[checkbox] 352×22dp
  - iOS, touch target: 370×22pt
  - Android, touch target: 352×22dp
- **Tamagui**
  - iOS, name, role, state: missing
  - Android, name, role, state: label="" value="unchecked" traits=[checkbox] 22×22dp
  - Android, touch target: 22×22dp
- **Reusables**
  - iOS, name, role, state: label="" value="checkbox, unchecked" traits=[] 16×16pt
  - iOS, touch target: 16×16pt
  - Android, touch target: 16×16dp

</details>

<a id="radio-option"></a>

### Radio option

| Check | Baseline<br>iOS / Android | Unistyles<br>iOS / Android | Uniwind<br>iOS / Android | NativeWind<br>iOS / Android | HeroUI<br>iOS / Android | gluestack<br>iOS / Android | Tamagui<br>iOS / Android | Reusables<br>iOS / Android |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| name, role, state | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| touch target | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ❌ / ❌ | ❌ / ❌ | ❌ / ❌ |

<details>
<summary>What each check means</summary>

![A radio option read with its label, the radio role and selected passes. Without its role or state, it fails.](checks/pictures/radio-nrs.svg)

- **name, role, state:** Reads the control from the accessibility tree.
  - **Passes:** It has a label, the right role (button, switch, checkbox…) and its current state: disabled, busy, on/off, checked or selected.
  - **Fails:** Any of the three is missing or wrong, e.g. a switch read as just “Workout reminders”.

![Radio option: the tappable area is at least 44 pt tall (48 dp on Android). When it fails, it is smaller than the dashed minimum.](checks/pictures/target-radio.svg)

- **touch target:** Measures the control’s frame in the accessibility tree.
  - **Passes:** At least 44 × 44 pt on iOS (Apple’s default control size) and 48 × 48 dp on Android (Google’s minimum).
  - **Fails:** Either side is smaller, so it is easy to miss with a finger.

All checks, with their pictures: [Method](method.md#checks-in-pictures).

</details>

<details>
<summary>Why checks failed</summary>

- **HeroUI**
  - iOS, touch target: 370×24pt
  - Android, touch target: 352×24dp
- **gluestack**
  - iOS, touch target: 370×22pt
  - Android, touch target: 352×22dp
- **Tamagui**
  - iOS, touch target: 22×22pt
  - Android, touch target: 22×22dp
- **Reusables**
  - iOS, touch target: 16×16pt
  - Android, touch target: 16×16dp

</details>

<a id="select-trigger"></a>

### Select trigger

| Check | Baseline<br>iOS / Android | Unistyles<br>iOS / Android | Uniwind<br>iOS / Android | NativeWind<br>iOS / Android | HeroUI<br>iOS / Android | gluestack<br>iOS / Android | Tamagui<br>iOS / Android | Reusables<br>iOS / Android |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| name, role, state | ❌ / ✅ ⚠️ | ❌ / ✅ ⚠️ | ❌ / ✅ ⚠️ | ❌ / ✅ ⚠️ | ❌ / ❌ | ❌ / ❌ | ❌ / ❌ | ❌ / ✅ ⚠️ |
| touch target | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ➖ / ✅ | ❌ / ❌ |

<details>
<summary>What each check means</summary>

![The select trigger is read with its name, its value and a button role. When it fails, a part is missing.](checks/pictures/select-nrs.svg)

- **name, role, state:** Reads the control from the accessibility tree.
  - **Passes:** It has a label, the right role (button, switch, checkbox…) and its current state: disabled, busy, on/off, checked or selected.
  - **Fails:** Any of the three is missing or wrong, e.g. a switch read as just “Workout reminders”.

![Select trigger: the tappable area is at least 44 pt tall (48 dp on Android). When it fails, it is smaller than the dashed minimum.](checks/pictures/target-select.svg)

- **touch target:** Measures the control’s frame in the accessibility tree.
  - **Passes:** At least 44 × 44 pt on iOS (Apple’s default control size) and 48 × 48 dp on Android (Google’s minimum).
  - **Fails:** Either side is smaller, so it is easy to miss with a finger.

All checks, with their pictures: [Method](method.md#checks-in-pictures).

</details>

<details>
<summary>Why checks failed</summary>

- **Baseline**
  - iOS, name, role, state: label="Rest time, 60 seconds" value="" traits=[] 370×44pt
- **Unistyles**
  - iOS, name, role, state: label="Rest time, 60 seconds" value="" traits=[] 370×44pt
- **Uniwind**
  - iOS, name, role, state: label="Rest time, 60 seconds" value="" traits=[] 370×44pt
- **NativeWind**
  - iOS, name, role, state: label="Rest time, 60 seconds" value="" traits=[] 370×44pt
- **HeroUI**
  - iOS, name, role, state: label="60 seconds" value="" traits=[] 370×50pt
  - Android, name, role, state: label="60 seconds" value="" traits=[combobox] role="Combo box" 352×50dp
- **gluestack**
  - iOS, name, role, state: label="" value="" traits=[button] 370×40pt
  - Android, name, role, state: label="" value="" traits=[button] 352×40dp
  - iOS, touch target: 370×40pt
  - Android, touch target: 352×40dp
- **Tamagui**
  - iOS, name, role, state: missing
  - Android, name, role, state: label="60 seconds" value="collapsed" traits=[combobox] role="Combo box" 352×48dp
- **Reusables**
  - iOS, name, role, state: label="60 seconds" value="" traits=[] 200×40pt
  - iOS, touch target: 200×40pt
  - Android, touch target: 200×40dp

</details>

<a id="tab-selected"></a>

### Tab (selected)

| Check | Baseline<br>iOS / Android | Unistyles<br>iOS / Android | Uniwind<br>iOS / Android | NativeWind<br>iOS / Android | HeroUI<br>iOS / Android | gluestack<br>iOS / Android | Tamagui<br>iOS / Android | Reusables<br>iOS / Android |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| name, role, state | ❌ / ✅ ⚠️ | ❌ / ✅ ⚠️ | ❌ / ✅ ⚠️ | ❌ / ✅ ⚠️ | ❌ / ✅ ⚠️ | ❌ / ✅ ⚠️ | ❌ / ✅ ⚠️ | ❌ / ✅ ⚠️ |
| touch target | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ❌ / ❌ | ✅ / ✅ | ❌ / ❌ |

<details>
<summary>What each check means</summary>

![The selected tab is read with the tab role and as selected. When it fails, nothing says which tab is open.](checks/pictures/tab-nrs.svg)

- **name, role, state:** Reads the control from the accessibility tree.
  - **Passes:** It has a label, the right role (button, switch, checkbox…) and its current state: disabled, busy, on/off, checked or selected.
  - **Fails:** Any of the three is missing or wrong, e.g. a switch read as just “Workout reminders”.

![Tab: the tappable area is at least 44 pt tall (48 dp on Android). When it fails, it is smaller than the dashed minimum.](checks/pictures/target-tab.svg)

- **touch target:** Measures the control’s frame in the accessibility tree.
  - **Passes:** At least 44 × 44 pt on iOS (Apple’s default control size) and 48 × 48 dp on Android (Google’s minimum).
  - **Fails:** Either side is smaller, so it is easy to miss with a finger.

All checks, with their pictures: [Method](method.md#checks-in-pictures).

</details>

<details>
<summary>Why checks failed</summary>

- **Baseline**
  - iOS, name, role, state: label="Today" value="" traits=[selected] 123×44pt
- **Unistyles**
  - iOS, name, role, state: label="Today" value="" traits=[selected] 123×44pt
- **Uniwind**
  - iOS, name, role, state: label="Today" value="" traits=[selected] 123×44pt
- **NativeWind**
  - iOS, name, role, state: label="Today" value="" traits=[selected] 123×44pt
- **HeroUI**
  - iOS, name, role, state: label="Today" value="" traits=[selected] 69×36pt
  - iOS, touch target: 69×36pt
  - Android, touch target: 68×36dp
- **gluestack**
  - iOS, name, role, state: label="Today" value="" traits=[selected] 64×29pt
  - iOS, touch target: 64×29pt
  - Android, touch target: 63×31dp
- **Tamagui**
  - iOS, name, role, state: label="Today" value="" traits=[selected] 123×44pt
- **Reusables**
  - iOS, name, role, state: label="Today" value="" traits=[selected] 58×30pt
  - iOS, touch target: 58×30pt
  - Android, touch target: 57×30dp

</details>

<a id="native-switch-expoui"></a>

### Native switch (@expo/ui)

| Check | Baseline<br>iOS / Android | Unistyles<br>iOS / Android | Uniwind<br>iOS / Android | NativeWind<br>iOS / Android | HeroUI<br>iOS / Android | gluestack<br>iOS / Android | Tamagui<br>iOS / Android | Reusables<br>iOS / Android |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| name, role, state | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| touch target | ❌ / ❌ | ❌ / ❌ | ❌ / ❌ | ❌ / ❌ | ❌ / ❌ | ❌ / ❌ | ❌ / ❌ | ❌ / ❌ |

<details>
<summary>What each check means</summary>

![The native switch is read with its label, the switch role and on or off.](checks/pictures/native-switch-nrs.svg)

- **name, role, state:** Reads the control from the accessibility tree.
  - **Passes:** It has a label, the right role (button, switch, checkbox…) and its current state: disabled, busy, on/off, checked or selected.
  - **Fails:** Any of the three is missing or wrong, e.g. a switch read as just “Workout reminders”.

![Native switch row: the tappable area is at least 44 pt tall (48 dp on Android). When it fails, it is smaller than the dashed minimum.](checks/pictures/target-native-switch.svg)

- **touch target:** Measures the control’s frame in the accessibility tree.
  - **Passes:** At least 44 × 44 pt on iOS (Apple’s default control size) and 48 × 48 dp on Android (Google’s minimum).
  - **Fails:** Either side is smaller, so it is easy to miss with a finger.

All checks, with their pictures: [Method](method.md#checks-in-pictures).

</details>

<details>
<summary>Why checks failed</summary>

- **Baseline**
  - iOS, touch target: 317×28pt
  - Android, touch target: 52×47.6dp
- **Unistyles**
  - iOS, touch target: 317×28pt
  - Android, touch target: 52×47.6dp
- **Uniwind**
  - iOS, touch target: 317×28pt
  - Android, touch target: 52×47.6dp
- **NativeWind**
  - iOS, touch target: 317×28pt
  - Android, touch target: 52×47.6dp
- **HeroUI**
  - iOS, touch target: 317×28pt
  - Android, touch target: 52×47.6dp
- **gluestack**
  - iOS, touch target: 317×28pt
  - Android, touch target: 52×47.6dp
- **Tamagui**
  - iOS, touch target: 317×28pt
  - Android, touch target: 52×47.6dp
- **Reusables**
  - iOS, touch target: 317×28pt
  - Android, touch target: 52×47.6dp

</details>

<a id="radio-group"></a>

### Radio group

| Check | Baseline<br>iOS / Android | Unistyles<br>iOS / Android | Uniwind<br>iOS / Android | NativeWind<br>iOS / Android | HeroUI<br>iOS / Android | gluestack<br>iOS / Android | Tamagui<br>iOS / Android | Reusables<br>iOS / Android |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| all options exposed | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| group label read | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |

<details>
<summary>What each check means</summary>

![Each of the three radio options is its own stop for the screen reader. When it fails, they are merged into one stop, or some are missing.](checks/pictures/radio-options.svg)

- **all options exposed:** Counts the radio options in the accessibility tree.
  - **Passes:** All three options are separate elements the screen reader can move to.
  - **Fails:** Fewer than three: options are merged into one element or missing.

![The group label “Experience level” is in the tree, so it is read with the options. When it fails, it is drawn but the screen reader can’t reach it.](checks/pictures/radio-label.svg)

- **group label read:** Looks for the radio group’s label in the accessibility tree.
  - **Passes:** The label “Experience level” is in the tree.
  - **Fails:** It is drawn on screen but the screen reader can’t reach it.

All checks, with their pictures: [Method](method.md#checks-in-pictures).

</details>

No check failed for any app.

<a id="dialog"></a>

### Dialog

| Check | Baseline<br>iOS / Android | Unistyles<br>iOS / Android | Uniwind<br>iOS / Android | NativeWind<br>iOS / Android | HeroUI<br>iOS / Android | gluestack<br>iOS / Android | Tamagui<br>iOS / Android | Reusables<br>iOS / Android |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| opens | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| screen behind is hidden from the screen reader | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ❌ / ❌ | ❌ / ❌ | ❌ / ❌ |
| everything the screen reader lands on has a name | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ❌ ⚠️ | ✅ / ❌ ⚠️ | ✅ / ✅ | ✅ / ✅ |
| title is a heading | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ |
| actions are buttons | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| closes | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |

<details>
<summary>What each check means</summary>

![Tapping Delete workout opens the dialog. When it fails, nothing new appears in the tree.](checks/pictures/dialog-opens.svg)

- **opens:** Taps the trigger and waits for the overlay’s content in the tree.
  - **Passes:** Its title or content appears.
  - **Fails:** Nothing appears in the tree after the tap.

![With the dialog open, the screen reader can only reach the dialog. When it fails, it can still reach Delete workout behind it.](checks/pictures/dialog-behind.svg)

- **screen behind is hidden from the screen reader:** With the overlay open, lists every element the screen reader can reach.
  - **Passes:** Only the overlay’s own elements: nothing from the screen behind it.
  - **Fails:** Controls behind the overlay can still be reached, e.g. “Delete workout, button” behind the dialog.

![Every stop in the dialog has a name. When it fails, the dimmed backdrop is a stop of its own, read as “Unlabelled”.](checks/pictures/dialog-unnamed.svg)

- **everything the screen reader lands on has a name:** With the overlay open, lists every element the screen reader can move to (each “stop”) and looks for any without a label.
  - **Passes:** Every one has a name.
  - **Fails:** At least one has none, e.g. a full-screen dimmed backdrop that TalkBack reads as “Unlabelled”.

![The dialog title is read as a heading, so screen reader users can jump to it. In the failing app the whole dialog is one element, so there is no title stop at all.](checks/pictures/dialog-heading.svg)

- **title is a heading:** Reads the dialog title’s role.
  - **Passes:** The title has the heading role, so it is read as “…, heading”.
  - **Fails:** It is read as plain text.

![Cancel is read as a button. When it fails, it sounds like plain text.](checks/pictures/dialog-buttons.svg)

- **actions are buttons:** Reads the role of the dialog’s Cancel action.
  - **Passes:** It has the button role.
  - **Fails:** It is read as plain text, so the user isn’t told it can be activated.

![Tapping Cancel closes the dialog. When it fails, the dialog is still in the tree.](checks/pictures/dialog-closes.svg)

- **closes:** Taps the overlay’s own Close or Cancel button.
  - **Passes:** The overlay leaves the tree.
  - **Fails:** It is still open.

All checks, with their pictures: [Method](method.md#checks-in-pictures).

</details>

<details>
<summary>Why checks failed</summary>

- **HeroUI**
  - iOS, screen behind is hidden from the screen reader: still exposed: 16 elements, such as test-button-disabled, test-button-loading, Form
  - Android, screen behind is hidden from the screen reader: still exposed: 46 elements, such as test-sheet-close, Component test screen, test-theme
  - Android, everything the screen reader lands on has a name: unnamed: AXViewGroup 384×832dp
- **gluestack**
  - iOS, screen behind is hidden from the screen reader: still exposed: 19 elements, such as test-theme-0, test-theme-1, test-theme-2
  - Android, screen behind is hidden from the screen reader: still exposed: 45 elements, such as Component test screen, test-theme, test-theme-0
  - Android, everything the screen reader lands on has a name: unnamed: AXViewGroup 384×832dp
- **Tamagui**
  - iOS, screen behind is hidden from the screen reader: still exposed: 11 elements, such as Form, test-textfield, test-switch
  - Android, screen behind is hidden from the screen reader: still exposed: 45 elements, such as test-sheet-tamagui-close, Component test screen, test-theme-0
- **Reusables**
  - iOS, screen behind is hidden from the screen reader: still exposed: 18 elements, such as test-button-loading, Form, test-textfield
  - Android, screen behind is hidden from the screen reader: still exposed: 41 elements, such as Component test screen, test-theme-0, test-theme-1
  - iOS, title is a heading: AXGroup label="Delete this workout?, This removes the workout and its logged sets. You cannot undo this., Cancel, Delete"
  - Android, title is a heading: AXViewGroup label="Delete this workout?, This removes the workout and its logged sets. You cannot undo this."

</details>

<a id="select"></a>

### Select

| Check | Baseline<br>iOS / Android | Unistyles<br>iOS / Android | Uniwind<br>iOS / Android | NativeWind<br>iOS / Android | HeroUI<br>iOS / Android | gluestack<br>iOS / Android | Tamagui<br>iOS / Android | Reusables<br>iOS / Android |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| opens | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | n/r / ✅ | ✅ / ✅ |
| current option marked | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | n/r / ✅ | ❌ / ✅ ⚠️ |
| options are actionable | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ❌ / ❌ | n/r / ✅ | ❌ / ❌ |
| screen behind is hidden from the screen reader | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ❌ / ❌ | n/r / ❌ | ✅ / ❌ ⚠️ |
| everything the screen reader lands on has a name | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ❌ ⚠️ | ✅ / ✅ | n/r / ✅ | ✅ / ❌ ⚠️ |
| new value read on trigger | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | n/r / ✅ | ✅ / ✅ |
| test could start | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ✅ ⚠️ | ✅ / ✅ |

<details>
<summary>What each check means</summary>

![Tapping the Rest time select shows its options. When it fails, nothing new appears in the tree.](checks/pictures/select-opens.svg)

- **opens:** Taps the trigger and waits for the overlay’s content in the tree.
  - **Passes:** Its title or content appears.
  - **Fails:** Nothing appears in the tree after the tap.

![The open list marks the option already chosen, 60 seconds, as selected. When it fails, nothing says which one is chosen.](checks/pictures/select-current.svg)

- **current option marked:** Opens the select and reads the option that is already chosen (60 seconds).
  - **Passes:** It is marked as selected or checked.
  - **Fails:** Nothing says which option is chosen.

![Every option has a button, radio or option role, so the user knows it can be picked. When it fails, options sound like plain text.](checks/pictures/select-options.svg)

- **options are actionable:** Reads the role of every option in the open select.
  - **Passes:** Each has a button, radio or option role.
  - **Fails:** At least one is read as plain text.

![With the list open, the screen reader can only reach the options. When it fails, it can still reach the screen behind.](checks/pictures/select-behind.svg)

- **screen behind is hidden from the screen reader:** With the overlay open, lists every element the screen reader can reach.
  - **Passes:** Only the overlay’s own elements: nothing from the screen behind it.
  - **Fails:** Controls behind the overlay can still be reached, e.g. “Delete workout, button” behind the dialog.

![Every stop in the open list has a name. When it fails, the backdrop behind the list is a stop of its own, read as “Unlabelled”.](checks/pictures/select-unnamed.svg)

- **everything the screen reader lands on has a name:** With the overlay open, lists every element the screen reader can move to (each “stop”) and looks for any without a label.
  - **Passes:** Every one has a name.
  - **Fails:** At least one has none, e.g. a full-screen dimmed backdrop that TalkBack reads as “Unlabelled”.

![After picking 90 seconds, the trigger reads the new value. When it fails, it still reads the old one.](checks/pictures/select-new-value.svg)

- **new value read on trigger:** Picks 90 seconds, then reads the select’s trigger.
  - **Passes:** The trigger reads the new value.
  - **Fails:** It still reads the old value, or no value.

![The test finds the element it starts from, so its other checks run. When it fails, the element isn’t there and the rest of that test is marked not run.](checks/pictures/test-ran.svg)

- **test could start:** Looks for the element the test starts from.
  - **Passes:** It was there, so the test’s other checks ran.
  - **Fails:** It wasn’t, so the test’s other checks are marked not run (n/r).

All checks, with their pictures: [Method](method.md#checks-in-pictures).

</details>

<details>
<summary>Why checks failed</summary>

- **HeroUI**
  - iOS, options are actionable: AXGroup label="30 seconds" value="unchecked, 30 seconds", and 4 more like it
  - Android, options are actionable: AXViewGroup label="30 seconds" value="unchecked", and 4 more like it
  - iOS, screen behind is hidden from the screen reader: still exposed: 16 elements, such as test-theme-0, test-theme-1, test-theme-2
  - Android, screen behind is hidden from the screen reader: still exposed: 45 elements, such as test-sheet-close, Component test screen, test-theme
  - Android, everything the screen reader lands on has a name: unnamed: AXViewGroup 384×832dp
- **gluestack**
  - iOS, current option marked: AXGroup label="60 seconds"
  - Android, current option marked: AXViewGroup label="60 seconds"
  - iOS, options are actionable: AXGroup label="30 seconds", and 4 more like it
  - Android, options are actionable: AXViewGroup label="30 seconds", and 4 more like it
  - iOS, screen behind is hidden from the screen reader: still exposed: 18 elements, such as test-theme-0, test-theme-1, test-theme-2
  - Android, screen behind is hidden from the screen reader: still exposed: 44 elements, such as Component test screen, test-theme, test-theme-0
  - iOS, new value read on trigger: label="" value="" traits=[button] 370×40pt
  - Android, new value read on trigger: label="" value="" traits=[button] 352×40dp
- **Tamagui**
  - Android, screen behind is hidden from the screen reader: still exposed: 44 elements, such as test-sheet-tamagui-close, Component test screen, test-theme-0
  - iOS, test could start: element test-select not in tree
- **Reusables**
  - iOS, current option marked: AXGroup label="60 seconds"
  - iOS, options are actionable: AXGroup label="30 seconds", and 4 more like it
  - Android, options are actionable: AXViewGroup label="30 seconds", and 4 more like it
  - Android, screen behind is hidden from the screen reader: still exposed: 40 elements, such as Component test screen, test-theme-0, test-theme-1
  - Android, everything the screen reader lands on has a name: unnamed: AXViewGroup 384×832dp

</details>

<a id="toast"></a>

### Toast

| Check | Baseline<br>iOS / Android | Unistyles<br>iOS / Android | Uniwind<br>iOS / Android | NativeWind<br>iOS / Android | HeroUI<br>iOS / Android | gluestack<br>iOS / Android | Tamagui<br>iOS / Android | Reusables<br>iOS / Android |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| screen reader can find it | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |

<details>
<summary>What each check means</summary>

![The toast is in the tree while it is on screen. When it fails, it is drawn but the screen reader never finds it.](checks/pictures/toast.svg)

- **screen reader can find it:** Shows the toast and looks for its text in the tree within 3 s.
  - **Passes:** The toast is in the tree while it is on screen.
  - **Fails:** It is drawn but not in the tree, so the screen reader never finds it.

All checks, with their pictures: [Method](method.md#checks-in-pictures).

</details>

No check failed for any app.

<a id="slider"></a>

### Slider

| Check | Baseline<br>iOS / Android | Unistyles<br>iOS / Android | Uniwind<br>iOS / Android | NativeWind<br>iOS / Android | HeroUI<br>iOS / Android | gluestack<br>iOS / Android | Tamagui<br>iOS / Android | Reusables<br>iOS / Android |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| name, role, value | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ✅ ⚠️ | ❌ / ❌ | ❌ / ✅ ⚠️ | ✅ / ✅ |
| touch target | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ❌ / ❌ | ❌ / ❌ | ✅ / ✅ |
| dragging changes the value | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ✅ / ✅ | ✅ / ✅ |

<details>
<summary>What each check means</summary>

![The slider is read with its label, its value and the adjustable role. When it fails, a part is missing.](checks/pictures/slider-nrs.svg)

- **name, role, value:** Reads the slider from the accessibility tree.
  - **Passes:** It has a label, the adjustable role and its current value.
  - **Fails:** Any of the three is missing.

![Slider thumb: the tappable area is at least 44 pt tall (48 dp on Android). When it fails, it is smaller than the dashed minimum.](checks/pictures/target-slider.svg)

- **touch target:** Measures the control’s frame in the accessibility tree.
  - **Passes:** At least 44 × 44 pt on iOS (Apple’s default control size) and 48 × 48 dp on Android (Google’s minimum).
  - **Fails:** Either side is smaller, so it is easy to miss with a finger.

![Dragging the thumb changes the value the screen reader is given. When it fails, the value stays the same.](checks/pictures/slider-drag.svg)

- **dragging changes the value:** Drags the thumb across the track and reads the value before and after. It stands in for the screen reader’s adjust gesture.
  - **Passes:** The value in the tree changes.
  - **Fails:** The value stays the same.

All checks, with their pictures: [Method](method.md#checks-in-pictures).

</details>

<details>
<summary>Why checks failed</summary>

- **HeroUI**
  - iOS, name, role, value: label="Weight" value="60" traits=[] 28×20pt (system tree)
  - iOS, touch target: 28×20pt (system tree, ±0.4 pt)
  - Android, touch target: 28×20dp
- **gluestack**
  - iOS, name, role, value: label="Slider" value="" traits=[] 370×6pt (system tree)
  - Android, name, role, value: label="Slider" value="" traits=[] 352×6dp
  - iOS, touch target: 370×6pt (system tree, ±0.4 pt)
  - Android, touch target: 352×6dp
  - iOS, dragging changes the value: value "" → ""
  - Android, dragging changes the value: value "" → ""
- **Tamagui**
  - iOS, name, role, value: label="Weight" value="30%" traits=[] 28×28pt
  - iOS, touch target: 28×28pt
  - Android, touch target: 28×28dp

</details>

<a id="progress"></a>

### Progress

| Check | Baseline<br>iOS / Android | Unistyles<br>iOS / Android | Uniwind<br>iOS / Android | NativeWind<br>iOS / Android | HeroUI<br>iOS / Android | gluestack<br>iOS / Android | Tamagui<br>iOS / Android | Reusables<br>iOS / Android |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| name and value | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ✅ / ✅ | ❌ / ❌ |

<details>
<summary>What each check means</summary>

![The progress bar is read with its label and how far along it is. When it fails, the value or label is missing.](checks/pictures/progress-nrs.svg)

- **name and value:** Reads the progress bar from the accessibility tree.
  - **Passes:** It has a label and its current value.
  - **Fails:** The label or the value is missing.

All checks, with their pictures: [Method](method.md#checks-in-pictures).

</details>

<details>
<summary>Why checks failed</summary>

- **gluestack**
  - iOS, name and value: label="" value="38%" traits=[updatesFrequently] 370×8pt
  - Android, name and value: label="38%" value="" traits=[] role="Progress bar" 352×8dp
- **Reusables**
  - iOS, name and value: label="" value="0%" traits=[updatesFrequently] 370×8pt
  - Android, name and value: label="0%" value="0" traits=[] role="Progress bar" 352×8dp

</details>

<a id="accordion"></a>

### Accordion

| Check | Baseline<br>iOS / Android | Unistyles<br>iOS / Android | Uniwind<br>iOS / Android | NativeWind<br>iOS / Android | HeroUI<br>iOS / Android | gluestack<br>iOS / Android | Tamagui<br>iOS / Android | Reusables<br>iOS / Android |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| header is a button | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ✅ / ✅ |
| touch target | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | n/r / ✅ | ✅ / ✅ |
| expanded state exposed | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | n/r / ✅ | ✅ / ✅ |
| content shows and hides | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | n/r / ✅ | ✅ / ✅ |
| test could start | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ✅ ⚠️ | ✅ / ✅ |

<details>
<summary>What each check means</summary>

![The section header is read as a button, so the user knows it opens. When it fails, it sounds like a heading or plain text.](checks/pictures/accordion-button.svg)

- **header is a button:** Reads the role of the accordion’s first header.
  - **Passes:** It has the button role.
  - **Fails:** It is read as plain text.

![Accordion header: the tappable area is at least 44 pt tall (48 dp on Android). When it fails, it is smaller than the dashed minimum.](checks/pictures/target-accordion.svg)

- **touch target:** Measures the control’s frame in the accessibility tree.
  - **Passes:** At least 44 × 44 pt on iOS (Apple’s default control size) and 48 × 48 dp on Android (Google’s minimum).
  - **Fails:** Either side is smaller, so it is easy to miss with a finger.

![An open section’s header is read as expanded, and a closed one as collapsed. When it fails, the header sounds the same either way.](checks/pictures/accordion-expanded.svg)

- **expanded state exposed:** Reads the header closed, taps it, and reads it open.
  - **Passes:** It reads as expanded when open and not when closed.
  - **Fails:** It reads the same either way.

![Tapping the header shows the section’s text, and tapping again hides it. When it fails, the text doesn’t appear, or doesn’t go.](checks/pictures/accordion-content.svg)

- **content shows and hides:** Taps the header twice, looking for the section text after each tap.
  - **Passes:** The text appears on the first tap and goes on the second.
  - **Fails:** It doesn’t appear, or doesn’t go.

![The test finds the element it starts from, so its other checks run. When it fails, the element isn’t there and the rest of that test is marked not run.](checks/pictures/test-ran.svg)

- **test could start:** Looks for the element the test starts from.
  - **Passes:** It was there, so the test’s other checks ran.
  - **Fails:** It wasn’t, so the test’s other checks are marked not run (n/r).

All checks, with their pictures: [Method](method.md#checks-in-pictures).

</details>

<details>
<summary>Why checks failed</summary>

- **gluestack**
  - iOS, touch target: 368×20pt
  - Android, touch target: 350×20dp
- **Tamagui**
  - iOS, header is a button: missing
  - Android, header is a button: label="Warm-up, ▾" value="collapsed" traits=[] 99×53dp
  - iOS, test could start: element test-accordion-0 not in tree

</details>

<a id="menu"></a>

### Menu

| Check | Baseline<br>iOS / Android | Unistyles<br>iOS / Android | Uniwind<br>iOS / Android | NativeWind<br>iOS / Android | HeroUI<br>iOS / Android | gluestack<br>iOS / Android | Tamagui<br>iOS / Android | Reusables<br>iOS / Android |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| trigger name and role | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| touch target | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ✅ / ✅ | ❌ / ❌ |
| opens | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| items are buttons | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ✅ ⚠️ | ❌ / ✅ ⚠️ | ✅ / ❌ ⚠️ | ❌ / ✅ ⚠️ |
| screen behind is hidden from the screen reader | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ❌ / ❌ | ❌ / ✅ ⚠️ | ✅ / ❌ ⚠️ |
| everything the screen reader lands on has a name | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ❌ ⚠️ | ✅ / ❌ ⚠️ | ✅ / ✅ | ✅ / ❌ ⚠️ |
| closes after an action | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |

<details>
<summary>What each check means</summary>

![The menu button is read with its name and the button role. When it fails, the user hears an unnamed button or plain text.](checks/pictures/menu-trigger.svg)

- **trigger name and role:** Reads the menu button from the accessibility tree.
  - **Passes:** It has a label and the button role.
  - **Fails:** The label or the role is missing.

![Menu button: the tappable area is at least 44 pt tall (48 dp on Android). When it fails, it is smaller than the dashed minimum.](checks/pictures/target-menu.svg)

- **touch target:** Measures the control’s frame in the accessibility tree.
  - **Passes:** At least 44 × 44 pt on iOS (Apple’s default control size) and 48 × 48 dp on Android (Google’s minimum).
  - **Fails:** Either side is smaller, so it is easy to miss with a finger.

![Tapping Workout options shows its three actions. When it fails, nothing new appears in the tree.](checks/pictures/menu-opens.svg)

- **opens:** Taps the trigger and waits for the overlay’s content in the tree.
  - **Passes:** Its title or content appears.
  - **Fails:** Nothing appears in the tree after the tap.

![Each menu action is read as a button. When it fails, actions sound like plain text.](checks/pictures/menu-items.svg)

- **items are buttons:** Reads the role of each menu action.
  - **Passes:** Each has the button role.
  - **Fails:** At least one is read as plain text.

![With the menu open, the screen reader can only reach the menu. When it fails, it can still reach the screen behind.](checks/pictures/menu-behind.svg)

- **screen behind is hidden from the screen reader:** With the overlay open, lists every element the screen reader can reach.
  - **Passes:** Only the overlay’s own elements: nothing from the screen behind it.
  - **Fails:** Controls behind the overlay can still be reached, e.g. “Delete workout, button” behind the dialog.

![Every stop in the open menu has a name. When it fails, a backdrop that closes the menu is a stop of its own, read as “Unlabelled”.](checks/pictures/menu-unnamed.svg)

- **everything the screen reader lands on has a name:** With the overlay open, lists every element the screen reader can move to (each “stop”) and looks for any without a label.
  - **Passes:** Every one has a name.
  - **Fails:** At least one has none, e.g. a full-screen dimmed backdrop that TalkBack reads as “Unlabelled”.

![Tapping Duplicate runs it and closes the menu. When it fails, the menu stays open.](checks/pictures/menu-closes.svg)

- **closes after an action:** Taps the first menu action.
  - **Passes:** The menu leaves the tree.
  - **Fails:** It is still open.

All checks, with their pictures: [Method](method.md#checks-in-pictures).

</details>

<details>
<summary>Why checks failed</summary>

- **HeroUI**
  - iOS, items are buttons: AXGroup label="Duplicate", and 2 more like it
  - iOS, screen behind is hidden from the screen reader: still exposed: 16 elements, such as test-sheet-open-expoui, test-toast-show, Tabs
  - Android, screen behind is hidden from the screen reader: still exposed: 45 elements, such as test-sheet-close, Component test screen, test-theme
  - Android, everything the screen reader lands on has a name: unnamed: AXViewGroup 384×832dp
- **gluestack**
  - iOS, touch target: 370×38pt
  - Android, touch target: 352×38dp
  - iOS, items are buttons: AXGroup label="Duplicate", and 2 more like it
  - iOS, screen behind is hidden from the screen reader: still exposed: 17 elements, such as test-dialog-open, test-sheet-open, test-sheet-open-expoui
  - Android, screen behind is hidden from the screen reader: still exposed: 44 elements, such as Component test screen, test-theme, test-theme-0
  - Android, everything the screen reader lands on has a name: unnamed: AXViewGroup 352×6dp, AXViewGroup 210×140dp
- **Tamagui**
  - Android, items are buttons: AXView label="Duplicate", and 2 more like it
  - iOS, screen behind is hidden from the screen reader: still exposed: 14 elements, such as test-sheet-open, test-sheet-open-tamagui, test-sheet-open-expoui
- **Reusables**
  - iOS, touch target: 370×40pt
  - Android, touch target: 352×40dp
  - iOS, items are buttons: AXGroup label="Duplicate", and 2 more like it
  - Android, screen behind is hidden from the screen reader: still exposed: 40 elements, such as Component test screen, test-theme-0, test-theme-1
  - Android, everything the screen reader lands on has a name: unnamed: AXViewGroup 384×832dp, AXView#test-menu 224×119dp

</details>

<a id="segmented-control"></a>

### Segmented control

| Check | Baseline<br>iOS / Android | Unistyles<br>iOS / Android | Uniwind<br>iOS / Android | NativeWind<br>iOS / Android | HeroUI<br>iOS / Android | gluestack<br>iOS / Android | Tamagui<br>iOS / Android | Reusables<br>iOS / Android |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| options have name and role | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ✅ / ✅ |
| selected option marked | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ✅ / ✅ |
| touch target | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ |
| selection moves on tap | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ✅ / ✅ |

<details>
<summary>What each check means</summary>

![Each segment is read with its label and a button, radio or tab role. When it fails, it sounds like plain text.](checks/pictures/segmented-nrs.svg)

- **options have name and role:** Reads each segment of the segmented control.
  - **Passes:** Each has a label and a button, radio or tab role.
  - **Fails:** A label or role is missing.

![The selected segment, Week, is read as selected, and the others aren’t. When it fails, nothing says which one is selected.](checks/pictures/segmented-selected.svg)

- **selected option marked:** Reads every segment’s state.
  - **Passes:** The selected one is marked as selected or checked, and the others aren’t.
  - **Fails:** Nothing says which is selected.

![Segment: the tappable area is at least 44 pt tall (48 dp on Android). When it fails, it is smaller than the dashed minimum.](checks/pictures/target-segmented.svg)

- **touch target:** Measures the control’s frame in the accessibility tree.
  - **Passes:** At least 44 × 44 pt on iOS (Apple’s default control size) and 48 × 48 dp on Android (Google’s minimum).
  - **Fails:** Either side is smaller, so it is easy to miss with a finger.

![Tapping Month moves the selected state to it. When it fails, the tree still says Week is selected.](checks/pictures/segmented-moves.svg)

- **selection moves on tap:** Taps the second segment and reads the states again.
  - **Passes:** The selected state moves to it.
  - **Fails:** It stays on the first, or isn’t marked at all.

All checks, with their pictures: [Method](method.md#checks-in-pictures).

</details>

<details>
<summary>Why checks failed</summary>

- **Tamagui**
  - iOS, options have name and role: label="Week" value="" traits=[] 123×44pt, and 2 more like it
  - Android, options have name and role: label="Week" value="" traits=[] 117×48dp, and 2 more like it
  - iOS, selected option marked: label="Week" value="" traits=[] 123×44pt, and 2 more like it
  - Android, selected option marked: label="Week" value="" traits=[] 117×48dp, and 2 more like it
  - iOS, selection moves on tap: label="Week" value="" traits=[] 123×44pt | label="Month" value="" traits=[] 123×44pt
  - Android, selection moves on tap: label="Week" value="" traits=[] 117×48dp | label="Month" value="" traits=[] 117×48dp
- **Reusables**
  - iOS, touch target: 124×40pt
  - Android, touch target: 118×40dp

</details>

<a id="bottom-sheets"></a>

### Bottom sheets

Each sheet gets the same 5 checks: opens, title and body readable, screen behind is hidden from the screen reader, closes, screen reachable again after close. Each cell is the number passed, iOS / Android: ✅ all passed, ❌ at least one failed, ➖ the app has no such sheet.

| Sheet | Baseline<br>iOS / Android | Unistyles<br>iOS / Android | Uniwind<br>iOS / Android | NativeWind<br>iOS / Android | HeroUI<br>iOS / Android | gluestack<br>iOS / Android | Tamagui<br>iOS / Android | Reusables<br>iOS / Android |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| @gorhom/bottom-sheet | ❌ 4/5 / ❌ 4/5 | ❌ 4/5 / ❌ 4/5 | ❌ 4/5 / ❌ 4/5 | ❌ 4/5 / ❌ 4/5 | ❌ 3/5 / ❌ 3/5 | ❌ 4/5 / ❌ 4/5 | ❌ 4/5 / ❌ 4/5 | ❌ 4/5 / ❌ 4/5 |
| @expo/ui BottomSheet | ✅ 5/5 / ✅ 5/5 | ✅ 5/5 / ✅ 5/5 | ✅ 5/5 / ✅ 5/5 | ✅ 5/5 / ✅ 5/5 | ✅ 5/5 / ✅ 5/5 | ✅ 5/5 / ✅ 5/5 | ✅ 5/5 / ✅ 5/5 | ✅ 5/5 / ✅ 5/5 |
| The library’s own sheet | ➖ / ➖ | ➖ / ➖ | ➖ / ➖ | ➖ / ➖ | ❌ 3/5 / ❌ 3/5 | ❌ 1/4 / ❌ 1/4 | ❌ 4/5 / ❌ 4/5 | ➖ / ➖ |

<details>
<summary>The three sheets</summary>

- **@gorhom/bottom-sheet:** the raw third-party sheet, themed with the library’s tokens
- **@expo/ui BottomSheet:** the native sheet, filled with @expo/ui’s own Text and Button
- **The library’s own sheet:** the sheet component the library ships, set up as its docs show

</details>

<details>
<summary>What each check means</summary>

![Tapping Show exercise details slides the sheet up from the bottom. When it fails, nothing new appears in the tree.](checks/pictures/sheet-opens.svg)

- **opens:** Taps the trigger and waits for the overlay’s content in the tree.
  - **Passes:** Its title or content appears.
  - **Fails:** Nothing appears in the tree after the tap.

![The sheet’s title and description are in the tree. When it fails, they are drawn but the screen reader can’t reach them.](checks/pictures/sheet-text.svg)

- **title and body readable:** Looks for the sheet’s title and body text in the tree.
  - **Passes:** Both are in the tree.
  - **Fails:** The text is drawn but the screen reader can’t reach it.

![With the sheet open, the screen reader can only reach the sheet. When it fails, it can still reach the screen above it.](checks/pictures/sheet-behind.svg)

- **screen behind is hidden from the screen reader:** With the overlay open, lists every element the screen reader can reach.
  - **Passes:** Only the overlay’s own elements: nothing from the screen behind it.
  - **Fails:** Controls behind the overlay can still be reached, e.g. “Delete workout, button” behind the dialog.

![Tapping Close slides the sheet away. When it fails, the sheet is still in the tree.](checks/pictures/sheet-closes.svg)

- **closes:** Taps the overlay’s own Close or Cancel button.
  - **Passes:** The overlay leaves the tree.
  - **Fails:** It is still open.

![After the sheet closes, the screen’s controls are back for the screen reader. When it fails, they stay hidden as if the sheet were still open.](checks/pictures/sheet-after.svg)

- **screen reachable again after close:** After the sheet closes, looks for the screen’s controls in the tree.
  - **Passes:** They are back, so the screen reader can use the screen again.
  - **Fails:** They are still hidden, as if the sheet were open.

All checks, with their pictures: [Method](method.md#checks-in-pictures).

</details>

<details>
<summary>Why checks failed</summary>

- **Baseline**
  - @gorhom/bottom-sheet, iOS, screen behind is hidden from the screen reader: still exposed: 15 elements, such as test-button-disabled, test-button-loading, Form
  - @gorhom/bottom-sheet, Android, screen behind is hidden from the screen reader: still exposed: 44 elements, such as Component test screen, test-theme, test-theme-0
- **Unistyles**
  - @gorhom/bottom-sheet, iOS, screen behind is hidden from the screen reader: still exposed: 15 elements, such as test-button-disabled, test-button-loading, Form
  - @gorhom/bottom-sheet, Android, screen behind is hidden from the screen reader: still exposed: 44 elements, such as Component test screen, test-theme, test-theme-0
- **Uniwind**
  - @gorhom/bottom-sheet, iOS, screen behind is hidden from the screen reader: still exposed: 15 elements, such as test-button-disabled, test-button-loading, Form
  - @gorhom/bottom-sheet, Android, screen behind is hidden from the screen reader: still exposed: 44 elements, such as Component test screen, test-theme, test-theme-0
- **NativeWind**
  - @gorhom/bottom-sheet, iOS, screen behind is hidden from the screen reader: still exposed: 15 elements, such as test-button-disabled, test-button-loading, Form
  - @gorhom/bottom-sheet, Android, screen behind is hidden from the screen reader: still exposed: 44 elements, such as Component test screen, test-theme, test-theme-0
- **HeroUI**
  - @gorhom/bottom-sheet, iOS, title and body readable: title and body text not in the system tree
  - @gorhom/bottom-sheet, iOS, screen behind is hidden from the screen reader: still exposed: 16 elements, such as test-button-disabled, test-button-loading, Form
  - @gorhom/bottom-sheet, Android, title and body readable: title and body text not in the system tree
  - @gorhom/bottom-sheet, Android, screen behind is hidden from the screen reader: still exposed: 46 elements, such as test-sheet-close, Component test screen, test-theme
  - The library’s own sheet, iOS, title and body readable: title and body text not in the system tree
  - The library’s own sheet, iOS, screen behind is hidden from the screen reader: still exposed: 16 elements, such as test-button-disabled, test-button-loading, Form
  - The library’s own sheet, Android, title and body readable: title and body text not in the system tree
  - The library’s own sheet, Android, screen behind is hidden from the screen reader: still exposed: 45 elements, such as Component test screen, test-theme, test-theme-0
- **gluestack**
  - @gorhom/bottom-sheet, iOS, screen behind is hidden from the screen reader: still exposed: 19 elements, such as test-button-loading, Form, test-textfield
  - @gorhom/bottom-sheet, Android, screen behind is hidden from the screen reader: still exposed: 45 elements, such as Component test screen, test-theme, test-theme-0
  - The library’s own sheet, iOS, title and body readable: title and body text not in the system tree
  - The library’s own sheet, iOS, screen behind is hidden from the screen reader: still exposed: 19 elements, such as test-button-loading, Form, test-textfield
  - The library’s own sheet, iOS, closes: still open
  - The library’s own sheet, Android, title and body readable: title and body text not in the system tree
  - The library’s own sheet, Android, screen behind is hidden from the screen reader: still exposed: 45 elements, such as Component test screen, test-theme, test-theme-0
  - The library’s own sheet, Android, closes: still open
- **Tamagui**
  - @gorhom/bottom-sheet, iOS, screen behind is hidden from the screen reader: still exposed: 11 elements, such as Form, test-textfield, test-switch
  - @gorhom/bottom-sheet, Android, screen behind is hidden from the screen reader: still exposed: 45 elements, such as test-sheet-tamagui-close, Component test screen, test-theme-0
  - The library’s own sheet, iOS, screen behind is hidden from the screen reader: still exposed: 15 elements, such as test-textfield, test-switch, test-radiogroup-0
  - The library’s own sheet, Android, screen behind is hidden from the screen reader: still exposed: 44 elements, such as Component test screen, test-theme-0, test-theme-1
- **Reusables**
  - @gorhom/bottom-sheet, iOS, screen behind is hidden from the screen reader: still exposed: 18 elements, such as test-button-loading, Form, test-textfield
  - @gorhom/bottom-sheet, Android, screen behind is hidden from the screen reader: still exposed: 41 elements, such as Component test screen, test-theme-0, test-theme-1

</details>

<a id="dark-and-brand-themes"></a>

## Dark and brand themes

Every check also ran in the dark and brand themes, on both platforms. The tables above show light.

- **No check changed:** every check gave the same result in the dark and brand themes as in light, on both platforms.

<a id="charts"></a>

## Charts

<a id="accessibility"></a>

### Accessibility

![Accessibility: the test screen](charts/accessibility-test-screen.svg)

**Measured on** iOS: iPhone 17 simulator (iOS 27.0). Android: Galaxy A15 5G (Android 16).

**How to read it:**

- The baseline and the three styling engines share the same hand-built components. Their bars are what careful hand-built accessibility reaches.
- A library’s gap to them is what you would have to fix yourself.

![Accessibility: the extra bottom sheets](charts/accessibility-extra-sheets.svg)

**Measured on** iOS: iPhone 17 simulator (iOS 27.0). Android: Galaxy A15 5G (Android 16).

**How to read it:**

- Sheets: @expo/ui in every app, Tamagui’s and gluestack’s own, and a raw @gorhom sheet in HeroUI.

<a id="speed-memory-and-scrolling"></a>

### Speed, memory and scrolling

Compare apps within a platform. iOS is an iPhone 12 Pro, Android a budget Galaxy A15.

![Theme switch, median of 10](charts/theme-switch.svg)

**Measured on** iOS: iPhone 12 Pro (iOS 26.6.1). Android: Galaxy A15 5G (Android 16).

**How to read it:**

- iOS: five apps take two frames (about 33 ms), gluestack and HeroUI about 65 ms, Tamagui 116 ms.
- Android: Tamagui (630 ms) stands out, then HeroUI (239 ms).
- The other gaps are within each app’s run-to-run spread.

![200-row list mount, median of 10](charts/list-mount.svg)

**Measured on** iOS: iPhone 12 Pro (iOS 26.6.1). Android: Galaxy A15 5G (Android 16).

**How to read it:**

- iOS: 94–102 ms in most apps, NativeWind 118 ms and Tamagui 135 ms.
- Android: most apps take 150–180 ms, with overlapping ranges. Tamagui takes 365 ms.

![Startup until readable, median of 10](charts/startup.svg)

**Measured on** iOS: iPhone 12 Pro (iOS 26.6.1). Android: Galaxy A15 5G (Android 16).

**How to read it:**

- Within each platform the apps sit close together, so read them as groups.
- iOS: 1.2–1.3 s in every app, which is within one poll of the accessibility tree (about 0.5 s), so they can’t be told apart.
- Android: 2.8–3.5 s, with the component libraries at the slow end.

![Memory at idle](charts/memory-idle.svg)

**Measured on** iOS: iPhone 12 Pro (iOS 26.6.1). Android: Galaxy A15 5G (Android 16).

**How to read it:**

- Compare apps within a platform, not across: the two are different measures.
- On both, the component libraries use more than the baseline, and HeroUI the most.

![Memory after use](charts/memory-used.svg)

**Measured on** iOS: iPhone 12 Pro (iOS 26.6.1). Android: Galaxy A15 5G (Android 16).

**How to read it:**

- iOS: Tamagui (144 MiB) stands out.
- Android: HeroUI (416 MiB) and gluestack (286 MiB) grow far more than the rest.

![App CPU time during 5 list flings](charts/cpu-flings.svg)

**Measured on** iOS: iPhone 12 Pro (iOS 26.6.1). Android: Galaxy A15 5G (Android 16).

**How to read it:**

- Compare apps within a platform: on the iPhone each fling is injected by XCUITest, which spreads the 5 over about 27 s and adds its own work.
- Tamagui uses the most on iOS, HeroUI on Android, and each is second on the other.

![Dropped frames during the flings](charts/dropped-frames.svg)

**Measured on** iOS: iPhone 12 Pro (iOS 26.6.1). Android: Galaxy A15 5G (Android 16).

**How to read it:**

- At most 1 in any app on either phone, so scrolling is smooth everywhere.

<a id="bundle-size-and-re-renders"></a>

### Bundle size and re-renders

![JS bundle](charts/bundle.svg)

**Measured on** no device, built with expo export.

**How to read it:**

- Exact, with no run-to-run noise.
- The baseline is plain React Native, so the gap to it is what the library adds.

![Components re-rendered on one theme switch](charts/rerenders.svg)

**Measured on** iOS: iPhone 17 simulator (iOS 27.0). Android: Galaxy A15 5G (Android 16).

**How to read it:**

- Unistyles re-renders the fewest on both platforms, HeroUI and Tamagui the most.
- Tamagui has Android counts only: its Debug build aborts on iOS. A closed Select keeps a hidden `display: none` view, which trips an open React Native bug, [react-native#52349](https://github.com/react/react-native/issues/52349). Release builds aren’t affected.

<!-- begin:navfoot -->

---

← [Back to README](../README.md)
<!-- end:navfoot -->
