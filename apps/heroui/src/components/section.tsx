import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { space, type } from '../theme';

// Plain RN layout + heading, coloured from the theme via className.
// role="heading" matches the baseline's section headings (HeroUI has no
// section/heading component outside Dialog/BottomSheet titles).
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: space.md, paddingVertical: space.lg }}>
      <Text role="heading" className="text-foreground" style={type.title}>
        {title}
      </Text>
      {children}
    </View>
  );
}
