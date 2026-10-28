import { Label, RadioGroup as TRadioGroup, SizableText, XStack, YStack } from 'tamagui'

// RadioGroup: the group is labelled with aria-labelledby (as in Tamagui's demo),
// each item with a Label via htmlFor/id. https://tamagui.dev/ui/radio-group
export function RadioGroup({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  const labelId = `${testID}-label`
  return (
    <YStack gap="xs">
      <SizableText id={labelId} color="color" fontSize={15} lineHeight="20px" fontWeight="600">
        {label}
      </SizableText>
      <TRadioGroup testID={testID} aria-labelledby={labelId} value={value} onValueChange={onChange} gap="xs">
        {options.map((opt, i) => {
          const id = `${testID}-${i}`
          return (
            <XStack key={opt} minH={44} items="center" gap="md">
              <TRadioGroup.Item id={id} testID={id} value={opt}>
                <TRadioGroup.Indicator />
              </TRadioGroup.Item>
              <Label htmlFor={id} color="color" fontSize={16} lineHeight="22px">
                {opt}
              </Label>
            </XStack>
          )
        })}
      </TRadioGroup>
    </YStack>
  )
}
