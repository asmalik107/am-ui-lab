// The native @expo/ui sheet, themed with NativeWind.
import { Button as NativeButton, Column as NativeColumn, BottomSheet as NativeSheet, Text as NativeText } from '@expo/ui';
import { accessibilityAddTraits, accessibilityIdentifier } from '@expo/ui/swift-ui/modifiers';
import { styled } from 'nativewind';

// @expo/ui's universal BottomSheet: a native SwiftUI sheet on iOS, filled
// with @expo/ui's own Column, Text and Button (React Native views inside it
// don't receive touches unless wrapped in RNHostView). Its colours and sizes
// are plain props, so styled() sends className values to them: one value to
// a plain prop (backgroundColor -> containerColor, gap -> spacing), or the
// whole resolved text style to Text's textStyle.
// https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/bottomsheet/
// https://www.nativewind.dev/v5/api/styled
const StyledNativeSheet = styled(NativeSheet, {
  className: { target: false, nativeStyleMapping: { backgroundColor: 'containerColor' } },
});
const StyledNativeColumn = styled(NativeColumn, {
  className: { target: false, nativeStyleMapping: { gap: 'spacing' } },
});
const StyledNativeText = styled(NativeText, { className: 'textStyle' });

export function ExpoExerciseSheet({ open, onClose, title, body, close, testID }: { open: boolean; onClose: () => void; title: string; body: string; close: string; testID?: string }) {
  return (
    <StyledNativeSheet testID={testID} isPresented={open} onDismiss={onClose} className="bg-surface-raised">
      <StyledNativeColumn className="gap-md">
        <StyledNativeText modifiers={[accessibilityAddTraits(['isHeader'])]} className="text-title font-bold text-text">
          {title}
        </StyledNativeText>
        <StyledNativeText className="text-body text-text-muted">{body}</StyledNativeText>
        <NativeButton label={close} variant="outlined" onPress={onClose} modifiers={[accessibilityIdentifier(`${testID}-close`)]} />
      </StyledNativeColumn>
    </StyledNativeSheet>
  );
}
