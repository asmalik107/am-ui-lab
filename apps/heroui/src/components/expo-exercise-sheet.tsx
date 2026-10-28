// @expo/ui's universal BottomSheet: a native SwiftUI sheet on iOS, filled
// with @expo/ui's own Column, Text and Button (React Native views inside it
// don't receive touches unless wrapped in RNHostView). Its colours are plain
// props, so they come from HeroUI's useThemeColor, as for the @expo/ui Host;
// the same tokens as the gorhom sheet (overlay, overlay-foreground, muted).
// https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/bottomsheet/
import { Button as NativeButton, Column as NativeColumn, BottomSheet as NativeSheet, Text as NativeText } from '@expo/ui';
import { accessibilityAddTraits, accessibilityIdentifier } from '@expo/ui/swift-ui/modifiers';
import { useThemeColor } from 'heroui-native/hooks';

import { space, type } from '../theme';

type Props = { open: boolean; onClose: () => void; title: string; body: string; close: string; testID: string };

export function ExpoExerciseSheet({ open, onClose, title, body, close, testID }: Props) {
  const [overlay, overlayForeground, muted] = useThemeColor(['overlay', 'overlay-foreground', 'muted']);
  return (
    <NativeSheet testID={testID} isPresented={open} onDismiss={onClose} containerColor={overlay}>
      <NativeColumn spacing={space.md}>
        <NativeText modifiers={[accessibilityAddTraits(['isHeader'])]} textStyle={{ color: overlayForeground, fontSize: type.title.fontSize, fontWeight: '700' }}>
          {title}
        </NativeText>
        <NativeText textStyle={{ color: muted, fontSize: type.body.fontSize }}>{body}</NativeText>
        <NativeButton label={close} variant="outlined" onPress={onClose} modifiers={[accessibilityIdentifier(`${testID}-close`)]} />
      </NativeColumn>
    </NativeSheet>
  );
}
