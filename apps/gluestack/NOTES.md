# gluestack-ui v5 + Uniwind: build notes

Built on 2026-10-22, starting from a copy of `apps/baseline`. Nothing in this app has been run on a simulator or device yet. Everything under "Accessibility" is what the source code says should happen, and still has to be checked with argent `describe`.

## Versions

Stack, kept identical to the baseline:

| Package | Version |
| --- | --- |
| expo | 57.0.31 |
| react-native | 0.86.3 |
| react | 19.2.3 |
| react-native-reanimated | 4.5.1 |
| react-native-worklets | 0.10.1 |
| expo-router | ~57.0.29 |
| @gorhom/bottom-sheet | 5.2.14 |
| @expo/ui | 57.0.26 |
| react-native-safe-area-context | ~5.7.0 (the CLI bumped it to ^5.10.1; reverted, see below) |
| react-native-svg | 15.15.4 (the CLI installed ^15.16.0; pinned back to the SDK version) |

Library packages added by the CLI:

| Package | Version |
| --- | --- |
| gluestack-ui (CLI, run with npx) | 5.0.3 |
| @gluestack-ui/core | 5.0.15 |
| @gluestack-ui/utils | 5.0.6 |
| uniwind | 1.13.0 |
| tailwindcss | 4.3.3 |
| tailwind-variants | 0.1.20 (brings tailwind-merge 1.14.0) |
| react-aria | 3.53.1 |
| react-stately | 3.51.0 |
| @legendapp/motion | 2.5.3 |
| @expo/html-elements | 0.12.5 |
| babel-plugin-module-resolver | 5.0.3 |

The components were copied from the gluestack-ui repo's `main` branch, commit `b712c85` (2 Sep 2026), path `apps/starter-kit-expo-uniwind/components/ui`.

## Uniwind is a supported engine

gluestack-ui v5 lists two styling engines: NativeWind v5 and Uniwind. Uniwind is Expo-only and needs no PostCSS step. The CLI has a `--uniwind` flag.

- https://gluestack.io/ui/docs/home/getting-started/installation
- https://gluestack.io/ui/docs/home/getting-started/cli
- https://gluestack.io/ui/docs/guides/more/upgrade-to-v5 (the "UniWind Upgrade" section has the manual setup)

## Setup steps

1. `rsync` from `apps/baseline`, leaving out node_modules, ios, android and .expo. Renamed the package to `am-ui-lab-gluestack`. In app.json: name `UI Lab gluestack`, slug `am-ui-lab-gluestack`, scheme `amuilab-gluestack`, and `dev.asimmalik.uilab.gluestack` for both ios.bundleIdentifier and android.package. Ran `npm ci`.
2. `npx gluestack-ui@5.0.3 init --uniwind -y`. The first attempt hung for over 40 minutes and had to be killed (see Errors 1). The second attempt worked after I cloned the repo cache by hand.
3. `npx expo install react-native-safe-area-context react-native-svg`. This put both back on the versions SDK 57 expects. `expo install --check` is clean.
4. `npx gluestack-ui@5.0.3 add button input form-control switch checkbox radio select alert-dialog toast tabs text heading spinner -y`, then `add icon`. The docs say `init` adds icon, but it didn't, and Select and Checkbox need the icons.
5. Fixed up the config the CLI wrote (see the next section) and rewrote the screens.

### Files the CLI wrote, and what I changed afterwards

