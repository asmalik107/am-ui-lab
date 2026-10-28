// The themed third-party (@gorhom) sheet, the baseline's, restyled with NativeWind. Accessibility props are unchanged from baseline.
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { styled } from 'nativewind';
import { forwardRef } from 'react';
import { Text } from 'react-native';

import { Button } from './button';

// Third-party component themed from tokens. gorhom's backgroundStyle and
// handleIndicatorStyle are extra style props, so styled() maps a className
// prop onto each one; BottomSheetView only takes `style`, so its className is
// mapped to that. https://www.nativewind.dev/v5/guides/third-party-components
const ThemedBottomSheetModal = styled(BottomSheetModal<never>, {
  backgroundClassName: 'backgroundStyle',
  handleIndicatorClassName: 'handleIndicatorStyle',
});
const SheetView = styled(BottomSheetView, { className: 'style' });

export const ExerciseSheet = forwardRef<BottomSheetModal, { title: string; body: string; close: string; testID?: string }>(
  function ExerciseSheet({ title, body, close, testID }, ref) {
    return (
      <ThemedBottomSheetModal
        ref={ref}
        accessible={false}
        backgroundClassName="bg-surface-raised"
        handleIndicatorClassName="bg-border"
        backdropComponent={(p) => <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />}>
        <SheetView testID={testID} aria-modal className="gap-md p-xl pb-xxl">
          <Text role="heading" className="text-title text-text">
            {title}
          </Text>
          <Text className="text-body text-text-muted">{body}</Text>
          <Button testID={`${testID}-close`} label={close} variant="secondary" onPress={() => (ref as React.RefObject<BottomSheetModal>).current?.dismiss()} />
        </SheetView>
      </ThemedBottomSheetModal>
    );
  },
);
