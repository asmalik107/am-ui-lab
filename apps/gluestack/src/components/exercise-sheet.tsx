import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { type RefObject } from 'react';
import { Text } from 'react-native';
import { withUniwind } from 'uniwind';

import { Heading } from '@/components/ui/heading';

import { Button } from './button';

// Third-party component themed with the gluestack/Uniwind tokens. Uniwind's
// documented way to style components it doesn't own is withUniwind: every
// `*Style` prop gets a matching `*ClassName` prop (backgroundStyle ->
// backgroundClassName, handleIndicatorStyle -> handleIndicatorClassName).
// https://docs.uniwind.dev/api/with-uniwind
// The instantiation expression pins gorhom's generic (T = never); without it
// withUniwind infers T = unknown and the ref type no longer matches.
const StyledBottomSheetModal = withUniwind(BottomSheetModal<never>);
const StyledBottomSheetView = withUniwind(BottomSheetView);

type SheetProps = { sheetRef: RefObject<BottomSheetModal | null>; title: string; body: string; close: string; testID?: string };

// accessible={false} and aria-modal are copied from the baseline so the
// third-party sheet behaves identically in every app; they are not gluestack's.
export function ExerciseSheet({ sheetRef, title, body, close, testID }: SheetProps) {
  return (
    <StyledBottomSheetModal
      ref={sheetRef}
      accessible={false}
      backgroundClassName="bg-card"
      handleIndicatorClassName="bg-border"
      backdropComponent={(p) => <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />}>
      <StyledBottomSheetView testID={testID} aria-modal className="p-xl gap-md pb-xxl">
        <Heading className="text-title text-foreground">{title}</Heading>
        <Text className="text-body text-muted-foreground">{body}</Text>
        <Button testID={`${testID}-close`} label={close} variant="secondary" onPress={() => sheetRef.current?.dismiss()} />
      </StyledBottomSheetView>
    </StyledBottomSheetModal>
  );
}
