# NativeWind app: build notes

## Library and versions

| Package | Version | How installed |
| --- | --- | --- |
| nativewind | 5.0.0-rc.0 (exact, npm dist-tag `rc`) | `npm install --save-exact nativewind@5.0.0-rc.0 react-native-css@3.1.0-rc.0` |
| react-native-css | 3.1.0-rc.0 (exact) | same command. nativewind 5.0.0-rc.0 declares it as an exact peer, and the docs say the pair can't be upgraded independently. |
| tailwindcss | 4.1.12 (exact, dev) | `npm install --save-dev --save-exact tailwindcss@4.1.12 @tailwindcss/postcss@4.1.12 postcss lightningcss@1.30.1` |
| @tailwindcss/postcss | 4.1.12 (exact, dev) | same command |
| postcss | 8.5.31 (dev) | same command |
| lightningcss | 1.30.1 (exact, dev) + `overrides` | same command, plus `"overrides": { "lightningcss": "1.30.1" }` in package.json. `npm ls` shows one copy, marked `overridden`. |

The pinned stack is unchanged from baseline: expo ~57.0.31, react-native 0.86.3, react 19.2.3, react-native-reanimated 4.5.1, react-native-worklets 0.10.1, expo-router ~57.0.29, @gorhom/bottom-sheet 5.2.14, @expo/ui 57.0.26.
- I ran `npm ci` from the baseline's lockfile first, then added the packages above.
- `npx expo install react-native-reanimated react-native-worklets react-native-safe-area-context expo-system-ui`, the docs' install step, changed nothing: all four were already at the SDK versions.
- No peer-dependency errors, and no `--force` or `--legacy-peer-deps`.
- `npx expo install --check` reports "Dependencies are up to date". `expo-doctor` passes 21/21 checks.

The RC was tested upstream on Expo 57.0.22, RN 0.86.3, React 19.2.3, Reanimated 4.5.1 and Worklets 0.10.1 (installation page and `docs/rc-compatibility.md`). The lab is on expo 57.0.31: the same SDK, a later patch.

## Setup steps and files touched

1. Copied `apps/baseline` without node_modules, ios, android or .expo.
2. Renamed the app:
   - `package.json` name: `am-ui-lab-nativewind`
   - `app.json` name `UI Lab NativeWind`, slug `am-ui-lab-nativewind`, scheme `amuilab-nativewind`
   - iOS bundle identifier and Android package: `dev.asimmalik.uilab.nativewind`
   - `userInterfaceStyle: "automatic"` was already set, as the dark-mode docs require.
3. Installed the packages above.
4. **`postcss.config.mjs` (new):** `@tailwindcss/postcss`. The docs warn that Expo 57 doesn't read `postcss.config.cjs`.
5. **`metro.config.js`:**
   - Keeps `watchFolders` for `../../shared`.
   - Wraps the config with `withNativewind(config, { inlineVariables: { exclude: [...] } })`.
   - The exclude list is all 13 `--color-*` tokens, so the compiler keeps them as runtime variables instead of inlining the light values.
   - `withNativewind` turns on `globalClassNamePolyfill` by default. Its Metro resolver points `react-native` imports at react-native-css wrappers that accept `className`.
6. **No `babel.config.js`.** v5 has no Babel preset; the docs say to keep `babel-preset-expo`, which is Expo's default.
7. **`src/global.css` (new):**
   - The docs' split imports: `tailwindcss/theme.css` layer(theme), `preflight.css` layer(base), unlayered `utilities.css`, then `nativewind/theme`.
   - An `@theme` block holds the shared tokens: colours, `--spacing-xs..xxl`, `--radius-sm/md/lg/full`, and `--text-caption/body/label/title/heading`. Each text step has `--line-height`, and label, title and heading also have `--font-weight`.
   - A `:root` block repeats the colour defaults; the Dynamic Themes guide asks for both.
   - Two custom `@utility` rules, `min-target` (min height and width) and `min-h-target`, are 44px with an `@media android` override to 48px, from `shared/tokens` `minTarget`.
8. **`src/css.d.ts` (new):** `declare module '*.css'`, as the TypeScript page suggests.
9. **`nativewind-env.d.ts` (new):** `/// <reference types="react-native-css/types" />`, the exact file the docs show. Metro regenerates the same content on start.
10. **`src/theme.tsx` (rewritten):**
    - Builds one CSS-variable map per theme from `shared/tokens` `colors`. For example, `surfaceRaised` becomes `--color-surface-raised`, so the runtime values are never copied by hand.
    - `ThemeProvider` wraps children in `VariableContextProvider value={themeVars[name]}`.
    - The theme name is also kept in a small React context, `useThemeName()`, for the places that need it as a value (see below).
