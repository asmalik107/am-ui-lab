// Baseline control built on React Native primitives with hand-written accessibility.
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '../theme';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={{ gap: theme.space.md, paddingVertical: theme.space.lg }}>
      <Text role="heading" style={[theme.type.title, { color: theme.colors.text }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}
