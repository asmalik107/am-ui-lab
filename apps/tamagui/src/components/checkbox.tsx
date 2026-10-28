import { Checkbox as TCheckbox, Label, Text, XStack } from 'tamagui'

// Checkbox with its indeterminate state, Label linked by htmlFor/id.
// https://tamagui.dev/ui/checkbox
export function Checkbox({ label, checked, onChange, testID }: { label: string; checked: boolean | 'indeterminate'; onChange: (v: boolean | 'indeterminate') => void; testID?: string }) {
  const id = `${testID}-control`
  return (
    <XStack minH={44} items="center" gap="md">
      <TCheckbox id={id} testID={testID} checked={checked} onCheckedChange={onChange}>
        <TCheckbox.Indicator>
          <Text color="color" fontWeight="700">
            {checked === 'indeterminate' ? '–' : '✓'}
          </Text>
        </TCheckbox.Indicator>
      </TCheckbox>
      <Label htmlFor={id} color="color" fontSize={16} lineHeight="22px" flex={1}>
        {label}
      </Label>
    </XStack>
  )
}
