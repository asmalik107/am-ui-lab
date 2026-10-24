# React Native Reusables (Uniwind) — build notes

React Native Reusables (RNR) is a shadcn-style copy-paste kit: the CLI copies component source into `src/components/ui/`, built on `@rn-primitives/*` (Radix ports). It has a NativeWind variant and a Uniwind variant. This app uses the **Uniwind** variant.

Built 2026-10-22. Nothing here has been run on a simulator or device yet. Everything below comes from `tsc`, `expo export` and reading the source.

## Versions

Pinned stack (identical to baseline, checked with `npm ls` and `npx expo install --check`):

| Package | Version |
| --- | --- |
| expo | 57.0.31 |
| react-native | 0.86.3 |
| react | 19.2.3 |
| react-native-reanimated | 4.5.1 |
| react-native-worklets | 0.10.1 |
| expo-router | 57.0.29 |

Library packages (installed versions):

| Package | Version |
| --- | --- |
| @react-native-reusables/cli | 0.7.1 (shells out to `shadcn@latest`, which was 4.22.1) |
| uniwind (Free) | 1.13.0 |
| tailwindcss | 4.3.3 |
| tw-animate-css / tailwindcss-animate | 1.4.0 / 1.0.7 |
| class-variance-authority / clsx / tailwind-merge | 0.7.1 / 2.1.1 / 3.7.0 |
| @rn-primitives/alert-dialog, checkbox, label, radio-group, select, slot, switch, tabs, hooks, types | 1.5.2 |
| @rn-primitives/portal | 1.5.3 |
| lucide-react-native | 1.61.0 |
| react-native-svg | 15.15.4 |
| @gorhom/bottom-sheet | 5.2.14 |
| @expo/ui | 57.0.26 |

RNR's own target, from the `minimal-uniwind` template (react-native-reusables-templates @ `ecdc14b`, 2 Jul 2026): expo ~56.0.13, react-native 0.85.3, reanimated 4.3.1, worklets 0.8.3, uniwind ^1.9.0, @rn-primitives ^1.5.2. That confirms the survey (Expo 56 / RN 0.85.3). We kept Expo 57 / RN 0.86.3 / Reanimated 4.5.1.

**Incompatibilities with our newer stack:** none showed up at install, type-check or bundle time. The `@rn-primitives/*` peer ranges are `*`, and uniwind's peers are `react-native >=0.81` and `tailwindcss >=4`, so npm reported no peer warnings. Runtime is not tested.

## Setup steps (in order)

1. Copied `apps/baseline` to `apps/reusables`, leaving out node_modules, ios, android and .expo. Renamed the package (`am-ui-lab-reusables`, in package.json and package-lock.json). In app.json: name `UI Lab Reusables`, slug `am-ui-lab-reusables`, scheme `amuilab-reusables`, bundle id and Android package `dev.asimmalik.uilab.reusables`. Ran `npm install`.
2. `npx expo install uniwind tailwindcss tw-animate-css tailwindcss-animate class-variance-authority clsx tailwind-merge @rn-primitives/portal`. This list comes from the minimal-uniwind template's package.json and the RNR CLI's `CORE_DEPENDENCIES` (apps/cli/src/project-manifest.ts).
3. **metro.config.js**: kept `watchFolders = [../../shared]`, then wrapped with `withUniwindConfig(config, { cssEntryFile: './src/global.css', dtsFile: './src/uniwind-types.d.ts', extraThemes: ['brand'] })`. Uniwind's docs require `withUniwindConfig` to be the outermost wrapper.
4. **src/global.css**: `@import 'tailwindcss'; @import 'uniwind'; @import 'tw-animate-css';`, then `@theme` radii and three `@variant light|dark|brand` blocks in `@layer theme :root`. The structure follows the minimal-uniwind template. Values come from shared/tokens (see Theming).
5. **src/uniwind-types.d.ts**: generated with `npx uniwind generate-artifacts --css ./src/global.css --theme brand --dts ./src/uniwind-types.d.ts`. Metro also regenerates it. It types `Uniwind.setTheme` as `'light' | 'dark' | 'brand'`.
6. **components.json**: copied from the minimal-uniwind template, with `tailwind.config: ""` and `tailwind.css: "src/global.css"`. Aliases `@/components`, `@/lib/utils`, `@/components/ui` resolve through the existing `@/* -> ./src/*` tsconfig path. tsconfig is unchanged from baseline (`@shared/*` kept).
7. **src/lib/utils.ts**: the `cn()` helper, the same as the registry's `uniwind/lib/utils.ts`.
8. Added components with the CLI:
   `npx @react-native-reusables/cli@latest add button text input label switch checkbox radio-group select alert-dialog tabs icon --styling-library uniwind -y`.
   The CLI pulls from `https://reactnativereusables.com/r/uniwind/<name>.json` and runs `shadcn add`. It created 12 files under src/components/ui/ (it also pulled in native-only-animated-view) and added the `@rn-primitives/*` dependencies.
