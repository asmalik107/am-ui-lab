// Baseline overlay ported to Unistyles: the @expo/ui native sheet.
import { Button as NativeButton, Column as NativeColumn, BottomSheet as NativeSheet, Text as NativeText } from '@expo/ui';
import { accessibilityAddTraits, accessibilityIdentifier } from '@expo/ui/swift-ui/modifiers';
import { withUnistyles } from 'react-native-unistyles';

import { space } from '@shared/tokens';

// @expo/ui's universal BottomSheet: a native SwiftUI sheet on iOS, filled
// with @expo/ui's own Column, Text and Button (React Native views inside it
// don't receive touches unless wrapped in RNHostView). containerColor and
// textStyle are plain props, so withUnistyles maps them from the theme, the
// same way as gorhom's props in exercise-sheet.tsx.
// https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/bottomsheet/
const ThemedNativeSheet = withUnistyles(NativeSheet, (theme) => ({ containerColor: theme.colors.surfaceRaised }));
const ThemedNativeText = withUnistyles(NativeText);

export function ExpoExerciseSheet({ open, onClose, title, body, close, testID }: { open: boolean; onClose: () => void; title: string; body: string; close: string; testID?: string }) {
  return (
    <ThemedNativeSheet testID={testID} isPresented={open} onDismiss={onClose}>
      <NativeColumn spacing={space.md}>
        <ThemedNativeText
          modifiers={[accessibilityAddTraits(['isHeader'])]}
          uniProps={(theme) => ({ textStyle: { color: theme.colors.text, fontSize: theme.type.title.fontSize, fontWeight: '700' } })}>
          {title}
        </ThemedNativeText>
        <ThemedNativeText uniProps={(theme) => ({ textStyle: { color: theme.colors.textMuted, fontSize: theme.type.body.fontSize } })}>{body}</ThemedNativeText>
        <NativeButton label={close} variant="outlined" onPress={onClose} modifiers={[accessibilityIdentifier(`${testID}-close`)]} />
      </NativeColumn>
    </ThemedNativeSheet>
  );
}
