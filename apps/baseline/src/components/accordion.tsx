// Baseline control built on React Native primitives with hand-written accessibility.
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '../theme';
import { target } from './shared';

// Each header is a button with aria-expanded. On iOS, React Native adds
// "expanded" to the value when open and nothing when closed.
export function Accordion({ sections, panels, testID }: { sections: readonly string[]; panels: readonly string[]; testID?: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [open, setOpen] = useState<number[]>([]);
  return (
    <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: theme.radius.md }}>
      {sections.map((s, i) => {
        const expanded = open.includes(i);
        return (
          <View key={s} style={{ borderTopWidth: i ? 1 : 0, borderColor: c.border }}>
            <Pressable
              testID={`${testID}-${i}`}
              role="button"
              aria-expanded={expanded}
              accessibilityLabel={s}
              onPress={() => setOpen(expanded ? open.filter((x) => x !== i) : [...open, i])}
              style={{ minHeight: target, paddingHorizontal: theme.space.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[theme.type.label, { color: c.text }]}>{s}</Text>
              <Text importantForAccessibility="no" accessibilityElementsHidden style={{ color: c.textMuted }}>
                {expanded ? '▴' : '▾'}
              </Text>
            </Pressable>
            {expanded && <Text style={[theme.type.body, { color: c.textMuted, paddingHorizontal: theme.space.md, paddingBottom: theme.space.md }]}>{panels[i]}</Text>}
          </View>
        );
      })}
    </View>
  );
}