11. **`src/app/_layout.tsx`:** imports `../global.css` once, as the Expo Router install step says. It puts `ThemeProvider` above `BottomSheetModalProvider` so the sheet portal inherits the variables.
12. Rewrote the styling in `src/app/index.tsx`, `src/app/list.tsx`, `src/components/controls.tsx` and `src/components/overlays.tsx`:
    - All `StyleSheet` and inline styles are replaced with `className`. The exceptions are `GestureHandlerRootView style={{ flex: 1 }}` and `PerfReadout`.
    - Every accessibility prop, testID and piece of copy is unchanged from baseline: roles, aria-*, accessibilityLabel/Hint, nativeID, `announce()`, `useReduceMotion`.
    - The Select modal keeps the backdrop `Pressable accessible={false}` as a sibling of the `aria-modal` list.
13. **`src/perf.tsx` and `src/a11y.ts`:** byte-identical to baseline (checked with `diff`). The perf wiring copies apps/unistyles:
    - `<PerfReadout />` in the layout
    - `mark()` / `measure('theme')` around `setTheme`
    - `<PerfTouch onTouchStart={mark}>` (`View as PerfTouch`) around `<Link href="/list" asChild><Button/></Link>`
    - `onLayout={useListMeasure()}` on the FlatList
14. Index header title: `'NativeWind v5 RC'`.

### Why px everywhere

On native, NativeWind's `rem` is 14 (16 on web), so Tailwind's numeric scale doesn't match the tokens:
- `p-4` is 14pt, not 16.
- The default `rounded-lg` is 7pt.

Every size is therefore a named token in px (`p-lg`, `gap-md`, `rounded-md`, `text-body`) or an arbitrary px value (`w-[24px]`, `border-b-[3px]`, `pb-[120px]`). Tailwind's default numeric spacing utilities aren't used. Source: the Units page and the RC compatibility notes.

### Dynamic Type / controls grow

- Text sizes compile to plain `fontSize` / `lineHeight` numbers on RN `Text`, so the system text-size multiplier applies as it does in the baseline.
- Every control uses `min-h-target` or `min-target`, which are minimums. There are no fixed heights.
- The checkbox box (24) and radio ring (22) are fixed sizes, as in the baseline.

## Theme switching: which mechanism, and why

The v5 docs offer two runtime mechanisms:
1. **Light/dark:** `dark:` = `@media (prefers-color-scheme: dark)`, driven by RN `Appearance.setColorScheme()`. The NativeWind `useColorScheme` hook is deprecated.
2. **Any set of themes:** CSS variables declared in `@theme` and `:root`, overridden at runtime with `VariableContextProvider`, with the variables excluded from inlining. `vars()` still exists but is deprecated in RC0.

The lab needs a third, `brand`, theme. Appearance can only express light and dark, and the RC compiler rejects qualified root selectors such as `:root.dark` or a theme class. So the app uses **mechanism 2 for all three themes**. Light/dark/brand are three variable maps, and switching calls `setTheme(name)`, which changes the provider's `value`. `Appearance` is not touched, so system dark mode doesn't affect the app, like the baseline.

Components only use `className` (`bg-surface-raised`, `text-text`). They resolve the variables from `VariableContext`, with no theme hook. The theme-name context is read by:
- `ThemeSwitcher` (aria-checked)
- `Navigator`: StatusBar style, plus Stack `screenOptions` colours taken from `shared/tokens` by name. Navigation options are props, not styles, and the RC removed the StatusBar `className` declaration.
- `ThemedHost`: colorScheme

I verified with the react-native-css compiler, run on the PostCSS output of `global.css`:
- Colour utilities compile to `[{}, "var", "color-primary"]` lookups, not literals.
- The no-bytecode iOS export also contains the `var` references.
- `text-label` compiles to `fontSize 15, lineHeight 20, fontWeight 600`.
- `min-target` is 44, with a `platform = android` rule of 48.
- `rounded-full` is 999.

## Errors hit and fixes

No errors came up:
- `npx tsc --noEmit` was clean on the first run.
- `expo export` succeeded on the first run.
- No ERESOLVE or peer warnings during install.