| File | What the CLI did | What I changed |
| --- | --- | --- |
| `package.json` | Added the dependencies above. Bumped safe-area-context and svg. | Pinned safe-area-context and svg back to the SDK versions. Added `"main": "index.js"` and an `npm run tokens` script. |
| `.npmrc` | Created it with `legacy-peer-deps=true`. `@legendapp/motion` has a `nativewind >=4` peer dependency, which a Uniwind project never satisfies. | Kept. |
| `metro.config.js` | Overwrote the file with `withUniwindConfig(...)`. That **dropped the baseline's `watchFolders` for `../../shared`**. It also set `extraThemes: ['dark']`, which is redundant because light and dark are built in. | Put `watchFolders` back before the Uniwind wrapper. Set `extraThemes: ['brand']`. |
| `babel.config.js` | Created it with `module-resolver` (`@` → `./`) and `react-native-worklets/plugin`. | Removed the worklets plugin. In SDK 57, `babel-preset-expo` already adds it when `react-native-worklets` is installed (`build/configs/expo.js`), so the transform would run twice. The v4/v5 docs still say the plugin is required. |
| `global.css` | Wrote Tailwind v4 + Uniwind imports and gluestack's default neutral palette. | Kept the two imports. Replaced the palette with `@import './theme.generated.css'`. |
| `uniwind-types.d.ts` | Created it. Metro regenerates it on every bundle. | Nothing. It now lists `['light', 'dark', 'brand']`. |
| `tsconfig.json` | Changed `@/*` to `["./src/*", "./*"]`. | Kept. The `@shared/*` path was preserved. |
| `src/app/_layout.tsx` | Inserted `SafeAreaListener`, a **second** `GestureHandlerRootView` and `<GluestackUIProvider mode="dark">` in the middle of the existing `Navigator` JSX, with the indentation broken. | Rewrote it by hand. Kept the `global.css` import and `Uniwind.updateInsets`. |
| `components/ui/**` | Copied in the components (about 6,960 lines). | Edited two files; see "Edits to generated components". |
| `gluestack-ui.config.json` | The CLI docs say `init` creates this file. It didn't. `add` worked anyway. | — |

### Files I added

- `scripts/gen-theme-css.mjs` generates `theme.generated.css` from `shared/tokens.ts`. Uniwind reads CSS at bundle time and can't import a TS module, so this build step is needed. Node 22.18+ strips the TS types on import.
- `theme.generated.css` holds the generated tokens.
- `src/tv-config.ts` and `index.js` are a custom entry. The reason is under Theming → tailwind-merge.
- `css.d.ts` declares `declare module '*.css'`. TypeScript 6 checks side-effect imports, so `import '@/global.css'` fails without it, and Uniwind's types don't ship a declaration.

## Theming

### Tokens → CSS variables

`theme.generated.css` defines one `@variant` block per theme (`light`, `dark`, `brand`) inside `@layer theme { :root { … } }`. This is the format from Uniwind's custom-themes page, and the gluestack CLI wrote the same thing. gluestack's components only know the shadcn-style names, so the shared tokens are mapped onto those names:

| gluestack name | shared token |
| --- | --- |
| background | background |
| foreground | text |
| card, popover | surfaceRaised |
| popover-foreground, secondary-foreground, accent-foreground | text |
| primary / primary-foreground | primary / onPrimary |
| secondary, muted, accent | surface |
| muted-foreground | textMuted |
| destructive | danger |
| border, input | border |
| ring | focus |

Extra names gluestack doesn't have: `destructive-foreground` (onDanger), `surface`, `surface-raised`, `success`, `scrim`.

Colours are stored as "R G B" triplets and wrapped later as `rgb(var(--x))`, which is gluestack's format. That lets opacity modifiers like `bg-primary/90` work.

Spacing, radii and type are written to `@theme` as `--spacing-xs…xxl`, `--radius-sm|md|lg` and `--text-caption|body|label|title|heading`, the last with `--line-height` and `--font-weight` modifiers. Overriding `--radius-*` also changes the radius of every gluestack component that uses `rounded-md` and similar classes.

### Switching at runtime

`<GluestackUIProvider mode={name}>` calls `Uniwind.setTheme(mode)`. The provider's `ModeType` only allowed `'light' | 'dark' | 'system'`, so I added `'brand'` to it in the copied file. Uniwind registers `brand` through `extraThemes` in metro.config.js.

Docs:
- https://docs.uniwind.dev/theming/custom-themes
- https://gluestack.io/ui/docs/home/theme-configuration/dark-mode

The provider's `mode` is documented as light/dark/system only. There's no gluestack doc for a third theme; it works because the provider is a thin wrapper over Uniwind.

### Colour values for APIs that don't take a className

react-navigation header options, the `@expo/ui` Host and ButtonSpinner need actual colour values. For these, `useTokenColor(token)` in `src/theme.tsx` calls `useResolveClassNames('accent-<token>').accentColor`. Uniwind documents `useResolveClassNames` as the hook for react-navigation, and the `accent-` prefix for extracting colours.

