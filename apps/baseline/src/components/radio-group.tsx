// Baseline control built on React Native primitives with hand-written accessibility.
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '../theme';
import { target } from './shared';

export function RadioGroup({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View testID={testID} role="radiogroup" accessibilityLabel={label} style={{ gap: theme.space.xs }}>
      <Text style={[theme.type.label, { color: c.text }]}>{label}</Text>
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
            style={{ minHeight: target, flexDirection: 'row', alignItems: 'center', gap: theme.space.md }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: selected ? c.primary : c.border, alignItems: 'center', justifyContent: 'center' }}>
              {selected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.primary }} />}
            </View>
            <Text style={[theme.type.body, { color: c.text }]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
