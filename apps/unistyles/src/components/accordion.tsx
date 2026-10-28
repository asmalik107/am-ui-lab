// Baseline control ported to Unistyles; accessibility is hand-written as in the baseline.
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { styles } from './styles';

// Each header is a button with aria-expanded. On iOS, React Native adds
// "expanded" to the value when open and nothing when closed.
export function Accordion({ sections, panels, testID }: { sections: readonly string[]; panels: readonly string[]; testID?: string }) {
  const [open, setOpen] = useState<number[]>([]);
  return (
    <View style={styles.accordion}>
      {sections.map((s, i) => {
        const expanded = open.includes(i);
        return (
          <View key={s} style={styles.accordionItem(i > 0)}>
            <Pressable
              testID={`${testID}-${i}`}
              role="button"
              aria-expanded={expanded}
              accessibilityLabel={s}
              onPress={() => setOpen(expanded ? open.filter((x) => x !== i) : [...open, i])}
              style={styles.accordionHeader}>
              <Text style={styles.label}>{s}</Text>
              <Text importantForAccessibility="no" accessibilityElementsHidden style={styles.chevron}>
                {expanded ? '▴' : '▾'}
              </Text>
            </Pressable>
            {expanded && <Text style={styles.accordionPanel}>{panels[i]}</Text>}
          </View>
        );
      })}
    </View>
  );
}
