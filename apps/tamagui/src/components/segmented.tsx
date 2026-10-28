import { SizableText, ToggleGroup, YStack } from 'tamagui'

// Segmented control as a single-choice ToggleGroup. disableDeactivation keeps
// one option selected. https://tamagui.dev/ui/toggle-group
export function Segmented({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  return (
    <YStack gap="xs">
      <SizableText color="color" fontSize={15} lineHeight="20px" fontWeight="600">
        {label}
      </SizableText>
      <ToggleGroup testID={testID} type="single" disableDeactivation value={value} onValueChange={(v: string) => v && onChange(v)} aria-label={label} orientation="horizontal" flexDirection="row">
        {options.map((o, i) => (
          <ToggleGroup.Item key={o} testID={`${testID}-${i}`} value={o} aria-label={o} flex={1} minH={44}>
            <SizableText color={o === value ? 'primary' : 'color'} fontSize={15} fontWeight="600">
              {o}
            </SizableText>
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>
    </YStack>
  )
}
