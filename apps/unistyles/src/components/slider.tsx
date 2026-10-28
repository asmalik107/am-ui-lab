// Baseline control ported to Unistyles; accessibility is hand-written as in the baseline.
import { useState } from 'react';
import { Text, View } from 'react-native';

import { styles } from './styles';

type SliderProps = { label: string; unit: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; testID?: string };

// React Native has no slider, so this is the baseline's, built from a View.
// accessibilityRole="adjustable" (role has no such value) gives the iOS
// adjustable trait; VoiceOver's swipe up/down fires increment/decrement.
// The fill and thumb position depend on the value, so they are dynamic styles.
export function Slider({ label, unit, value, min, max, step, onChange, testID }: SliderProps) {
  const [width, setWidth] = useState(0);
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step));
  const fromX = (x: number) => (width ? onChange(clamp(min + (x / width) * (max - min))) : undefined);
  const pct = (value - min) / (max - min);
  return (
    <View style={styles.group}>
      <Text style={styles.label}>
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
        style={styles.sliderHit}>
        <View pointerEvents="none" style={styles.track}>
          <View style={styles.fill(pct)} />
        </View>
        <View pointerEvents="none" style={styles.thumb(pct * width - 14)} />
      </View>
    </View>
  );
}
