// Baseline control built on React Native primitives with hand-written accessibility.
import { Pressable, Switch as RNSwitch, Text } from 'react-native';

import { useTheme } from '../theme';
import { target } from './shared';

// The whole row is one switch element so the label and state are read together.
export function SwitchRow({ label, value, onValueChange, testID }: { label: string; value: boolean; onValueChange: (v: boolean) => void; testID?: string }) {
  const { theme } = useTheme();
  return (
    <Pressable
      testID={testID}
      role="switch"
      aria-checked={value}
      accessibilityLabel={label}
      onPress={() => onValueChange(!value)}
      style={{ minHeight: target, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={[theme.type.body, { color: theme.colors.text, flex: 1 }]}>{label}</Text>
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      />
    </Pressable>
  );
}
