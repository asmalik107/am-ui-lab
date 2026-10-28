// Baseline control ported to Unistyles; accessibility is hand-written as in the baseline.
import { Pressable, Switch as RNSwitch, Text } from 'react-native';
import { withUnistyles } from 'react-native-unistyles';

import { styles } from './styles';

// Switch track colours are props, not styles, so they are mapped from the
// theme with withUnistyles (re-renders only this leaf on a theme change).
// https://www.unistyl.es/v3/references/with-unistyles
const ThemedSwitch = withUnistyles(RNSwitch, (theme) => ({
  trackColor: { true: theme.colors.primary, false: theme.colors.border },
}));

// The whole row is one switch element so the label and state are read together.
export function SwitchRow({ label, value, onValueChange, testID }: { label: string; value: boolean; onValueChange: (v: boolean) => void; testID?: string }) {
  return (
    <Pressable testID={testID} role="switch" aria-checked={value} accessibilityLabel={label} onPress={() => onValueChange(!value)} style={styles.switchRow}>
      <Text style={styles.rowText}>{label}</Text>
      <ThemedSwitch value={value} onValueChange={onValueChange} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden />
    </Pressable>
  );
}
