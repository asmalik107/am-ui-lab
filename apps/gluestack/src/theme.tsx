// gluestack-ui v5 + Uniwind theming. The theme name lives in React state only so
// the switcher can show it; the colours themselves are CSS variables that
// Uniwind swaps when GluestackUIProvider calls Uniwind.setTheme(mode).
// Components read colours through className, not through this context.
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useResolveClassNames } from 'uniwind';

import type { ThemeName } from '@shared/tokens';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';

const ThemeNameContext = createContext<{ name: ThemeName; setName: (name: ThemeName) => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState<ThemeName>('light');
  const value = useMemo(() => ({ name, setName }), [name]);
  return (
    <ThemeNameContext.Provider value={value}>
      <GluestackUIProvider mode={name}>{children}</GluestackUIProvider>
    </ThemeNameContext.Provider>
  );
}

export function useThemeName() {
  const ctx = useContext(ThemeNameContext);
  if (!ctx) throw new Error('useThemeName must be used inside ThemeProvider');
  return ctx;
}

// For APIs that take a colour value instead of a className (react-navigation
// options, the @expo/ui Host, RN Switch trackColor). Uniwind's documented route
// is useResolveClassNames; `accent-*` utilities resolve to style.accentColor.
// https://docs.uniwind.dev/api/use-resolve-class-names
export function useTokenColor(token: string): string | undefined {
  const style = useResolveClassNames(`accent-${token}`) as { accentColor?: string };
  return style.accentColor;
}
