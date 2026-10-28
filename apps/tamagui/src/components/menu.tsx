import { Menu as TMenu } from 'tamagui'

import { Button } from './button'

// Menu: Tamagui's non-native menu (the default), opened from a Button.
// https://tamagui.dev/ui/menu
export function Menu({ label, items, onSelect, testID }: { label: string; items: readonly string[]; onSelect: (item: string) => void; testID?: string }) {
  return (
    <TMenu>
      <TMenu.Trigger asChild>
        <Button testID={`${testID}-open`} label={label} variant="secondary" />
      </TMenu.Trigger>
      <TMenu.Portal>
        <TMenu.Content testID={testID} bg="surface-raised" borderColor="border-color" borderWidth={1} rounded="md" py="sm">
          {items.map((item, i) => (
            <TMenu.Item key={item} testID={`${testID}-item-${i}`} onSelect={() => onSelect(item)} minH={44} px="lg" justify="center">
              <TMenu.ItemTitle color="color" fontSize={16}>
                {item}
              </TMenu.ItemTitle>
            </TMenu.Item>
          ))}
        </TMenu.Content>
      </TMenu.Portal>
    </TMenu>
  )
}
