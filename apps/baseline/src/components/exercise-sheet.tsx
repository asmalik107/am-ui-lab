// Baseline overlay: the themed third-party sheet (@gorhom/bottom-sheet).
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { forwardRef } from 'react';
import { Text } from 'react-native';

import { useTheme } from '../theme';
import { Button } from './button';

// Third-party component themed from tokens: gorhom only takes style props,
// so every colour is passed in by hand.
export const ExerciseSheet = forwardRef<BottomSheetModal, { title: string; body: string; close: string; testID?: string }>(
  function ExerciseSheet({ title, body, close, testID }, ref) {
    const { theme } = useTheme();
    const c = theme.colors;
    return (
      <BottomSheetModal
        ref={ref}
        accessible={false}
        backgroundStyle={{ backgroundColor: c.surfaceRaised }}
        handleIndicatorStyle={{ backgroundColor: c.border }}
        backdropComponent={(p) => <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />}>
        <BottomSheetView testID={testID} aria-modal style={{ padding: theme.space.xl, gap: theme.space.md, paddingBottom: theme.space.xxl }}>
          <Text role="heading" style={[theme.type.title, { color: c.text }]}>
            {title}
          </Text>
          <Text style={[theme.type.body, { color: c.textMuted }]}>{body}</Text>
          <Button testID={`${testID}-close`} label={close} variant="secondary" onPress={() => (ref as React.RefObject<BottomSheetModal>).current?.dismiss()} />
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);
