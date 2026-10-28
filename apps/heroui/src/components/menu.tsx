// Items 15–19. Slider, Accordion and Menu are HeroUI's own components, set up
// as its docs show. HeroUI Native 1.0.11 ships no progress bar and no
// segmented control, so those two are built on React Native primitives with
// HeroUI's theme classes and the baseline's hand-written accessibility.
import { Button } from 'heroui-native/button';
import { Menu as HeroMenu } from 'heroui-native/menu';

// https://heroui.com/docs/native/components/menu, popover presentation.
// Items close the menu on press (shouldCloseOnSelect defaults to true).
export function Menu({ label, items, onSelect, testID }: { label: string; items: readonly string[]; onSelect: (item: string) => void; testID?: string }) {
  return (
    <HeroMenu>
      <HeroMenu.Trigger asChild>
        <Button testID={`${testID}-open`} variant="outline">
          {label}
        </Button>
      </HeroMenu.Trigger>
      <HeroMenu.Portal>
        <HeroMenu.Overlay />
        <HeroMenu.Content presentation="popover" width={220} testID={testID}>
          {items.map((item, i) => (
            <HeroMenu.Item key={item} testID={`${testID}-item-${i}`} onPress={() => onSelect(item)}>
              <HeroMenu.ItemTitle>{item}</HeroMenu.ItemTitle>
            </HeroMenu.Item>
          ))}
        </HeroMenu.Content>
      </HeroMenu.Portal>
    </HeroMenu>
  );
}
