// Baseline control built on React Native primitives with hand-written accessibility.
import { useState } from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '../theme';
import { target } from './shared';

type SliderProps = { label: string; unit: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; testID?: string };

// React Native has no slider, so this one is built from a View.
// accessibilityRole="adjustable" (role has no such value) gives the iOS adjustable trait; VoiceOver's swipe up/down fires the
// increment/decrement actions, and aria-valuetext is what it reads. Touch uses
// the responder system: the thumb follows the finger along the track.
export function Slider({ label, unit, value, min, max, step, onChange, testID }: SliderProps) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [width, setWidth] = useState(0);
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step));
  const fromX = (x: number) => (width ? onChange(clamp(min + (x / width) * (max - min))) : undefined);
  const pct = (value - min) / (max - min);
  return (
    <View style={{ gap: theme.space.xs }}>
      <Text style={[theme.type.label, { color: c.text }]}>
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
        style={{ height: target, justifyContent: 'center' }}>
        <View pointerEvents="none" style={{ height: 6, borderRadius: 3, backgroundColor: c.border }}>
          <View style={{ width: `${pct * 100}%`, height: 6, borderRadius: 3, backgroundColor: c.primary }} />
        </View>
        <View
          pointerEvents="none"
          style={{ position: 'absolute', left: pct * width - 14, width: 28, height: 28, borderRadius: 14, backgroundColor: c.surfaceRaised, borderWidth: 2, borderColor: c.primary }}
        />
      </View>
    </View>
  );
}
