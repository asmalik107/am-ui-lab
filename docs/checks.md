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
- **Under each table**, two fold-outs say what each check means and why any check failed.
- **NativeWind** results use a line-height workaround. See `apps/nativewind/NOTES.md`.

<a id="accessibility-checks"></a>

## Accessibility checks

**Checks that give a different result on iOS and Android,** per app:

- **Baseline:** 2
- **Unistyles:** 2
- **Uniwind:** 2
- **NativeWind:** 2
- **HeroUI:** 9
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

- **name, role, state:** The screen reader gets a label, the right role, and the current state (disabled, busy, on/off, checked, selected).
- **touch target:** At least 44 × 44 pt on iOS (Apple’s default) and 48 × 48 dp on Android (Google’s minimum).

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

- **name, role, state:** The screen reader gets a label, the right role, and the current state (disabled, busy, on/off, checked, selected).
- **touch target:** At least 44 × 44 pt on iOS (Apple’s default) and 48 × 48 dp on Android (Google’s minimum).

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

- **name, role, state:** The screen reader gets a label, the right role, and the current state (disabled, busy, on/off, checked, selected).
- **touch target:** At least 44 × 44 pt on iOS (Apple’s default) and 48 × 48 dp on Android (Google’s minimum).

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

- **name, role, state:** The screen reader gets a label, the right role, and the current state (disabled, busy, on/off, checked, selected).
- **error shown:** After an invalid entry, the error message appears in the tree.
- **error reachable from field:** The error is part of the field’s label, value or hint, so it’s read with the field.

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

- **name, role, state:** The screen reader gets a label, the right role, and the current state (disabled, busy, on/off, checked, selected).
- **touch target:** At least 44 × 44 pt on iOS (Apple’s default) and 48 × 48 dp on Android (Google’s minimum).

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

- **name, role, state:** The screen reader gets a label, the right role, and the current state (disabled, busy, on/off, checked, selected).
- **touch target:** At least 44 × 44 pt on iOS (Apple’s default) and 48 × 48 dp on Android (Google’s minimum).

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

- **name, role, state:** The screen reader gets a label, the right role, and the current state (disabled, busy, on/off, checked, selected).
- **touch target:** At least 44 × 44 pt on iOS (Apple’s default) and 48 × 48 dp on Android (Google’s minimum).

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

- **name, role, state:** The screen reader gets a label, the right role, and the current state (disabled, busy, on/off, checked, selected).
- **touch target:** At least 44 × 44 pt on iOS (Apple’s default) and 48 × 48 dp on Android (Google’s minimum).

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

- **name, role, state:** The screen reader gets a label, the right role, and the current state (disabled, busy, on/off, checked, selected).
- **touch target:** At least 44 × 44 pt on iOS (Apple’s default) and 48 × 48 dp on Android (Google’s minimum).

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

- **name, role, state:** The screen reader gets a label, the right role, and the current state (disabled, busy, on/off, checked, selected).
- **touch target:** At least 44 × 44 pt on iOS (Apple’s default) and 48 × 48 dp on Android (Google’s minimum).

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

- **all options exposed:** All three options are separate elements the screen reader can reach.
- **group label read:** The group label is in the tree.

</details>

No check failed for any app.

<a id="dialog"></a>

### Dialog

| Check | Baseline<br>iOS / Android | Unistyles<br>iOS / Android | Uniwind<br>iOS / Android | NativeWind<br>iOS / Android | HeroUI<br>iOS / Android | gluestack<br>iOS / Android | Tamagui<br>iOS / Android | Reusables<br>iOS / Android |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| opens | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| screen behind is hidden from the screen reader | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | ❌ / ❌ | ❌ / ❌ | ❌ / ❌ |
| every stop has a name | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ❌ ⚠️ | ✅ / ❌ ⚠️ | ✅ / ✅ | ✅ / ✅ |
| title is a heading | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ❌ ⚠️ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ |
| actions are buttons | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| closes | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |

