import { Progress as TProgress, SizableText, Text, YStack } from 'tamagui'

// Progress with getValueLabel for the text read out; Tamagui sets
// role="progressbar" and aria-value*. https://tamagui.dev/ui/progress
export function Progress({ label, value, max, valueText, testID }: { label: string; value: number; max: number; valueText: string; testID?: string }) {
  return (
    <YStack gap="xs">
      <SizableText color="color" fontSize={15} lineHeight="20px" fontWeight="600">
        {label}
      </SizableText>
      <TProgress testID={testID} aria-label={label} value={value} max={max} getValueLabel={() => valueText} bg="border-color">
        <TProgress.Indicator bg="primary" />
      </TProgress>
      <Text color="text-muted" fontSize={13} lineHeight="18px">
        {valueText}
      </Text>
    </YStack>
  )
}
