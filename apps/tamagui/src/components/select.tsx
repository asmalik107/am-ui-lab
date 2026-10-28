import { Adapt, Label, Select as TSelect, Sheet, Text, YStack } from 'tamagui'

type SelectProps = { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }

// Select with Label htmlFor/id, adapted to a modal Sheet on touch devices.
// https://tamagui.dev/ui/select#adapted-sheet
export function Select({ label, options, value, onChange, testID }: SelectProps) {
  const id = `${testID}-control`
  return (
    <YStack gap="xs">
      <Label htmlFor={id} color="color" fontSize={15} lineHeight="20px" fontWeight="600">
        {label}
      </Label>
      <TSelect id={id} value={value} onValueChange={onChange}>
        <TSelect.Trigger testID={testID} minH={44} bg="surface-raised" borderColor="border-color" borderWidth={1} rounded="md">
          <TSelect.Value color="color" fontSize={16} />
        </TSelect.Trigger>

        <Adapt platform="touch">
          <Sheet modal dismissOnSnapToBottom snapPointsMode="fit" transition="medium">
            <Sheet.Container>
              <Sheet.Background bg="surface-raised" />
              <Sheet.ScrollView>
                <Adapt.Contents />
              </Sheet.ScrollView>
            </Sheet.Container>
            <Sheet.Overlay bg="scrim" opacity="1 enter:0 exit:0" transition="lazy" />
          </Sheet>
        </Adapt>

        <TSelect.Content>
          <TSelect.Viewport>
            <TSelect.Group>
              <TSelect.Label color="text-muted">{label}</TSelect.Label>
              {options.map((opt, i) => (
                <TSelect.Item key={opt} testID={`${testID}-option-${i}`} value={opt} minH={44}>
                  <TSelect.ItemText color="color" fontSize={16}>
                    {opt}
                  </TSelect.ItemText>
                  <TSelect.ItemIndicator ml="auto">
                    <Text color="primary">✓</Text>
                  </TSelect.ItemIndicator>
                </TSelect.Item>
              ))}
            </TSelect.Group>
          </TSelect.Viewport>
        </TSelect.Content>
      </TSelect>
    </YStack>
  )
}