9. `npx expo install lucide-react-native react-native-svg`. The registry doesn't declare these (see Errors).
10. **src/app/_layout.tsx**: `import '../global.css'`, `Uniwind.setTheme('light')` at module scope, and `<PortalHost />` as the last child inside the providers.
11. **src/expo-types.d.ts**: `/// <reference types="expo/types" />`, so tsc accepts the CSS side-effect import (see Errors).
12. `npx @react-native-reusables/cli doctor` leaves one warning: "Missing Files: Theme" (`lib/theme.ts`). We didn't add it on purpose. That file only holds `NAV_THEME` hex copies for react-navigation, and here the header colours come from `useCSSVariable`, so global.css stays the only source of colour values.

Config files touched: package.json, package-lock.json, app.json, metro.config.js, components.json, src/global.css, src/uniwind-types.d.ts (generated), src/expo-types.d.ts. No babel config: Uniwind needs no Babel preset.

## Errors and fixes

| # | Error | Cause | Fix |
| --- | --- | --- | --- |
| 1 | `placeholderClassName does not exist on type TextInputProps` in `components/ui/input.tsx` (tsc) | RNR's Uniwind `Input` destructures `placeholderClassName`, which is a NativeWind prop that Uniwind doesn't type or support. RNR's registry package type-checks only because its tsconfig also includes `nativewind-env.d.ts`. The prop is never used in the component body. | Removed the unused destructure (a one-line edit to the copied component). `textarea.tsx` has the same issue but isn't installed here. |
| 2 | Components import `lucide-react-native`, but the CLI didn't install it | `icon.json` in the uniwind registry lists no `dependencies`, while checkbox, select and icon import lucide. The minimal-uniwind template ships lucide already, so a template-based project never sees this. | `npx expo install lucide-react-native react-native-svg` |
| 3 | `TS2882: Cannot find module or type declarations for side-effect import of '../global.css'` | TypeScript 6 checks side-effect imports. Expo declares `*.css` in `expo/types`, which is normally pulled in by the gitignored, CLI-generated `expo-env.d.ts`. `expo export` doesn't generate that file. | Added `src/expo-types.d.ts` referencing `expo/types`. |
| 4 | `RefObject<BottomSheetModal> is not assignable to ForwardedRef<BottomSheetModal<unknown>>` | `withUniwind(BottomSheetModal)` infers gorhom's generic `T` as `unknown` (gorhom's default is `never`). | Typed the ref `BottomSheetModal<unknown>`. |
| 5 | (design trap, caught before it shipped) Defining the type scale as `--text-body` etc. in `@theme` | `cn()` uses tailwind-merge, which classifies unknown `text-<name>` as a colour and silently drops `text-foreground` from RNR components. | Used arbitrary values (`text-[16px] leading-[22px]`) from `src/lib/type.ts`. tailwind-merge reads those as font sizes. |
| 6 | `npx expo install` printed `ERR_PACKAGE_PATH_NOT_EXPORTED` | Only my own `node -p require('<pkg>/package.json')` version probe failed: `@rn-primitives/*` and lucide don't export `./package.json`. The install itself succeeded. | Read the versions from node_modules/*/package.json directly. |

## Which of the 14 items use library components

