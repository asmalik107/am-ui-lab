// Radio group, the baseline's, restyled with NativeWind className. Accessibility props are unchanged from apps/baseline.
import { Pressable, Text, View } from 'react-native';

export function RadioGroup({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  return (
    <View testID={testID} role="radiogroup" accessibilityLabel={label} className="gap-xs">
      <Text className="text-label text-text">{label}</Text>
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
            className="min-h-target flex-row items-center gap-md">
            <View className={`h-[22px] w-[22px] items-center justify-center rounded-[11px] border-2 ${selected ? 'border-primary' : 'border-border'}`}>
              {selected && <View className="h-[10px] w-[10px] rounded-[5px] bg-primary" />}
            </View>
            <Text className="text-body text-text">{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
