// Section heading + body, ported from the baseline to Uniwind.
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3 py-4">
      <Text role="heading" className="text-title font-bold text-text">
        {title}
      </Text>
      {children}
    </View>
  );
}