| # | Item | Built with |
| --- | --- | --- |
| 1 | Button (pressed / disabled / loading) | RNR `Button` + `Text`. Pressed comes from `active:` classes. Loading follows RNR's documented pattern: `disabled` plus a lucide `Loader2` inside `animate-spin`. RNR has no loading prop and no `aria-busy`. |
| 2 | Text field | RNR `Label` + `Input`. Helper and error text are hand-built (`Text`), because RNR's Input has no error or helper API. Error border comes from `border-destructive border-2` via className. |
| 3 | Switch | RNR `Switch` + `Label` |
| 4 | Checkbox | RNR `Checkbox` + `Label`. **No indeterminate state**: `@rn-primitives/checkbox` types `checked: boolean`. |
| 5 | Radio group | RNR `RadioGroup` / `RadioGroupItem` + `Label` per option. The group label is a `Text` linked with `aria-labelledby`. |
| 6 | Modal dialog | RNR `AlertDialog` (Trigger, Content, Header, Title, Description, Footer, Cancel, Action). The Action is restyled destructive with `className="bg-destructive"` / `text-destructive-foreground`. |
| 7 | Bottom sheet | Third-party `@gorhom/bottom-sheet`, themed with Uniwind's `withUniwind`. RNR has no sheet. |
| 8 | Select (5 options) | RNR `Select` (Trigger, Value, Content, Group, Item), with safe-area `insets` as the docs show |
| 9 | Tabs | RNR `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` |
| 10 | Toast | **Hand-built** with Uniwind classes on `View`/`Text`. RNR has no toast (the registry has 32 components and none is a toast or sheet). |
| 11 | List (200 rows) | FlatList + Uniwind classes + RNR `Text` |
| 12 | Theme switcher | RNR `RadioGroup`, which calls `Uniwind.setTheme('light' \| 'dark' \| 'brand')` |
| 13 | Third-party component | `@gorhom/bottom-sheet` via `withUniwind` (see below) |
| 14 | Native component | `@expo/ui` `Switch` in a `Host`, with `seedColor` from `useCSSVariable('--color-primary')` |

Copied components are unmodified except for the `input.tsx` fix in error 1. RNR's own sizing defaults are kept on purpose, so the touch-target check measures the library: Button `h-10` (40pt), Switch about 18×32pt, Checkbox 16pt with `hitSlop={24}`, RadioGroupItem 16pt with no hitSlop. Expect these to fail the 44pt/48dp check.

## Accessibility: what the library provides (from the source in node_modules)

- AlertDialog Content: `role="alertdialog"` and `aria-modal={true}`. `useAccessibilityFocus` calls `AccessibilityInfo.setAccessibilityFocus` 50ms after opening. `onAccessibilityEscape` closes it, and so does the Android `BackHandler`. The Trigger runs `useRestoreAccessibilityFocus`, which moves focus back to the trigger on close. **That only works if you use `AlertDialogTrigger`**, so the app does. This confirms the survey claim, but only from source; it hasn't been heard on a device.
- Select: Trigger has `role="combobox"` with `accessibilityState.expanded` and `aria-expanded`. Content has `role="list"`, `aria-modal`, and focus moved in and restored to the trigger. Items have `role="option"`, `aria-selected` and `aria-label`.
- Switch: `role="switch"`, `aria-checked`, `aria-valuetext` ("on"/"off").
- Checkbox: `role="checkbox"`, `aria-checked`, `accessibilityState.checked`. Boolean only, no indeterminate.
- RadioGroup: `role="radiogroup"`. Each item has `role="radio"` and `aria-checked`.
- Tabs: `role="tablist"`. Each tab has `role="tab"` and `aria-selected`. Content has `role="tabpanel"`, plus `aria-hidden` when inactive.
- Button: `role="button"`. Disabled state comes from Pressable's `disabled`. **No `aria-busy` for loading.**
- RNR `Text` `variant="h1..h4"` sets `role="heading"` and `aria-level`.
- Overlay entering and exiting use Reanimated `FadeIn` / `FadeOut` with `.reduceMotion(ReduceMotion.System)`, so Reduce Motion is respected by the library.
- Labels: RNR's documented native pattern is a `Label` with `nativeID` and the control with `aria-labelledby`. The app follows it everywhere. **`aria-labelledby` only works on Android in React Native**, so on iOS the Switch, Checkbox, Radio, Select trigger and Input may have no accessible name. RNR's `Label` is a separate pressable element, not merged with the control. This needs measuring.

## Manual accessibility additions (not from the library)

All of these are for things RNR doesn't ship. Each copies the baseline's approach.

