<a id="results"></a>

# Results

<!-- begin:nav -->
**The docs:**

- [README](../README.md): the answer, the scorecard and each library
- [Site](https://asmalik107.github.io/am-ui-lab/): the scorecard, every check and the charts, sortable and filterable
- **Results** (this page): every check, with the iOS and Android numbers
- [Method](method.md): how each check was measured, its limits, and how to reproduce it
- [iOS accessibility](ios-accessibility.md): every iOS accessibility failure, with the line of code that causes it
- [Android accessibility](android-accessibility.md): every Android accessibility failure, with the line of code that causes it
- [All checks](checks.md): every accessibility check for every app, one table per component, plus the charts
- [To do](../TODO.md): what is left to measure, and how
<!-- end:nav -->

Every check, one section each, with iOS and Android side by side.

- **Apps and devices:** listed in the [README](../README.md#what-was-tested).
- **How each check works:** in [Method](method.md).
- **Every number was measured.** Where something couldn't be, it says so.

<!-- begin:kinds -->
**Baseline**

This project’s own reference app, not a library.

- Plain React Native, with every component written by hand
- Accessibility written by hand too
- Every library is measured against it

**Styling engines**

They style components you write yourself. Here they restyle the baseline’s components, so they keep its accessibility.

- [Unistyles](https://www.unistyl.es) 3.6.0
- [Uniwind](https://uniwind.dev) 1.13.0
  - Tailwind 4.3.3
- [NativeWind](https://www.nativewind.dev) 5.0.0-rc.0
  - react-native-css 3.1.0-rc.0
  - Tailwind 4.1.12

**Component libraries**

Ready-made buttons, dialogs, sheets and more, each with its own accessibility.

- [Tamagui](https://tamagui.dev) 3.1.2
- [gluestack](https://gluestack.io) 5.0.15
  - The version of @gluestack-ui/core
  - On Uniwind 1.13.0
- [HeroUI Native](https://heroui.com/docs/native) 1.0.11
  - On Uniwind 1.13.0
- [React Native Reusables](https://reactnativereusables.com) CLI 0.7.1
  - @rn-primitives 1.5.2
  - On Uniwind 1.13.0
<!-- end:kinds -->

<a id="contents"></a>

## Contents

- [In brief](#in-brief)
- [Accessibility](#accessibility)
- [Largest text size](#largest-text-size)
- [Reduced motion](#reduced-motion)
- [Timings](#timings)
- [Startup, memory and scrolling](#startup-memory-and-scrolling)
- [Bundle size and re-renders](#bundle-size-and-re-renders)
- [Developer cost](#developer-cost)

<a id="in-brief"></a>

## In brief

- **Accessibility**
  - Baseline and styling engines
    - iOS: 58 of 62 checks
    - Android: 60 of 62 checks
  - Component libraries: 35 to 47 checks, with much the same gaps on both platforms
  - Light, dark and brand themes: no check changed on either platform
- **Where the platforms disagree**
  - The `combobox` and `tab` roles reach TalkBack but not VoiceOver, so every app passes those two on Android only
  - Controls 44 tall
    - Pass Apple's 44 pt
    - Fail Google's 48 dp
  - Each component library has a few more of its own, listed under [Accessibility](#accessibility)
  - How the platforms are measured differently: [Method](method.md#ios-and-android)
- **Largest text size**
  - iOS: controls grow with the text
  - Android: most controls are already 48 dp tall and the text fits inside, so few change height
  - Reusables' button labels are cut off on both
- **Reduced motion:** every animated overlay drops to one or two frames, on both platforms.
- **Speed**
  - iOS: every app switches theme within a frame, except Tamagui (99 ms)
  - Android: the apps spread out
    - Tamagui: 630 ms, about 6 times the baseline
    - HeroUI, gluestack and NativeWind: 180 to 240 ms
    - Unistyles: the fastest, ahead of the baseline
- **Memory**
  - Android, growth after use
    - HeroUI: roughly doubles (199 → 416 MiB)
    - gluestack: +103 MiB
    - The others: about +50 MiB
  - iOS: Tamagui uses the most
- **Scrolling:** smooth on the phone in every app
  - At most 1 janky frame in about 1,250

<a id="accessibility"></a>

## Accessibility

`scripts/a11y-audit.mjs` checks every control's name, role, state and touch-target size. Then the harder cases:

- that a text-field error is reachable from the field
- that the screen behind a dialog, bottom sheet, select or menu is hidden from the screen reader
- that toasts reach the accessibility tree
- the slider, progress bar, accordion, menu and segmented control

- **Themes:** every check runs in the light, dark and brand themes. The table shows light.
- **Checks that differ:** checks that pass on one platform and fail on the other.

<!-- begin:accessibility -->
**Measured on** iOS: iPhone 17 simulator (iOS 27.0). Android: Galaxy A15 5G (Android 16).

| App | Test screen, iOS | Test screen, Android | Extra sheets, iOS | Extra sheets, Android | All checks, iOS | All checks, Android | Checks that differ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| baseline | 57 / 61 | 59 / 61 | 6 / 6 | 6 / 6 | 63 / 67 | 65 / 67 | 2 |
| unistyles | 57 / 61 | 59 / 61 | 6 / 6 | 6 / 6 | 63 / 67 | 65 / 67 | 2 |
| uniwind | 57 / 61 | 59 / 61 | 6 / 6 | 6 / 6 | 63 / 67 | 65 / 67 | 2 |
| nativewind | 57 / 61 | 59 / 61 | 6 / 6 | 6 / 6 | 63 / 67 | 65 / 67 | 2 |
| tamagui | 30 / 50 | 44 / 61 | 11 / 12 | 11 / 12 | 41 / 62 | 55 / 73 | 5 |
| gluestack | 33 / 61 | 32 / 61 | 8 / 11 | 8 / 11 | 41 / 72 | 40 / 72 | 5 |
| heroui | 40 / 61 | 39 / 61 | 10 / 12 | 10 / 12 | 50 / 73 | 49 / 73 | 9 |
| reusables | 36 / 61 | 39 / 61 | 6 / 6 | 6 / 6 | 42 / 67 | 45 / 67 | 11 |
<!-- end:accessibility -->

<a id="failing-in-every-app-on-both-platforms"></a>

### Failing in every app, on both platforms

The baseline included.

- **`@expo/ui` Switch is too small to tap**
  - iOS: 28 pt tall, 44 needed
  - Android: 47.6 dp, one pixel short of 48
- **@gorhom bottom sheet leaves the screen behind it reachable**
  - Only the `@expo/ui` BottomSheet passes every sheet check on both platforms

<a id="where-the-platforms-disagree"></a>

### Where the platforms disagree

- **Every app**
  - `role="combobox"` (the select trigger) and `role="tab"` reach TalkBack but give VoiceOver no trait, so they fail on iOS only
  - These are the baseline's 2 differences
- **Touch targets 44 tall**
  - Pass Apple's 44 pt
  - Fail Google's 48 dp
  - Affected:
    - Tamagui's buttons, tabs, menu and segmented control
    - gluestack's and HeroUI's segmented control
    - Reusables' slider
- **Tamagui**
  - Disabled button and slider: usable element on Android only
  - Menu: hides the screen behind it on Android only
  - Menu items: buttons on iOS only
  - Select and Accordion: tested on Android only
    - On iOS they're not in the tree, so they couldn't be tested
- **gluestack**
  - Loading button says "In progress" on iOS only
  - Its own BottomSheet's text: readable on Android only
  - Menu items are menu items on Android only
- **HeroUI**
  - Dialog title is a heading on iOS only
  - Sheet text: readable on Android only
  - Slider and menu items get a role on Android only
- **Reusables**
  - Select marks the current option on Android only
  - Select and menu hide the screen behind them on iOS only

<a id="failing-on-both-platforms-by-library"></a>

### Failing on both platforms, by library

- **Tamagui**
  - Switch and checkbox have no name
  - Select trigger reads only its value
  - The dialog and every sheet but `@expo/ui`'s leave the screen behind reachable
- **gluestack**
  - Controls are 22 to 40 tall
  - Switch has no name
  - Field error isn't linked to the field
  - Slider has no value
  - Its own BottomSheet doesn't close
- **HeroUI**
  - Labelled switch and checkbox rows swallow the control's name, role and state
  - Field error isn't linked to the field
- **Reusables**
  - Small controls: the checkbox is 16 tall
  - Text field and checkbox have no name
  - Field error isn't linked to the field
  - Progress always reads 0%

<a id="notes"></a>

### Notes

- **Every iOS failure**, with the line of code that causes it: [iOS accessibility](ios-accessibility.md).
- **Every Android failure**, with its cause: [Android accessibility](android-accessibility.md).
- **NativeWind's score** is with a line-height workaround. Without it the page was 18 screens tall (see `apps/nativewind/NOTES.md`).

[How this was measured →](method.md#accessibility-checks)

<a id="largest-text-size"></a>

## Largest text size

`scripts/textsize-test.mjs` compares control heights at the default text size and the largest one.

- **iOS screenshots:** `results/<app>/textsize-*.png`
- **Android screenshots:** `results/<app>/android-textsize-*.png`

<!-- begin:textsize -->
**Measured on** iOS: iPhone 17 simulator (iOS 27.0). Android: Galaxy A15 5G (Android 16).

| App | Controls that grew, iOS (AX5) | Controls that grew, Android (2.0) | Pushed off screen, iOS | Pushed off screen, Android |
| --- | --- | --- | --- | --- |
| baseline | 16 / 17 | 1 / 16 | native-switch | native-switch |
| unistyles | 16 / 17 | 1 / 16 | native-switch | native-switch |
| uniwind | 16 / 17 | 1 / 16 | native-switch | native-switch |
| nativewind | 16 / 17 | 1 / 16 | native-switch | native-switch |
| tamagui | 9 / 13 | 5 / 16 | native-switch | native-switch |
| gluestack | 15 / 16 | 13 / 16 | tabs-2, native-switch | native-switch |
| heroui | 11 / 16 | 9 / 16 | tabs-2, native-switch | native-switch |
| reusables | 2 / 17 | 1 / 16 | tabs-0, tabs-2, native-switch | native-switch |
<!-- end:textsize -->

- **Growth works differently on the two platforms**
  - iOS (AX5): controls grow with their text
    - The baseline's button goes from 44 to 72 pt
  - Android (font scale 2.0): the baseline's controls are already 48 dp tall, and the bigger text fits inside
    - Only the text field gets taller
  - gluestack, HeroUI and Tamagui size their controls from the text, so more of theirs grow
- **Pushed off screen**
  - The `@expo/ui` Switch, in every app, on both platforms
  - Some tabs in gluestack, HeroUI and Reusables, on iOS
- **Clipping seen in the screenshots**
  - Reusables: button labels cut off on both platforms (fixed-height buttons)
  - HeroUI: partly cut off on iOS only
  - No other app clips

[How this was measured →](method.md#accessibility-checks)

<a id="reduced-motion"></a>

## Reduced motion

`scripts/motion-test.mjs` times how long each overlay takes to open.

- Measured from a real-time screen recording
- Reduced motion off, then on
- One frame is 33 ms

<!-- begin:motion -->
**Measured on** iOS: iPhone 17 simulator (iOS 27.0). Android: Galaxy A15 5G (Android 16).

| App | Dialog, iOS | Dialog, Android | Bottom sheet, iOS | Bottom sheet, Android |
| --- | --- | --- | --- | --- |
| baseline | 333 → 67 ms | 233 → 33 ms | 400 → 33 ms | 233 → 67 ms |
| unistyles | 333 → 67 ms | 267 → 67 ms | 400 → 33 ms | 233 → 33 ms |
| uniwind | 333 → 67 ms | 267 → 33 ms | 400 → 33 ms | 200 → 33 ms |
| nativewind | 433 → 67 ms | 233 → 67 ms | 400 → 33 ms | 300 → 67 ms |
| tamagui | 100 → 100 ms | 33 → 33 ms | 400 → 33 ms | 267 → 33 ms |
| gluestack | 233 → 33 ms | 267 → 33 ms | 467 → 33 ms | 233 → 33 ms |
| heroui | 233 → 33 ms | 267 → 67 ms | 567 → 67 ms | 467 → 33 ms |
| reusables | 133 → 33 ms | 233 → 67 ms | 367 → 33 ms | 300 → 33 ms |
<!-- end:motion -->

- **Every animated overlay respects reduced motion** on both platforms, dropping to one or two frames.
- **Tamagui's dialog** has no open animation on either platform.
- **HeroUI's bottom sheet** is the slowest open on both platforms (567 ms on iOS, 467 ms on Android).
- **Android figures are the median of 3 recordings** (2 November 2026). The recordings are in `results/<app>/android-motion.md`.
  - One recording put Unistyles' dialog at 500 ms; with 3 it's 267 ms, level with the other hand-built apps
- **iOS figures are one recording each,** so a frame or two either way is noise.
- **Not tested:** turning reduced motion on while the app runs.

[How this was measured →](method.md#accessibility-checks)

<a id="timings"></a>

## Timings

`scripts/perf-run.mjs` times from the tap to the second frame after the update.

- 10 runs each, shown as median (range)
- One frame is 16.7 ms on both devices

<!-- begin:timings -->
**Measured on** iOS: iPhone 12 Pro (iOS 26.6.1). Android: Galaxy A15 5G (Android 16).

| App | Theme switch, iOS | Theme switch, Android | List mount, iOS | List mount, Android |
| --- | --- | --- | --- | --- |
| baseline | 32.5 ms (32–33) | 98.9 ms (87–164) | 100.5 ms (82–119) | 147.6 ms (141–177) |
| unistyles | 32.5 ms (32–33) | 70.6 ms (54–139) | 101.7 ms (100–103) | 150.4 ms (137–173) |
| uniwind | 32.7 ms (20–33) | 136.8 ms (104–178) | 101.3 ms (69–103) | 163.9 ms (139–183) |
| nativewind | 32.6 ms (32–37) | 183.4 ms (154–207) | 118.1 ms (99–136) | 189.3 ms (171–294) |
| tamagui | 115.9 ms (116–116) | 629.6 ms (583–676) | 135.1 ms (115–152) | 365.1 ms (290–447) |
| gluestack | 65.5 ms (32–66) | 192.0 ms (137–244) | 98.9 ms (82–117) | 142.6 ms (134–164) |
| heroui | 65.2 ms (32–82) | 238.7 ms (206–324) | 98.4 ms (82–117) | 203.5 ms (188–253) |
| reusables | 32.5 ms (32–66) | 96.8 ms (82–123) | 94.0 ms (82–120) | 161.3 ms (143–199) |
<!-- end:timings -->

- **iOS:** on the iPhone 12 Pro five apps switch theme in two frames. gluestack and HeroUI take about 65 ms, Tamagui 116 ms.
- **Android:** the apps spread out. Tamagui is the slowest on both platforms.
- **Unistyles** is the fastest theme switch on Android
  - Unistyles: 71 ms
  - Baseline: 99 ms
  - It applies styles natively
- **Reusables** is level with the baseline.
- **iOS run counts**
  - A run only counts when the readout changes
  - Two runs in a row with exactly the same time can't be told apart from no update
  - So some iOS apps have fewer than 10 runs (as few as 8)

[How this was measured →](method.md#performance-checks)

<a id="startup-memory-and-scrolling"></a>

## Startup, memory and scrolling

`scripts/metrics-run.mjs`: Release builds, 10 cold launches.

<!-- begin:metrics -->
**Measured on** iOS: iPhone 12 Pro (iOS 26.6.1). Android: Galaxy A15 5G (Android 16).

| App | Startup, iOS | Startup, Android | Memory idle → used, iOS | Memory idle → used, Android | CPU in flings, iOS | CPU in flings, Android | Frame hitches, iOS | Janky frames, Android |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| baseline | 1.25 s | 2.80 s | 54.9 → 123.1 MiB | 163.1 → 212.9 MiB | 8.14 s | 8.62 s | 1 of 940 | 0 of 1232 |
| unistyles | 1.30 s | 2.87 s | 56.6 → 123.8 MiB | 170.5 → 224.6 MiB | 7.22 s | 8.95 s | 1 of 906 | 0 of 1244 |
| uniwind | 1.19 s | 2.95 s | 56.2 → 94.4 MiB | 163.7 → 214.5 MiB | 8.11 s | 8.60 s | 0 of 913 | 0 of 1238 |
| nativewind | 1.30 s | 3.02 s | 58.7 → 110.0 MiB | 164.4 → 196.8 MiB | 8.99 s | 8.77 s | 0 of 1010 | 0 of 1212 |
| tamagui | 1.32 s | 3.42 s | 75.1 → 143.7 MiB | 182.8 → 228.3 MiB | 18.59 s | 9.65 s | 1 of 1017 | 1 of 1296 |
| gluestack | 1.30 s | 3.34 s | 69.4 → 116.6 MiB | 182.3 → 285.7 MiB | 8.35 s | 8.89 s | 1 of 977 | 0 of 1232 |
| heroui | 1.31 s | 3.53 s | 90.0 → 119.1 MiB | 199.3 → 415.6 MiB | 11.49 s | 10.26 s | 1 of 1085 | 0 of 1250 |
| reusables | 1.31 s | 3.21 s | 69.7 → 112.4 MiB | 173.8 → 221.8 MiB | 8.70 s | 8.39 s | 0 of 1016 | 1 of 1240 |
<!-- end:metrics -->

- **Startup**
  - From the launch call until the screen title is in the accessibility tree, when the screen reader could first read it. Not first paint
  - Within each platform the apps sit close together, and the figure moves from day to day. Read it as a group
  - Android's own first-frame time (`am start -W`, the splash screen) is in `results/<app>/android-metrics.md`
- **Memory**
  - Idle: 5 s after launch
  - Used: after scrolling the list and opening and closing every overlay once
- **CPU**
  - User plus system time of the app's threads while the list is flung 5 times
  - On the iPhone each fling is injected by XCUITest, which adds its own work and spreads the 5 flings over about 27 s, so compare iOS apps with each other only
- **Frame hitches, iOS:** from Instruments' Animation Hitches template on the iPhone, out of the frames rendered during the flings. At most one 17 ms hitch in any app
- **Janky frames, Android:** from `dumpsys gfxinfo`

[How this was measured →](method.md#performance-checks)

<a id="bundle-size-and-re-renders"></a>

## Bundle size and re-renders

- **Bundle size:** the Hermes bytecode from `npx expo export`, once per platform (`scripts/bundle-size.mjs`).
  - Android measured on 2 November 2026
- **Re-renders:** components React rendered for light → dark, dark → brand and brand → light.
  - Counted with argent's React profiler on a Debug build (`scripts/rerender-run.mjs`)

<!-- begin:ioscode -->
**Measured on** bundle size: no device, built with `npx expo export`. Re-renders: iPhone 17 simulator (iOS 27.0) on iOS, Galaxy A15 5G (Android 16) on Android.

| App | JS bundle, iOS | JS bundle, Android | Components rendered per theme switch, iOS | Components rendered per theme switch, Android |
| --- | --- | --- | --- | --- |
| baseline | 3.95 MB | 4.09 MB | 298 / 298 / 290 | 294 / 294 / 285 |
| unistyles | 4.15 MB | 4.29 MB | 128 / 128 / 126 | 123 / 123 / 121 |
| uniwind | 4.24 MB | 4.38 MB | 507 / 509 / 302 | 503 / 299 / 503 |
| nativewind | 4.47 MB | 4.61 MB | 460 / 460 / 456 | 457 / 457 / 453 |
| tamagui | 5.44 MB | 5.59 MB | not measured | 1029 / 1029 / 1029 |
| gluestack | 5.67 MB | 5.81 MB | 815 / 815 / 508 | 520 / 515 / 510 |
| heroui | 5.24 MB | 5.39 MB | 1137 / 1135 / 948 | 1040 / 839 / 1088 |
| reusables | 6.83 MB | 7.00 MB | 603 / 608 / 356 | 601 / 353 / 601 |
<!-- end:ioscode -->

- **Reusables** bundles every lucide icon (1,917 of them), although it uses 4.
- **Tamagui's** Debug build aborts on a Yoga layout assertion on iOS, so its re-renders are counted on Android only.
- **gluestack** re-renders more on iOS's first switch (815) than on Android's (520). The other apps are within a few percent across platforms.

[How this was measured →](method.md#performance-checks)

<a id="developer-cost"></a>

## Developer cost

What it would cost a developer to build the same test screen with each library.

- **Code, not a platform measure.**
- **Counted** by `scripts/devcost.mjs` on 1 November, after the one-component-per-file refactor.
- **Raw output:** `results/devcost.md`.

| What it counts | baseline | unistyles | uniwind | nativewind | heroui | gluestack | tamagui | reusables |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Library code copied into your app (lines) | 0 | 0 | 0 | 0 | 0 | 7,488 | 0 | 1,519 |
| Config files added or changed | 0 | 2 | 3 | 6 | 3 | 8 | 5 | 4 |
| Setup steps | n/a | 8 | 11 | 14 | 10 | 5 | 11 | 12 |
| Setup problems hit | n/a | 2 | 0 | 0 | 4 | 8 | 6 | 6 |
| Type errors in your own code | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Type errors in copied library code | 0 | 0 | 0 | 0 | 0 | 17 | 0 | 0 |
| Accessibility props written by hand | 75 | 75 | 75 | 75 | 20 | 11 | 12 | 21 |

- **Library code copied into your app**
  - gluestack and Reusables don't ship as npm packages
  - Their CLI copies each component's source into the app. From then on it's yours to maintain
- **Setup steps and problems**
  - Counted from each app's `NOTES.md`
  - A rough guide: one problem took two minutes, another twenty
- **Type errors**
  - From `npx tsc --noEmit`
  - All 17 of gluestack's are in its copied components
  - The app still builds, but the type-check fails until someone fixes code they didn't write
- **Accessibility props written by hand**
  - The styling engines repeat the baseline's 75
  - The component libraries supply some of it themselves

[How this was measured →](method.md#ease-of-use-log)

<!-- begin:navfoot -->

---

← [Back to README](../README.md)
<!-- end:navfoot -->
