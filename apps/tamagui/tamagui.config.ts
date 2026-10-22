// Tamagui config built from the shared lab tokens.
// Base: @tamagui/config/v6 (the v3 default) via createV6Config, which takes a
// colours pack (themes + colour tokens). https://tamagui.dev/docs/core/config-v6-colors
// Layout scales, fonts, media and settings come from v6; space and radius get the
// shared lab values added on top so `p="lg"` / `rounded="md"` mean the same thing
// as in every other app.
import { animations } from '@tamagui/config/animations-reanimated'
import { createV6Config, themes as v6Themes, tokens as v6Tokens } from '@tamagui/config/v6'
import { createTamagui } from 'tamagui'

// Relative import (not the @shared alias): the Tamagui compiler loads this file
// at build time outside Metro's resolver.
import { colors, radius, space, type ColorTokens, type ThemeName } from '../../shared/tokens'

// The shared "brand" theme can't be called `brand` in Tamagui: Checkbox, Switch,
// RadioGroup and ToggleGroup switch to a sub-theme literally named `brand` when
// checked (activeTheme: 'brand'), so a root theme with that name would resolve to
// itself and checked controls would lose their fill.
export const tamaguiThemeName = {
  light: 'light',
  dark: 'dark',
  brand: 'labBrand',
} as const satisfies Record<ThemeName, string>

// The v6 base themes supply the adaptive ramp (color-1..color-11) and shadows that
// Tamagui's skins read for incidental details (e.g. the Switch's off-state track
// uses color-4). Every semantic key the components style from is overridden with
// lab tokens. Keys: https://tamagui.dev/docs/core/theme#defining-themes
function baseTheme(c: ColorTokens, scheme: 'light' | 'dark') {
  return {
    ...v6Themes[scheme],
    background: c.background,
    'background-hover': c.surface,
    'background-press': c.surface,
    'background-focus': c.surface,
    'background-active': c.surface,
    'border-color': c.border,
    'border-color-hover': c.text,
    'border-color-press': c.text,
    'border-color-focus': c.focus,
    color: c.text,
    'color-hover': c.text,
    'color-press': c.text,
    'color-focus': c.text,
    'placeholder-color': c.textMuted,
    'outline-color': c.focus,
    'accent-background': c.primary,
    'accent-color': c.onPrimary,
    // lab semantic keys, readable as style values and through useTheme()
    surface: c.surface,
    'surface-raised': c.surfaceRaised,
    'text-muted': c.textMuted,
    primary: c.primary,
    'on-primary': c.onPrimary,
    danger: c.danger,
    'on-danger': c.onDanger,
    success: c.success,
    scrim: c.scrim,
  }
}

type Theme = ReturnType<typeof baseTheme>

// level2: Tamagui's Button wraps itself in <Theme name="level2">, and Dialog/Sheet
// surfaces use it, so it is the "raised" surface.
const level2 = (t: Theme, c: ColorTokens): Theme => ({
  ...t,
  background: c.surface,
  'background-hover': c.surfaceRaised,
  'background-press': t['color-3'],
  'background-focus': c.surfaceRaised,
  'background-active': c.surfaceRaised,
})

// A filled sub-theme (primary or danger): background/foreground pair.
const filled = (t: Theme, bg: string, fg: string): Theme => ({
  ...t,
  background: bg,
  'background-hover': bg,
  'background-press': bg,
  'background-focus': bg,
  'background-active': bg,
  'border-color': bg,
  'border-color-hover': bg,
  'border-color-press': bg,
  'border-color-focus': fg,
  color: fg,
  'color-hover': fg,
  'color-press': fg,
  'color-focus': fg,
})

function themeSet(name: ThemeName, scheme: 'light' | 'dark') {
  const c = colors[name]
  const root = tamaguiThemeName[name]
  const t = baseTheme(c, scheme)
  const brand = filled(t, c.primary, c.onPrimary)
  const danger = filled(t, c.danger, c.onDanger)
  // Sub-theme lookup walks up the name (light_danger_level2 -> light_level2), so a
  // Button with theme="danger" needs its own _level2 or it falls back to plain level2.
  return {
    [root]: t,
    [`${root}_level2`]: level2(t, c),
    [`${root}_brand`]: brand,
    [`${root}_brand_level2`]: brand,
    [`${root}_danger`]: danger,
    [`${root}_danger_level2`]: danger,
  } as Record<string, Theme>
}

const themes = {
  ...themeSet('light', 'light'),
  ...themeSet('dark', 'dark'),
  ...themeSet('brand', 'light'),
} as {
  light: Theme
  light_level2: Theme
  light_brand: Theme
  light_brand_level2: Theme
  light_danger: Theme
  light_danger_level2: Theme
  dark: Theme
  dark_level2: Theme
  dark_brand: Theme
  dark_brand_level2: Theme
  dark_danger: Theme
  dark_danger_level2: Theme
  labBrand: Theme
  labBrand_level2: Theme
  labBrand_brand: Theme
  labBrand_brand_level2: Theme
  labBrand_danger: Theme
  labBrand_danger_level2: Theme
}

// Flat colour tokens: Tailwind palette from v6 plus every lab colour as
// `<theme>-<key>`, e.g. `light-primary`.
const labColorTokens = Object.fromEntries(
  (Object.keys(colors) as ThemeName[]).flatMap((name) =>
    Object.entries(colors[name]).map(([key, value]) => [`${name}-${key}`, value])
  )
)

const v6 = createV6Config({
  themes,
  colorTokens: { ...v6Tokens.color, ...labColorTokens },
})

export const config = createTamagui({
  ...v6,
  tokens: {
    ...v6.tokens,
    space: { ...v6.tokens.space, ...space },
    radius: { ...v6.tokens.radius, ...radius },
  },
  animations,
})

export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config
