// Items 15–19. Slider, Accordion and Menu are HeroUI's own components, set up
// as its docs show. HeroUI Native 1.0.11 ships no progress bar and no
// segmented control, so those two are built on React Native primitives with
// HeroUI's theme classes and the baseline's hand-written accessibility.
import { Label } from 'heroui-native/label';
import { Slider as HeroSlider } from 'heroui-native/slider';
import { View } from 'react-native';

import { space } from '../theme';

// https://heroui.com/docs/native/components/slider. Each thumb gets
// role="slider"; the docs document no label, so the thumb's aria-label is
// passed by hand (a standard View prop).
export function Slider({ label, unit, value, min, max, step, onChange, testID }: { label: string; unit: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; testID?: string }) {
  return (
    <View style={{ gap: space.xs }}>
      <Label>{`${label}: ${value} ${unit}`}</Label>
      <HeroSlider value={value} minValue={min} maxValue={max} step={step} onChange={(v) => onChange(v as number)}>
        <HeroSlider.Track>
          <HeroSlider.Fill />
          <HeroSlider.Thumb testID={testID} aria-label={label} />
        </HeroSlider.Track>
      </HeroSlider>
    </View>
  );
}
