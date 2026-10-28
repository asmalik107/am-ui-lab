import { Button, ButtonText } from '@/components/ui/button';
import { Menu as GSMenu, MenuItem, MenuItemLabel } from '@/components/ui/menu';

// Menu as in the gluestack docs: the trigger is a render prop that spreads
// the trigger props onto a Button. https://gluestack.io/ui/docs/components/menu
export function Menu({ label, items, onSelect, testID }: { label: string; items: readonly string[]; onSelect: (item: string) => void; testID?: string }) {
  return (
    <GSMenu
      testID={testID}
      placement="bottom"
      offset={5}
      trigger={(triggerProps) => (
        <Button {...triggerProps} testID={`${testID}-open`} variant="outline">
          <ButtonText className="text-label">{label}</ButtonText>
        </Button>
      )}>
      {items.map((item, i) => (
        <MenuItem key={item} textValue={item} testID={`${testID}-item-${i}`} onPress={() => onSelect(item)}>
          <MenuItemLabel>{item}</MenuItemLabel>
        </MenuItem>
      ))}
    </GSMenu>
  );
}
