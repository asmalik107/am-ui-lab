import { H3, Paragraph } from 'tamagui'

import { Button } from './button'

export type SheetContentProps = { title: string; body: string; close: string; onClose: () => void; testID?: string }

export function SheetBody({ title, body, close, onClose, testID }: SheetContentProps) {
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
