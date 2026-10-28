// Baseline control ported to Unistyles; accessibility is hand-written as in the baseline.
import { Pressable, Text, View } from 'react-native';

import { styles } from './styles';

// A row of buttons; aria-selected gives the iOS selected trait, as UIKit's
// segmented control does.
export function Segmented({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View testID={testID} accessibilityLabel={label} style={styles.segmented}>
        {options.map((o, i) => {
          const selected = o === value;
          return (
            <Pressable key={o} testID={`${testID}-${i}`} role="button" aria-selected={selected} accessibilityLabel={o} onPress={() => onChange(o)} style={styles.segment(selected)}>
              <Text style={styles.segmentLabel(selected)}>{o}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
