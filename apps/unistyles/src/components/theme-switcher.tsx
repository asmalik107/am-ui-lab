// Theme switcher for the Unistyles test screen.
import { UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

import { copy, ids } from '@shared/content';
import type { ThemeName } from '@shared/tokens';

import { mark, measure } from '../perf';
import { RadioGroup } from './radio-group';

const themeNames: ThemeName[] = ['light', 'dark', 'brand'];

// The switcher needs the current theme name as a value (for aria-checked),
// not as a style, so it reads it with useUnistyles. Kept in its own small
// component so only the switcher re-renders, as the docs advise.
// https://www.unistyl.es/v3/references/use-unistyles
export function ThemeSwitcher() {
  const { theme } = useUnistyles();
  return (
    <RadioGroup
      testID={ids.themeSwitcher}
      label={copy.themeLabel}
      options={copy.themes}
      value={copy.themes[themeNames.indexOf(theme.name)]}
      onChange={(v) => {
              mark();
              UnistylesRuntime.setTheme(themeNames[copy.themes.indexOf(v as (typeof copy.themes)[number])]);
              measure('theme');
            }}
    />
  );
}
