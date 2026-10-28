// Items 15–19. Slider, Accordion and Menu are HeroUI's own components, set up
// as its docs show. HeroUI Native 1.0.11 ships no progress bar and no
// segmented control, so those two are built on React Native primitives with
// HeroUI's theme classes and the baseline's hand-written accessibility.
import { Label } from 'heroui-native/label';
import { Pressable, Text, View } from 'react-native';

import { space, type } from '../theme';

// Hand-built: a row of buttons with aria-selected (the iOS selected trait).
export function Segmented({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  return (
    <View style={{ gap: space.xs }}>
      <Label>{label}</Label>
      <View testID={testID} accessibilityLabel={label} className="flex-row rounded-xl border border-border p-0.5">
        {options.map((o, i) => {
          const selected = o === value;
          return (
            <Pressable
              key={o}
              testID={`${testID}-${i}`}
              role="button"
              aria-selected={selected}
              accessibilityLabel={o}
              onPress={() => onChange(o)}
              className={`min-h-11 flex-1 items-center justify-center rounded-lg ${selected ? 'bg-accent' : 'bg-transparent'}`}>
              <Text className={selected ? 'text-accent-foreground' : 'text-foreground'} style={type.label}>
                {o}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
