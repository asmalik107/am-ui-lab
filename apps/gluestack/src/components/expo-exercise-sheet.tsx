import { Button as NativeButton, Column as NativeColumn, BottomSheet as NativeSheet, Text as NativeText } from '@expo/ui';
import { accessibilityAddTraits, accessibilityIdentifier } from '@expo/ui/swift-ui/modifiers';
import { useResolveClassNames } from 'uniwind';

import { useTokenColor } from '../theme';

// @expo/ui's universal BottomSheet: a native SwiftUI sheet on iOS, filled
// with @expo/ui's own Column, Text and Button (React Native views inside it
// don't receive touches unless wrapped in RNHostView). Its colours and sizes
// are plain props, so they come from the same classes as the gorhom sheet,
// resolved with Uniwind's useResolveClassNames (useTokenColor for the
// background, as for the @expo/ui Host).
// https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/bottomsheet/
// https://docs.uniwind.dev/api/use-resolve-class-names
type Resolved = { color?: string; fontSize?: number; gap?: number };

export function ExpoExerciseSheet({ open, onClose, title, body, close, testID }: { open: boolean; onClose: () => void; title: string; body: string; close: string; testID?: string }) {
  const card = useTokenColor('card');
  const column = useResolveClassNames('gap-md') as Resolved;
  const heading = useResolveClassNames('text-title text-foreground') as Resolved;
  const text = useResolveClassNames('text-body text-muted-foreground') as Resolved;
  return (
    <NativeSheet testID={testID} isPresented={open} onDismiss={onClose} containerColor={card}>
      <NativeColumn spacing={column.gap}>
        <NativeText modifiers={[accessibilityAddTraits(['isHeader'])]} textStyle={{ color: heading.color, fontSize: heading.fontSize, fontWeight: '700' }}>
          {title}
        </NativeText>
        <NativeText textStyle={{ color: text.color, fontSize: text.fontSize }}>{body}</NativeText>
        <NativeButton label={close} variant="outlined" onPress={onClose} modifiers={[accessibilityIdentifier(`${testID}-close`)]} />
      </NativeColumn>
    </NativeSheet>
  );
}
