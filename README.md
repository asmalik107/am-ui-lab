# am-ui-lab

A side-by-side comparison of React Native UI libraries. Every library builds the same test screen from the same tokens and copy. Each app then goes through the same scripted checks on an iOS simulator:
- accessibility, in the light, dark and brand themes
- largest text size and Reduce Motion
- timings, startup, memory, scrolling and re-renders
- bundle size and developer cost

Every number below was measured. Where something couldn't be measured, this page says so.

- **Stack:** Expo SDK 57, React Native 0.86.3, React 19.2.3, New Architecture, Reanimated 4.5.1, expo-router.
- **Test device:** iPhone 17 simulator, iOS 27.0 (Xcode 27.1). All results are from Release builds, except the re-render counts (Debug, see below).
- **Dates:** first built 22–23 October 2026 on the iPhone 17 Pro simulator with iOS 26.4. Re-run on iOS 27.0 with the slider, progress bar, accordion, menu and segmented control added, the dark and brand audits and the new metrics on 27–28 October. Git history keeps the 26.4 results; what changed is listed under [iOS 27 against iOS 26.4](#ios-27-against-ios-264).
- **iOS 27 setup step:** Expo SDK 57 apps built with Xcode 27 need the UIKit scene life cycle. Every app adds `expo-build-properties` with `ios.enableSceneSupport: true` (see each app's `NOTES.md`).

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

The spec for the test screen is in [docs/method.md](docs/method.md): 19 items, from buttons and form controls to overlays, a 200-row list, a theme switcher, a slider, progress bar, accordion, menu and segmented control. The last five were added on 27 October.

**Every check, side by side:** [docs/checks.html](docs/checks.html) has every check for all eight apps, with the measured detail for each cell, plus charts of the scores and metrics. It's generated from `results/` by `scripts/report-html.mjs`.

## Results

### Accessibility (iOS)

`scripts/a11y-audit.mjs` checks:
- name, role, state and touch-target size for every control
- that a text-field error is reachable from the field
- that the screen behind a dialog, bottom sheet, select or menu is hidden from VoiceOver
- that toasts reach the accessibility tree
- the slider's adjustable trait and value, and that dragging changes it; the progress bar's name and value; the accordion's expanded state; menu items as buttons; the segmented control's selected state

Every check runs three times, in the light, dark and brand themes, because a theme could change which elements exist or how they're labelled. **No check gave a different result in dark or brand than in light, in any app**, so the scores below hold for all three.

| App | Test screen (57 checks) | Extra sheets | All checks |
| --- | --- | --- | --- |
| baseline | 53 / 57 | 5 / 5 (@expo/ui) | 58 / 62 |
| unistyles | 53 / 57 | 5 / 5 (@expo/ui) | 58 / 62 |
| uniwind | 53 / 57 | 5 / 5 (@expo/ui) | 58 / 62 |
| nativewind (v5 RC, with the line-height workaround) | 53 / 57 | 5 / 5 (@expo/ui) | 58 / 62 |
| heroui | 36 / 57 | 8 / 10 (raw @gorhom, @expo/ui) | 44 / 67 |
| reusables | 32 / 57 | 5 / 5 (@expo/ui) | 37 / 62 |
| gluestack | 29 / 57 | 6 / 9 (@expo/ui, gluestack BottomSheet: 4 of its 5 checks could run) | 35 / 66 |
| tamagui | 27 / 47, with 10 checks unable to run (see below) | 9 / 10 (Tamagui Sheet, @expo/ui) | 36 / 57 |

Full tables are in `results/<app>/ios-a11y.md` (light), `ios-a11y-dark.md` and `ios-a11y-brand.md`. The raw trees are in the matching `.json` files, and `a11y-dark.png` and `a11y-brand.png` show the theme was applied.

The three styling engines (Unistyles, Uniwind, NativeWind) carry the baseline's hand-written accessibility, so they score the same. That's the point of comparison: what you get when you build the components yourself.

**Failures in every app, the baseline included:**
- **Select and tab roles.** React Native maps `role="combobox"` and `role="tab"` to no iOS trait. In `ReactCommon/react/renderer/components/view/accessibilityPropsConversions.h`, only `switch` and `tabbar` map to traits; `tab`, `tablist` and `combobox` fall through to `None`.
- **The `@expo/ui` Switch fails the 44 pt check at the system switch's own size.**
  - It's a plain SwiftUI `Toggle` with nothing added (`ios/Toggle/ToggleView.swift` in `@expo/ui` 57.0.26). iOS draws it 28 pt tall, on 27.0 (317×28 pt) as on 26.4. UIKit's `UISwitch` measures the same: gluestack's Switch, which is React Native's `Switch`, is 63×28 pt.
  - 28 pt meets Apple's minimum control size (28x28 pt) but not its default (44x44 pt), which this check uses ([HIG: Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)).
  - Apple says to "use the switch toggle style only in a list row", where the row provides the height ([HIG: Toggles](https://developer.apple.com/design/human-interface-guidelines/toggles)). The lab places it on its own.
  - On its own, only the switch track responds to taps. Taps 8 pt above or below its frame, or on its label, didn't toggle it (baseline app, simulator).
- **The @gorhom/bottom-sheet modal**, even with `aria-modal` on its content, leaves the screen behind it reachable in Release builds.

**Bottom sheets compared** (5 checks each: opens, title and body readable, screen behind hidden from VoiceOver, closes, screen reachable after close). Unchanged on iOS 27:

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

**Slider, progress bar, accordion, menu and segmented control.** Each app uses its library's own component where the library ships one. Otherwise the component is hand-built on React Native primitives with the library's styling and the baseline's hand-written accessibility.

| Component | baseline + 3 engines | Tamagui | gluestack | HeroUI | Reusables |
| --- | --- | --- | --- | --- | --- |
| Slider | hand-built, 3 / 3 | own, 1 / 3 | own, 0 / 3 | own, 1 / 3 | hand-built, 3 / 3 |
| Progress | hand-built, 1 / 1 | own, 1 / 1 | own, 0 / 1 | hand-built, 1 / 1 | own, 0 / 1 |
| Accordion | hand-built, 4 / 4 | own, 0 / 2 (no header element, so the rest couldn't run) | own, 3 / 4 | own, 4 / 4 | own, 4 / 4 |
| Menu | hand-built, 6 / 6 | own (native iOS menu), 5 / 6 | own, 3 / 6 | own, 4 / 6 | own, 4 / 6 |
| Segmented control | hand-built, 4 / 4 | own (ToggleGroup), 1 / 4 | hand-built, 4 / 4 | hand-built, 4 / 4 | own (ToggleGroup), 3 / 4 |

What failed, each checked by hand on the simulator:
- **`role="slider"` gives no iOS trait.** Tamagui's and HeroUI's slider thumbs use it, so VoiceOver isn't told it's adjustable.
  - React Native takes iOS traits from the `role` string (`AccessibilityProps.cpp`, lines 259–281). The trait table in `accessibilityPropsConversions.h` has `adjustable` but no `slider`.
  - The hand-built sliders use `accessibilityRole="adjustable"`, which TypeScript's `role` type doesn't accept, and pass.
- **Slider values:**
  - Tamagui reads "30%" (of 0–200), HeroUI "60" with no unit, and the hand-built ones "60 kg".
  - gluestack's slider moves on screen (60 → 175 kg in a drag), but its accessibility element is a group named "Slider" with no value and no trait, 370×6 pt.
  - Tamagui's thumb is 28×28 pt and HeroUI's 28×20 pt.
- **Reusables' Progress reads "0%" with no name while the bar shows 3 of 8.** The copied `src/components/ui/progress.tsx` takes `value` out of the props and passes it only to the indicator, never to `ProgressPrimitive.Root`. The primitive then reports its default of 0.
- **gluestack's Progress** reads "38%" but has no name.
- **Tamagui's Accordion has no button for VoiceOver.**
  - `Accordion.Header` renders an `H1` (a Text with role heading) around the trigger (`@tamagui/accordion/src/Accordion.tsx`, line 462), and the source says the trigger "should always be nested inside" it.
  - Inside iOS text the trigger becomes an attachment, so VoiceOver gets a heading read as "￼" and no button or expanded state.
  - gluestack's accordion headers work but are 20 pt tall.
- **Menus:**
  - gluestack's, HeroUI's and Reusables' menu items are plain groups, not buttons.
  - gluestack's and HeroUI's menus leave the screen behind them in the tree. Reusables' hides it.
  - gluestack's trigger is 38 pt tall and Reusables' 40 pt.
- **Tamagui's Menu:**
  - On Expo 57 its docs require `import '@tamagui/native/setup-expo-ui-menu'`. With it, the trigger opens iOS's own context menu through `@expo/ui`.
  - Its items are buttons, but the screen behind stays in the system tree, beside a "Dismiss context menu" button. This is iOS's own menu, so how VoiceOver treats it needs a device.
  - Without the import, the first tap crashed the app (`TypeError: Cannot read property 'contentId' of undefined` in `MenuContent`).
- **Toggle groups as segmented controls:**
  - Tamagui's options expose no role and no selected state.
  - Reusables' are read as "radio button, checked/unchecked", which passes, but they are 40 pt tall.

**Other failures specific to a library, unchanged on iOS 27:**

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
| baseline | 16 / 17 | none |
| unistyles | 16 / 17 | none (radio circles also scale, via `rt.fontScale`) |
| uniwind | 16 / 17 | none |
| nativewind (workaround) | 16 / 17 | none |
| tamagui | 9 / 13 | none |
| gluestack | 15 / 16 | none |
| heroui | 11 / 16 | button labels partly cut off |
| reusables | 2 / 17 | **button labels cut off completely** (fixed-height buttons) |

The `@expo/ui` Switch is pushed past the screen edge in every app. The hand-built slider's track stays 44 pt at AX5 (its label above it grows), which is why it counts as not grown. The denominator is the controls the app exposes: Tamagui's accordion header and menu trigger, and gluestack's and HeroUI's slider, aren't measurable elements.

### Reduce Motion

`scripts/motion-test.mjs` measures how long the open transition takes, from a real-time screen recording. Reduce Motion was set before launch.

| App | Dialog, off → on | Bottom sheet, off → on |
| --- | --- | --- |
| baseline | 367 → 67 ms | 400 → 33 ms |
| unistyles | 367 → 67 ms | 400 → 33 ms |
| uniwind | 333 → 33 ms | 400 → 33 ms |
| nativewind | 300 → 33 ms | 433 → 33 ms |
| tamagui | 67 → 67 ms (no open animation in this build) | 433 → 33 ms |
| gluestack | 233 → 67 ms | 467 → 33 ms |
| heroui | 233 → 33 ms | 533 → 100 ms |
| reusables | 200 → 33 ms | 433 → 33 ms |

Every animated overlay respected Reduce Motion when it was on at launch. One frame is 33 ms, so 67 ms is the change plus the button's press highlight. Turning it on while the app runs was not tested.

### Timings and bundle size

`scripts/perf-run.mjs` measures from the tap to the second frame after the update, 10 runs each. Resolution is one frame (16.7 ms), so about 32 ms means "finished within a frame".

| App | Theme switch, median | 200-row list mount, median (range) | iOS JS bundle |
| --- | --- | --- | --- |
| baseline | 32.0 ms | 81.8 ms (81–99) | 3.95 MB |
| unistyles | 32.2 ms | 82.1 ms (82–99) | 4.14 MB |
| uniwind | 31.7 ms | 81.5 ms (80–98) | 4.23 MB |
| nativewind | 30.9 ms | 114.7 ms (98–147) | 4.47 MB |
| tamagui | 99.0 ms (6 runs) | 115.2 ms (99–134) | 5.44 MB |
| gluestack | 32.4 ms | 82.8 ms (82–100) | 5.66 MB |
| heroui | 48.7 ms (light→dark ~65, dark→brand ~49, brand→light ~32) | 82.7 ms (82–99) | 5.24 MB |
| reusables | 32.4 ms (7 runs) | 83.2 ms (82–100) | 6.83 MB |

Bundle sizes are the Hermes bytecode from `npx expo export --platform ios` (`scripts/bundle-size.mjs`), measured on 27 October with all 19 items. The five components added on 27 October added 15 KB to the baseline and 650 KB to gluestack (5.01 → 5.66 MB). Reusables bundles every lucide icon (1,917 of them) although it uses 4.

A theme-switch run is only counted when the readout changes. Two runs in a row that both took exactly 99.0 ms (Tamagui) or 32.4 ms (Reusables) can't be told apart from no update, so those runs have fewer than 10.

### Startup, memory, scrolling and re-renders

`scripts/metrics-run.mjs` (Release builds, 10 cold launches) and `scripts/rerender-run.mjs` (Debug builds, argent's React profiler).

| App | Startup until readable, median (date) | Memory at idle | Memory after use | App CPU during 5 list flings | Hangs | Components rendered per switch (light→dark / dark→brand / brand→light) |
| --- | --- | --- | --- | --- | --- | --- |
| baseline | 8.1 s (28 Oct) | 62.9 MiB | 124.4 MiB | 2.16 s | 0 | 298 / 298 / 288 |
| unistyles | 8.2 s (27 Oct) | 64.0 MiB | 130.9 MiB | 1.95 s | 0 | 128 / 128 / 126 |
| uniwind | 8.6 s (27 Oct) | 64.4 MiB | 133.5 MiB | 2.06 s | 0 | 507 / 509 / 302 |
| nativewind | 9.4 s (27 Oct) | 66.9 MiB | 135.2 MiB | 1.98 s | 0 | 460 / 460 / 456 |
| heroui | 7.8 s (28 Oct) | 91.2 MiB | 130.2 MiB | 2.53 s | 0 | 1130 / 1135 / 841 |
| gluestack | 7.9 s (28 Oct) | 74.8 MiB | 128.5 MiB | 2.09 s | 0 | 815 / 815 / 508 |
| tamagui | 7.8 s (28 Oct) | 81.5 MiB | 162.4 MiB | 1.98 s | 0 | not measured (Debug build aborts) |
| reusables | 7.8 s (28 Oct) | 76.0 MiB | 142.6 MiB | 2.10 s | 0 | 603 / 608 / 356 |

- **Startup until readable:** from argent's `launch-app` call until "Component test screen" is in the system accessibility tree, which is when VoiceOver could first read the screen. It isn't first paint. In screenshots, Unistyles' screen was visible 4–6 s after launch but readable at about 8 s. Timing first paint from a screen recording was tried and dropped, because the recorder slowed the launches (8.0 s became 7.7–12.1 s). The clock's resolution is one accessibility-tree read, about 0.2 s. The figures barely separate the apps and move from day to day: the baseline measured 4.8 s on 27 October and 8.1 s on 28 October with the same build settings, so read them as a group (7.8–9.4 s), not as a ranking.
- **Memory:** `footprint`'s `phys_footprint` for the app's process. "After use" is after scrolling the 200-row list and opening and closing every overlay once.
- **Scrolling:** frame hitches can't be recorded on the simulator. xctrace's Animation Hitches template stops with "Hitches is not supported on this platform". Recorded instead, with argent's native profiler (xctrace Time Profiler):
  - the CPU time of the app's own threads while the list is flung 5 times
  - Instruments' main-thread hangs: none in any app
- **Re-renders:** React commits and component renders for one theme switch, counted by argent's React profiler on a Debug build with Metro. Counts only, because Debug timings aren't representative.

### Developer cost

What it would cost a developer to build the same test screen with each library. `scripts/devcost.mjs` counts every row with a command that can be re-run; `results/devcost.md` has the raw output.

| What it counts | baseline | unistyles | uniwind | nativewind | heroui | gluestack | tamagui | reusables |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Lines of screen code you write | 840 | 957 | 814 | 819 | 641 | 770 | 812 | 654 |
| Kit code copied into your app (lines) | 0 | 0 | 0 | 0 | 0 | 7,488 | 0 | 1,519 |
| Config files added or changed | 0 | 2 | 3 | 6 | 3 | 8 | 5 | 4 |
| Setup steps | n/a | 8 | 11 | 14 | 10 | 5 | 11 | 12 |
| Setup problems hit | n/a | 2 | 0 | 0 | 4 | 8 | 6 | 6 |
| Type errors in your own code | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Type errors in copied kit code | 0 | 0 | 0 | 0 | 0 | 17 | 0 | 0 |
| Accessibility props written by hand | 75 | 75 | 75 | 75 | 20 | 11 | 12 | 21 |

What each row means:

- **Lines of screen code you write:** non-blank lines of TypeScript in the app's own `src/` folder: the test screen, any components built by hand and the theme setup. Code a kit's CLI copied in isn't counted here.
- **Kit code copied into your app:** gluestack and Reusables don't ship as npm packages. Their CLI copies each component's source into the app (`components/ui`, `src/components/ui`), and from then on it's yours to maintain and fix. The other kits are npm packages, so they show 0.
- **Config files added or changed:** files at the app root, plus `.css` and `.d.ts` files in `src/`, that are new or differ from the baseline app's (Babel, Metro, Tailwind, theme and type files). `package.json`, the lockfile and `app.json` are left out, because every app changes them.
- **Setup steps:** how many numbered steps the setup section of the app's `NOTES.md` lists. A rough guide only, because each app's notes split steps differently. The baseline is the plain React Native reference, so it has none. The iOS 27 step is the same in every app, so it's left out.
- **Setup problems hit:** how many problems came up while setting the app up and had to be worked around, as listed under "Errors hit" in the app's `NOTES.md`. Examples are a CLI that hung or overwrote files, docs that disagree with the code, and package versions Expo 57 doesn't support. It's a count, not a measure of effort: one took two minutes, another twenty.
- **Type errors:** what `npx tsc --noEmit` reports, split into the app's own files and the files a kit's CLI copied in. All 17 of gluestack's are in its copied components: 11 in the bottom sheet, 4 in the checkbox, and 1 each in the menu and the alert dialog. The app still builds and runs, because Metro doesn't type-check. But the project's type-check fails until someone fixes code they didn't write. (An earlier run on 28 October counted 18 with no source change; the extra one wasn't in the app's or the kit's source.)
- **Accessibility props written by hand:** `role`, `aria-*`, `accessibility*` and `importantForAccessibility` props in the app's own code. Higher means more accessibility written by hand. The styling engines repeat the baseline's 75, while the kits supply some of it themselves and need 11–21.

### iOS 27 against iOS 26.4

Every check was re-run on iOS 27.0, and each change was checked by hand.

- **Accessibility:** the 39 checks that existed on iOS 26.4 (the test screen before the five newer components) and every sheet check give the same pass or fail in all eight apps. One detail changed: iOS 27 autocorrected the typed "not-an-email" to "notability" (the field doesn't turn autocorrect off). The error check still passes.
- **Largest text size:** the same counts and the same controls pushed off screen in every app.
- **Reduce Motion:** within a frame or two of 26.4. HeroUI's bottom sheet with Reduce Motion on went from 33 to 100 ms (still three frames, against 533 ms with it off).
- **Theme switch:**
  - HeroUI went from about 32 ms in every direction to 65 / 49 / 32 ms, depending on the direction.
  - Tamagui went from 82.4 to 99.0 ms.
  - The others are unchanged at about 32 ms.
- **List mount:** medians sit on frame multiples (about 82, 98 and 115 ms). Baseline, Uniwind and Reusables moved down a frame (to about 82 ms) and NativeWind up a frame (to 114.7 ms). The ranges overlap.

## Limits

- Simulators expose the accessibility tree. They don't let you hear VoiceOver, check swipe order as spoken, or test Switch Control. Those need a device.
- The slider check drags the thumb. VoiceOver's own swipe up (the increment action) can't be performed on the simulator without VoiceOver running.
- Some kit elements are in the system accessibility tree but not in argent's view-hierarchy walk: Tamagui's Progress and its native menu button. For the slider, progress bar, accordion, menu and segmented control, the audit reads those from the system tree. It gives role, label, value and size, but not the selected state, and sizes only to about ±0.4 pt. Those cells say "(system tree)".
- Frame hitches and first paint aren't measured (see above).
- Android and TalkBack have not been tested yet.
- The timing clock runs in JS. Libraries that apply styles natively (Unistyles, Tamagui's native runtime) may do work it doesn't see.
- The Tamagui **Debug** build aborted on a React Native Yoga layout assertion on iOS 26.4 when the `@expo/ui` Host sat below the form sections. Release builds are unaffected; see the re-render table for iOS 27.
- Tamagui's RadioGroup doesn't draw its selected dot in this build, although the tree reports it as checked. This may come from the lab's theme setup (the `brand` theme renamed to `labBrand`) rather than from Tamagui.
- The timing readout overlay scales with system text size and covers the header at AX5. It doesn't affect any check.

## Reproduce

```bash
scripts/build-ios.sh <app> Release
```

```bash
scripts/run-all.sh <simulator-udid>
```

For the re-render counts, build Debug, start Metro and install with `scripts/audit-app.sh <app> <udid> Debug`, then:

```bash
node scripts/rerender-run.mjs <app> dev.asimmalik.uilab.<app> <simulator-udid>
```

These need [argent](https://github.com/software-mansion/argent) for simulator control, plus ffmpeg. `scripts/contrast.mjs` checks the shared tokens against WCAG contrast; `scripts/devcost.mjs` and `scripts/bundle-size.mjs` produce the cost table and bundle sizes.
