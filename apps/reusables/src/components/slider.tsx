// Items 15–19. Progress, Accordion, DropdownMenu and ToggleGroup are
// Reusables components added with its CLI (0.7.1) and used as its docs show.
// Reusables has no slider, so that one is the baseline's, built on a View
// with Uniwind classes and hand-written accessibility.
import { useState } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { type } from '@/lib/type';

type SliderProps = { label: string; unit: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; testID?: string };

// Hand-built: accessibilityRole="adjustable" gives the iOS adjustable trait;
// VoiceOver's swipe up/down fires increment/decrement. Touch uses the
// responder system, as in the baseline.
export function Slider({ label, unit, value, min, max, step, onChange, testID }: SliderProps) {
  const [width, setWidth] = useState(0);
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step));
  const fromX = (x: number) => (width ? onChange(clamp(min + (x / width) * (max - min))) : undefined);
  const pct = (value - min) / (max - min);
  return (
    <View className="gap-1">
      <Text className={type.label}>{`${label}: ${value} ${unit}`}</Text>
      <View
        testID={testID}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value} ${unit}`}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => onChange(clamp(value + (e.nativeEvent.actionName === 'increment' ? step : -step)))}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={(e) => fromX(e.nativeEvent.locationX)}
        onResponderMove={(e) => fromX(e.nativeEvent.locationX)}
        className="min-h-11 justify-center">
        <View pointerEvents="none" className="h-1.5 rounded-full bg-primary/20">
          <View className="h-1.5 rounded-full bg-primary" style={{ width: `${pct * 100}%` }} />
        </View>
        <View pointerEvents="none" className="absolute size-7 rounded-full border-2 border-primary bg-background" style={{ left: pct * width - 14 }} />
      </View>
    </View>
  );
}
