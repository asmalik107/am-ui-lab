// Switch row, the baseline's, restyled with NativeWind className. Accessibility props are unchanged from apps/baseline.
import { Pressable, Switch as RNSwitch, Text } from 'react-native';
import { styled } from 'nativewind';

// RN Switch's trackColor is an object prop, not a style. styled() sends a
// className colour into each nested prop path.
// https://www.nativewind.dev/v5/api/styled
const ThemedSwitch = styled(RNSwitch, {
  trackOnClassName: { target: false, nativeStyleMapping: { color: 'trackColor.true' } },
  trackOffClassName: { target: false, nativeStyleMapping: { color: 'trackColor.false' } },
});

// The whole row is one switch element so the label and state are read together.
export function SwitchRow({ label, value, onValueChange, testID }: { label: string; value: boolean; onValueChange: (v: boolean) => void; testID?: string }) {
  return (
    <Pressable
      testID={testID}
      role="switch"
      aria-checked={value}
      accessibilityLabel={label}
      onPress={() => onValueChange(!value)}
      className="min-h-target flex-row items-center justify-between">
      <Text className="flex-1 text-body text-text">{label}</Text>
      <ThemedSwitch
        value={value}
        onValueChange={onValueChange}
        trackOnClassName="text-primary"
        trackOffClassName="text-border"
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      />
    </Pressable>
  );
}
