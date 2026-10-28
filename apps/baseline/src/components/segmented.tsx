// Baseline control built on React Native primitives with hand-written accessibility.
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '../theme';
import { target } from './shared';

// A row of buttons; aria-selected gives the iOS selected trait, as UIKit's
// segmented control does.
export function Segmented({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={{ gap: theme.space.xs }}>
      <Text style={[theme.type.label, { color: c.text }]}>{label}</Text>
      <View testID={testID} accessibilityLabel={label} style={{ flexDirection: 'row', borderWidth: 1, borderColor: c.border, borderRadius: theme.radius.md, padding: 2 }}>
        {options.map((o, i) => {
          const selected = o === value;
          return (
            <Pressable
              key={o}
              testID={`${testID}-${i}`}
              role="button"
              aria-selected={selected}
              accessibilityLabel={o}
              onPress={() => onChange(o)}
              style={{ flex: 1, minHeight: target, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.sm, backgroundColor: selected ? c.primary : 'transparent' }}>
              <Text style={[theme.type.label, { color: selected ? c.onPrimary : c.text }]}>{o}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