<details>
<summary>What each check means</summary>

- **opens:** Opens when its trigger is tapped.
- **screen behind is hidden from the screen reader:** While open, nothing behind it is in the accessibility tree.
- **every stop has a name:** 
- **title is a heading:** The title has the heading role.
- **actions are buttons:** Its actions have the button role.
- **closes:** Closes from its own Close or Cancel button.

</details>

<details>
<summary>Why checks failed</summary>

- **HeroUI**
  - iOS, screen behind is hidden from the screen reader: still exposed: 16 elements, such as test-button-disabled, test-button-loading, Form
  - Android, screen behind is hidden from the screen reader: still exposed: 46 elements, such as test-sheet-close, Component test screen, test-theme
  - Android, every stop has a name: unnamed: AXViewGroup 384×832dp
  - Android, title is a heading: AXViewGroup label="Delete this workout?, This removes the workout and its logged sets. You cannot undo this., Delete this workout?"
- **gluestack**
  - iOS, screen behind is hidden from the screen reader: still exposed: 19 elements, such as test-theme-0, test-theme-1, test-theme-2
  - Android, screen behind is hidden from the screen reader: still exposed: 45 elements, such as Component test screen, test-theme, test-theme-0
  - Android, every stop has a name: unnamed: AXViewGroup 384×832dp
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
| every stop has a name | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ❌ ⚠️ | ✅ / ✅ | n/r / ✅ | ✅ / ❌ ⚠️ |
| new value read on trigger | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ❌ | n/r / ✅ | ✅ / ✅ |
| test could run | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ✅ ⚠️ | ✅ / ✅ |

<details>
<summary>What each check means</summary>

- **opens:** Opens when its trigger is tapped.
- **current option marked:** The selected option is marked as checked or selected.
- **options are actionable:** Options have a button, radio or option role.
- **screen behind is hidden from the screen reader:** While open, nothing behind it is in the accessibility tree.
- **every stop has a name:** 
- **new value read on trigger:** After picking, the trigger announces the new value.
- **test could run:** The element the test needs was there, so the test could run.

</details>

<details>
<summary>Why checks failed</summary>

- **HeroUI**
  - iOS, options are actionable: AXGroup label="30 seconds" value="unchecked, 30 seconds", and 4 more like it
  - Android, options are actionable: AXViewGroup label="30 seconds" value="unchecked", and 4 more like it
  - iOS, screen behind is hidden from the screen reader: still exposed: 16 elements, such as test-theme-0, test-theme-1, test-theme-2
  - Android, screen behind is hidden from the screen reader: still exposed: 45 elements, such as test-sheet-close, Component test screen, test-theme
  - Android, every stop has a name: unnamed: AXViewGroup 384×832dp
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
  - iOS, test could run: element test-select not in tree
- **Reusables**
  - iOS, current option marked: AXGroup label="60 seconds"
  - iOS, options are actionable: AXGroup label="30 seconds", and 4 more like it
  - Android, options are actionable: AXViewGroup label="30 seconds", and 4 more like it
  - Android, screen behind is hidden from the screen reader: still exposed: 40 elements, such as Component test screen, test-theme-0, test-theme-1
  - Android, every stop has a name: unnamed: AXViewGroup 384×832dp

</details>

<a id="toast"></a>

### Toast

| Check | Baseline<br>iOS / Android | Unistyles<br>iOS / Android | Uniwind<br>iOS / Android | NativeWind<br>iOS / Android | HeroUI<br>iOS / Android | gluestack<br>iOS / Android | Tamagui<br>iOS / Android | Reusables<br>iOS / Android |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| in accessibility tree | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |

<details>
<summary>What each check means</summary>

- **in accessibility tree:** The toast appears in the tree while it is on screen.

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

- **name, role, value:** The screen reader gets a label, the adjustable role and the current value.
- **touch target:** At least 44 × 44 pt on iOS (Apple’s default) and 48 × 48 dp on Android (Google’s minimum).
- **dragging changes the value:** Dragging the thumb changes the value in the tree. It stands in for the screen reader’s adjust gesture.

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

