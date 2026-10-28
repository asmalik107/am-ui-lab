// Baseline control built on React Native primitives with hand-written accessibility.
import { Text, View } from 'react-native';

import { useTheme } from '../theme';

// role="progressbar" with aria-value*: the value text is what VoiceOver reads.
export function Progress({ label, value, max, valueText, testID }: { label: string; value: number; max: number; valueText: string; testID?: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={{ gap: theme.space.xs }}>
      <Text style={[theme.type.label, { color: c.text }]}>{label}</Text>
      <View
        testID={testID}
        accessible
        role="progressbar"
        accessibilityLabel={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={valueText}
        style={{ height: 8, borderRadius: 4, backgroundColor: c.border }}>
        <View style={{ width: `${(value / max) * 100}%`, height: 8, borderRadius: 4, backgroundColor: c.primary }} />
      </View>
      <Text style={[theme.type.caption, { color: c.textMuted }]}>{valueText}</Text>
    </View>
  );
}
