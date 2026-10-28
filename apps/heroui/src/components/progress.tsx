// Items 15–19. Slider, Accordion and Menu are HeroUI's own components, set up
// as its docs show. HeroUI Native 1.0.11 ships no progress bar and no
// segmented control, so those two are built on React Native primitives with
// HeroUI's theme classes and the baseline's hand-written accessibility.
import { Label } from 'heroui-native/label';
import { Text, View } from 'react-native';

import { space, type } from '../theme';

// Hand-built: role="progressbar" with aria-value*, as in the baseline.
export function Progress({ label, value, max, valueText, testID }: { label: string; value: number; max: number; valueText: string; testID?: string }) {
  return (
    <View style={{ gap: space.xs }}>
      <Label>{label}</Label>
      <View testID={testID} accessible role="progressbar" accessibilityLabel={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-valuetext={valueText} className="h-2 rounded-full bg-border">
        <View className="h-2 rounded-full bg-accent" style={{ width: `${(value / max) * 100}%` }} />
      </View>
      <Text className="text-muted" style={type.caption}>
        {valueText}
      </Text>
    </View>
  );
}
