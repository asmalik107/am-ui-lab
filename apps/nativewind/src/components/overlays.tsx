// Baseline overlays restyled with NativeWind: dialog, select, toast and the
// themed third-party sheet. Accessibility props are unchanged from baseline.
import { Button as NativeButton, Column as NativeColumn, BottomSheet as NativeSheet, Text as NativeText } from '@expo/ui';
import { accessibilityAddTraits, accessibilityIdentifier } from '@expo/ui/swift-ui/modifiers';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { styled } from 'nativewind';
import { forwardRef, useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { announce, useReduceMotion } from '../a11y';
import { Button } from './controls';

type DialogProps = {
  open: boolean;
  title: string;
  body: string;
  confirm: string;
  cancel: string;
  onConfirm: () => void;
  onClose: () => void;
  testID?: string;
};

// RN Modal presents a separate native window, so screen-reader focus can't
// leave it. aria-modal (iOS) is added on the card as well, and
// onRequestClose handles the Android back button.
export function Dialog({ open, title, body, confirm, cancel, onConfirm, onClose, testID }: DialogProps) {
  const reduceMotion = useReduceMotion();
  return (
    <Modal visible={open} transparent animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={onClose}>
      <View className="flex-1 justify-center bg-scrim p-xl">
        <View testID={testID} aria-modal role="alert" className="gap-md rounded-lg bg-surface-raised p-xl">
          <Text role="heading" className="text-title text-text">
            {title}
          </Text>
          <Text className="text-body text-text-muted">{body}</Text>
          <View className="flex-row justify-end gap-sm">
            <Button testID={`${testID}-cancel`} label={cancel} variant="secondary" onPress={onClose} />
            <Button testID={`${testID}-confirm`} label={confirm} variant="danger" onPress={onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

type SelectProps = { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string };

// A trigger with role="combobox" + aria-expanded that opens a modal list of radios.
export function Select({ label, options, value, onChange, testID }: SelectProps) {
  const reduceMotion = useReduceMotion();
  const [open, setOpen] = useState(false);
  return (
    <View className="gap-xs">
      <Text className="text-label text-text">{label}</Text>
      <Pressable
        testID={testID}
        role="combobox"
        aria-expanded={open}
        accessibilityLabel={`${label}, ${value}`}
        onPress={() => setOpen(true)}
        className="min-h-target flex-row items-center justify-between rounded-md border border-border bg-surface-raised px-md">
        <Text className="text-body text-text">{value}</Text>
        <Text importantForAccessibility="no" accessibilityElementsHidden className="text-text-muted">
          ▾
        </Text>
      </Pressable>
      <Modal visible={open} transparent animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={() => setOpen(false)}>
        {/* The backdrop is a sibling of the list, not its parent: aria-modal inside
            an accessible Pressable did not hide the screen behind it from VoiceOver. */}
        <View className="flex-1 justify-center p-xl">
          <Pressable accessible={false} className="absolute inset-0 bg-scrim" onPress={() => setOpen(false)} />
          <View aria-modal role="list" accessibilityLabel={label} className="rounded-lg bg-surface-raised py-sm">
            {options.map((opt, i) => (
              <Pressable
                key={opt}
                testID={`${testID}-option-${i}`}
                role="radio"
                aria-checked={opt === value}
                accessibilityLabel={opt}
                onPress={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className="min-h-target justify-center px-lg">
                <Text className={`text-body ${opt === value ? 'font-bold text-primary' : 'font-normal text-text'}`}>{opt}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Android reads it through the live region; iOS gets an explicit announcement.
export function Toast({ message, visible, onHide, testID }: { message: string; visible: boolean; onHide: () => void; testID?: string }) {
  useEffect(() => {
    if (!visible) return;
    announce(message);
    const t = setTimeout(onHide, 4000);
    return () => clearTimeout(t);
  }, [visible, message, onHide]);
  if (!visible) return null;
  return (
    <View testID={testID} role="alert" aria-live="polite" className="absolute bottom-xxl left-lg right-lg rounded-md bg-text p-lg">
      <Text className="text-body text-background">{message}</Text>
    </View>
  );
}

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
