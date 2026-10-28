import { Text, View } from 'react-native';

import { Progress as GSProgress, ProgressFilledTrack } from '@/components/ui/progress';

// Progress as in the docs; the library sets role="progressbar" and a
// percentage value text. https://gluestack.io/ui/docs/components/progress
export function Progress({ label, value, max, valueText, testID }: { label: string; value: number; max: number; valueText: string; testID?: string }) {
  return (
    <View className="gap-xs">
      <Text className="text-label text-foreground">{label}</Text>
      <GSProgress testID={testID} value={value} max={max}>
        <ProgressFilledTrack />
      </GSProgress>
      <Text className="text-caption text-muted-foreground">{valueText}</Text>
    </View>
  );
}
