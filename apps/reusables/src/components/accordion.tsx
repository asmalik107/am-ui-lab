// Items 15–19. Progress, Accordion, DropdownMenu and ToggleGroup are
// Reusables components added with its CLI (0.7.1) and used as its docs show.
// Reusables has no slider, so that one is the baseline's, built on a View
// with Uniwind classes and hand-written accessibility.
import { Accordion as UIAccordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Text } from '@/components/ui/text';
import { type } from '@/lib/type';

// Accordion as in the docs, several sections open at once.
export function Accordion({ sections, panels, testID }: { sections: readonly string[]; panels: readonly string[]; testID?: string }) {
  return (
    <UIAccordion type="multiple">
      {sections.map((s, i) => (
        <AccordionItem key={s} value={s}>
          <AccordionTrigger testID={`${testID}-${i}`}>
            <Text className={type.label}>{s}</Text>
          </AccordionTrigger>
          <AccordionContent>
            <Text className={`${type.body} text-muted-foreground`}>{panels[i]}</Text>
          </AccordionContent>
        </AccordionItem>
      ))}
    </UIAccordion>
  );
}
