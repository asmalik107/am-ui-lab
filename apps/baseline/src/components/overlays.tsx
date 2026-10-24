// Baseline overlays: dialog, select, toast and the themed third-party sheet.
import { Button as NativeButton, Column as NativeColumn, BottomSheet as NativeSheet, Text as NativeText } from '@expo/ui';
import { accessibilityAddTraits, accessibilityIdentifier } from '@expo/ui/swift-ui/modifiers';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { forwardRef, useEffect, useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';

import { minTarget } from '@shared/tokens';

import { announce, useReduceMotion } from '../a11y';
import { useTheme } from '../theme';
import { Button } from './controls';

const target = Platform.OS === 'ios' ? minTarget.ios : minTarget.android;

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
  const { theme } = useTheme();
  const c = theme.colors;
  const reduceMotion = useReduceMotion();
  return (
    <Modal visible={open} transparent animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: c.scrim, justifyContent: 'center', padding: theme.space.xl }}>
        <View
          testID={testID}
          aria-modal
          role="alert"
          style={{ backgroundColor: c.surfaceRaised, borderRadius: theme.radius.lg, padding: theme.space.xl, gap: theme.space.md }}>
          <Text role="heading" style={[theme.type.title, { color: c.text }]}>
            {title}
          </Text>
          <Text style={[theme.type.body, { color: c.textMuted }]}>{body}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: theme.space.sm }}>
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
  const { theme } = useTheme();
  const c = theme.colors;
  const reduceMotion = useReduceMotion();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: theme.space.xs }}>
      <Text style={[theme.type.label, { color: c.text }]}>{label}</Text>
      <Pressable
        testID={testID}
        role="combobox"
        aria-expanded={open}
        accessibilityLabel={`${label}, ${value}`}
        onPress={() => setOpen(true)}
        style={{ minHeight: target, borderWidth: 1, borderColor: c.border, borderRadius: theme.radius.md, paddingHorizontal: theme.space.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.surfaceRaised }}>
        <Text style={[theme.type.body, { color: c.text }]}>{value}</Text>
        <Text importantForAccessibility="no" accessibilityElementsHidden style={{ color: c.textMuted }}>
          ▾
        </Text>
      </Pressable>
      <Modal visible={open} transparent animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={() => setOpen(false)}>
        {/* The backdrop is a sibling of the list, not its parent: aria-modal inside
            an accessible Pressable did not hide the screen behind it from VoiceOver. */}
        <View style={{ flex: 1, justifyContent: 'center', padding: theme.space.xl }}>
          <Pressable accessible={false} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: c.scrim }} onPress={() => setOpen(false)} />
          <View aria-modal role="list" accessibilityLabel={label} style={{ backgroundColor: c.surfaceRaised, borderRadius: theme.radius.lg, paddingVertical: theme.space.sm }}>
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
                style={{ minHeight: target, paddingHorizontal: theme.space.lg, justifyContent: 'center' }}>
                <Text style={[theme.type.body, { color: opt === value ? c.primary : c.text, fontWeight: opt === value ? '700' : '400' }]}>{opt}</Text>
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
  const { theme } = useTheme();
  useEffect(() => {
    if (!visible) return;
    announce(message);
    const t = setTimeout(onHide, 4000);
    return () => clearTimeout(t);
  }, [visible, message, onHide]);
  if (!visible) return null;
  return (
    <View
      testID={testID}
      role="alert"
      aria-live="polite"
      style={{ position: 'absolute', left: theme.space.lg, right: theme.space.lg, bottom: theme.space.xxl, backgroundColor: theme.colors.text, borderRadius: theme.radius.md, padding: theme.space.lg }}>
      <Text style={[theme.type.body, { color: theme.colors.background }]}>{message}</Text>
    </View>
  );
}

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

// @expo/ui's universal BottomSheet: a native SwiftUI sheet on iOS. Built the
// way Expo's docs show, from @expo/ui's own Column, Text and Button: React
// Native views inside a sheet don't receive touches unless wrapped in
// RNHostView (see RNHostView.tsx in @expo/ui).
// https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/bottomsheet/
export function ExpoExerciseSheet({ open, onClose, title, body, close, testID }: { open: boolean; onClose: () => void; title: string; body: string; close: string; testID?: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <NativeSheet testID={testID} isPresented={open} onDismiss={onClose} containerColor={c.surfaceRaised}>
      <NativeColumn spacing={theme.space.md}>
        <NativeText modifiers={[accessibilityAddTraits(['isHeader'])]} textStyle={{ color: c.text, fontSize: theme.type.title.fontSize, fontWeight: '700' }}>
          {title}
        </NativeText>
        <NativeText textStyle={{ color: c.textMuted, fontSize: theme.type.body.fontSize }}>{body}</NativeText>
        <NativeButton label={close} variant="outlined" onPress={onClose} modifiers={[accessibilityIdentifier(`${testID}-close`)]} />
      </NativeColumn>
    </NativeSheet>
  );
}
