// Item 13: the raw third-party @gorhom/bottom-sheet, themed with Uniwind's
// documented mechanism for components the stack doesn't own: withUniwind.
// With no mapping argument, withUniwind turns every `*Style` prop into a
// `*ClassName` prop, so backgroundStyle -> backgroundClassName and
// handleIndicatorStyle -> handleIndicatorClassName resolve against the active
// theme's CSS variables. https://docs.uniwind.dev/api/with-uniwind
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Button } from 'heroui-native/button';
import type { RefObject } from 'react';
import { Text } from 'react-native';
import { withUniwind } from 'uniwind';

import { space, type } from '../theme';

const StyledBottomSheetModal = withUniwind(BottomSheetModal);
const StyledBottomSheetView = withUniwind(BottomSheetView);

type Props = { sheetRef: RefObject<BottomSheetModal<unknown> | null>; title: string; body: string; close: string; testID: string };

export function ExerciseSheet({ sheetRef, title, body, close, testID }: Props) {
  return (
    <StyledBottomSheetModal
      ref={sheetRef}
      backgroundClassName="bg-overlay"
      handleIndicatorClassName="bg-border"
      backdropComponent={(p) => <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />}>
      <StyledBottomSheetView testID={testID} style={{ padding: space.xl, gap: space.md, paddingBottom: space.xxl }}>
        <Text className="text-overlay-foreground" style={type.title}>
          {title}
        </Text>
        <Text className="text-muted" style={type.body}>
          {body}
        </Text>
        <Button testID={`${testID}-close`} variant="outline" onPress={() => sheetRef.current?.dismiss()}>
          {close}
        </Button>
      </StyledBottomSheetView>
    </StyledBottomSheetModal>
  );
}
