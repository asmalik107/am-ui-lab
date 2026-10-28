// Pieces RNR doesn't ship: the toast and the third-party bottom sheets.
import { Button as NativeButton, Column as NativeColumn, BottomSheet as NativeSheet, Text as NativeText } from '@expo/ui';
import { accessibilityAddTraits, accessibilityIdentifier } from '@expo/ui/swift-ui/modifiers';
import { useCSSVariable, useResolveClassNames } from 'uniwind';

import { type } from '@/lib/type';

// @expo/ui's universal BottomSheet: a native SwiftUI sheet on iOS, filled
// with @expo/ui's own Column, Text and Button (React Native views inside it
// don't receive touches unless wrapped in RNHostView). Its colours are plain
// props, so they come from useCSSVariable, as for the @expo/ui Host; the
// gap and font sizes are the gorhom sheet's classes, resolved with
// useResolveClassNames.
// https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/bottomsheet/
// https://docs.uniwind.dev/api/use-css-variable
// https://docs.uniwind.dev/api/use-resolve-class-names
type Resolved = { fontSize?: number; gap?: number };
const str = (v: string | number | undefined) => (v === undefined ? undefined : String(v));

export function ExpoExerciseSheet({ open, onClose, title, body, close, testID }: { open: boolean; onClose: () => void; title: string; body: string; close: string; testID?: string }) {
  const [card, foreground, muted] = useCSSVariable(['--color-card', '--color-foreground', '--color-muted-foreground']);
  const column = useResolveClassNames('gap-3') as Resolved;
  const titleSize = useResolveClassNames(type.title) as Resolved;
  const bodySize = useResolveClassNames(type.body) as Resolved;
  return (
    <NativeSheet testID={testID} isPresented={open} onDismiss={onClose} containerColor={str(card)}>
      <NativeColumn spacing={column.gap}>
        <NativeText modifiers={[accessibilityAddTraits(['isHeader'])]} textStyle={{ color: str(foreground), fontSize: titleSize.fontSize, fontWeight: '700' }}>
          {title}
        </NativeText>
        <NativeText textStyle={{ color: str(muted), fontSize: bodySize.fontSize }}>{body}</NativeText>
        <NativeButton label={close} variant="outlined" onPress={onClose} modifiers={[accessibilityIdentifier(`${testID}-close`)]} />
      </NativeColumn>
    </NativeSheet>
  );
}
