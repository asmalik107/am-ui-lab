// Baseline overlay: the @expo/ui native sheet.
import { Button as NativeButton, Column as NativeColumn, BottomSheet as NativeSheet, Text as NativeText } from '@expo/ui';
import { accessibilityAddTraits, accessibilityIdentifier } from '@expo/ui/swift-ui/modifiers';

import { useTheme } from '../theme';

// @expo/ui's universal BottomSheet: a native SwiftUI sheet on iOS. Built the
// way Expo's docs show, from @expo/ui's own Column, Text and Button: React
// Native views inside a sheet don't receive touches unless wrapped in
// RNHostView (see RNHostView.tsx in @expo/ui).
// https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/bottomsheet/
export function ExpoExerciseSheet({ open, onClose, title, body, close, testID }: { open: boolean; onClose: () => void; title: string; body: string; close: string; testID?: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <NativeSheet testID={testID} isPresented={open} onDismiss={onClose} containerColor={c.surfaceRaised}>
      <NativeColumn spacing={theme.space.md}>
        <NativeText modifiers={[accessibilityAddTraits(['isHeader'])]} textStyle={{ color: c.text, fontSize: theme.type.title.fontSize, fontWeight: '700' }}>
          {title}
        </NativeText>
        <NativeText textStyle={{ color: c.textMuted, fontSize: theme.type.body.fontSize }}>{body}</NativeText>
        <NativeButton label={close} variant="outlined" onPress={onClose} modifiers={[accessibilityIdentifier(`${testID}-close`)]} />
      </NativeColumn>
    </NativeSheet>
  );
}
