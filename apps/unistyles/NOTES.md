# Unistyles app: build notes

## Library and versions

| Package | Version | How installed |
| --- | --- | --- |
| react-native-unistyles | 3.6.0 (exact) | `npm install react-native-unistyles@3.6.0 react-native-nitro-modules@0.37.1 --save-exact` |
| react-native-nitro-modules | 0.37.1 (exact) | same command. Unistyles >= 3.4.0 needs nitro >= 0.37.1 (compatibility table in the Unistyles README). The docs say to pin nitro to a fixed version. |

The pinned stack is unchanged from baseline: expo ~57.0.31, react-native 0.86.3, react 19.2.3, react-native-reanimated 4.5.1, react-native-worklets 0.10.1, expo-router ~57.0.29, @gorhom/bottom-sheet 5.2.14, @expo/ui 57.0.26. `npx expo install --check` reports "Dependencies are up to date", and `expo-doctor` passes 21/21 checks.

Not installed:
- `react-native-edge-to-edge`. The README calls it deprecated, and Expo SDK 54+ enables edge-to-edge itself.
- `@react-native/normalize-colors`. It's a peer dependency, but RN already brings it in, so nothing extra was needed.

## Setup steps and files touched

1. Copied `apps/baseline` without node_modules, ios, android or .expo.
2. Renamed the app:
   - `package.json` name: `am-ui-lab-unistyles`
   - `app.json` name `UI Lab Unistyles`, slug `am-ui-lab-unistyles`, scheme `amuilab-unistyles`
   - iOS bundle identifier and Android package: `dev.asimmalik.uilab.unistyles`
   - `metro.config.js` (watchFolders for `../../shared`) and the `@shared/*` path in tsconfig are unchanged.
3. Installed the two packages above.
4. **`babel.config.js` (new):** `babel-preset-expo` plus `['react-native-unistyles/plugin', { root: 'src' }]`. The plugin rewrites `react-native` imports under `src/` to Unistyles component factories and detects which styles depend on the theme or runtime.
   - I chose the Babel plugin over the experimental Metro integration. The docs say Unistyles throws if both are set up, and the React Compiler guide says to keep using the Babel plugin when the compiler is on (`experiments.reactCompiler` is on here).
   - For Expo, the React Compiler guide says no extra ordering config is needed.
5. **`package.json` `main`:** changed from `expo-router/entry` to `index.ts`. The new **`index.ts`** imports `expo-router/entry` and then `./src/unistyles`. This follows the Expo Router guide: Unistyles parses a StyleSheet as soon as its file is imported, so `configure()` has to run before any route module loads.
6. **`src/unistyles.ts` (new):**
   - Calls `StyleSheet.configure({ themes: { light, dark, brand }, settings: { initialTheme: 'light' } })`. Each theme is built from `shared/tokens`: `{ name, colors, space, radius, type }`, the same shape as the baseline theme object.
   - Adds module augmentation (`UnistylesThemes extends AppThemes`) so themes are typed.
   - `initialTheme` and `adaptiveThemes` are mutually exclusive. Like the baseline, the app starts on light and switches manually.
7. Deleted `src/theme.tsx`, the baseline's React-context provider. There is no provider any more.
8. Rewrote the styling in `src/app/_layout.tsx`, `src/app/index.tsx`, `src/app/list.tsx`, `src/components/controls.tsx` and `src/components/overlays.tsx`:
   - All styles now use `StyleSheet.create((theme, rt) => ...)`.
   - The theme switcher calls `UnistylesRuntime.setTheme(name)`.
   - `src/a11y.ts` is unchanged.

Not done: a web `+html.tsx` importing `unistyles.ts`, which the Expo Router guide asks for when using web static rendering. Only iOS is in scope here, so web is untested.

## Errors hit and fixes

