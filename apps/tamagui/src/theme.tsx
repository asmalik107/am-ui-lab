// Which lab theme is active. Tamagui does the actual theming: the name is fed to
// TamaguiProvider's `defaultTheme`, which re-themes every styled component and
// useTheme() reader below it. https://tamagui.dev/docs/core/tamagui-provider
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

import type { ThemeName } from '@shared/tokens'

const ThemeNameContext = createContext<{ name: ThemeName; setTheme: (name: ThemeName) => void } | null>(null)

export function ThemeNameProvider({ children }: { children: (name: ThemeName) => ReactNode }) {
  const [name, setTheme] = useState<ThemeName>('light')
  const value = useMemo(() => ({ name, setTheme }), [name])
  return <ThemeNameContext.Provider value={value}>{children(name)}</ThemeNameContext.Provider>
}

export function useThemeSwitch() {
  const ctx = useContext(ThemeNameContext)
  if (!ctx) throw new Error('useThemeSwitch must be used inside ThemeNameProvider')
  return ctx
}
