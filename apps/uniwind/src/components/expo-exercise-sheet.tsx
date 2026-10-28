// The native @expo/ui sheet, themed from Uniwind.
import { Button as NativeButton, Column as NativeColumn, BottomSheet as NativeSheet, Text as NativeText } from '@expo/ui';
import { accessibilityAddTraits, accessibilityIdentifier } from '@expo/ui/swift-ui/modifiers';
import { useCSSVariable } from 'uniwind';

// @expo/ui's universal BottomSheet: a native SwiftUI sheet on iOS, filled
// with @expo/ui's own Column, Text and Button (React Native views inside it
// don't receive touches unless wrapped in RNHostView). containerColor and
// textStyle aren't style props, so the values come from the active theme via
// useCSSVariable, as for the @expo/ui Host. It returns string | number |
// undefined, so each value is narrowed.
// https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/bottomsheet/
// https://docs.uniwind.dev/api/use-css-variable
const str = (v: string | number | undefined) => (typeof v === 'string' ? v : undefined);
const num = (v: string | number | undefined) => (typeof v === 'number' ? v : undefined);

export function ExpoExerciseSheet({ open, onClose, title, body, close, testID }: { open: boolean; onClose: () => void; title: string; body: string; close: string; testID?: string }) {
  const [surface, text, muted, spacing, titleSize, bodySize] = useCSSVariable([
    '--color-surface-raised',
    '--color-text',
    '--color-text-muted',
    '--spacing',
    '--text-title',
    '--text-body',
  ]);
  // gap-3, as in the gorhom sheet: Tailwind's spacing scale is 3 × --spacing.
  const unit = num(spacing);
  return (
    <NativeSheet testID={testID} isPresented={open} onDismiss={onClose} containerColor={str(surface)}>
      <NativeColumn spacing={unit === undefined ? undefined : unit * 3}>
        <NativeText modifiers={[accessibilityAddTraits(['isHeader'])]} textStyle={{ color: str(text), fontSize: num(titleSize), fontWeight: '700' }}>
          {title}
        </NativeText>
        <NativeText textStyle={{ color: str(muted), fontSize: num(bodySize) }}>{body}</NativeText>
        <NativeButton label={close} variant="outlined" onPress={onClose} modifiers={[accessibilityIdentifier(`${testID}-close`)]} />
      </NativeColumn>
    </NativeSheet>
  );
}