1. **`tsc`: `colorScheme: string` is not assignable to `ColorSchemeName`** in the `withUnistyles(Host, ...)` mapping. Fixed with `'dark' as const` / `'light' as const`.
2. **`tsc`: `ForwardedRef<BottomSheetModal>` is not assignable to `Ref<BottomSheetModal<unknown>>`** after `withUnistyles(BottomSheetModal, ...)`. gorhom's `BottomSheetModal` is a generic function component, and `withUnistyles` widens its generic to `unknown`. Fixed with a TS instantiation expression, `withUnistyles(BottomSheetModal<never>, ...)` (`never` is gorhom's default). Babel compiles it fine, and the export succeeds.

No runtime errors are known, because the app has not been run on a device or simulator (see "Unverified").

## Doc URLs per API

| API | Source |
| --- | --- |
| Install, Babel plugin `root`, nitro pinning | https://www.unistyl.es/v3/start/getting-started, plus the README compatibility table |
| `StyleSheet.configure`, `initialTheme`, TS augmentation | https://www.unistyl.es/v3/start/configuration |
| Expo Router entry (`index.ts`) | https://www.unistyl.es/v3/guides/expo-router |
| `UnistylesRuntime.setTheme`, adaptive-theme caveat | https://www.unistyl.es/v3/guides/theming |
| Variants, `useVariants`, boolean variants | https://www.unistyl.es/v3/references/variants |
| Variant scoping per component | https://www.unistyl.es/v3/other/babel-plugin |
| Dynamic functions (`styles.tab(selected)`) | https://www.unistyl.es/v3/references/dynamic-functions |
| Mini runtime (`rt.fontScale`, `contentSizeCategory`) | https://www.unistyl.es/v3/references/mini-runtime |
| `withUnistyles`, mappings, `uniProps` | https://www.unistyl.es/v3/references/with-unistyles |
| `useUnistyles`, and when to use it | https://www.unistyl.es/v3/references/use-unistyles |
| Third-party view decision algorithm | https://www.unistyl.es/v3/references/3rd-party-views |
| Merging styles (arrays, no spreading) | https://www.unistyl.es/v3/guides/merging-styles |
| React Compiler | https://www.unistyl.es/v3/guides/react-compiler |

I also checked these against the type definitions:
- `node_modules/react-native-unistyles/lib/typescript/src/` (`index.d.ts`, `specs/UnistylesRuntime/*.d.ts`, `specs/StyleSheet/index.d.ts`, `core/withUnistyles/*.d.ts`, `types/stylesheet.d.ts`)
- `plugin/index.d.ts`

The docs don't cover a `Pressable` `style={({ pressed }) => ...}` function. I confirmed support in `src/components/native/Pressable.native.tsx`, which calls the style function and registers the result.

## The 14 items: library vs hand-built

Unistyles has no components, so **all 14 items are hand-built** on RN primitives with the baseline's accessibility props, styled with Unistyles:

| # | Item | Unistyles features used |
| --- | --- | --- |
| 1 | Button (pressed, disabled, loading) | Variants for `variant` (primary/secondary/danger) and boolean `disabled`. The pressed state uses the dynamic function `pressed(bool)` in the Pressable style callback. The spinner colour goes through `withUnistyles(ActivityIndicator)` + `uniProps`. |
| 2 | Text field | Boolean `invalid` variant for the border and message colour |
| 3 | Switch row | `withUnistyles(Switch, theme => ({ trackColor }))` |
| 4 | Checkbox | Dynamic function. The box size scales with `rt.fontScale`. |
| 5 | Radio group | Dynamic function. The ring and dot scale with `rt.fontScale`. |
| 6 | Dialog (RN Modal) | Plain themed styles. `Modal` isn't processed by Unistyles, but the Views inside it are. |
| 7 | Bottom sheet | See the next section |
| 8 | Select | Plain styles, plus the dynamic `optionText(selected)` |
| 9 | Tabs | Dynamic functions `tab(selected)` and `tabLabel(selected)` |
| 10 | Toast | Plain themed styles |
| 11 | 200-row list | `StyleSheet.create(theme => ...)`. Rows use no hook or context. |
| 12 | Theme switcher | `UnistylesRuntime.setTheme`. The current name is read with `useUnistyles()` inside a small `ThemeSwitcher` component only. |
| 13 | @gorhom/bottom-sheet | `withUnistyles` mappings |
| 14 | @expo/ui Switch in a Host | `withUnistyles(Host)` mappings |

