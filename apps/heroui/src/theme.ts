// HeroUI theming: Uniwind owns the active theme (CSS variables in global.css).
// There is no React theme context; components re-style from className when
// Uniwind.setTheme() runs. https://heroui.com/docs/native/getting-started/theming
import { Uniwind, useUniwind } from 'uniwind';

import { space, type, type ThemeName } from '@shared/tokens';

export const themeNames: ThemeName[] = ['light', 'dark', 'brand'];

export function setTheme(name: ThemeName) {
  Uniwind.setTheme(name);
}

export function useThemeName(): ThemeName {
  const { theme } = useUniwind();
  return (themeNames as string[]).includes(theme) ? (theme as ThemeName) : 'light';
}

// Spacing and type scale are passed as styles from the shared tokens;
// colours always come from theme classNames so they follow the active theme.
export { space, type };
