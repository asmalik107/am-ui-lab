// Baseline control ported to Unistyles; accessibility is hand-written as in the baseline.
import { Text, View } from 'react-native';

import { styles } from './styles';

// role="progressbar" with aria-value*: the value text is what VoiceOver reads.
export function Progress({ label, value, max, valueText, testID }: { label: string; value: number; max: number; valueText: string; testID?: string }) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View testID={testID} accessible role="progressbar" accessibilityLabel={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-valuetext={valueText} style={styles.progressTrack}>
        <View style={styles.progressFill(value / max)} />
      </View>
      <Text style={styles.caption}>{valueText}</Text>
    </View>
  );
}
