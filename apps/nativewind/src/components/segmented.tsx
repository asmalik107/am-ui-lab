// Segmented control, the baseline's, restyled with NativeWind className. Accessibility props are unchanged from apps/baseline.
import { Pressable, Text, View } from 'react-native';

// A row of buttons; aria-selected gives the iOS selected trait, as UIKit's
// segmented control does.
export function Segmented({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  return (
    <View className="gap-xs">
      <Text className="text-label text-text">{label}</Text>
      <View testID={testID} accessibilityLabel={label} className="flex-row rounded-md border border-border p-0.5">
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
              className={`min-h-target flex-1 items-center justify-center rounded-sm ${selected ? 'bg-primary' : 'bg-transparent'}`}>
              <Text className={selected ? 'text-label text-on-primary' : 'text-label text-text'}>{o}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
