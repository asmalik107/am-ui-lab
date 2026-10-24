// Pieces RNR doesn't ship: the toast and the third-party bottom sheets.
import { Button as NativeButton, Column as NativeColumn, BottomSheet as NativeSheet, Text as NativeText } from '@expo/ui';
import { accessibilityAddTraits, accessibilityIdentifier } from '@expo/ui/swift-ui/modifiers';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useEffect, type RefObject } from 'react';
import { View } from 'react-native';
import { useCSSVariable, useResolveClassNames, withUniwind } from 'uniwind';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { announce } from '@/a11y';
import { type } from '@/lib/type';
import { cn } from '@/lib/utils';

// Uniwind's documented route for components it doesn't own: withUniwind.
// Auto-mapping turns every `*Style` prop into a `*ClassName` prop, so
// backgroundStyle -> backgroundClassName and handleIndicatorStyle ->
// handleIndicatorClassName, resolved against the active theme's variables.
// https://docs.uniwind.dev/api/with-uniwind#automatic-prop-mapping
const StyledBottomSheetModal = withUniwind(BottomSheetModal);
const StyledBottomSheetView = withUniwind(BottomSheetView);
// withUniwind infers BottomSheetModal's generic as `unknown` (its default is
// `never`), so the ref has to be typed BottomSheetModal<unknown>.

type SheetProps = { sheetRef: RefObject<BottomSheetModal<unknown> | null>; title: string; body: string; close: string; testID?: string };

export function ExerciseSheet({ sheetRef, title, body, close, testID }: SheetProps) {
  return (
    <StyledBottomSheetModal
      ref={sheetRef}
      accessible={false}
      backgroundClassName="bg-card"
      handleIndicatorClassName="bg-border"
      backdropComponent={(p) => <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />}>
      {/* aria-modal copied from the baseline: gorhom doesn't set it and RNR has no sheet. */}
      <StyledBottomSheetView testID={testID} aria-modal className="gap-3 p-6 pb-8">
        <Text variant="h4" className={type.title}>
          {title}
        </Text>
        <Text className={cn(type.body, 'text-muted-foreground')}>{body}</Text>
        <Button testID={`${testID}-close`} variant="outline" onPress={() => sheetRef.current?.dismiss()}>
          <Text>{close}</Text>
        </Button>
      </StyledBottomSheetView>
    </StyledBottomSheetModal>
  );
}

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

// Hand-built: RNR has no toast. Uniwind classes on RN primitives, with the
// same announcement logic as the baseline (Android live region, iOS
// announceForAccessibility).
export function Toast({ message, visible, onHide, testID }: { message: string; visible: boolean; onHide: () => void; testID?: string }) {
  useEffect(() => {
    if (!visible) return;
    announce(message);
    const t = setTimeout(onHide, 4000);
    return () => clearTimeout(t);
  }, [visible, message, onHide]);
  if (!visible) return null;
  return (
    <View testID={testID} role="alert" aria-live="polite" className="bg-foreground absolute bottom-8 left-4 right-4 rounded-md p-4">
      <Text className={cn(type.body, 'text-background')}>{message}</Text>
    </View>
  );
}
