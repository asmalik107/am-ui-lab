import { Uniwind, useUniwind } from 'uniwind';

import { copy, ids } from '@shared/content';
import type { ThemeName } from '@shared/tokens';

import { mark, measure } from '../perf';
import { RadioGroup } from './radio-group';

const themeNames: ThemeName[] = ['light', 'dark', 'brand'];

// The switcher needs the current theme name as a value (for aria-checked),
// not as a style, so it reads it with useUniwind. Kept in its own small
// component so only the switcher re-renders. https://docs.uniwind.dev/api/use-uniwind
export function ThemeSwitcher() {
  const { theme } = useUniwind();
  return (
    <RadioGroup
      testID={ids.themeSwitcher}
      label={copy.themeLabel}
      options={copy.themes}
      value={copy.themes[Math.max(0, themeNames.indexOf(theme as ThemeName))]}
      onChange={(v) => {
        mark();
        Uniwind.setTheme(themeNames[copy.themes.indexOf(v as (typeof copy.themes)[number])]);
        measure('theme');
      }}
    />
  );
}
