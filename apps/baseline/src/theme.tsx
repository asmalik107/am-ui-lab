// Baseline theming: plain React context over the shared tokens.
// Switching theme re-renders every consumer; that cost is what the other
// libraries are measured against.
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { colors, radius, space, type, type ThemeName } from '@shared/tokens';

const build = (name: ThemeName) => ({ name, colors: colors[name], space, radius, type });
export type Theme = ReturnType<typeof build>;

const ThemeContext = createContext<{ theme: Theme; setTheme: (name: ThemeName) => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState<ThemeName>('light');
  const value = useMemo(() => ({ theme: build(name), setTheme: setName }), [name]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
