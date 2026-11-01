<a id="method"></a>

# Method

<!-- begin:nav -->
[README](../README.md) · [Results](results.md) · **Method** · [iOS accessibility](ios-accessibility.md) · [All checks](checks.html)
<!-- end:nav -->

How every number in [Results](results.md) was measured.

- **Same screen:** every library builds the same screen to the same spec.
- **Same checks:** every app goes through the same scripted checks.
- **Measured only:** a result is recorded only if it was measured. Anything else is marked `not tested`, with the reason.

<a id="contents"></a>

## Contents

- [Why one app per library](#why-one-app-per-library)
- [Pinned stack](#pinned-stack)
- [The test screen](#the-test-screen)
- [iOS and Android](#ios-and-android)
- [Accessibility checks](#accessibility-checks)
- [Performance checks](#performance-checks)
- [Ease-of-use log](#ease-of-use-log)
- [Limits](#limits)
- [Reproduce](#reproduce)

<a id="why-one-app-per-library"></a>

## Why one app per library

- **Most of these libraries change global config:** a Babel plugin, a compiler, or Tailwind/CSS processing in Metro.
- **In one app they would interfere** with each other and skew the bundle-size and render measurements.
- **So each library gets its own Expo app** under `apps/<library>`, with identical Expo, React Native and Reanimated versions.

<a id="pinned-stack"></a>

## Pinned stack

| Package | Version |
| --- | --- |
| expo | ~57.0.31 |
| react-native | 0.86.3 |
| react | 19.2.3 |
| react-native-reanimated | 4.5.1 |
| react-native-worklets | 0.10.1 |
| expo-router | ~57.0.29 |

- **New Architecture:** on, the default in SDK 57.
- **Builds:** every app runs as a development build, not in Expo Go.

<a id="the-test-screen"></a>

## The test screen

- **Library components first:** each app uses the library's own component where it has one.
- **Otherwise hand-built:** the app uses the library's styling or theming API on React Native primitives.
- **Which is which:** each app's `NOTES.md` says, item by item.

| # | Component | Must support |
| --- | --- | --- |
| 1 | Button | Pressed, disabled and loading states |
| 2 | Text field | Visible label, helper text, error message |
| 3 | Switch | Labelled |
| 4 | Checkbox | Labelled, including an indeterminate state if the library has one |
| 5 | Radio group | Three options, group label |
| 6 | Modal dialog | Title, body, confirm/cancel |
| 7 | Bottom sheet | Opened from a button |
| 8 | Menu / select | Five options |
| 9 | Tabs | Three tabs |
| 10 | Toast | Shown after a button press |
| 11 | List | 200 themed rows (title, subtitle, icon) |
| 12 | Theme switcher | Light, dark, and a third brand theme |
| 13 | Third-party component | `@gorhom/bottom-sheet` themed with the library's tokens |
| 14 | Native component | An `@expo/ui` control placed next to the library's components and themed with its tokens |
| 15 | Slider | Labelled, value announced, adjustable (weight 0–200 kg, step 2.5) |
| 16 | Progress | Labelled, with a value (workout 3 of 8) |
| 17 | Accordion | Three sections, expanded/collapsed state |
| 18 | Menu / popover | Opened from a button, three actions |
| 19 | Segmented control | Three options, selected state |

- **Items 15–19** were added on 27 October 2026.
- **Test IDs and copy:** `shared/content.ts`.
- **Tokens:** every app uses the same colours, spacing, radii and type scale, from `packages/tokens`.

<a id="ios-and-android"></a>

## iOS and Android

- **Same everything:** every check runs on both platforms with the same script, flows and check names.
- **Two values per result:** one for iOS, one for Android.
- **Each platform's own rules:** where a platform has its own guideline or setting, it is held to its own.

| What | iOS | Android |
| --- | --- | --- |
| Device | iPhone 17 simulator, iOS 27.0 | Samsung Galaxy A15 5G (SM-A156E), Android 16. A physical budget phone; the Android emulator crashed repeatedly on this Mac. |
| Accessibility tree | What VoiceOver is given: the system accessibility tree (argent `describe`) and the view hierarchy (argent `native-describe-screen`) | What TalkBack is given: the active window's accessibility tree, read through UiAutomation by `scripts/android-a11y-dump`. A tappable element with no label of its own is named by the text inside it, as TalkBack does. |
| Role and state | VoiceOver traits (button, adjustable, header, selected, not enabled) | Class and role description (Button, Switch, CheckBox, RadioButton, SeekBar, "Combo box", "Tab"), heading, checked, selected, enabled, state description, expand and collapse actions |
| Screen hidden behind an overlay | Nothing from the screen is in the system tree while the overlay is open | Nothing from the screen is in the active window while the overlay is open |
| Touch target | ≥ 44 × 44 pt (Apple's default control size) | ≥ 48 × 48 dp (Google's minimum) |
| Largest text size | AX5 (accessibility-extra-extra-extra-large) | Font scale 2.0, the largest Android offers. Android 14+ scales large text less than small text. |
| Pushed off screen at the largest size | Frame outside the screen | Present at the default size but gone from the tree, or newly touching the screen edge (Android clips bounds to the screen) |
| Reduced motion | Reduce Motion on, set before launch | Remove animations (animator, transition and window scales 0), set before launch. Restored afterwards. |
| Recording for motion | Simulator recording at 30 fps | Phone recording, resampled to 30 fps |
| Timings, startup, CPU | Simulator on a Mac | Budget phone; compare apps within a platform |
| Memory | `footprint` phys_footprint | `dumpsys meminfo` total PSS. A different measure, so compare apps within a platform. |
| Scrolling | CPU during 5 flings and main-thread hangs; frame hitches can't be recorded on the simulator | CPU during 5 flings (from `/proc`) and janky frames (`dumpsys gfxinfo`) |
| Re-renders, bundle size | Measured (Debug build with Metro; `expo export`) | Not measured: the JS is the same, so counts and bundle size would match iOS |

**Don't compare memory or speed across platforms.**

- iOS is a simulator on a Mac
- Android is a budget phone
- Compare the apps within each platform, and how each app ranks on the two

**Run everything:**

- iOS: `scripts/run-all.sh <udid>`
- Android: `scripts/run-all-android.sh <serial>`

<a id="accessibility-checks"></a>

## Accessibility checks

| Check | Pass condition | Reference |
| --- | --- | --- |
| Name, role, value | Every control exposes a label, the correct role, and its state: checked, selected, expanded, disabled or busy | WCAG 2.2 SC 4.1.2 |
| Focus on modal open | Focus moves into the dialog or sheet, background content is hidden from assistive technology, and focus returns to the trigger on close | WCAG 2.2 SC 2.4.3; RN `aria-modal`/`accessibilityViewIsModal` (iOS-only) and `importantForAccessibility` (Android) |
| Announcements | Form errors and toasts are announced. Live regions (`aria-live`) are Android-only in React Native, so iOS needs `AccessibilityInfo.announceForAccessibility` | WCAG 2.2 SC 4.1.3 (AA) |
| Text scaling | At the largest accessibility text size, nothing is clipped, overlapping or truncated without a way to read it | WCAG 2.2 SC 1.4.4; Apple Dynamic Type |
| Reduce Motion | With Reduce Motion (iOS) or Remove animations (Android) on at launch, the dialog and sheet open without their animation. Switching it on while the app runs isn't tested | WCAG 2.2 SC 2.3.3 (AAA, not AA); Apple HIG |
| Touch targets | At least 44×44pt on iOS (Apple's default control size; 28pt is its minimum) and 48×48dp on Android, measured from accessibility-tree frames | Apple HIG; Material; WCAG 2.2 SC 2.5.8 (24px at AA) |
| Contrast | The default theme's text/background token pairs meet 4.5:1 (3:1 for large text and UI components) | WCAG 2.2 SC 1.4.3, 1.4.11 |

**Every accessibility check runs three times:** in the light, dark and brand themes (`scripts/a11y-audit.mjs --theme`).

**Checks for items 15–19:**

| Item | Checks |
| --- | --- |
| Slider | Name, `adjustable` role and value; touch target; dragging the thumb changes the value. The screen reader's own adjust gesture needs it running, so the drag stands in for it on both platforms. |
| Progress | Name and value |
| Accordion | Header is a button; its expanded state is exposed; content appears and disappears |
| Menu | Trigger name and role; touch target; opens; items are buttons; screen behind hidden; closes after an action |
| Segmented control | Each option has a name and role; the selected one is marked; touch target; selection moves on tap |

**Not covered.** The scripts read what each screen reader is given, not what it says. So these aren't tested:

- What VoiceOver and TalkBack actually speak
- Swipe order, as heard
- Switch Control

<a id="performance-checks"></a>

## Performance checks

- **Devices:** the iOS simulator and the Android phone.
- **Builds:** Release.
- **Runs:** ten each, reported as the median and the range.

**What's measured:**

- Mount time and commit count for the 200-row list (React profiler)
- Commits and time to re-render after switching theme
- JS bundle size (`expo export`), compared with an app that uses no library
- Cold start to first screen (`expo-router` index mounted)

**Added on 27 October 2026** (`scripts/metrics-run.mjs`, `scripts/rerender-run.mjs`):

- **Startup**
  - Terminate, `launch-app`, then wait until the screen title is in the accessibility tree
  - Median of 10
- **Memory:** `footprint` phys_footprint
  - At idle
  - After using the list and every overlay
- **Scrolling**
  - Frame hitches can't be recorded on the simulator. xctrace's Animation Hitches template says "Hitches is not supported on this platform"
  - Recorded instead: main-thread hangs, and the app's CPU time during 5 list flings
- **Re-renders on a theme switch**
  - React commits and component renders, from argent's React profiler
  - Debug build, counts only

<a id="ease-of-use-log"></a>

## Ease-of-use log

Each app's `NOTES.md` records:

- The setup steps and config files touched
- Every error hit while building it, and how it was fixed
- Lines of code for the test screen

<a id="limits"></a>

## Limits

- **Screen readers**
  - The checks read the tree VoiceOver and TalkBack are given
  - They don't listen to what is spoken or check the swipe order
  - Switch Control and Switch Access aren't tested
- **One device each**
  - iOS: a simulator
  - Android: one budget phone
  - An Android emulator was tried first. Emulator 37.1 and 37.2 crashed repeatedly, so no emulator numbers are reported
- **iOS**
  - Frame hitches and first paint aren't measured
  - The timing clock runs in JS, so libraries that apply styles natively (Unistyles, Tamagui's native runtime) may do work it doesn't see
  - Some Tamagui elements aren't in argent's view-hierarchy walk. Those checks read the system tree, which gives no selected state
  - Tamagui's RadioGroup doesn't draw the selected dot, although the tree reports it as checked
- **Android**
  - The phone was charging, with power saving off and no thermal throttling
- **Both platforms**
  - Turning reduced motion on while an app runs wasn't tested

<a id="reproduce"></a>

## Reproduce

**You need:**

- [argent](https://github.com/software-mansion/argent), for device control
- ffmpeg, for the reduced-motion recordings

**iOS**

```bash
scripts/build-ios.sh <app> Release
```

```bash
scripts/run-all.sh <simulator-udid>
```

**Re-render counts:**

1. Build Debug and start Metro
2. Install with `scripts/audit-app.sh <app> <udid> Debug`
3. Then run:

```bash
node scripts/rerender-run.mjs <app> dev.asimmalik.uilab.<app> <simulator-udid>
```

**Android**

**1. Build and install each app** on a phone with USB debugging on:

```bash
scripts/build-android.sh <app> Release
```

```bash
adb -s <serial> install -r -g apps/<app>/android/app/build/outputs/apk/release/app-release.apk
```

**2. Run every check** for the apps you name. The script:

- Builds and installs the accessibility reader (`scripts/android-a11y-dump`)
- Keeps the screen awake
- Restores the font scale and animation settings it changes

```bash
scripts/run-all-android.sh <serial> baseline unistyles
```

**Tables and report**

```bash
node scripts/readme-tables.mjs
```

```bash
node scripts/report-html.mjs
```

**Other scripts:**

- `scripts/contrast.mjs`: checks the shared tokens against WCAG contrast
- `scripts/devcost.mjs`: the developer-cost table
- `scripts/bundle-size.mjs`: bundle sizes

<!-- begin:navfoot -->

---

← [Back to README](../README.md)

[README](../README.md) · [Results](results.md) · **Method** · [iOS accessibility](ios-accessibility.md) · [All checks](checks.html)
<!-- end:navfoot -->
