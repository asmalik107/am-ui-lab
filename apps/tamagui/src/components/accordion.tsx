import { Accordion as TAccordion, SizableText, Text } from 'tamagui'

// Accordion, several sections open at once; Trigger inside Header as the
// docs show. https://tamagui.dev/ui/accordion
export function Accordion({ sections, panels, testID }: { sections: readonly string[]; panels: readonly string[]; testID?: string }) {
  return (
    <TAccordion type="multiple" borderWidth={1} borderColor="border-color" rounded="md" overflow="hidden">
      {sections.map((s, i) => (
        <TAccordion.Item key={s} value={s}>
          <TAccordion.Header>
            <TAccordion.Trigger testID={`${testID}-${i}`} minH={44} flexDirection="row" justify="space-between" items="center" bg="background" borderWidth={0} borderTopWidth={i ? 1 : 0} borderColor="border-color">
              {({ open }: { open: boolean }) => (
                <>
                  <SizableText color="color" fontSize={15} lineHeight="20px" fontWeight="600">
                    {s}
                  </SizableText>
                  <Text color="text-muted">{open ? '▴' : '▾'}</Text>
                </>
              )}
            </TAccordion.Trigger>
          </TAccordion.Header>
          <TAccordion.Content bg="background">
            <Text color="text-muted" fontSize={16} lineHeight="22px">
              {panels[i]}
            </Text>
          </TAccordion.Content>
        </TAccordion.Item>
      ))}
    </TAccordion>
  )
}