Navigation (`Stack` `screenOptions`, `StatusBar`) uses `useUnistyles()` in the layout. The docs name navigation options as the intended use of that hook, because they are props, not styles.

### Dynamic Type

React Native `Text` already multiplies `fontSize` by the system text size. Scaling font sizes with `rt.fontScale` as well would scale them twice, so `rt.fontScale` is only used for non-text sizes: the checkbox box and the radio ring and dot, capped at 2x. Because `rt.fontScale` is a style dependency, Unistyles recomputes those styles natively when the system text size changes. `rt.contentSizeCategory` is available too, but isn't used.

## How the third-party sheet and @expo/ui are themed

Following the 3rd-party views algorithm:
- The Babel plugin only binds the `style` prop of RN components.
- gorhom's `backgroundStyle` and `handleIndicatorStyle`, and Host's `colorScheme` and `seedColor`, are plain props.
- That makes `withUnistyles` the documented next step. The docs list `useUnistyles` as a last resort, because it re-renders the whole calling component on every change.
- `withUnistyles` re-renders only the wrapped component when its theme dependency changes.

```tsx
// src/components/overlays.tsx
const ThemedBottomSheetModal = withUnistyles(BottomSheetModal<never>, (theme) => ({
  backgroundStyle: { backgroundColor: theme.colors.surfaceRaised },
  handleIndicatorStyle: { backgroundColor: theme.colors.border },
}));
// The sheet content sits in an RN <View style={styles.sheet}> inside
// BottomSheetView, so the plugin binds those styles normally.

// src/app/index.tsx
const ThemedHost = withUnistyles(Host, (theme) => ({
  colorScheme: theme.name === 'dark' ? ('dark' as const) : ('light' as const),
  seedColor: theme.colors.primary,
}));
<ThemedHost matchContents>
  <NativeSwitch testID={ids.nativeSwitch} label={copy.nativeSwitchLabel} value={sync} onValueChange={setSync} />
</ThemedHost>
```

## Could not make work / deviations

- **Header title:** `'Unistyles'`, where the baseline has `'Baseline (React Native)'`. This is intentional.
- **`contentContainerStyle`:** the ScrollView's is a plain object built from the `space` token. The plugin doesn't bind `contentContainerStyle`; the docs say to wrap the ScrollView in `withUnistyles` when that style depends on the theme. The padding doesn't depend on the theme, so no wrapper is needed.
- **Nothing else** was knowingly left out.

## Verification

- `npx tsc --noEmit`: clean.
- I ran the Babel transform on `controls.tsx`. Its `react-native` imports are rewritten to `react-native-unistyles/components/native/{View,Text,TextInput,Switch,Pressable,ActivityIndicator}`, which confirms the plugin is active.
- `npx expo export --platform ios --output-dir $TMPDIR/uilab-export-unistyles`: succeeded, 1965 modules.
- **iOS bundle size:** `_expo/static/js/ios/index-9dc75babd57037e2cc0bea13d6f4575a.hbc` is **4,123,140 bytes** (4.1 MB, Hermes bytecode).

## Unverified

- Nothing has run on a simulator or device. No prebuild or native build was done, so these are all untested:
  - The Nitro/Unistyles native compile against RN 0.86.3 and the New Architecture
  - Runtime theme switching
  - Whether gorhom picks up the remapped `backgroundStyle` without a re-present
  - Variant scoping when several `Button` instances share a stylesheet
  - `rt.fontScale` behaviour at accessibility sizes
- None of the method's accessibility or performance checks have been run yet.
