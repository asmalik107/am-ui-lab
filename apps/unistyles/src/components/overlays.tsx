// Overlays ported to Unistyles: dialog, select, toast and the themed
// third-party sheet. Accessibility is hand-written exactly as in the baseline.
import { Button as NativeButton, Column as NativeColumn, BottomSheet as NativeSheet, Text as NativeText } from '@expo/ui';
import { accessibilityAddTraits, accessibilityIdentifier } from '@expo/ui/swift-ui/modifiers';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { forwardRef, useEffect, useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { minTarget, space } from '@shared/tokens';

import { announce, useReduceMotion } from '../a11y';
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
// onRequestClose handles the Android back button. Modal itself is not
// processed by Unistyles (no native handle), but the Views inside it are.
export function Dialog({ open, title, body, confirm, cancel, onConfirm, onClose, testID }: DialogProps) {
  const reduceMotion = useReduceMotion();
  return (
    <Modal visible={open} transparent animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={onClose}>
      <View style={styles.scrim}>
        <View testID={testID} aria-modal role="alert" style={styles.card}>
          <Text role="heading" style={styles.title}>
            {title}
          </Text>
          <Text style={styles.body}>{body}</Text>
          <View style={styles.actions}>
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
    <View style={styles.selectWrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable testID={testID} role="combobox" aria-expanded={open} accessibilityLabel={`${label}, ${value}`} onPress={() => setOpen(true)} style={styles.trigger}>
        <Text style={styles.value}>{value}</Text>
        <Text importantForAccessibility="no" accessibilityElementsHidden style={styles.chevron}>
          ▾
        </Text>
      </Pressable>
      <Modal visible={open} transparent animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={() => setOpen(false)}>
        {/* The backdrop is a sibling of the list, not its parent: aria-modal inside
            an accessible Pressable did not hide the screen behind it from VoiceOver. */}
        <View style={styles.menuWrap}>
          <Pressable accessible={false} style={styles.backdrop} onPress={() => setOpen(false)} />
          <View aria-modal role="list" accessibilityLabel={label} style={styles.menu}>
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
                style={styles.option}>
                <Text style={styles.optionText(opt === value)}>{opt}</Text>
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
    <View testID={testID} role="alert" aria-live="polite" style={styles.toast}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}

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

// @expo/ui's universal BottomSheet: a native SwiftUI sheet on iOS, filled
// with @expo/ui's own Column, Text and Button (React Native views inside it
// don't receive touches unless wrapped in RNHostView). containerColor and
// textStyle are plain props, so withUnistyles maps them from the theme, the
// same way as gorhom's props above.
// https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/bottomsheet/
const ThemedNativeSheet = withUnistyles(NativeSheet, (theme) => ({ containerColor: theme.colors.surfaceRaised }));
const ThemedNativeText = withUnistyles(NativeText);

export function ExpoExerciseSheet({ open, onClose, title, body, close, testID }: { open: boolean; onClose: () => void; title: string; body: string; close: string; testID?: string }) {
  return (
    <ThemedNativeSheet testID={testID} isPresented={open} onDismiss={onClose}>
      <NativeColumn spacing={space.md}>
        <ThemedNativeText
          modifiers={[accessibilityAddTraits(['isHeader'])]}
          uniProps={(theme) => ({ textStyle: { color: theme.colors.text, fontSize: theme.type.title.fontSize, fontWeight: '700' } })}>
          {title}
        </ThemedNativeText>
        <ThemedNativeText uniProps={(theme) => ({ textStyle: { color: theme.colors.textMuted, fontSize: theme.type.body.fontSize } })}>{body}</ThemedNativeText>
        <NativeButton label={close} variant="outlined" onPress={onClose} modifiers={[accessibilityIdentifier(`${testID}-close`)]} />
      </NativeColumn>
    </ThemedNativeSheet>
  );
}

const styles = StyleSheet.create((theme) => ({
  scrim: { flex: 1, backgroundColor: theme.colors.scrim, justifyContent: 'center', padding: theme.space.xl },
  menuWrap: { flex: 1, justifyContent: 'center', padding: theme.space.xl },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: theme.colors.scrim },
  card: { backgroundColor: theme.colors.surfaceRaised, borderRadius: theme.radius.lg, padding: theme.space.xl, gap: theme.space.md },
  title: { ...theme.type.title, color: theme.colors.text },
  body: { ...theme.type.body, color: theme.colors.textMuted },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: theme.space.sm },
  selectWrap: { gap: theme.space.xs },
  label: { ...theme.type.label, color: theme.colors.text },
  trigger: {
    minHeight: target,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceRaised,
  },
  value: { ...theme.type.body, color: theme.colors.text },
  chevron: { color: theme.colors.textMuted },
  menu: { backgroundColor: theme.colors.surfaceRaised, borderRadius: theme.radius.lg, paddingVertical: theme.space.sm },
  option: { minHeight: target, paddingHorizontal: theme.space.lg, justifyContent: 'center' },
  optionText: (selected: boolean) => ({
    ...theme.type.body,
    color: selected ? theme.colors.primary : theme.colors.text,
    fontWeight: selected ? '700' : '400',
  }),
  toast: {
    position: 'absolute',
    left: theme.space.lg,
    right: theme.space.lg,
    bottom: theme.space.xxl,
    backgroundColor: theme.colors.text,
    borderRadius: theme.radius.md,
    padding: theme.space.lg,
  },
  toastText: { ...theme.type.body, color: theme.colors.background },
  sheet: { padding: theme.space.xl, gap: theme.space.md, paddingBottom: theme.space.xxl },
}));
