import { Button as NativeButton, Column as NativeColumn, BottomSheet as NativeSheet, Text as NativeText } from '@expo/ui'
import { accessibilityAddTraits, accessibilityIdentifier } from '@expo/ui/swift-ui/modifiers'
import { getTokens, useTheme } from 'tamagui'

import type { SheetContentProps } from './sheet-body'

// @expo/ui's universal BottomSheet: a native SwiftUI sheet on iOS, filled
// with @expo/ui's own Column, Text and Button (React Native views inside it
// don't receive touches unless wrapped in RNHostView). Like gorhom's props,
// containerColor and textStyle aren't `style`, so they read useTheme()
// values, and the Column spacing is the `md` space token.
// https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/bottomsheet/
export function ExpoExerciseSheet({ open, onClose, title, body, close, testID }: SheetContentProps & { open: boolean }) {
  const theme = useTheme()
  return (
    <NativeSheet testID={testID} isPresented={open} onDismiss={onClose} containerColor={theme['surface-raised'].val}>
      <NativeColumn spacing={getTokens().space.md.val}>
        <NativeText modifiers={[accessibilityAddTraits(['isHeader'])]} textStyle={{ color: theme.color.val, fontSize: 20, fontWeight: '700' }}>
          {title}
        </NativeText>
        <NativeText textStyle={{ color: theme['text-muted'].val, fontSize: 16 }}>{body}</NativeText>
        <NativeButton label={close} variant="outlined" onPress={onClose} modifiers={[accessibilityIdentifier(`${testID}-close`)]} />
      </NativeColumn>
    </NativeSheet>
  )
}
