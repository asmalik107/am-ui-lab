// Items 15–19. Progress, Accordion, DropdownMenu and ToggleGroup are
// Reusables components added with its CLI (0.7.1) and used as its docs show.
// Reusables has no slider, so that one is the baseline's, built on a View
// with Uniwind classes and hand-written accessibility.
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Text } from '@/components/ui/text';

// DropdownMenu as in the docs, opened from an outline Button.
export function Menu({ label, items, onSelect, testID }: { label: string; items: readonly string[]; onSelect: (item: string) => void; testID?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button testID={`${testID}-open`} variant="outline">
          <Text>{label}</Text>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent testID={testID} className="w-56">
        {items.map((item, i) => (
          <DropdownMenuItem key={item} testID={`${testID}-item-${i}`} onPress={() => onSelect(item)}>
            <Text>{item}</Text>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
