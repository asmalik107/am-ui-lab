// Dialog, ported from the baseline to Uniwind. Accessibility is hand-written exactly as in the baseline.
import { Modal, Text, View } from 'react-native';

import { useReduceMotion } from '../a11y';
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
