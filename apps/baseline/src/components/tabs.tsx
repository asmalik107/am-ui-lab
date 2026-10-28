// Baseline control built on React Native primitives with hand-written accessibility.
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '../theme';
import { target } from './shared';

// role="tablist" / "tab" + aria-selected; the panel is a plain region below.
export function Tabs({ tabs, panels, testID }: { tabs: readonly string[]; panels: readonly string[]; testID?: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [index, setIndex] = useState(0);
  return (
    <View style={{ gap: theme.space.md }}>
      <View testID={testID} role="tablist" style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: c.border }}>
        {tabs.map((t, i) => (
          <Pressable
            key={t}
            testID={`${testID}-${i}`}
            role="tab"
            aria-selected={i === index}
            accessibilityLabel={t}
            accessibilityHint={`Tab ${i + 1} of ${tabs.length}`}
            onPress={() => setIndex(i)}
            style={{ flex: 1, minHeight: target, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 3, borderColor: i === index ? c.primary : 'transparent' }}>
            <Text style={[theme.type.label, { color: i === index ? c.primary : c.textMuted }]}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[theme.type.body, { color: c.text }]}>{panels[index]}</Text>
    </View>
  );
}
