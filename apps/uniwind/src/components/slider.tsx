// Slider, ported from the baseline to Uniwind.
import { useState } from 'react';
import { Text, View } from 'react-native';

import { targetH } from './shared';

type SliderProps = { label: string; unit: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; testID?: string };

// React Native has no slider, so this is the baseline's, built from a View.
// accessibilityRole="adjustable" (role has no such value) gives the iOS
// adjustable trait; VoiceOver's swipe up/down fires increment/decrement.
// The fill width and thumb position depend on the value, so they stay inline
// styles; Tailwind classes can't be built at runtime.
export function Slider({ label, unit, value, min, max, step, onChange, testID }: SliderProps) {
  const [width, setWidth] = useState(0);
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step));
  const fromX = (x: number) => (width ? onChange(clamp(min + (x / width) * (max - min))) : undefined);
  const pct = (value - min) / (max - min);
  return (
    <View className="gap-1">
      <Text className="text-label font-semibold text-text">
        {label}: {value} {unit}
      </Text>
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
        className={`${targetH} justify-center`}>
        <View pointerEvents="none" className="h-1.5 rounded-full bg-border">
          <View className="h-1.5 rounded-full bg-primary" style={{ width: `${pct * 100}%` }} />
        </View>
        <View pointerEvents="none" className="absolute size-7 rounded-full border-2 border-primary bg-surface-raised" style={{ left: pct * width - 14 }} />
      </View>
    </View>
  );
}
