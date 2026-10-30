# iOS accessibility: what failed and why

The detail behind the accessibility scores in the [README](../README.md#accessibility). Every failure here was checked by hand on the iPhone 17 simulator (iOS 27.0). Per-check results for each app are in `results/<app>/ios-a11y.md` (light), `ios-a11y-dark.md` and `ios-a11y-brand.md`, and side by side in [checks.html](checks.html).

The three styling engines (Unistyles, Uniwind, NativeWind) carry the baseline's hand-written accessibility, so they score the same. That's the point of comparison: what you get when you build the components yourself.

## Failures in every app, the baseline included
- **Select and tab roles.** React Native maps `role="combobox"` and `role="tab"` to no iOS trait. In `ReactCommon/react/renderer/components/view/accessibilityPropsConversions.h`, only `switch` and `tabbar` map to traits; `tab`, `tablist` and `combobox` fall through to `None`.
- **The `@expo/ui` Switch fails the 44 pt check at the system switch's own size.**
  - It's a plain SwiftUI `Toggle` with nothing added (`ios/Toggle/ToggleView.swift` in `@expo/ui` 57.0.26). iOS draws it 28 pt tall (317×28 pt). UIKit's `UISwitch` measures the same: gluestack's Switch, which is React Native's `Switch`, is 63×28 pt.
  - 28 pt meets Apple's minimum control size (28x28 pt) but not its default (44x44 pt), which this check uses ([HIG: Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)).
  - Apple says to "use the switch toggle style only in a list row", where the row provides the height ([HIG: Toggles](https://developer.apple.com/design/human-interface-guidelines/toggles)). The lab places it on its own.
  - On its own, only the switch track responds to taps. Taps 8 pt above or below its frame, or on its label, didn't toggle it (baseline app, simulator).
- **The @gorhom/bottom-sheet modal**, even with `aria-modal` on its content, leaves the screen behind it reachable in Release builds.

## Bottom sheets compared

5 checks each: opens, title and body readable, screen behind hidden from VoiceOver, closes, screen reachable after close.

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

## Slider, progress bar, accordion, menu and segmented control

 Each app uses its library's own component where the library ships one. Otherwise the component is hand-built on React Native primitives with the library's styling and the baseline's hand-written accessibility.

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

## Failures specific to one library

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
