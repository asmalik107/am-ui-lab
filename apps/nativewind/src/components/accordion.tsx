// Accordion, the baseline's, restyled with NativeWind className. Accessibility props are unchanged from apps/baseline.
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

// Each header is a button with aria-expanded. On iOS, React Native adds
// "expanded" to the value when open and nothing when closed.
export function Accordion({ sections, panels, testID }: { sections: readonly string[]; panels: readonly string[]; testID?: string }) {
  const [open, setOpen] = useState<number[]>([]);
  return (
    <View className="rounded-md border border-border">
      {sections.map((s, i) => {
        const expanded = open.includes(i);
        return (
          <View key={s} className={i > 0 ? 'border-t border-border' : ''}>
            <Pressable
              testID={`${testID}-${i}`}
              role="button"
              aria-expanded={expanded}
              accessibilityLabel={s}
              onPress={() => setOpen(expanded ? open.filter((x) => x !== i) : [...open, i])}
              className="min-h-target flex-row items-center justify-between px-md">
              <Text className="text-label text-text">{s}</Text>
              <Text importantForAccessibility="no" accessibilityElementsHidden className="text-text-muted">
                {expanded ? '▴' : '▾'}
              </Text>
            </Pressable>
            {expanded && <Text className="text-body text-text-muted px-md pb-md">{panels[i]}</Text>}
          </View>
        );
      })}
    </View>
  );
}