1. Text field error: `aria-live="polite"` on the helper/error `Text`, plus `announce()` (iOS `AccessibilityInfo.announceForAccessibility`) in `validate()`. Helper and error text are **not** programmatically tied to the input (no `accessibilityHint`, no `aria-invalid`), because RNR's Input documents none.
2. Toast: `role="alert"`, `aria-live="polite"`, and `announce()` on show (src/components/overlays.tsx).
3. Bottom sheet: `aria-modal` on `BottomSheetView` and `accessible={false}` on the modal, as in the baseline. gorhom sets neither.
4. List rows: `accessible` plus a combined `accessibilityLabel`, as in the baseline. RNR has no list component.
5. `aria-labelledby` / `nativeID` linking on form controls. This is RNR's documented pattern, not an extra role or state, but it's listed here because it's wiring the app author does by hand.

Nothing else was hand-added: no roles, states or `accessibilityLabel` on RNR controls.

## Theming

- **Tokens → CSS variables.** shared/tokens.ts colours map onto RNR's shadcn variable names in `src/global.css`, one `@variant` per theme:
  background→`--color-background`; text→`foreground`; surfaceRaised→`card`/`popover`; text→`*-foreground`; primary/onPrimary→`primary`/`primary-foreground`; surface→`secondary`/`muted`/`accent` (+ `--color-surface`); textMuted→`muted-foreground`; danger/onDanger→`destructive`/`destructive-foreground`; border→`border`/`input`; focus→`ring`; plus `success` and `scrim`. Radii: `--radius-sm/md/lg` = 6/10/16. Spacing uses Tailwind's 4px scale (xs…xxl = 1/2/3/4/6/8). The type scale is in `src/lib/type.ts`.
  The CSS values are hand-copied from tokens.ts, because CSS can't import TS. They must be kept in sync by hand.