- https://docs.uniwind.dev/api/use-resolve-class-names
- https://docs.uniwind.dev/class-names#the-accent-prefix

The RN Switch track colours use Uniwind's Switch bindings (`trackColorOnClassName` etc.): https://docs.uniwind.dev/components/switch

### Third-party sheet: @gorhom/bottom-sheet

Styled with Uniwind's `withUniwind` HOC, which is Uniwind's documented way to style components it doesn't own. Every `*Style` prop gets a matching `*ClassName` prop.

- https://docs.uniwind.dev/api/with-uniwind
- https://docs.uniwind.dev/components/other-components

```tsx
// The instantiation expression pins gorhom's generic. Without it, withUniwind
// infers T = unknown and the ref type stops matching (a TS error).
const StyledBottomSheetModal = withUniwind(BottomSheetModal<never>);
const StyledBottomSheetView = withUniwind(BottomSheetView);

<StyledBottomSheetModal
  ref={sheetRef}
  backgroundClassName="bg-card"          // -> backgroundStyle
  handleIndicatorClassName="bg-border"   // -> handleIndicatorStyle
  …>
  <StyledBottomSheetView className="p-xl gap-md pb-xxl">…</StyledBottomSheetView>
</StyledBottomSheetModal>
```

The `withUniwind` wrapper is a plain function component with no `forwardRef`. Refs reach gorhom only because React 19 passes `ref` as an ordinary prop.

gluestack also ships its own `BottomSheet` component, a wrapper around @gorhom/bottom-sheet. I didn't use it, because item 13 asks for the raw third-party component themed with the library's tokens.

### @expo/ui Host

```tsx
const { name } = useThemeName();
const primary = useTokenColor('primary'); // useResolveClassNames('accent-primary').accentColor
<Host matchContents colorScheme={name === 'dark' ? 'dark' : 'light'} seedColor={primary}>
  <NativeSwitch … />
</Host>
```

### @expo/ui BottomSheet

