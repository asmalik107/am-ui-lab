// Baseline control ported to Unistyles; accessibility is hand-written as in the baseline.
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { styles } from './styles';

// role="tablist" / "tab" + aria-selected; the panel is a plain region below.
export function Tabs({ tabs, panels, testID }: { tabs: readonly string[]; panels: readonly string[]; testID?: string }) {
  const [index, setIndex] = useState(0);
  return (
    <View style={styles.tabsWrap}>
      <View testID={testID} role="tablist" style={styles.tablist}>
        {tabs.map((t, i) => (
          <Pressable
            key={t}
            testID={`${testID}-${i}`}
            role="tab"
            aria-selected={i === index}
            accessibilityLabel={t}
            accessibilityHint={`Tab ${i + 1} of ${tabs.length}`}
            onPress={() => setIndex(i)}
            style={styles.tab(i === index)}>
            <Text style={styles.tabLabel(i === index)}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.bodyText}>{panels[index]}</Text>
    </View>
  );
}