- **Runtime switch:** `Uniwind.setTheme(name)`. `brand` is registered via `extraThemes` in metro.config.js (https://docs.uniwind.dev/theming/custom-themes). The current theme comes from `useUniwind().theme`. Uniwind starts in adaptive `system` mode, so `_layout.tsx` calls `Uniwind.setTheme('light')` first to match the baseline. No React provider is involved.
- **Verified in the bundle:** the unminified export contains `__uniwind-theme-light/dark/brand` objects with our hex values (for example `"--color-primary": vars => "#c2410c"` for brand), and `rounded-md → --radius-md: 10`.
- **Library opinions that ignore our tokens** (left as shipped, to be measured):
  - The `destructive` Button variant hard-codes `text-white` and uses `dark:bg-destructive/60`. In dark, that puts white text on a 60% #FCA5A5, which will likely fail contrast. (`destructive-foreground` was added for our dialog action, but RNR's button doesn't use it.)
  - Several components use `shadow-black/5` and `dark:bg-input/30`.
  - `group-active:*` text classes (Button outline/ghost, SelectItem) do nothing in Uniwind Free. Uniwind's class-names docs say `group-*` is parsed but has no runtime effect without Pro.
  - `placeholder:` classes are unsupported on native per Uniwind's docs, so Input's placeholder colour falls back to the default.

### Third-party sheet (Uniwind `withUniwind`)

```tsx
// https://docs.uniwind.dev/api/with-uniwind#automatic-prop-mapping
const StyledBottomSheetModal = withUniwind(BottomSheetModal); // backgroundStyle -> backgroundClassName, handleIndicatorStyle -> handleIndicatorClassName
const StyledBottomSheetView = withUniwind(BottomSheetView);   // style -> className

<StyledBottomSheetModal ref={sheetRef} backgroundClassName="bg-card" handleIndicatorClassName="bg-border" ...>
  <StyledBottomSheetView className="gap-3 p-6 pb-8">...</StyledBottomSheetView>
</StyledBottomSheetModal>
```

Auto-mapping is confirmed in `uniwind/src/hoc/withUniwindUtils.ts`: any `*ClassName` prop becomes `*Style`. `withUniwind` subscribes to theme changes, so the sheet re-themes on switch. That has not been seen at runtime.

### @expo/ui

```tsx
const { theme } = useUniwind();
const primary = useCSSVariable('--color-primary'); // https://docs.uniwind.dev/api/use-css-variable
<Host matchContents colorScheme={theme === 'dark' ? 'dark' : 'light'} seedColor={primary === undefined ? undefined : String(primary)}>
  <NativeSwitch ... />
</Host>
```

The Stack header colours use the same approach: `useCSSVariable(['--color-surface', '--color-foreground', '--color-background'])` in `_layout.tsx`.

### @expo/ui BottomSheet

Added after the first round of tests, to check whether `@expo/ui`'s universal `BottomSheet` behaves the same outside the baseline. It is filled with `@expo/ui`'s own `Column`, `Text` and `Button`, as [Expo's docs](https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/bottomsheet/) show: React Native views inside it don't receive touches unless wrapped in `RNHostView`. The Close button carries `accessibilityIdentifier('test-sheet-expoui-close')` and the title `accessibilityAddTraits(['isHeader'])`, both from `@expo/ui/swift-ui/modifiers`.

**Result (2026-10-24, iPhone 17 Pro simulator, iOS 26.4, Release):** 5 / 5 sheet checks in `scripts/a11y-audit.mjs`, including the screen behind being hidden from VoiceOver. Opened by hand in the dark theme: the sheet showed the theme's surface and text colours.

Colours come from `useCSSVariable(['--color-card', '--color-foreground', '--color-muted-foreground'])`, as for the Host. The gap and font sizes are the gorhom sheet's classes (`gap-3`, `type.title`, `type.body`), resolved with Uniwind's `useResolveClassNames`.

## What didn't work or is unverified

- **Loading spinner probably won't spin.** `animate-spin` compiles to an `animation: spin 1s linear infinite` style entry. Uniwind's docs list `animate-*` / Reanimated animations as a **Pro** feature, so on Free (native) the icon is likely static. Not tested.
- **Bundle bloat from lucide.** Metro doesn't tree-shake the `lucide-react-native` barrel import, so all **1,917 icon modules** are bundled. They are about **23% of the unminified JS** (2.66 MB of 11.56 MB). The app uses 4 icons. The fix would be deep imports in the copied components, which RNR doesn't do. Left as shipped.
- No indeterminate checkbox and no `aria-busy` on loading buttons. RNR doesn't provide them.
- Runtime behaviour (theme switch re-render, sheet theming, focus moves, `aria-labelledby` on iOS) is not tested. Simulators weren't run, per the task rules.
- The RNR docs site renders client-side, so its pages couldn't be fetched as text. The docs were read from the source repo instead: founded-labs/react-native-reusables @ `385834c` (27 Sep 2026), `apps/docs/content/docs/**`, plus the registry under `packages/registry/src/uniwind`. The repo's manual-install page only covers NativeWind. The Uniwind setup was taken from the official `minimal-uniwind` template, the CLI's Uniwind file checks (`project-manifest.ts`), and Uniwind's own docs.

## Verification

- `npx tsc --noEmit`: clean.
- `npx expo export --platform ios --output-dir $TMPDIR/uilab-export-reusables`: succeeded. 4095 modules.
- **Main iOS JS bundle:** `_expo/static/js/ios/entry-fcd616914418754d290b0be05c73ae9d.hbc` = **6,750,471 bytes** (Hermes bytecode). An unminified, non-bytecode build for inspection was 11,557,928 bytes.

## Lines of code (test screen)

src/app/index.tsx 281, src/app/list.tsx 31, src/app/_layout.tsx 48, src/components/overlays.tsx 63, src/lib/type.ts 10, src/global.css 110. The CLI-copied components in src/components/ui are not counted.

## Doc URLs used

- https://github.com/founded-labs/react-native-reusables: apps/docs/content/docs/installation/manual.mdx, cli.mdx, changelog.mdx (Dec 2025 Uniwind integration), components/*.mdx, packages/registry/src/{uniwind,examples}, apps/cli/src/project-manifest.ts, apps/cli/src/services/commands/add.ts
- https://github.com/founded-labs/react-native-reusables-templates/tree/main/minimal-uniwind
- https://reactnativereusables.com/r/uniwind/icon.json (registry item, missing lucide dependency)
- https://docs.uniwind.dev/quickstart
- https://docs.uniwind.dev/theming/basics
- https://docs.uniwind.dev/theming/custom-themes
- https://docs.uniwind.dev/api/with-uniwind
- https://docs.uniwind.dev/components/other-components
- https://docs.uniwind.dev/api/use-css-variable
- https://docs.uniwind.dev/api/use-uniwind
- https://docs.uniwind.dev/api/generate-artifacts
- https://docs.uniwind.dev/monorepos
- https://docs.uniwind.dev/class-names (group-*, placeholder:* unsupported in Free)
- https://docs.uniwind.dev/pro/reanimated-animations (animate-* is Pro)
- https://rnprimitives.com/portal (linked from RNR's install docs. Primitive behaviour was confirmed from `node_modules/@rn-primitives/*/dist/*.mjs`, not from the site.)
