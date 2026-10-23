// NativeWind v5 theming: the three themes are sets of CSS variables, built
// from shared/tokens and supplied at runtime with VariableContextProvider.
// Components only use className (bg-surface, text-text, ...), which reads
// the variables, so they need no theme hook.
// https://www.nativewind.dev/v5/guides/themes
//
// The theme name is also kept in a small React context, because a few
// things need it as a value rather than a style: the switcher's
// aria-checked, the StatusBar style, navigation header colours and the
// @expo/ui Host colorScheme.
import { VariableContextProvider } from 'nativewind';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { colors, type ColorTokens, type ThemeName } from '@shared/tokens';

export const themeNames: ThemeName[] = ['light', 'dark', 'brand'];

// surfaceRaised -> --color-surface-raised, matching the @theme names in global.css.
const toVar = (key: string): `--${string}` => `--color-${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;
const toVars = (c: ColorTokens) => Object.fromEntries(Object.entries(c).map(([k, v]) => [toVar(k), v]));
const themeVars = Object.fromEntries(themeNames.map((n) => [n, toVars(colors[n])])) as Record<ThemeName, Record<`--${string}`, string>>;

const ThemeNameContext = createContext<{ name: ThemeName; setTheme: (name: ThemeName) => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [name, setTheme] = useState<ThemeName>('light');
  const value = useMemo(() => ({ name, setTheme }), [name]);
  return (
    <ThemeNameContext.Provider value={value}>
      <VariableContextProvider value={themeVars[name]}>{children}</VariableContextProvider>
    </ThemeNameContext.Provider>
  );
}

export function useThemeName() {
  const ctx = useContext(ThemeNameContext);
  if (!ctx) throw new Error('useThemeName must be used inside ThemeProvider');
  return ctx;
}
