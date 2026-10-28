import { Platform, View } from 'react-native';

import { Label } from '@/components/ui/label';
import { RadioGroup as UIRadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Text } from '@/components/ui/text';
import { type } from '@/lib/type';

// Labelled radio group, composed the way RNR's docs show it: RadioGroupItem +
// Label per option, Label onPress selecting on native. The group and item
// labels are linked with aria-labelledby/nativeID (RNR's Label example).
export function RadioGroup({ testID, label, options, value, onChange }: { testID: string; label: string; options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <View className="gap-2">
      <Text nativeID={`${testID}-label`} className={type.label}>
        {label}
      </Text>
      <UIRadioGroup testID={testID} aria-labelledby={`${testID}-label`} value={value} onValueChange={onChange}>
        {options.map((opt, i) => (
          <View key={opt} className="flex-row items-center gap-3">
            <RadioGroupItem testID={`${testID}-${i}`} value={opt} aria-labelledby={`${testID}-${i}-label`} />
            <Label nativeID={`${testID}-${i}-label`} onPress={Platform.select({ native: () => onChange(opt) })}>
              {opt}
            </Label>
          </View>
        ))}
      </UIRadioGroup>
    </View>
  );
}
