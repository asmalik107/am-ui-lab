// Checkbox, the baseline's, restyled with NativeWind className. Accessibility props are unchanged from apps/baseline.
import { Pressable, Text, View } from 'react-native';

export function Checkbox({ label, checked, onChange, testID }: { label: string; checked: boolean | 'mixed'; onChange: (v: boolean) => void; testID?: string }) {
  return (
    <Pressable
      testID={testID}
      role="checkbox"
      aria-checked={checked}
      accessibilityLabel={label}
      onPress={() => onChange(checked !== true)}
      className="min-h-target flex-row items-center gap-md">
      <View
        className={`h-[24px] w-[24px] items-center justify-center rounded-sm border-2 ${checked ? 'border-primary bg-primary' : 'border-border bg-transparent'}`}>
        {checked && <Text className="font-bold text-on-primary">{checked === 'mixed' ? '–' : '✓'}</Text>}
      </View>
      <Text className="flex-1 text-body text-text">{label}</Text>
    </Pressable>
  );
}
