// @expo/ui Host themed from the active Unistyles theme.
import { Host } from '@expo/ui';
import { withUnistyles } from 'react-native-unistyles';

// @expo/ui Host takes colorScheme / seedColor as props, so they are mapped
// from the active Unistyles theme with withUnistyles.
// https://www.unistyl.es/v3/references/with-unistyles
export const ThemedHost = withUnistyles(Host, (theme) => ({
  colorScheme: theme.name === 'dark' ? ('dark' as const) : ('light' as const),
  seedColor: theme.colors.primary,
}));
