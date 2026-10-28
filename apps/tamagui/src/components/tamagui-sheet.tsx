import { Sheet } from 'tamagui'

import { SheetBody, type SheetContentProps } from './sheet-body'

// Tamagui's own Sheet, for comparison with the third-party one.
// https://tamagui.dev/ui/sheet
export function TamaguiSheet({ open, onOpenChange, ...content }: SheetContentProps & { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Sheet modal open={open} onOpenChange={onOpenChange} dismissOnSnapToBottom snapPointsMode="fit" transition="medium">
      <Sheet.Overlay bg="scrim" opacity="1 enter:0 exit:0" transition="lazy" />
      <Sheet.Handle bg="border-color" />
      <Sheet.Container testID={content.testID} p="xl" pb="xxl" gap="md">
        <Sheet.Background bg="surface-raised" />
        <SheetBody {...content} />
      </Sheet.Container>
    </Sheet>
  )
}
