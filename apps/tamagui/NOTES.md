# Tamagui v3: build notes

Status: `npx tsc --noEmit` passes and `npx expo export --platform ios` succeeds. **Not run on a simulator or device**: everything about runtime behaviour, including accessibility, comes from reading Tamagui's v3 docs and the source in `node_modules`. The a11y and performance checks in `docs/method.md` still have to be run.

## Versions installed (exact)

| Package | Version |
| --- | --- |
| tamagui | 3.1.2 (latest 3.x on 2026-10-22; 3.0.0 shipped 2026-10-10) |
| @tamagui/config | 3.1.2 |
| @tamagui/metro-plugin | 3.1.2 |
| @tamagui/animations-reanimated | 3.1.2 |
| @tamagui/native | 3.1.2 |
| @tamagui/react-native-web-lite | 3.1.2 (devDependency, workaround, see Errors) |
| All other @tamagui/* (transitive) | 3.1.2 |
| expo / react-native / react / reanimated / worklets | 57.0.31 / 0.86.3 / 19.2.3 / 4.5.1 / 0.10.1 (same as baseline) |
| @gorhom/bottom-sheet / @expo/ui | 5.2.14 / 57.0.26 (same as baseline) |

## Setup steps and files touched

1. Copied `apps/baseline` without `node_modules`, `ios`, `android` or `.expo`. Started from baseline's `package-lock.json` and ran `npm ci`, so Expo, RN and Reanimated resolve exactly as in baseline.
2. `package.json`: renamed to `am-ui-lab-tamagui` and set `main` to `index.js`. Added the Tamagui packages, pinned exact (`npm install` writes `^`).
3. `app.json`: name `UI Lab Tamagui`, slug `am-ui-lab-tamagui`, scheme `amuilab-tamagui`, `ios.bundleIdentifier` and `android.package` set to `dev.asimmalik.uilab.tamagui`.
4. `metro.config.js`: kept `watchFolders` for `../../shared` and wrapped the config in `withTamagui(config)` from `@tamagui/metro-plugin`. With no inline options, the plugin reads `tamagui.build.ts`. **No Babel plugin**: v3 removed `@tamagui/babel-plugin`, and compilation runs through bundler plugins (upgrade guide, "Babel plugin: removed"). There is no `babel.config.js`; Expo's default preset is unchanged.
5. `tamagui.build.ts` (new): `{ components: ['tamagui'], config: './tamagui.config.ts' }`.
6. `tamagui.config.ts` (new): `createTamagui(createV6Config({ themes, colorTokens }))`, plus the shared `space`/`radius` merged into the v6 scales and the Reanimated animation driver. See "Theming" below.
7. `index.js` (new entry): `import '@tamagui/native/setup-gesture-handler'`, then `import 'expo-router/entry'`. Tamagui's native integrations must be imported before any Tamagui import.
8. `src/theme.tsx`: holds the active lab theme name. `src/app/_layout.tsx` passes it to `TamaguiProvider defaultTheme=…`.
9. `tsconfig.json`: unchanged (`@shared/*` path kept). `tamagui.config.ts` declares `TamaguiCustomConfig` for types.
10. Ran `npm dedupe` after install (see Errors). Added `.gitignore` for `.tamagui/`, the compiler output the Metro plugin writes.
11. Deleted `src/a11y.ts` (baseline's hand-written `announce`/`useReduceMotion`), so Tamagui is measured without them.

## Errors hit and fixes

| # | Error | Fix |
| --- | --- | --- |
| 1 | After `npm install`, many `@tamagui/*` packages at the *same* version 3.1.2 were nested 2–4 times (`tamagui/node_modules/@tamagui/sheet`, `dialog/node_modules/@tamagui/sheet`, …), so Sheet, Portal and Adapt would have had duplicate contexts and duplicate bundle weight. | `npm dedupe`. Afterwards one copy of each, except a nested `linear-gradient` under `tamagui` and two packages under `@tamagui/static`. |
| 2 | `expo export`: `[tamagui] Static evaluation could not proceed … Cannot find package '@tamagui/react-native-web-lite' imported from …/.tamagui/tamagui-components.config.native.mjs`. After the dedupe the package stayed nested under `@tamagui/static/node_modules`, and the compiler's generated module resolves from the project root. | `npm install -D -E @tamagui/react-native-web-lite@3.1.2` to hoist it. The error message also suggests `dangerouslyIgnoreStaticEvaluationModules` in `tamagui.build.ts`, which wasn't needed. |
| 3 | `tsc`: `Property 'width' does not exist` on `View`. The v6 config sets `onlyAllowShorthands: true`, so `width`/`height`/`padding` etc. must be written `w`/`h`/`p`. | Used shorthands. |
| 4 | Theme naming clash: the shared third theme is called `brand`, but Tamagui's Checkbox, Switch, RadioGroup and ToggleGroup switch to a sub-theme literally named `brand` when checked (`activeTheme: 'brand'` in `tamagui/src/components/*.tsx`). With a root theme named `brand`, theme lookup (`resolveThemeName` in `@tamagui/web/src/hooks/useThemeState.ts`) resolves `brand` to itself and checked controls lose their fill. | The Tamagui root theme is named `labBrand` (`tamaguiThemeName` map in `tamagui.config.ts`). |
| 5 | A Button with `theme="danger"` would render like a plain button. Button wraps itself in `<Theme name="level2">`, and the lookup tries `light_danger_level2`, then **`light_level2`**, so the danger colours are lost. | Defined `<root>_brand_level2` and `<root>_danger_level2` explicitly. |
| 6 | Not an error, but a gotcha: a numeric `lineHeight` prop is a **ratio** in v3 on web and native (config-v6 docs). `lineHeight={22}` would mean 22× the font size. | Wrote line heights as `"22px"`. |

Warnings that remain during export, harmless for the build: Metro "not listed in exports … falling back to file-based resolution" for 7 internal `@tamagui/*` deep imports, and `[@tamagui/metro-plugin] metro/plan-miss … shared/content.ts … module ships unlowered` (a file outside the app root, with no Tamagui code in it). The upgrade guide also notes that Metro doesn't invalidate its cache when `tamagui.config.ts` changes, so restart with `-c` after editing it.

## Doc URLs for each API used

- Install / provider / `defaultTheme`: https://tamagui.dev/docs/intro/installation, https://tamagui.dev/docs/core/tamagui-provider
- Metro plugin: https://tamagui.dev/docs/guides/metro, https://tamagui.dev/docs/guides/expo, https://tamagui.dev/docs/intro/compiler-install
- Babel plugin removed, `accept` removed, Toast v2 API removed: https://tamagui.dev/docs/guides/how-to-upgrade
- Config, tokens, themes: https://tamagui.dev/docs/core/configuration, https://tamagui.dev/docs/core/config-v6, https://tamagui.dev/docs/core/config-v6-colors (`createV6Config`), https://tamagui.dev/docs/core/theme (theme keys, sub-themes)
- `useTheme` / `.val`: https://tamagui.dev/docs/core/use-theme. `styled()` on external components: https://tamagui.dev/docs/core/styled
- Reanimated driver: https://tamagui.dev/docs/core/animations-reanimated (`@tamagui/config/animations-reanimated` entry from config-v6)
- Native integrations (gesture handler, teleport, safe area, burnt): https://tamagui.dev/docs/core/native
- Components: https://tamagui.dev/ui/button, /ui/inputs, /ui/label, /ui/field, /ui/switch, /ui/checkbox, /ui/radio-group, /ui/select, /ui/adapt, /ui/dialog, /ui/sheet, /ui/tabs, /ui/toast, /ui/list-item, /ui/portal
- Demo sources used to confirm labelling patterns: https://github.com/tamagui/tamagui/tree/main/code/demos/src (SwitchDemo, CheckboxDemo, RadioGroupDemo, SelectDemo, DialogDemo, TabsDemo)

Docs were read from the v3 pages (`components/<name>/3.0.0`, or the newest version for pages without a 3.0.0 entry) in https://tamagui.dev/llms.txt. Every prop was checked against the installed type definitions with `tsc`.

## The 14 items

| # | Item | Built with | Notes |
| --- | --- | --- | --- |
| 1 | Button (pressed/disabled/loading) | Tamagui `Button` | Primary = `theme="brand"`, danger = `theme="danger"`, secondary = `variant="outlined"`. **No loading/busy prop**: loading = `disabled` + `<Spinner>` as `icon`. |
| 2 | Text field (label/helper/error) | Tamagui `Field` + `Field.Label` / `Field.Description` / `Field.Error` + `Input` | Tamagui's `Input` doesn't read Field by itself. The small `EmailInput` wrapper is the `useFieldControl()` pattern copied from the Field docs. Validation runs through Field `validate` with `validationMode="onBlur"`. |
| 3 | Switch (labelled) | Tamagui `Switch` + `Label htmlFor/id` | Pattern from SwitchDemo. |
| 4 | Checkbox (+ indeterminate) | Tamagui `Checkbox` + `Label htmlFor/id` | Supports `'indeterminate'` (`aria-checked="mixed"`). The indicator glyph is a text ✓/–, because Tamagui ships no icon set and lucide icons need generating. |
| 5 | Radio group (3 + group label) | Tamagui `RadioGroup` + `Label htmlFor/id` per item, `aria-labelledby` on the group | Pattern from RadioGroupDemo. |
| 6 | Modal dialog | Tamagui `Dialog` (Trigger/Portal/Overlay/FocusScope/Content/Title/Description/Close) | Not adapted to a Sheet. |
| 7 | Bottom sheet | **Both**: `@gorhom/bottom-sheet` (`test-sheet`) and Tamagui `Sheet` (`test-sheet-tamagui`, opened by `test-sheet-open-tamagui`) | The Tamagui Sheet trigger's label is `copy.sheetOpen + " (Tamagui Sheet)"`, which isn't in `shared/content.ts`. |
| 8 | Select (5 options) | Tamagui `Select` + `Adapt platform="touch"` → Tamagui `Sheet` | The docs say Adapt-to-Sheet is "the only way to render a Select on Native for now". |
| 9 | Tabs (3) | Tamagui `Tabs` | v3 Tabs ship no visual defaults. The selected underline uses `activeStyle={style({...})}` and the label colour is set from state. |
| 10 | Toast | Tamagui `Toast` root + `toast()` | v3 composable API. A custom `renderItem` exists only to put `testID="test-toast"` on `Toast.Item`. |
| 11 | List (200 rows) | Tamagui `ListItem` (title/subTitle/icon) in RN `FlatList` | The icon is a themed `View` circle with the row number. |
| 12 | Theme switcher | Tamagui `RadioGroup` driving `TamaguiProvider defaultTheme` | Themes: `light`, `dark`, `labBrand`. |
| 13 | Third-party component | `@gorhom/bottom-sheet` themed via `styled()` + `useTheme()` | Snippet below. |
| 14 | Native component | `@expo/ui` `Switch` in `Host` | `colorScheme` from `useThemeName()`, `seedColor` from `useTheme().primary.val`. |

Hand-built (not Tamagui components): the theme-name context, the `EmailInput` Field adapter (documented pattern), the list row icon, and the checkbox/select glyphs. Section headings and the screen title are Tamagui `H1`/`H2`/`H3`.

## Theming

`tamagui.config.ts` builds each lab theme from `shared/tokens.ts`:

- Starts from the v6 base theme for its scheme (to keep the `color-1..11` ramp and `shadow-*`, which skins read for small details, e.g. Switch off-track = `color-4`). Then it overrides every semantic key the skins style from (`background*`, `border-color*`, `color*`, `placeholder-color`, `outline-color`, `accent-*`) with lab colours, and adds lab keys (`surface`, `surface-raised`, `text-muted`, `primary`, `on-primary`, `danger`, `on-danger`, `success`, `scrim`).
- Sub-themes per root: `_level2` (raised surface, which Button and overlays use), `_brand` (primary/onPrimary, used by checked controls and primary buttons) and `_danger`, each with a `_level2` twin.
- `tokens.space` / `tokens.radius`: the v6 scales plus the shared keys (`xs…xxl`, `sm/md/lg/full`). This overrides v6's `sm/md/lg/full` radius, so Tamagui's sizing ladder, which uses `radius: 'md'`, now uses the lab's 10.
- `tokens.color`: the v6 Tailwind palette plus every lab colour as `<theme>-<key>`.
- Runtime switching: `TamaguiProvider defaultTheme={tamaguiThemeName[name]}`. The provider docs recommend `defaultTheme` over wrapping in `<Theme>`, and the Expo guide drives it from `colorScheme`. Because `labBrand` doesn't start with `light`/`dark`, Tamagui assigns it no scheme (`getThemeScheme` uses `/^(light|dark)(?=_|$)/`). The effect of that on `fastSchemeChange` / DynamicColorIOS is **unverified**.

### Third-party sheet and @expo/ui (code)

```tsx
// src/components/overlays.tsx
const SheetView = styled(BottomSheetView, { p: 'xl', pb: 'xxl', gap: 'md' }) // tokens via styled()

export const ExerciseSheet = forwardRef<BottomSheetModal, SheetContentProps>(function ExerciseSheet(props, ref) {
  const theme = useTheme() // gorhom's backgroundStyle/handleIndicatorStyle aren't `style`, and v3 removed `accept`
  return (
    <BottomSheetModal
      ref={ref}
      backgroundStyle={{ backgroundColor: theme['surface-raised'].val }}
      handleIndicatorStyle={{ backgroundColor: theme['border-color'].val }}
      backdropComponent={(p) => <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />}>
      <SheetView testID={props.testID}><SheetBody {...props} /></SheetView>
    </BottomSheetModal>
  )
})

// src/app/index.tsx
const theme = useTheme()
const themeName = useThemeName()
<Host matchContents colorScheme={themeName.startsWith('dark') ? 'dark' : 'light'} seedColor={theme.primary.val}>
  <NativeSwitch testID={ids.nativeSwitch} label={copy.nativeSwitchLabel} value={sync} onValueChange={setSync} />
</Host>
```

`styled()` accepts any component that takes `style`, but non-Tamagui components aren't optimised by the compiler (styled docs). `BottomSheetModalProvider` sits inside `TamaguiProvider`, so gorhom's portal still sees the Tamagui theme. The expo-router `Stack` header colours also come from `useTheme().*.val`.

## Accessibility: what was passed, what was added by hand

Props passed **because Tamagui's docs or demos pass them**: `Label htmlFor` + control `id`, `aria-labelledby` on `RadioGroup`, `aria-label` on `Tabs.List`, the `Field` parts, and `Dialog.Title`/`Description` (required by the docs).

**Added by hand: no roles, states or announcements.** The only additions:
- `minH={44}` (and `minW={44}` on buttons) for touch targets. Styling, but it changes the touch-target result.
- `accessible={false}` on gorhom's `BottomSheetModal`, kept from baseline. The prop belongs to the third-party sheet, not Tamagui.

What Tamagui provides on native, per source (verify on simulator):

| Component | From the library (native) | Expected gap |
| --- | --- | --- |
| Button | `role="button"`, `aria-disabled` when disabled | No busy/loading state. |
| Label `htmlFor` | Pressing the label focuses the control (`focusFocusable`) | **The `aria-labelledby` link is written to the DOM on web only** (`@tamagui/label/src/Label.tsx`, `if (isWeb)`). On native the control gets no name from its Label. Switch/Checkbox/Radio fall back to `aria-labelledby` from `useLabelContext()`, which only works when the control is nested *inside* the Label, and RN maps it to `accessibilityLabelledBy`, which is Android only. **Expect Switch, Checkbox, Radio items and the Select trigger to have no accessible name on iOS.** |
| Field + Input | `accessibilityLabel` = label text, `accessibilityHint` = description + error text (`@tamagui/field/src/Field.tsx`, native branch) | On native: no `aria-invalid` and **no announcement** when the error appears. |
| Switch | `role="switch"`, `aria-checked` | Name, see Label. |
| Checkbox | `role="checkbox"`, `aria-checked` (incl. `mixed`) | Name, see Label. |
| RadioGroup | `role="radiogroup"`; items `role="radio"`, `aria-checked` | `aria-labelledby` on the group: Android only. |
| Select trigger | `accessibilityRole="button"`, `accessibilityState { expanded, disabled }` | Name, see Label. Options inside the adapted Sheet: unverified. |
| Dialog.Content | `role="dialog"`, `aria-modal` (maps to `accessibilityViewIsModal`), `aria-labelledby`/`describedby` | Focus return to the trigger: unverified. |
| Sheet (Tamagui) | **No aria/accessibility props anywhere in `@tamagui/sheet/src`** | Not modal for VoiceOver unless gesture/portal behaviour makes it so: unverified. |
| Tabs | `role="tablist"`/`"tab"`/`"tabpanel"`, `aria-selected` | — |
| Toast | `role="status"`, `aria-live="polite"`, `aria-atomic` on each item | `aria-live` is Android only. **No iOS announcement** (no `announceForAccessibility` in `@tamagui/toast`). Reduced motion: `useReducedMotion` hardcodes `false` on native ("could use AccessibilityInfo… default to false"). A `reducedMotion` prop exists to force it, but isn't wired here. |
| ListItem | `role="listitem"` | Rows aren't grouped into one element (baseline adds `accessible` + label by hand). |
| Headings (H1–H6) | `role="heading"` | — |

Reduce Motion for Dialog/Sheet animations: Tamagui has no reduce-motion handling in its own source. Whether Reanimated 4 applies the system setting to the driver's springs is **unverified**.

## What didn't work / skipped

- `react-native-teleport` (`@tamagui/native/setup-teleport`), which the docs recommend so portaled Sheet/Dialog/Select content keeps React context: **not installed**, since it adds a native module. Tamagui re-propagates its own theme/config context. The overlay content here only uses Tamagui context and props, so it should work, but this is unverified on device.
- `burnt` native toasts and `setup-safe-area`: not used. Safe-area insets go to `TamaguiProvider insets` as the Toast docs show.
- The optional native style runtime (`@tamagui/native-registry` + Nitro) and `experimental.nativeFastPath`: not enabled (beta, native module).
- `Adapt when="max-md"` from the docs example was dropped. `platform="touch"` alone adapts on every phone and tablet size.

## iOS bundle size

`npx expo export --platform ios --output-dir $TMPDIR/uilab-export-tamagui`:
**5,423,420 bytes** (`_expo/static/js/ios/index-*.hbc`, Hermes bytecode, 2,342 modules). Same code before the toast `renderItem` was added, with a cleared cache: 5,423,083 bytes. Baseline wasn't re-exported here (to avoid writing outside `apps/tamagui`).

One `expo export` run hung for more than 25 minutes with no output and was killed. The rerun finished in about 31 s. Cause unknown.

## Lines of code (test screen)

`src/app/*.tsx` + `src/components/*.tsx` + `src/theme.tsx` = 652 lines, plus `tamagui.config.ts` 165.
