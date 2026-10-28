import { Text, View } from 'react-native';

import { CircleIcon } from '@/components/ui/icon';
import { Radio, RadioGroup as GSRadioGroup, RadioIcon, RadioIndicator, RadioLabel } from '@/components/ui/radio';

export function RadioGroup({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  return (
    <View className="gap-xs">
      <Text className="text-label text-foreground">{label}</Text>
      <GSRadioGroup testID={testID} value={value} onChange={onChange} className="gap-sm">
        {options.map((opt, i) => (
          <Radio key={opt} testID={`${testID}-${i}`} value={opt}>
            <RadioIndicator>
              <RadioIcon as={CircleIcon} />
            </RadioIndicator>
            <RadioLabel className="text-body text-foreground">{opt}</RadioLabel>
          </Radio>
        ))}
      </GSRadioGroup>
    </View>
  );
}
