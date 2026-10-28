// Switch row, ported from the baseline to Uniwind.
import { Pressable, Switch as RNSwitch, Text } from 'react-native';

import { targetH } from './shared';

// The whole row is one switch element so the label and state are read together.
// Switch takes no className; its track colour comes from trackColorOnClassName
// / trackColorOffClassName with accent-* classes. https://docs.uniwind.dev/components/switch
export function SwitchRow({ label, value, onValueChange, testID }: { label: string; value: boolean; onValueChange: (v: boolean) => void; testID?: string }) {
  return (
    <Pressable
      testID={testID}
      role="switch"
      aria-checked={value}
      accessibilityLabel={label}
      onPress={() => onValueChange(!value)}
      className={`${targetH} flex-row items-center justify-between`}>
      <Text className="flex-1 text-body text-text">{label}</Text>
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        trackColorOnClassName="accent-primary"
        trackColorOffClassName="accent-border"
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      />
    </Pressable>
  );
}
