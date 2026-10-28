// Progress bar, ported from the baseline to Uniwind.
import { Text, View } from 'react-native';

// role="progressbar" with aria-value*: the value text is what VoiceOver reads.
export function Progress({ label, value, max, valueText, testID }: { label: string; value: number; max: number; valueText: string; testID?: string }) {
  return (
    <View className="gap-1">
      <Text className="text-label font-semibold text-text">{label}</Text>
      <View testID={testID} accessible role="progressbar" accessibilityLabel={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-valuetext={valueText} className="h-2 rounded-full bg-border">
        <View className="h-2 rounded-full bg-primary" style={{ width: `${(value / max) * 100}%` }} />
      </View>
      <Text className="text-caption text-text-muted">{valueText}</Text>
    </View>
  );
}
