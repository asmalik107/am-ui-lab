// Radio group, ported from the baseline to Uniwind.
import { Pressable, Text, View } from 'react-native';

import { targetH } from './shared';

export function RadioGroup({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  return (
    <View testID={testID} role="radiogroup" accessibilityLabel={label} className="gap-1">
      <Text className="text-label font-semibold text-text">{label}</Text>
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
            className={`${targetH} flex-row items-center gap-3`}>
            <View className={`size-[22px] items-center justify-center rounded-full border-2 ${selected ? 'border-primary' : 'border-border'}`}>
              {selected && <View className="size-2.5 rounded-full bg-primary" />}
            </View>
            <Text className="text-body text-text">{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
