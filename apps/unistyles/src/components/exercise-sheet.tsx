// Baseline overlay ported to Unistyles: the themed third-party sheet (@gorhom/bottom-sheet).
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { forwardRef } from 'react';
import { Text, View } from 'react-native';
import { withUnistyles } from 'react-native-unistyles';

import { Button } from './button';
import { styles } from './styles';

// Third-party component themed from Unistyles. @gorhom/bottom-sheet's
// backgroundStyle / handleIndicatorStyle are not the `style` prop, so the
// Babel plugin can't bind them to the shadow tree. The docs' decision
// algorithm for 3rd-party views puts withUnistyles before useUnistyles:
// it maps theme values to props and re-renders only this wrapper when the
// theme changes. https://www.unistyl.es/v3/references/3rd-party-views
// `<never>` pins gorhom's generic (its default) so the ref type matches.
const ThemedBottomSheetModal = withUnistyles(BottomSheetModal<never>, (theme) => ({
  backgroundStyle: { backgroundColor: theme.colors.surfaceRaised },
  handleIndicatorStyle: { backgroundColor: theme.colors.border },
}));

export const ExerciseSheet = forwardRef<BottomSheetModal, { title: string; body: string; close: string; testID?: string }>(
  function ExerciseSheet({ title, body, close, testID }, ref) {
    return (
      <ThemedBottomSheetModal
        ref={ref}
        accessible={false}
        backdropComponent={(p) => <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />}>
        {/* BottomSheetView's own style isn't themed; the RN View inside it
            carries the Unistyles styles so the plugin can bind them. */}
        <BottomSheetView testID={testID} aria-modal>
          <View style={styles.sheet}>
            <Text role="heading" style={styles.title}>
              {title}
            </Text>
            <Text style={styles.body}>{body}</Text>
            <Button testID={`${testID}-close`} label={close} variant="secondary" onPress={() => (ref as React.RefObject<BottomSheetModal>).current?.dismiss()} />
          </View>
        </BottomSheetView>
      </ThemedBottomSheetModal>
    );
  },
);
