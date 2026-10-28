import { Text, View } from 'react-native';

import { Slider as GSSlider, SliderFilledTrack, SliderThumb, SliderTrack } from '@/components/ui/slider';

// Slider as in the gluestack docs: Track, FilledTrack, Thumb. The docs pass
// no label, so none is added here. https://gluestack.io/ui/docs/components/slider
export function Slider({ label, unit, value, min, max, step, onChange, testID }: { label: string; unit: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; testID?: string }) {
  return (
    <View className="gap-xs">
      <Text className="text-label text-foreground">
        {label}: {value} {unit}
      </Text>
      <GSSlider testID={testID} value={value} minValue={min} maxValue={max} step={step} onChange={onChange} className="my-md">
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </GSSlider>
    </View>
  );
}
