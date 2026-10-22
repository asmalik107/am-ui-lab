// Pieces RNR doesn't ship: the toast and the third-party bottom sheet.
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useEffect, type RefObject } from 'react';
import { View } from 'react-native';
import { withUniwind } from 'uniwind';

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
