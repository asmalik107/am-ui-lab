// Baseline overlay built on React Native primitives with hand-written accessibility.
import { Modal, Text, View } from 'react-native';

import { useReduceMotion } from '../a11y';
import { useTheme } from '../theme';
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
