// Section, the baseline's, restyled with NativeWind className. Accessibility props are unchanged from apps/baseline.
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-md py-lg">
      <Text role="heading" className="text-title text-text">
        {title}
      </Text>
      {children}
    </View>
  );
}
