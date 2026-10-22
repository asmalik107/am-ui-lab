// Overlays: gluestack AlertDialog, Select (renders an Actionsheet on native)
// and Toast, plus the third-party @gorhom/bottom-sheet themed through Uniwind.
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useCallback, type RefObject } from 'react';
import { Text } from 'react-native';
import { withUniwind } from 'uniwind';

import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
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
