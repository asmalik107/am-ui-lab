// Overlays: Tamagui Dialog, Select (adapted to a Tamagui Sheet on touch, the only
// way Select renders on native), Tamagui's own Sheet, and the third-party
// @gorhom/bottom-sheet themed from Tamagui tokens.
import type { ReactNode } from 'react'
import { Dialog as TDialog, XStack } from 'tamagui'

import { Button } from './button'

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
