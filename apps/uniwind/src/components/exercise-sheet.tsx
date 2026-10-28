// The themed third-party (@gorhom) sheet, ported from the baseline to Uniwind.
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { forwardRef } from 'react';
import { Text } from 'react-native';
import { withUniwind } from 'uniwind';

import { Button } from './button';

// Third-party component themed from Uniwind. gorhom's backgroundStyle /
// handleIndicatorStyle are not `style`, and gorhom isn't one of the RN
// components Uniwind patches, so it goes through withUniwind. With no mapping
// argument, every `*Style` prop gets a `*ClassName` twin resolved against
// the active theme. https://docs.uniwind.dev/api/with-uniwind
const ThemedBottomSheetModal = withUniwind(BottomSheetModal);
const ThemedBottomSheetView = withUniwind(BottomSheetView);

export const ExerciseSheet = forwardRef<BottomSheetModal<unknown>, { title: string; body: string; close: string; testID?: string }>(
  function ExerciseSheet({ title, body, close, testID }, ref) {
    return (
      <ThemedBottomSheetModal
        ref={ref}
        accessible={false}
        backgroundClassName="bg-surface-raised"
        handleIndicatorClassName="bg-border"
        backdropComponent={(p) => <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />}>
        <ThemedBottomSheetView testID={testID} aria-modal className="gap-3 p-6 pb-8">
          <Text role="heading" className="text-title font-bold text-text">
            {title}
          </Text>
          <Text className="text-body text-text-muted">{body}</Text>
          <Button testID={`${testID}-close`} label={close} variant="secondary" onPress={() => (ref as React.RefObject<BottomSheetModal<unknown>>).current?.dismiss()} />
        </ThemedBottomSheetView>
      </ThemedBottomSheetModal>
    );
  },
);
