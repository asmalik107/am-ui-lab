// Items 15–19. Progress, Accordion, DropdownMenu and ToggleGroup are
// Reusables components added with its CLI (0.7.1) and used as its docs show.
// Reusables has no slider, so that one is the baseline's, built on a View
// with Uniwind classes and hand-written accessibility.
import { View } from 'react-native';

import { Progress as UIProgress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { type } from '@/lib/type';

// Progress as in the docs: value is a percentage (0–100).
export function Progress({ label, value, max, valueText, testID }: { label: string; value: number; max: number; valueText: string; testID?: string }) {
  return (
    <View className="gap-1">
      <Text className={type.label}>{label}</Text>
      <UIProgress testID={testID} value={(value / max) * 100} />
      <Text className={`${type.caption} text-muted-foreground`}>{valueText}</Text>
    </View>
  );
}
