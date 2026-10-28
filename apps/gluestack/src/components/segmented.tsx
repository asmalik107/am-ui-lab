import { Pressable, Text, View } from 'react-native';

// gluestack-ui ships no segmented control, so this is built on Pressable with
// gluestack's classNames and the baseline's hand-written accessibility:
// role="button" + aria-selected (the iOS selected trait).
export function Segmented({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  return (
    <View className="gap-xs">
      <Text className="text-label text-foreground">{label}</Text>
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
              className={`min-h-11 flex-1 items-center justify-center rounded-sm ${selected ? 'bg-primary' : 'bg-transparent'}`}>
              <Text className={selected ? 'text-label text-primary-foreground' : 'text-label text-foreground'}>{o}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
