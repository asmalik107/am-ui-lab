// Unistyles setup: the three shared token sets registered as named themes.
// Imported from index.ts before expo-router so configure() runs before any
// StyleSheet.create. https://www.unistyl.es/v3/start/configuration
import { StyleSheet } from 'react-native-unistyles';

import { colors, radius, space, type, type ThemeName } from '@shared/tokens';

const build = (name: ThemeName) => ({ name, colors: colors[name], space, radius, type });

const themes = {
  light: build('light'),
  dark: build('dark'),
  brand: build('brand'),
};

type AppThemes = typeof themes;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  themes,
  // initialTheme and adaptiveThemes are mutually exclusive; the baseline
  // starts on light and switches manually, so initialTheme it is.
  settings: { initialTheme: 'light' },
});
