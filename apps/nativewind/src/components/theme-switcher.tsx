import { copy, ids } from '@shared/content';

import { mark, measure } from '../perf';
import { themeNames, useThemeName } from '../theme';
import { RadioGroup } from './radio-group';

// The switcher needs the current theme name as a value (for aria-checked),
// so it reads it from the theme-name context. Kept in its own component so
// a switch re-renders only the switcher and the VariableContextProvider
// consumers, not this screen's state.
export function ThemeSwitcher() {
  const { name, setTheme } = useThemeName();
  return (
    <RadioGroup
      testID={ids.themeSwitcher}
      label={copy.themeLabel}
      options={copy.themes}
      value={copy.themes[themeNames.indexOf(name)]}
      onChange={(v) => {
        mark();
        setTheme(themeNames[copy.themes.indexOf(v as (typeof copy.themes)[number])]);
        measure('theme');
      }}
    />
  );
}
