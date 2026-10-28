// Items 15–19. Slider, Accordion and Menu are HeroUI's own components, set up
// as its docs show. HeroUI Native 1.0.11 ships no progress bar and no
// segmented control, so those two are built on React Native primitives with
// HeroUI's theme classes and the baseline's hand-written accessibility.
import { Accordion as HeroAccordion } from 'heroui-native/accordion';
import { Text } from 'react-native';

import { type } from '../theme';

// https://heroui.com/docs/native/components/accordion, several open at once.
export function Accordion({ sections, panels, testID }: { sections: readonly string[]; panels: readonly string[]; testID?: string }) {
  return (
    <HeroAccordion selectionMode="multiple">
      {sections.map((s, i) => (
        <HeroAccordion.Item key={s} value={s}>
          <HeroAccordion.Trigger testID={`${testID}-${i}`}>
            <Text className="text-foreground" style={type.label}>
              {s}
            </Text>
            <HeroAccordion.Indicator />
          </HeroAccordion.Trigger>
          <HeroAccordion.Content>
            <Text className="text-muted" style={type.body}>
              {panels[i]}
            </Text>
          </HeroAccordion.Content>
        </HeroAccordion.Item>
      ))}
    </HeroAccordion>
  );
}