Added after the first round of tests, to check whether `@expo/ui`'s universal `BottomSheet` behaves the same outside the baseline. It is filled with `@expo/ui`'s own `Column`, `Text` and `Button`, as [Expo's docs](https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/bottomsheet/) show: React Native views inside it don't receive touches unless wrapped in `RNHostView`. The Close button carries `accessibilityIdentifier('test-sheet-expoui-close')` and the title `accessibilityAddTraits(['isHeader'])`, both from `@expo/ui/swift-ui/modifiers`.

**Result (2026-10-24, iPhone 17 Pro simulator, iOS 26.4, Release):** 5 / 5 sheet checks in `scripts/a11y-audit.mjs`, including the screen behind being hidden from VoiceOver. Opened by hand in the dark theme: the sheet showed the theme's surface and text colours.

`containerColor` is `useTokenColor('card')`, as for the Host. The text colours, font sizes and the `Column` gap come from the gorhom sheet's own classes, resolved with Uniwind's `useResolveClassNames` (`'text-title text-foreground'`, `'text-body text-muted-foreground'`, `'gap-md'`).

### tailwind-merge mismatch (theming friction)

gluestack's `tva()` wraps tailwind-variants 0.1.20, which uses **tailwind-merge 1.14**, a merger written for Tailwind v3, while the styles themselves are Tailwind v4. tailwind-merge doesn't know the token font sizes, so it classifies `text-heading` as a text *colour*. When `text-heading text-foreground` both reach a gluestack component, one of them gets dropped.

gluestack's theme docs point to tailwind-variants config for custom font sizes. I used the global `defaultConfig.twMergeConfig` (in `src/tv-config.ts`). It has to be set before any component module calls `tva()`, which is why the app now has a custom entry (`index.js` imports `./src/tv-config`, then `expo-router/entry`). I checked the source map: only one copy of tailwind-variants is bundled, so the config reaches the copy the components use.

Docs:
- https://gluestack.io/ui/docs/home/theme-configuration/customizing-theme
- https://www.tailwind-variants.org/docs/config#global-config

The generated components also use class names that the Uniwind `global.css` never defines, so they style nothing: `shadow-soft-4`, `tracking-md`, `font-body`, `font-heading`, `ring-indicator-primary`, `text-2xs`. These look like leftovers from v3/v4.

## Edits to generated components

All of these are visible in the copied files:

1. `button/index.tsx`: destructive text `text-white` → `text-destructive-foreground` (twice), and removed `dark:bg-destructive/60`. The library hard-codes white on the danger colour and fades it in dark mode, so the token `onDanger` would never be used. In the dark theme, white on #FCA5A5 fails contrast.
2. `gluestack-ui-provider/index.tsx`: added `'brand'` to `ModeType`.

Things I left alone: the backdrops use hard-coded `bg-black/50` / `bg-[#000]/50` with an animated opacity, not the `scrim` token. I tried `bg-scrim` and reverted it, because the opacity animation runs on top of the alpha already in the colour and doubles it.

## Which of the 14 items use library components

| # | Item | Implementation |
| --- | --- | --- |
| 1 | Button (pressed / disabled / loading) | gluestack `Button`, `ButtonText`, `ButtonSpinner`. There's no `loading` prop; loading is `isDisabled` plus a spinner child, as the docs show. |
| 2 | Text field (label, helper, error) | gluestack `FormControl` (Label, Helper, Error) + `Input`/`InputField` |
| 3 | Switch (labelled) | gluestack `Switch` (React Native's Switch) next to an RN `Text`, as in the docs' "Switch With Label" example |
| 4 | Checkbox | gluestack `Checkbox`, `CheckboxIndicator`, `CheckboxIcon`, `CheckboxLabel`. `isIndeterminate` is available but not used, to match the baseline. |
| 5 | Radio group | gluestack `RadioGroup`/`Radio`. The group label is an RN `Text`, because gluestack has no RadioGroup label part. |
| 6 | Modal dialog | gluestack `AlertDialog` |
| 7 | Bottom sheet | @gorhom/bottom-sheet themed with `withUniwind` (same component as item 13) |
| 8 | Select (5 options) | gluestack `Select`, which renders gluestack's Actionsheet on native (@legendapp/motion) |
| 9 | Tabs | gluestack `Tabs` (`TabsList`, `TabsTrigger`, `TabsIndicator`, `TabsContent`) |
| 10 | Toast | gluestack `useToast` + `Toast` / `ToastTitle` |
| 11 | List (200 rows) | Hand-built: RN `FlatList`/`View`/`Text` with token classNames. gluestack has no list-row component. |
| 12 | Theme switcher | gluestack `RadioGroup` driving `GluestackUIProvider mode` → `Uniwind.setTheme` |
| 13 | Third-party component | @gorhom/bottom-sheet via Uniwind `withUniwind` |
| 14 | Native component | `@expo/ui` Host + Switch, with `seedColor` and `colorScheme` taken from the active theme |

Headings use gluestack `Heading` (@expo/html-elements `H*`, which sets `accessibilityRole="header"` on native). Lines of test-screen code: 565 in `src/`, against 667 for the baseline, which includes its hand-written a11y helpers. That doesn't count the ~6,960 copied lines under `components/ui`.

## Accessibility: what I passed, and what I didn't add

Rule followed: pass only the props the gluestack docs ask for, and add no roles, states or announcements by hand.

**Props passed because the docs ask for them**
- `InputField aria-label={label}`. The Input docs say to set `aria-label`. Without it, `Input` defaults to `aria-label="Input Field"`. The visible `FormControlLabel` isn't linked to the input on native; `aria-describedby` is only wired on web.

**Kept from the baseline for parity (third-party / not gluestack)**
- The gorhom sheet keeps the baseline's `accessible={false}` and `aria-modal` on `BottomSheetView`. The list rows keep the baseline's `accessible` + `accessibilityLabel`.

**Not added: the library doesn't provide these, and I didn't hand-add them**
- Text-field error **announcement**. FormControl doesn't announce errors and has no live region. The baseline calls `announceForAccessibility` by hand; this app doesn't.
- Button **busy** state. gluestack's Button sets `role="button"` and `disabled`, but has no `aria-busy`. `ButtonSpinner` is labelled "loading" with `tabIndex={0}`.
- Switch **label**. Switch is RN's Switch, with no label association. Following the docs, it will probably be read without a name. Also, the gluestack Switch styling (`size` scale, disabled opacity) goes through `className`, which Uniwind's Switch ignores; this is TS error 6 below.
- Checkbox **name**. On native the accessible name is `aria-label || value || 'Checkbox'`. The docs example passes neither; the types require `value`, so I pass `value="terms"`. VoiceOver will probably read "terms", not the visible label. Not verified.
- RadioGroup **name**. Defaults to `aria-label="RadioGroup"` unless one is passed. The Radio docs don't pass one.
- Select. The trigger is `role="button"`, with no `aria-expanded` and no label link. The Actionsheet content has no `aria-modal` / `accessibilityViewIsModal`, and its items have no role. Only AlertDialog and Modal set modal semantics.
- Reduce Motion. gluestack has no reduce-motion handling. AlertDialog (ZoomIn/FadeOut), Toast (SlideInUp) and the Tabs indicator use Reanimated, which is expected to follow the system setting by default. The Select Actionsheet uses @legendapp/motion, which probably doesn't. Not verified.

**Things gluestack does provide, according to its source**
- AlertDialog content: `aria-modal="true"`, `accessibilityViewIsModal`, `onAccessibilityEscape`. It renders through gluestack's overlay portal, not an RN `Modal`, unless `useRNModal` is passed.
- ToastTitle: `role="alert"`, `aria-live="assertive"`, plus `AccessibilityInfo.announceForAccessibility(children)` in an effect (the code calls it a "hack").
- Tabs: `role="tablist"`/`"tab"`/`"tabpanel"`, `aria-selected`, `aria-controls`.
- Radio: `role="radio"`, `aria-checked`. Checkbox: `role="checkbox"`, `aria-checked` (including `"mixed"`).
- Heading: `accessibilityRole="header"`.
- Odd: `InputField` sets `aria-selected={isFocused}` on native.

**Touch targets.** I kept gluestack's default sizes. The default Button is `px-4 py-2` with `text-sm`, roughly 36pt tall, and `size="lg"` is `min-h-10` (40pt), so both are probably under 44pt. The Select trigger is `min-h-10` at `md`. To be measured.

## Errors hit, and fixes

1. **The CLI hung while cloning.** `init` runs `git clone --depth=1` of the whole gluestack-ui repo (288 MB on GitHub) into `~/.gluestack/cache/gluestack-ui`. The clone stalled at about 142 MB for more than 20 minutes with no progress. When I killed the git process, the CLI printed "◇ Cloning successful." anyway; it doesn't check git's exit code. Then it cancelled. Fix: clone the cache myself as a blobless, sparse checkout, which took 2.5 s: `git clone --depth=1 --branch main --filter=blob:none --sparse … && git sparse-checkout set apps/starter-kit-expo-uniwind packages/gluestack-ui`. The CLI accepted the cache ("Repository already cloned", then a pull). The CLI also does a second full clone of the `main-v4-alpha` branch for templates, even in v5 / Uniwind mode. Both caches live in `~/.gluestack`, outside the repo.
2. **The CLI dropped Metro `watchFolders`** when it overwrote metro.config.js. Merged it back by hand.
3. **The CLI mangled `_layout.tsx`.** It nested providers inside `Navigator`, duplicated `GestureHandlerRootView`, and hard-coded `mode="dark"`. Rewrote it.
4. **The CLI moved native modules off the SDK pins.** safe-area-context went to ^5.10.1 and svg to ^15.16.0. Fixed with `npx expo install`. It left Reanimated 4.5.1 and worklets 0.10.1 alone.
5. **The CLI added a redundant worklets Babel plugin.** Removed it, as explained above.
6. **The docs and the code disagree:**
   - The manual Uniwind setup in the upgrade docs shows `withUniwindConfig(config, { themes: ["light","dark"] })`. `themes` isn't an option in Uniwind 1.13's types; the options are `cssEntryFile`, `extraThemes`, `dtsFile`, `polyfills`, `debug` and `isTV`.
   - The upgrade docs' `global.css` uses `.light {}` / `.dark {}` selectors. The CLI writes `@variant light {}` / `@variant dark {}`.
   - The CLI docs say `init` adds icon/overlay/toast and creates `gluestack-ui.config.json`. It didn't add icon and didn't create the config file.
   - The Checkbox docs example has no `value`, but the types require one.
7. **TS6 side-effect import error** for `@/global.css`. Added `css.d.ts`.
8. **withUniwind lost gorhom's generic**, so the ref type didn't match. Fixed with the `BottomSheetModal<never>` instantiation expression.

### Version mismatch: gluestack's targets against our stack

| Source | expo | react-native | reanimated | worklets |
| --- | --- | --- | --- | --- |
| Our stack | 57.0.31 | 0.86.3 | 4.5.1 | 0.10.1 |
| `apps/starter-kit-expo-uniwind` (what the CLI copies for Uniwind) | ^55.0.0-preview.9 | 0.83.1 | 4.2.1 | ^0.7.2 |
| `apps/starter-kit-expo` (NativeWind v5 starter) | ^56.0.3 | 0.85.3 | 4.3.1 | 0.8.3 |
| v4/v5 docs, "Upgrade to v4" install commands | — | — | ~4.2.1 | ^0.7.1 |

- The survey said "starters target Expo 56 / RN 0.85.3". That's true for the NativeWind starter. The Uniwind starter is older still: an Expo 55 preview on RN 0.83.1.
- Issue #3421 ("init breaks babel.config.js on React Native 0.86+") is **closed**, but its fix, PR #3453, is still **open and unmerged**. The issue covers bare RN CLI + NativeWind v4, where the CLI wrote `module:metro-react-native-babel-preset`. I didn't hit it on Expo + Uniwind: the preset stayed `babel-preset-expo`. Links: https://github.com/gluestack/gluestack-ui/issues/3421 and https://github.com/gluestack/gluestack-ui/pull/3453
- Peer-dependency friction: `@legendapp/motion` requires `nativewind >=4`, so the CLI writes `.npmrc legacy-peer-deps=true`.

## Verification

- `npx expo install --check`: up to date.
- `npx tsc --noEmit`: **0 errors in app code, 6 errors in generated gluestack components.** I left them unedited and recorded them here:
  1. `components/ui/alert-dialog/index.tsx(140)`: `ZoomIn.withInitialValues({ transform, opacity })`. Reanimated 4.5's types allow only `transform` for ZoomIn. TS2353.
  2. `components/ui/checkbox/index.tsx(31)`: the `withUniwind(UIIcon)` ref type isn't assignable. TS2322.
  3. `components/ui/checkbox/index.tsx(128)`: `size` isn't in `ICheckboxIconProps`. TS2339.
  4–5. `components/ui/checkbox/index.tsx(139)`: `height` / `width` aren't on the props type. TS2339.
  6. `components/ui/switch/index.tsx(35)`: `className` passed to RN Switch. Under Uniwind the type is `undefined`, because Uniwind's Switch doesn't support `className`, so the Switch's tva styles are never applied at runtime either. TS2322.
- `npx expo export --platform ios --output-dir $TMPDIR/uilab-export-gluestack`: **succeeded.** 2,500 modules.
  - **Main iOS bundle: 4,985,657 bytes** (`index-0783b44315613fffc337fabc7e69c9e1.hbc`).
  - For context, a baseline export on the same machine the same day was 3,927,321 bytes (1,817 modules). That's +1,058,336 bytes, or +26.9%. The baseline number is a one-off, not a three-run median.
  - Biggest additions by module count in the source map: @gluestack-ui/core 123, react-native-svg 111, react-aria 91 (the umbrella package, pulled in on native through @gluestack-ui/utils), uniwind 63, @gluestack-ui/utils 42, @legendapp/tools + motion 28, tailwind-merge 14, react-stately 14.

## Not verified, still to do

- Everything on device: the a11y tree, focus on modal open and close, announcements, Reduce Motion, text scaling, touch targets, and whether all three themes repaint gluestack components, the gorhom sheet, the header and the `@expo/ui` Host.
- Whether `useResolveClassNames('accent-…')` returns colours for the `rgb(var(--x))` tokens at runtime. The export succeeded and the variables are in the bundle, but I haven't seen the result on screen.
- Whether the twMerge global config fixes the `text-heading` vs `text-foreground` conflict at runtime. I checked it by reading the code, not by rendering.
