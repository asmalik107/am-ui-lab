import { Text, View } from 'react-native';

import { Switch } from '@/components/ui/switch';

// gluestack's Switch is React Native's Switch with no label support. Its docs'
// "Switch With Label" example only places a Text next to it, so that is what is
// done here. Track colours use Uniwind's Switch className bindings.
export function SwitchRow({ label, value, onValueChange, testID }: { label: string; value: boolean; onValueChange: (v: boolean) => void; testID?: string }) {
  return (
    <View className="flex-row items-center justify-between gap-md">
      <Text className="text-body text-foreground flex-1">{label}</Text>
      <Switch
        testID={testID}
        value={value}
        onValueChange={onValueChange}
        trackColorOnClassName="accent-primary"
        trackColorOffClassName="accent-border"
        ios_backgroundColorClassName="accent-border"
      />
    </View>
  );
}
