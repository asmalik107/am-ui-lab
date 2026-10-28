// Baseline control ported to Unistyles; accessibility is hand-written as in the baseline.
import { Pressable, Text, View } from 'react-native';

import { styles } from './styles';

export function Checkbox({ label, checked, onChange, testID }: { label: string; checked: boolean | 'mixed'; onChange: (v: boolean) => void; testID?: string }) {
  return (
    <Pressable testID={testID} role="checkbox" aria-checked={checked} accessibilityLabel={label} onPress={() => onChange(checked !== true)} style={styles.choiceRow}>
      <View style={styles.checkbox(!!checked)}>
        {checked && <Text style={styles.checkmark}>{checked === 'mixed' ? '–' : '✓'}</Text>}
      </View>
      <Text style={styles.rowText}>{label}</Text>
    </Pressable>
  );
}
