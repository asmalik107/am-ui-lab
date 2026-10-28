// Tabs, the baseline's, restyled with NativeWind className. Accessibility props are unchanged from apps/baseline.
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

// role="tablist" / "tab" + aria-selected; the panel is a plain region below.
export function Tabs({ tabs, panels, testID }: { tabs: readonly string[]; panels: readonly string[]; testID?: string }) {
  const [index, setIndex] = useState(0);
  return (
    <View className="gap-md">
      <View testID={testID} role="tablist" className="flex-row border-b border-border">
        {tabs.map((t, i) => (
          <Pressable
            key={t}
            testID={`${testID}-${i}`}
            role="tab"
            aria-selected={i === index}
            accessibilityLabel={t}
            accessibilityHint={`Tab ${i + 1} of ${tabs.length}`}
            onPress={() => setIndex(i)}
            className={`min-h-target flex-1 items-center justify-center border-b-[3px] ${i === index ? 'border-primary' : 'border-transparent'}`}>
            <Text className={`text-label ${i === index ? 'text-primary' : 'text-text-muted'}`}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <Text className="text-body text-text">{panels[index]}</Text>
    </View>
  );
}
