// Overlays: gluestack AlertDialog, Select (renders an Actionsheet on native)
// and Toast, plus the third-party @gorhom/bottom-sheet themed through Uniwind.
import { Text } from 'react-native';

import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { Heading } from '@/components/ui/heading';

import { Button } from './button';

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
          <Button testID={`${testID}-cancel`} label={cancel} variant="secondary" onPress={onClose} />
          <Button testID={`${testID}-confirm`} label={confirm} variant="danger" onPress={onConfirm} />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
