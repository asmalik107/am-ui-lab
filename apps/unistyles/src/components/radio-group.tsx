// Baseline control ported to Unistyles; accessibility is hand-written as in the baseline.
import { Pressable, Text, View } from 'react-native';

import { styles } from './styles';

export function RadioGroup({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  return (
    <View testID={testID} role="radiogroup" accessibilityLabel={label} style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      {options.map((opt, i) => {
        const selected = opt === value;
        return (
          <Pressable
            key={opt}
            testID={`${testID}-${i}`}
            role="radio"
            aria-checked={selected}
            accessibilityLabel={opt}
            onPress={() => onChange(opt)}
            style={styles.choiceRow}>
            <View style={styles.radio(selected)}>{selected && <View style={styles.radioDot} />}</View>
            <Text style={styles.bodyText}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
