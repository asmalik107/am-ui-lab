// Overlays: Tamagui Dialog, Select (adapted to a Tamagui Sheet on touch, the only
// way Select renders on native), Tamagui's own Sheet, and the third-party
// @gorhom/bottom-sheet themed from Tamagui tokens.
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { forwardRef, type ReactNode } from 'react'
import { Adapt, Dialog as TDialog, H3, Label, Paragraph, Select as TSelect, Sheet, styled, Text, useTheme, XStack, YStack } from 'tamagui'

import { Button } from './controls'

type DialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: ReactNode
  title: string
  body: string
  confirm: string
  cancel: string
  onConfirm: () => void
  testID?: string
}

// Dialog.Content carries role="dialog", aria-modal and aria-labelledby /
// aria-describedby pointing at Title and Description.
// https://tamagui.dev/ui/dialog
export function Dialog({ open, onOpenChange, trigger, title, body, confirm, cancel, onConfirm, testID }: DialogProps) {
  return (
    <TDialog modal open={open} onOpenChange={onOpenChange}>
      <TDialog.Trigger asChild>{trigger}</TDialog.Trigger>
      <TDialog.Portal>
        <TDialog.Overlay key="overlay" bg="scrim" opacity="1 enter:0 exit:0" transition="quicker" />
        <TDialog.FocusScope focusOnIdle>
          <TDialog.Content
            key="content"
            testID={testID}
            bg="surface-raised"
            rounded="lg"
            p="xl"
            gap="md"
            mx="xl"
            opacity="1 enter:0 exit:0"
            scale="1 enter:0.95 exit:0.95"
            transition="quicker">
            <TDialog.Title color="color" fontSize={20} lineHeight="26px" fontWeight="700">
              {title}
            </TDialog.Title>
            <TDialog.Description color="text-muted" fontSize={16} lineHeight="22px">
              {body}
            </TDialog.Description>
            <XStack justify="flex-end" gap="sm">
              <TDialog.Close asChild>
                <Button testID={`${testID}-cancel`} label={cancel} variant="secondary" />
              </TDialog.Close>
              <Button testID={`${testID}-confirm`} label={confirm} variant="danger" onPress={onConfirm} />
            </XStack>
          </TDialog.Content>
        </TDialog.FocusScope>
      </TDialog.Portal>
    </TDialog>
  )
}

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

type SheetContentProps = { title: string; body: string; close: string; onClose: () => void; testID?: string }

function SheetBody({ title, body, close, onClose, testID }: SheetContentProps) {
  return (
    <>
      <H3 color="color" fontSize={20} lineHeight="26px" fontWeight="700">
        {title}
      </H3>
      <Paragraph color="text-muted" fontSize={16} lineHeight="22px">
        {body}
      </Paragraph>
      <Button testID={`${testID}-close`} label={close} variant="secondary" onPress={onClose} />
    </>
  )
}

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

// Third-party component themed with Tamagui:
// - styled() wraps BottomSheetView (any component that takes `style`), so its
//   padding/gap come from Tamagui tokens. https://tamagui.dev/docs/core/styled
// - gorhom's non-`style` props (backgroundStyle, handleIndicatorStyle) can't go
//   through styled() (v3 removed `accept`), so they read useTheme() values.
//   https://tamagui.dev/docs/core/use-theme
const SheetView = styled(BottomSheetView, {
  p: 'xl',
  pb: 'xxl',
  gap: 'md',
})

export const ExerciseSheet = forwardRef<BottomSheetModal, SheetContentProps>(function ExerciseSheet(props, ref) {
  const theme = useTheme()
  return (
    <BottomSheetModal
      ref={ref}
      accessible={false}
      backgroundStyle={{ backgroundColor: theme['surface-raised'].val }}
      handleIndicatorStyle={{ backgroundColor: theme['border-color'].val }}
      backdropComponent={(p) => <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />}>
      <SheetView testID={props.testID}>
        <SheetBody {...props} />
      </SheetView>
    </BottomSheetModal>
  )
})
