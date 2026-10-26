# am-ui-lab

A side-by-side comparison of React Native UI libraries. Every library builds the same test screen from the same tokens and copy. Each app then goes through the same scripted checks on an iOS simulator: accessibility, largest text size, Reduce Motion, timings and bundle size.

Every number below was measured. Where something couldn't be measured, this page says so.

- **Stack:** Expo SDK 57, React Native 0.86.3, React 19.2.3, New Architecture, Reanimated 4.5.1, expo-router.
- **Test device:** iPhone 17 Pro simulator, iOS 26.4. All results are from Release builds.
- **Date:** 22–23 October 2026 (Uniwind and NativeWind added on the 23rd).

## The apps

| App | Library | What it is |
| --- | --- | --- |
| `apps/baseline` | none | Plain React Native with accessibility written by hand. The reference point. |
| `apps/unistyles` | react-native-unistyles 3.6.0 | Styling engine only, so components are hand-built (the baseline's, restyled) |
| `apps/uniwind` | uniwind 1.13.0 (free), Tailwind 4.3.3 | Styling engine only; the baseline's components restyled with `className` |
| `apps/nativewind` | nativewind 5.0.0-rc.0 (react-native-css 3.1.0-rc.0), Tailwind 4.1.12 | Styling engine only, release candidate; the baseline's components restyled with `className` |
| `apps/tamagui` | tamagui 3.1.2 | Styling engine + compiler + UI kit |
| `apps/gluestack` | gluestack-ui 5 (core 5.0.15) on Uniwind 1.13.0 | Copy-paste components on react-aria |
| `apps/heroui` | heroui-native 1.0.11 on Uniwind 1.13.0 | Component kit |
| `apps/reusables` | React Native Reusables (CLI 0.7.1, @rn-primitives 1.5.2) on Uniwind 1.13.0 | shadcn-style copy-paste components |

Each app's `NOTES.md` records:
- exact versions
- every setup step and config file touched
- every error hit and how it was fixed
- the doc link for each API used
- which items use library components and which are hand-built

The spec for the test screen is in [docs/method.md](docs/method.md).

**Every check, side by side:** [docs/checks.html](docs/checks.html) lists all 59 checks for all eight apps, with the measured detail for each cell. The bottom sheets are one row per kind of sheet (gorhom, `@expo/ui`, the library's own), each cell showing the score out of 5 and the checks that failed. It's generated from `results/` by `scripts/report-html.mjs`.

## Results

### Accessibility (iOS)

`scripts/a11y-audit.mjs` checks:
- name, role, state and touch-target size for every control
- that a text-field error is reachable from the field
- that the screen behind a dialog, bottom sheet or select is hidden from VoiceOver
- that toasts reach the accessibility tree

The 39 core checks are the same for every app. Every app also has `@expo/ui`'s BottomSheet, and some have a further sheet of their own; each extra sheet adds 5 checks, which is why the totals differ.

| App | Core checks passed | With extra sheet checks |
| --- | --- | --- |
| baseline | 35 / 39 | 40 / 44 (+ @expo/ui BottomSheet) |
| unistyles | 35 / 39 | 40 / 44 (+ @expo/ui BottomSheet) |
| uniwind | 35 / 39 | 40 / 44 (+ @expo/ui BottomSheet) |
| nativewind (v5 RC, with the line-height workaround) | 35 / 39 | 40 / 44 (+ @expo/ui BottomSheet) |
| heroui | 22 / 39 | 30 / 49 (+ raw @gorhom sheet, + @expo/ui BottomSheet) |
| gluestack | 19 / 39 | 25 / 48 (+ @expo/ui BottomSheet, + gluestack's own BottomSheet, 4 of its 5 checks could run) |
| tamagui | 19 / 31, with 8 checks unable to run (see below) | 28 / 41 (+ Tamagui's own Sheet, + @expo/ui BottomSheet) |
| reusables | 18 / 39 | 23 / 44 (+ @expo/ui BottomSheet) |

Full tables are in `results/<app>/ios-a11y.md`. The raw trees are in `ios-a11y.json`.

The three styling engines (Unistyles, Uniwind, NativeWind) carry the baseline's hand-written accessibility, so they score the same. That's the point of comparison: what you get when you build the components yourself.

**Failures in every app, the baseline included:**
- **Select and tab roles.** React Native maps `role="combobox"` and `role="tab"` to no iOS trait. In `ReactCommon/react/renderer/components/view/accessibilityPropsConversions.h`, only `switch` and `tabbar` map to traits; `tab`, `tablist` and `combobox` fall through to `None`.
- **The `@expo/ui` Switch** exposes a 28 pt tall frame, below Apple's 44 pt default.
- **The @gorhom/bottom-sheet modal**, even with `aria-modal` on its content, leaves the screen behind it reachable in Release builds.

**Bottom sheets compared** (5 checks each: opens, title and body readable, screen behind hidden from VoiceOver, closes, screen reachable after close):

| Sheet | Passed | Screen behind hidden from VoiceOver |
| --- | --- | --- |
| `@expo/ui` BottomSheet (native SwiftUI sheet), built as Expo's docs show | 5 / 5 in all eight apps | yes |
| @gorhom/bottom-sheet (baseline and five other apps) | 4 / 5 | no |
| Tamagui `Sheet` | 4 / 5 | no |
| HeroUI Native `BottomSheet` | 3 / 5 | no, and its title and body are hidden too |
| @gorhom/bottom-sheet inside the HeroUI app | 3 / 5 | no, and its title and body are hidden too |
| gluestack-ui `BottomSheet` | 1 / 4 (its Close didn't close it, so the fifth check couldn't run) | no, and its title and body are hidden too |

`@expo/ui`'s sheet has to be filled with `@expo/ui`'s own `Column`, `Text` and `Button`, as in [its docs](https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/bottomsheet/). React Native views inside it don't receive touches unless wrapped in `RNHostView`, because the sheet presents in its own view controller (see `RNHostView.tsx` in `@expo/ui`). A first attempt with a React Native `Pressable` couldn't be tapped.

Each app colours the sheet through its own theming (`withUnistyles`, `useCSSVariable`, NativeWind `styled()`, Tamagui `useTheme`, `useResolveClassNames`, HeroUI `useThemeColor`; see each app's `NOTES.md`). In every app the sheet was opened in the dark theme on the simulator and showed the theme's surface and text colours. Inside the HeroUI app it is the only sheet whose title and body VoiceOver can read.

**Failures specific to a library:**

- **nativewind (5.0.0-rc.0)**
  - Tailwind v4 type tokens with px line-heights (`--text-body--line-height: 22px`) rendered each line at font size × value: 16 × 22 = 352 pt. Every text element matched size × line-height exactly. The page was 18 screens tall and the tests couldn't reach most controls. The as-found results are kept in `results/nativewind-px-line-height/`.
  - Unitless ratios (`1.375`) fix it. `results/nativewind/` is with that workaround.
  - `react-native-css` resolves `line-height` at runtime when it arrives through `var()`, which is how Tailwind v4's `text-*` utilities pass it; that runtime path is the likely cause, not confirmed. No matching upstream issue was found.
  - A third (brand) theme needs `VariableContextProvider`; v5's built-in theming is light/dark only.

- **tamagui**
  - Disabled and loading Buttons expose no button element at all, only their text.
  - Switch has no name, role or state.
  - Checkbox has no element at all.
  - Radio circles carry "radio button, checked" but no name. Their `Label` is separate text with a link trait.
  - The Select trigger is plain text.
  - Dialog and Sheet leave the screen behind them reachable.
  - Because of these, the Select test couldn't run.
- **gluestack**
  - Buttons, checkbox, radio and tabs are under 44 pt.
  - The Switch has no name.
  - The Checkbox is named after its `value` prop, not its visible label: `Checkbox.jsx` line 30, `aria-label || value || 'Checkbox'`.
  - The Select trigger has no name, and its options have no role or checked state.
  - The field error isn't linked to the field.
  - Dialog, sheet and select leave the screen behind them reachable.
- **heroui**
  - `ControlField`, its labelled switch/checkbox row, is a bare `Pressable` with no role or state (`control-field.tsx` line 127). It swallows the inner Switch's `role="switch"` and `aria-checked`.
  - The text field has no accessible name on iOS.
  - Dialog containment is off by default. The prop is `unstable_accessibilityContainerViewIsModal`.
  - Its own BottomSheet hides the sheet's title and body from the accessibility tree.
- **reusables**
  - Buttons are 40 pt; checkbox and radio are 16 pt.
  - Controls have no accessible name on iOS, because React Native only honours `aria-labelledby` on Android.
  - Select options have no role or checked state.
  - The alert-dialog title isn't a heading.

### Largest text size (AX5)

`scripts/textsize-test.mjs` compares control heights at the default size against the largest accessibility size. Screenshots are saved in `results/<app>/textsize-*.png`.

| App | Controls that grew | Clipping seen in screenshots |
| --- | --- | --- |
| baseline | 13 / 13 | none |
| unistyles | 13 / 13 | none (radio circles also scale, via `rt.fontScale`) |
| uniwind | 13 / 13 | none |
| nativewind (workaround) | 13 / 13 | none |
| tamagui | 9 / 11 | none |
| gluestack | 12 / 13 | none |
| heroui | 9 / 13 | button labels partly cut off |
| reusables | 1 / 13 | **button labels cut off completely** (fixed-height buttons) |

The `@expo/ui` Switch is pushed past the screen edge in every app.

### Reduce Motion

`scripts/motion-test.mjs` measures how long the open transition takes, from a real-time screen recording. Reduce Motion was set before launch.

| App | Dialog, off → on | Bottom sheet, off → on |
| --- | --- | --- |
| baseline | 367 → 133 ms (instant; the 133 includes the button press highlight) | 400 → 33 ms |
| unistyles | 300 → 67 ms | 433 → 33 ms |
| uniwind | 367 → 67 ms | 367 → 33 ms |
| nativewind | 333 → 67 ms | 400 → 33 ms |
| tamagui | instant either way (no open animation in this build) | 467 → 33 ms |
| gluestack | 233 → 33 ms | 433 → 33 ms |
| heroui | 200 → 33 ms | 533 → 33 ms |
| reusables | 200 → 33 ms | 400 → 33 ms |

Every animated overlay respected Reduce Motion when it was on at launch. Turning it on while the app runs was not tested.

### Timings and bundle size

`scripts/perf-run.mjs` measures from the tap to the second frame after the update, 10 runs each. Resolution is one frame (16.7 ms), so about 32 ms means "finished within a frame".

| App | Theme switch, median | 200-row list mount, median (range) | iOS JS bundle |
| --- | --- | --- | --- |
| baseline | 32.3 ms | 97.5 ms (82–114) | 3.93 MB |
| unistyles | 31.6 ms | 83.1 ms (82–115) | 4.13 MB |
| uniwind | 32.5 ms | 96.3 ms (78–112) | 4.21 MB |
| nativewind | 31.4 ms | 98.8 ms (82–100) | 4.45 MB |
| tamagui | 82.4 ms | 115.1 ms (98–1798) | 5.43 MB |
| gluestack | 31.8 ms | 82.8 ms (82–99) | 5.01 MB (re-measured 26 Oct, after adding its BottomSheet) |
| heroui | 32.0 ms | 82.5 ms (80–115) | 5.14 MB |
| reusables | 32.5 ms | 96.5 ms (78–346) | 6.75 MB |

Bundle sizes are the Hermes bytecode from `npx expo export --platform ios`. The first six were measured on 22 October and Uniwind and NativeWind on 23 October, with the same versions. Reusables bundles every lucide icon (1,917 of them) although it uses 4.

## Limits

- Simulators expose the accessibility tree. They don't let you hear VoiceOver, check swipe order as spoken, or test Switch Control. Those need a device.
- Android and TalkBack have not been tested yet.
- The timing clock runs in JS. Libraries that apply styles natively (Unistyles, Tamagui's native runtime) may do work it doesn't see.
- The Tamagui **Debug** build aborts on a React Native Yoga layout assertion when the `@expo/ui` Host sits below the form sections. Release builds are unaffected. The root cause has not been isolated.
- Tamagui's RadioGroup doesn't draw its selected dot in this build, although the tree reports it as checked. This may come from the lab's theme setup (the `brand` theme renamed to `labBrand`) rather than from Tamagui.
- The timing readout overlay scales with system text size and covers the header at AX5. It doesn't affect any check.

## Reproduce

```bash
scripts/build-ios.sh <app> Release
```

```bash
scripts/run-all.sh <simulator-udid>
```

These need [argent](https://github.com/software-mansion/argent) for simulator control, plus ffmpeg. `scripts/contrast.mjs` checks the shared tokens against WCAG contrast.
