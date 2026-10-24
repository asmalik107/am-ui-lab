// Overlays ported to Uniwind: dialog, select, toast and the themed
// third-party sheet. Accessibility is hand-written exactly as in the baseline.
import { Button as NativeButton, Column as NativeColumn, BottomSheet as NativeSheet, Text as NativeText } from '@expo/ui';
import { accessibilityAddTraits, accessibilityIdentifier } from '@expo/ui/swift-ui/modifiers';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { forwardRef, useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useCSSVariable, withUniwind } from 'uniwind';

import { announce, useReduceMotion } from '../a11y';
import { Button } from './controls';

// Minimum target: 44 pt iOS / 48 dp Android (shared/tokens minTarget).
const targetH = 'ios:min-h-11 android:min-h-12';

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
      <View className="flex-1 justify-center bg-scrim p-6">
        <View testID={testID} aria-modal role="alert" className="gap-3 rounded-lg bg-surface-raised p-6">
          <Text role="heading" className="text-title font-bold text-text">
            {title}
          </Text>
          <Text className="text-body text-text-muted">{body}</Text>
          <View className="flex-row justify-end gap-2">
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
    <View className="gap-1">
      <Text className="text-label font-semibold text-text">{label}</Text>
      <Pressable
        testID={testID}
        role="combobox"
        aria-expanded={open}
        accessibilityLabel={`${label}, ${value}`}
        onPress={() => setOpen(true)}
        className={`${targetH} flex-row items-center justify-between rounded-md border border-border bg-surface-raised px-3`}>
        <Text className="text-body text-text">{value}</Text>
        <Text importantForAccessibility="no" accessibilityElementsHidden className="text-text-muted">
          ▾
        </Text>
      </Pressable>
      <Modal visible={open} transparent animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={() => setOpen(false)}>
        {/* The backdrop is a sibling of the list, not its parent: aria-modal inside
            an accessible Pressable did not hide the screen behind it from VoiceOver. */}
        <View className="flex-1 justify-center p-6">
          <Pressable accessible={false} className="absolute inset-0 bg-scrim" onPress={() => setOpen(false)} />
          <View aria-modal role="list" accessibilityLabel={label} className="rounded-lg bg-surface-raised py-2">
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
                className={`${targetH} justify-center px-4`}>
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
    <View testID={testID} role="alert" aria-live="polite" className="absolute bottom-8 left-4 right-4 rounded-md bg-text p-4">
      <Text className="text-body text-background">{message}</Text>
    </View>
  );
}

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

// @expo/ui's universal BottomSheet: a native SwiftUI sheet on iOS, filled
// with @expo/ui's own Column, Text and Button (React Native views inside it
// don't receive touches unless wrapped in RNHostView). containerColor and
// textStyle aren't style props, so the values come from the active theme via
// useCSSVariable, as for the @expo/ui Host. It returns string | number |
// undefined, so each value is narrowed.
// https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/bottomsheet/
// https://docs.uniwind.dev/api/use-css-variable
const str = (v: string | number | undefined) => (typeof v === 'string' ? v : undefined);
const num = (v: string | number | undefined) => (typeof v === 'number' ? v : undefined);

export function ExpoExerciseSheet({ open, onClose, title, body, close, testID }: { open: boolean; onClose: () => void; title: string; body: string; close: string; testID?: string }) {
  const [surface, text, muted, spacing, titleSize, bodySize] = useCSSVariable([
    '--color-surface-raised',
    '--color-text',
    '--color-text-muted',
    '--spacing',
    '--text-title',
    '--text-body',
  ]);
  // gap-3, as in the gorhom sheet: Tailwind's spacing scale is 3 × --spacing.
  const unit = num(spacing);
  return (
    <NativeSheet testID={testID} isPresented={open} onDismiss={onClose} containerColor={str(surface)}>
      <NativeColumn spacing={unit === undefined ? undefined : unit * 3}>
        <NativeText modifiers={[accessibilityAddTraits(['isHeader'])]} textStyle={{ color: str(text), fontSize: num(titleSize), fontWeight: '700' }}>
          {title}
        </NativeText>
        <NativeText textStyle={{ color: str(muted), fontSize: num(bodySize) }}>{body}</NativeText>
        <NativeButton label={close} variant="outlined" onPress={onClose} modifiers={[accessibilityIdentifier(`${testID}-close`)]} />
      </NativeColumn>
    </NativeSheet>
  );
}
