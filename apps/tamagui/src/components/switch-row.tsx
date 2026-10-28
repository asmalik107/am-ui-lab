import { Label, Switch, XStack } from 'tamagui'

// Label + Switch linked by htmlFor/id, as in Tamagui's Switch demo.
// https://tamagui.dev/ui/switch
export function SwitchRow({ label, value, onValueChange, testID }: { label: string; value: boolean; onValueChange: (v: boolean) => void; testID?: string }) {
  const id = `${testID}-control`
  return (
    <XStack minH={44} items="center" justify="space-between" gap="md">
      <Label htmlFor={id} color="color" fontSize={16} lineHeight="22px" flex={1}>
        {label}
      </Label>
      <Switch id={id} testID={testID} checked={value} onCheckedChange={onValueChange} transition="quick">
        <Switch.Thumb transition="quickest" />
      </Switch>
    </XStack>
  )
}
