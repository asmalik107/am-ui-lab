import {
  Accordion as GSAccordion,
  AccordionContent,
  AccordionContentText,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ChevronDownIcon, ChevronUpIcon } from '@/components/ui/icon';

// Accordion as in the docs, several sections open at once.
// https://gluestack.io/ui/docs/components/accordion
export function Accordion({ sections, panels, testID }: { sections: readonly string[]; panels: readonly string[]; testID?: string }) {
  return (
    <GSAccordion type="multiple" isCollapsible className="border border-border">
      {sections.map((s, i) => (
        <AccordionItem key={s} value={s}>
          <AccordionHeader>
            <AccordionTrigger testID={`${testID}-${i}`}>
              {({ isExpanded }: { isExpanded: boolean }) => (
                <>
                  <AccordionTitleText>{s}</AccordionTitleText>
                  <AccordionIcon as={isExpanded ? ChevronUpIcon : ChevronDownIcon} />
                </>
              )}
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>
            <AccordionContentText>{panels[i]}</AccordionContentText>
          </AccordionContent>
        </AccordionItem>
      ))}
    </GSAccordion>
  );
}
