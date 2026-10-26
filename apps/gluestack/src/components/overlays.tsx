// Overlays: gluestack AlertDialog, Select (renders an Actionsheet on native)
// and Toast, plus the third-party @gorhom/bottom-sheet themed through Uniwind.
import { Button as NativeButton, Column as NativeColumn, BottomSheet as NativeSheet, Text as NativeText } from '@expo/ui';
import { accessibilityAddTraits, accessibilityIdentifier } from '@expo/ui/swift-ui/modifiers';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useCallback, type RefObject } from 'react';
import { Text } from 'react-native';
import { useResolveClassNames, withUniwind } from 'uniwind';

import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import {
  BottomSheet as GluestackBottomSheet,
  BottomSheetBackdrop as GluestackSheetBackdrop,
  BottomSheetContent,
  BottomSheetDragIndicator,
  BottomSheetPortal,
  type BottomSheetRef,
} from '@/components/ui/bottomsheet';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { ChevronDownIcon } from '@/components/ui/icon';
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from '@/components/ui/select';
import { Toast, ToastTitle, useToast } from '@/components/ui/toast';

import { useTokenColor } from '../theme';
import { AppButton } from './controls';

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

// AlertDialogContent sets aria-modal + accessibilityViewIsModal itself.
export function Dialog({ open, title, body, confirm, cancel, onConfirm, onClose, testID }: DialogProps) {
  return (
    <AlertDialog isOpen={open} onClose={onClose}>
      <AlertDialogBackdrop />
      <AlertDialogContent testID={testID} className="bg-card rounded-lg p-xl gap-md">
        <AlertDialogHeader>
          <Heading className="text-title text-foreground">{title}</Heading>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Text className="text-body text-muted-foreground">{body}</Text>
        </AlertDialogBody>
        <AlertDialogFooter className="gap-sm">
          <AppButton testID={`${testID}-cancel`} label={cancel} variant="secondary" onPress={onClose} />
          <AppButton testID={`${testID}-confirm`} label={confirm} variant="danger" onPress={onConfirm} />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type SelectProps = { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string };

// gluestack Select = trigger + Actionsheet of SelectItems.
export function RestSelect({ label, options, value, onChange, testID }: SelectProps) {
  return (
    <FormControl>
      <FormControlLabel>
        <FormControlLabelText className="text-label text-foreground">{label}</FormControlLabelText>
      </FormControlLabel>
      <Select selectedValue={value} initialLabel={value} onValueChange={onChange}>
        <SelectTrigger testID={testID} className="bg-card">
          <SelectInput className="text-body text-foreground" />
          <SelectIcon className="mr-md" as={ChevronDownIcon} />
        </SelectTrigger>
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent className="bg-card">
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            {options.map((opt, i) => (
              <SelectItem key={opt} testID={`${testID}-option-${i}`} label={opt} value={opt} />
            ))}
          </SelectContent>
        </SelectPortal>
      </Select>
    </FormControl>
  );
}

// Toast via gluestack's useToast. ToastTitle itself calls
// AccessibilityInfo.announceForAccessibility and sets role="alert".
export function useLogSetToast(message: string, testID: string) {
  const toast = useToast();
  return useCallback(() => {
    toast.show({
      placement: 'bottom',
      duration: 4000,
      render: ({ id }) => (
        <Toast nativeID={`toast-${id}`} testID={testID} action="muted" variant="solid">
          <ToastTitle className="text-body text-popover-foreground">{message}</ToastTitle>
        </Toast>
      ),
    });
  }, [toast, message, testID]);
}

// Third-party component themed with the gluestack/Uniwind tokens. Uniwind's
// documented way to style components it doesn't own is withUniwind: every
// `*Style` prop gets a matching `*ClassName` prop (backgroundStyle ->
// backgroundClassName, handleIndicatorStyle -> handleIndicatorClassName).
// https://docs.uniwind.dev/api/with-uniwind
// The instantiation expression pins gorhom's generic (T = never); without it
// withUniwind infers T = unknown and the ref type no longer matches.
const StyledBottomSheetModal = withUniwind(BottomSheetModal<never>);
const StyledBottomSheetView = withUniwind(BottomSheetView);

type SheetProps = { sheetRef: RefObject<BottomSheetModal | null>; title: string; body: string; close: string; testID?: string };

// accessible={false} and aria-modal are copied from the baseline so the
// third-party sheet behaves identically in every app; they are not gluestack's.
export function ExerciseSheet({ sheetRef, title, body, close, testID }: SheetProps) {
  return (
    <StyledBottomSheetModal
      ref={sheetRef}
      accessible={false}
      backgroundClassName="bg-card"
      handleIndicatorClassName="bg-border"
      backdropComponent={(p) => <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />}>
      <StyledBottomSheetView testID={testID} aria-modal className="p-xl gap-md pb-xxl">
        <Heading className="text-title text-foreground">{title}</Heading>
        <Text className="text-body text-muted-foreground">{body}</Text>
        <AppButton testID={`${testID}-close`} label={close} variant="secondary" onPress={() => sheetRef.current?.dismiss()} />
      </StyledBottomSheetView>
    </StyledBottomSheetModal>
  );
}

// gluestack's own BottomSheet (`npx gluestack-ui add bottomsheet`), built as
// its docs show: BottomSheet > BottomSheetPortal (backdrop, drag indicator) >
// BottomSheetContent. It wraps @gorhom/bottom-sheet's BottomSheet in
// gluestack's Overlay and colours it from the theme (bg-background), so no
// colours are passed in. It is opened and closed through its documented ref
// (open/close) from the app's own button, like the other sheets, and has no
// accessibility props added by hand.
// https://gluestack.io/ui/docs/components/bottomsheet
export function GluestackSheet({ sheetRef, title, body, close, testID }: { sheetRef: RefObject<BottomSheetRef | null>; title: string; body: string; close: string; testID?: string }) {
  return (
    <GluestackBottomSheet ref={sheetRef}>
      <BottomSheetPortal snapPoints={['40%']} backdropComponent={GluestackSheetBackdrop} handleComponent={BottomSheetDragIndicator}>
        <BottomSheetContent testID={testID} className="p-xl gap-md pb-xxl">
          <Heading className="text-title text-foreground">{title}</Heading>
          <Text className="text-body text-muted-foreground">{body}</Text>
          <AppButton testID={`${testID}-close`} label={close} variant="secondary" onPress={() => sheetRef.current?.close()} />
        </BottomSheetContent>
      </BottomSheetPortal>
    </GluestackBottomSheet>
  );
}

// @expo/ui's universal BottomSheet: a native SwiftUI sheet on iOS, filled
// with @expo/ui's own Column, Text and Button (React Native views inside it
// don't receive touches unless wrapped in RNHostView). Its colours and sizes
// are plain props, so they come from the same classes as the gorhom sheet,
// resolved with Uniwind's useResolveClassNames (useTokenColor for the
// background, as for the @expo/ui Host).
// https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/bottomsheet/
// https://docs.uniwind.dev/api/use-resolve-class-names
type Resolved = { color?: string; fontSize?: number; gap?: number };

export function ExpoExerciseSheet({ open, onClose, title, body, close, testID }: { open: boolean; onClose: () => void; title: string; body: string; close: string; testID?: string }) {
  const card = useTokenColor('card');
  const column = useResolveClassNames('gap-md') as Resolved;
  const heading = useResolveClassNames('text-title text-foreground') as Resolved;
  const text = useResolveClassNames('text-body text-muted-foreground') as Resolved;
  return (
    <NativeSheet testID={testID} isPresented={open} onDismiss={onClose} containerColor={card}>
      <NativeColumn spacing={column.gap}>
        <NativeText modifiers={[accessibilityAddTraits(['isHeader'])]} textStyle={{ color: heading.color, fontSize: heading.fontSize, fontWeight: '700' }}>
          {title}
        </NativeText>
        <NativeText textStyle={{ color: text.color, fontSize: text.fontSize }}>{body}</NativeText>
        <NativeButton label={close} variant="outlined" onPress={onClose} modifiers={[accessibilityIdentifier(`${testID}-close`)]} />
      </NativeColumn>
    </NativeSheet>
  );
}
