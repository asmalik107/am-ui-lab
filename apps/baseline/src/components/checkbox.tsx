// Baseline control built on React Native primitives with hand-written accessibility.
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '../theme';
import { target } from './shared';

export function Checkbox({ label, checked, onChange, testID }: { label: string; checked: boolean | 'mixed'; onChange: (v: boolean) => void; testID?: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <Pressable
      testID={testID}
      role="checkbox"
      aria-checked={checked}
      accessibilityLabel={label}
      onPress={() => onChange(checked !== true)}
      style={{ minHeight: target, flexDirection: 'row', alignItems: 'center', gap: theme.space.md }}>
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: theme.radius.sm,
          borderWidth: 2,
          borderColor: checked ? c.primary : c.border,
          backgroundColor: checked ? c.primary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {checked && <Text style={{ color: c.onPrimary, fontWeight: '700' }}>{checked === 'mixed' ? '–' : '✓'}</Text>}
      </View>
      <Text style={[theme.type.body, { color: c.text, flex: 1 }]}>{label}</Text>
    </Pressable>
  );
}