Two things I avoided by reading the docs and issues first, rather than hitting them:
- **lightningcss.** The docs require pinning it with `overrides`; without the pin they warn of `global.css` deserialization errors. Pinned before the first build.
- **Opacity modifiers on variable colours.** Classes such as `bg-primary/50` return `undefined` in rc.0 (open issue #1870, `colorMix` trailing `null`). The app uses none: `scrim` is an rgba token, and the pressed/disabled looks use `opacity-*`.

## Doc URLs per API

| API | Source |
| --- | --- |
| Install, exact RC pair, Tailwind/PostCSS/lightningcss pins, `overrides`, `postcss.config.mjs`, CSS import location | https://www.nativewind.dev/v5/getting-started/installation |
| `withNativewind`, `globalClassNamePolyfill`, `inlineVariables.exclude` | https://www.nativewind.dev/v5/api/with-nativewind |
| CSS-first config, no Babel preset, `@theme`, `@utility` | https://www.nativewind.dev/v5/customization/configuration, https://www.nativewind.dev/v5/customization/theme |
| Theme variables + `VariableContextProvider` + inlining exclusion | https://www.nativewind.dev/v5/guides/themes |
| `vars()` deprecated, `VariableContextProvider` value type | https://www.nativewind.dev/v5/api/vars |
| Dark mode via Appearance; `:root.dark` rejected | https://www.nativewind.dev/v5/core-concepts/dark-mode |
| `useColorScheme` (nativewind) deprecated | https://www.nativewind.dev/v5/api/use-color-scheme |
| `active:` modifier, ARIA modifiers need the hyphenated prop | https://www.nativewind.dev/v5/core-concepts/states |
| rem = 14 on native, px = dp | https://www.nativewind.dev/v5/core-concepts/units |
| `styled`, `nativeStyleMapping`, `target: false`, string/dot destinations | https://www.nativewind.dev/v5/api/styled, https://www.nativewind.dev/v5/guides/third-party-components |
| `cssInterop` / `remapProps` removed in RC0 | https://www.nativewind.dev/v5/api/css-interop |
| Custom components pass `className` through | https://www.nativewind.dev/v5/guides/custom-components |
| `nativewind-env.d.ts`, `declare module "*.css"` | https://www.nativewind.dev/v5/getting-started/typescript |
| RC limits (rem radii, rejected utilities, StatusBar className removed) | https://github.com/nativewind/nativewind/blob/main/docs/rc-compatibility.md |

I also checked these against the installed sources and types:
- `node_modules/nativewind/src/{index,metro}.tsx` and `nativewind/theme.css`
- `node_modules/react-native-css/src/runtime.types.ts` (the `Styled` / `StyledConfiguration` types, which allow dot-path destinations)
- `src/native/api.tsx` (`styled`, `useNativeVariable`)
- `src/native-internal/variables.tsx` (`VariableContextProvider`, `value: Record<`--${string}`, ...>`)
- `src/metro/index.ts` (resolver polyfill)
- `src/components/*.tsx`: built-in mappings. ActivityIndicator maps `color` to its `color` prop. Switch maps only `className -> style`.

## The 14 items: library vs hand-built

NativeWind has no components, so **all 14 items are hand-built** on RN primitives with the baseline's accessibility props, styled with `className`:

| # | Item | NativeWind features used |
| --- | --- | --- |
| 1 | Button (pressed, disabled, loading) | Variant class maps (full literal strings so Tailwind's scanner sees them), `active:opacity-80` for pressed, `opacity-45` when `disabled`. The spinner colour uses the built-in ActivityIndicator `className` -> `color` mapping. |
| 2 | Text field | Conditional `border-2 border-danger` / `border border-border`, `text-danger` / `text-text-muted` |
| 3 | Switch row | `styled(RNSwitch, { trackOnClassName: { target: false, nativeStyleMapping: { color: 'trackColor.true' } }, trackOffClassName: ... })` |
| 4 | Checkbox | Conditional classes |
| 5 | Radio group | Conditional classes |
| 6 | Dialog (RN Modal) | Plain classes; the variables reach the Modal through React context |
| 7 | Bottom sheet | See the next section |
| 8 | Select | Plain classes; the backdrop is `absolute inset-0 bg-scrim` |
| 9 | Tabs | Conditional `border-primary` / `border-transparent`, `border-b-[3px]` |
| 10 | Toast | `absolute bottom-xxl left-lg right-lg bg-text` |
| 11 | 200-row list | Plain classes. Rows use no hook or theme context. |
| 12 | Theme switcher | `VariableContextProvider` value swap, with the name kept in React context |
| 13 | @gorhom/bottom-sheet | `styled()` mappings |
| 14 | @expo/ui Switch in a Host | `styled(Host)` maps a colour to `seedColor`; colorScheme comes from the theme name |

`ScrollView` uses the built-in `contentContainerClassName` mapping. `aria-*` modifiers (`aria-checked:`, `aria-selected:`) exist in the RC, but I used plain conditionals to keep the class strings next to the existing state logic.

## How the third-party sheet and @expo/ui are themed

v5 RC0 removed `cssInterop` / `remapProps`. `styled()` is the documented replacement. It returns a wrapper, which must be rendered, and the original component is left alone.
- An extra class prop can target another style prop (`backgroundClassName: 'backgroundStyle'`).
- `target: false` with `nativeStyleMapping` sends one resolved style value to a plain prop (`color` -> `seedColor`).

```tsx
// src/components/overlays.tsx
const ThemedBottomSheetModal = styled(BottomSheetModal<never>, {
  backgroundClassName: 'backgroundStyle',
  handleIndicatorClassName: 'handleIndicatorStyle',
});
const SheetView = styled(BottomSheetView, { className: 'style' });

<ThemedBottomSheetModal ref={ref} accessible={false}
  backgroundClassName="bg-surface-raised" handleIndicatorClassName="bg-border" backdropComponent={...}>
  <SheetView testID={testID} aria-modal className="gap-md p-xl pb-xxl">...</SheetView>
</ThemedBottomSheetModal>

// src/app/index.tsx
const StyledHost = styled(Host, {
  className: { target: false, nativeStyleMapping: { color: 'seedColor' } },
});
function ThemedHost({ children }) {
  const { name } = useThemeName();
  return (
    <StyledHost matchContents colorScheme={name === 'dark' ? 'dark' : 'light'} className="text-primary">
      {children}
    </StyledHost>
  );
}
```

- `BottomSheetModal<never>` is the same TS instantiation expression the Unistyles app needed. It keeps gorhom's generic ref type through the wrapper. tsc passed without trying the plain form.
- `colorScheme` is not a style value, so no className mapping applies. It comes from the theme-name context.

## @expo/ui BottomSheet

Added after the first round of tests, to check whether `@expo/ui`'s universal `BottomSheet` behaves the same outside the baseline. It is filled with `@expo/ui`'s own `Column`, `Text` and `Button`, as [Expo's docs](https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/bottomsheet/) show: React Native views inside it don't receive touches unless wrapped in `RNHostView`. The Close button carries `accessibilityIdentifier('test-sheet-expoui-close')` and the title `accessibilityAddTraits(['isHeader'])`, both from `@expo/ui/swift-ui/modifiers`.

**Result (2026-10-24, iPhone 17 Pro simulator, iOS 26.4, Release):** 5 / 5 sheet checks in `scripts/a11y-audit.mjs`, including the screen behind being hidden from VoiceOver. Opened by hand in the dark theme: the sheet showed the theme's surface and text colours.

Themed with `styled()`, like the Host:

```tsx
// src/components/overlays.tsx
const StyledNativeSheet = styled(NativeSheet, {
  className: { target: false, nativeStyleMapping: { backgroundColor: 'containerColor' } },
});
const StyledNativeColumn = styled(NativeColumn, {
  className: { target: false, nativeStyleMapping: { gap: 'spacing' } },
});
const StyledNativeText = styled(NativeText, { className: 'textStyle' }); // whole resolved style -> textStyle

<StyledNativeSheet className="bg-surface-raised" …>
  <StyledNativeColumn className="gap-md">
    <StyledNativeText className="text-title font-bold text-text">…</StyledNativeText>
```

Because the whole text style goes to `textStyle`, the title and body also get a `lineHeight` (from the unitless ratio), which the baseline's sheet doesn't set.

## Could not make work / deviations / findings

- **No built-in multi-theme switch.** The documented class/variant route covers light and dark only (Appearance + `prefers-color-scheme`), and named theme selectors (`:root.dark`, a `.brand` class) are rejected by the native compiler. Three themes need `VariableContextProvider` plus `inlineVariables.exclude`. The hex values sit in `@theme` / `:root` (light defaults, copied by hand) and the runtime maps come from `shared/tokens`.
- **The theme name as a value needs app code.** NativeWind exposes no "current theme" for variable-provider themes. `useUnstableNativeVariable` can read a variable but is marked unstable. So the name lives in a small React context, used for aria-checked, StatusBar, header colours and the Host colorScheme.
- **Switch `trackColor`.** RC0 has no built-in Switch colour mapping (open issue #1757, "v5: Add Switch thumbColor/trackColor prop mappings"). I used a `styled()` mapping with dot-path destinations (`trackColor.true` / `.false`). The types accept it, and the RC notes say nested mappings preserve independent target paths, but it has **not been confirmed at runtime**.
- **`disabled:` modifier not used.** It keys off the `disabled` prop, which is also true while loading. The baseline only dims real disabled buttons, so the dimming is a conditional class.
- **Navigation header colours and StatusBar** use token values by theme name, not classes. Navigation options are props, and the RC removed the StatusBar `className` declaration.
- **rem = 14 on native**, so Tailwind's default numeric spacing and radius scales don't match web or the tokens. Everything uses named px tokens or arbitrary px values.
- **Known RC bugs not hit here:**
  - #1870 (color opacity modifiers return undefined)
  - #1837 (`tint-*` broken; `theme.css` still uses `@prop`)
  - #1846 (Android `font-bold` clipping, untested here since only iOS is in scope)
  - The SafeAreaView no-op mentioned in the survey: I didn't find a matching open v5 issue, and the app doesn't use SafeAreaView, so it's unverified.
- **List link** uses `<Link href="/list" asChild>` as in apps/unistyles, where the baseline uses `router.push`.
- Test-screen source (`src/app/*.tsx` + `src/components/*.tsx`): 573 lines (baseline 598, unistyles 734).

## Verification

- `npx tsc --noEmit`: clean.
- `npx expo export --platform ios --output-dir $TMPDIR/uilab-export-nativewind`: succeeded, 2072 modules.
- **iOS bundle size:** `_expo/static/js/ios/entry-c9ca42d3024848fd54164c288e183fc7.hbc` is **4,453,384 bytes** (4.45 MB, Hermes bytecode). For comparison: baseline 3.93 MB, unistyles 4,123,140 bytes.
- A second `--no-bytecode` export confirmed:
  - The compiled stylesheet is in the bundle, with colour utilities as `var` lookups.
  - The source `react-native` primitives go through react-native-css `useCssElement` wrappers.
- `npx expo install --check`: up to date. `expo-doctor`: 21/21.

## Unverified

- Nothing has run on a simulator or device; no prebuild or native build was done. These are all untested:
  - Runtime theme switching through `VariableContextProvider`
  - The `styled()` mappings: sheet background and handle, Switch `trackColor`, Host `seedColor`
  - Whether gorhom picks up a changed `backgroundStyle` while presented
  - `active:` press feedback
  - The `@media android` target override
- None of the method's accessibility or performance checks have been run yet.

## Found on the simulator: px line-heights render as multipliers

First Release run, 23 Oct 2026, iOS 26.4. The type tokens in `src/global.css` were written the usual Tailwind v4 way, `--text-body: 16px; --text-body--line-height: 22px;`. Each text element then rendered at font size × line-height value. Read from the accessibility tree:

| Token | Expected line | Rendered height |
| --- | --- | --- |
| heading 28px / 34px | 34 pt | 952 pt (28 × 34) |
| title 20px / 26px | 26 pt | 520 pt (20 × 26) |
| label 15px / 20px | 20 pt | 300 pt (15 × 20) |
| body 16px / 22px | 22 pt | 352 pt (16 × 22) |
| caption 13px / 18px | 18 pt | 234 pt (13 × 18) |

The page was 18 screens tall, and the audit, motion and timing scripts couldn't reach most controls. Those results are kept in `results/nativewind-px-line-height/`, along with a screenshot.

What was checked:
- `react-native-css` 3.1.0-rc.0 compiles a static px `line-height` as a length (`parseLineHeight` in `dist/module/compiler/declarations.js`).
- `line-height` is also on its list of properties resolved at runtime (`unparsedRuntimeParsing`), and Tailwind v4's `text-*` utilities pass the token through `var()`.
- That runtime path is the likely cause, but it hasn't been confirmed.
- No matching issue was found in nativewind/nativewind or nativewind/react-native-css (searched 23 Oct 2026).

**Workaround in this app:** unitless ratios (`--text-body--line-height: 1.375` and so on), which NativeWind treats as em multipliers. All results in `results/nativewind/` use the workaround.