- **name and value:** The screen reader gets a label and the current value.

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
| test could run | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ❌ / ✅ ⚠️ | ✅ / ✅ |

<details>
<summary>What each check means</summary>

- **header is a button:** The section header has the button role.
- **touch target:** At least 44 × 44 pt on iOS (Apple’s default) and 48 × 48 dp on Android (Google’s minimum).
- **expanded state exposed:** The header reads as expanded when open and not when closed.
- **content shows and hides:** The section text appears on the first tap and goes on the second.
- **test could run:** The element the test needs was there, so the test could run.

</details>

<details>
<summary>Why checks failed</summary>

- **gluestack**
  - iOS, touch target: 368×20pt
  - Android, touch target: 350×20dp
- **Tamagui**
  - iOS, header is a button: missing
  - Android, header is a button: label="Warm-up, ▾" value="collapsed" traits=[] 99×53dp
  - iOS, test could run: element test-accordion-0 not in tree

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
| every stop has a name | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ❌ ⚠️ | ✅ / ❌ ⚠️ | ✅ / ✅ | ✅ / ❌ ⚠️ |
| closes after an action | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |

<details>
<summary>What each check means</summary>

- **trigger name and role:** The menu button has a label and the button role.
- **touch target:** At least 44 × 44 pt on iOS (Apple’s default) and 48 × 48 dp on Android (Google’s minimum).
- **opens:** Opens when its trigger is tapped.
- **items are buttons:** Each menu action has the button role.
- **screen behind is hidden from the screen reader:** While open, nothing behind it is in the accessibility tree.
- **every stop has a name:** 
- **closes after an action:** Choosing an action closes the menu.

</details>

<details>
<summary>Why checks failed</summary>

- **HeroUI**
  - iOS, items are buttons: AXGroup label="Duplicate", and 2 more like it
  - iOS, screen behind is hidden from the screen reader: still exposed: 16 elements, such as test-sheet-open-expoui, test-toast-show, Tabs
  - Android, screen behind is hidden from the screen reader: still exposed: 45 elements, such as test-sheet-close, Component test screen, test-theme
  - Android, every stop has a name: unnamed: AXViewGroup 384×832dp
- **gluestack**
  - iOS, touch target: 370×38pt
  - Android, touch target: 352×38dp
  - iOS, items are buttons: AXGroup label="Duplicate", and 2 more like it
  - iOS, screen behind is hidden from the screen reader: still exposed: 17 elements, such as test-dialog-open, test-sheet-open, test-sheet-open-expoui
  - Android, screen behind is hidden from the screen reader: still exposed: 44 elements, such as Component test screen, test-theme, test-theme-0
  - Android, every stop has a name: unnamed: AXViewGroup 352×6dp, AXViewGroup 210×140dp
- **Tamagui**
  - Android, items are buttons: AXView label="Duplicate", and 2 more like it
  - iOS, screen behind is hidden from the screen reader: still exposed: 14 elements, such as test-sheet-open, test-sheet-open-tamagui, test-sheet-open-expoui
- **Reusables**
  - iOS, touch target: 370×40pt
  - Android, touch target: 352×40dp
  - iOS, items are buttons: AXGroup label="Duplicate", and 2 more like it
  - Android, screen behind is hidden from the screen reader: still exposed: 40 elements, such as Component test screen, test-theme-0, test-theme-1
  - Android, every stop has a name: unnamed: AXViewGroup 384×832dp, AXView#test-menu 224×119dp

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

- **options have name and role:** Each option has a label and a button, radio or tab role.
- **selected option marked:** The selected option is marked as selected or checked, and the others aren’t.
- **touch target:** At least 44 × 44 pt on iOS (Apple’s default) and 48 × 48 dp on Android (Google’s minimum).
- **selection moves on tap:** Tapping another option moves the selected state to it.

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
