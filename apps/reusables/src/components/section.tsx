import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { type } from '@/lib/type';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3 py-4">
      {/* RNR Text variant="h4" sets role="heading" itself. */}
      <Text variant="h4" className={type.title}>
        {title}
      </Text>
      {children}
    </View>
  );
}
