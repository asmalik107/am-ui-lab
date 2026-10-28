// Items 15–19. Progress, Accordion, DropdownMenu and ToggleGroup are
// Reusables components added with its CLI (0.7.1) and used as its docs show.
// Reusables has no slider, so that one is the baseline's, built on a View
// with Uniwind classes and hand-written accessibility.
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { type } from '@/lib/type';

// Segmented control as a single-choice ToggleGroup, as in the docs.
export function Segmented({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  return (
    <View className="gap-1">
      <Text className={type.label}>{label}</Text>
      <ToggleGroup testID={testID} type="single" variant="outline" value={value} onValueChange={(v) => v && onChange(v)}>
        {options.map((o, i) => (
          <ToggleGroupItem key={o} testID={`${testID}-${i}`} value={o} aria-label={o} isFirst={i === 0} isLast={i === options.length - 1} className="flex-1">
            <Text>{o}</Text>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </View>
  );
}
