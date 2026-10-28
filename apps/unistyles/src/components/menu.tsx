// Baseline overlay ported to Unistyles; accessibility is hand-written as in the baseline.
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { useReduceMotion } from '../a11y';
import { Button } from './button';
import { styles } from './styles';

// A button that opens a modal list of actions, built like the Select: the
// backdrop is a sibling of the list so aria-modal hides the screen behind it.
export function Menu({ label, items, onSelect, testID }: { label: string; items: readonly string[]; onSelect: (item: string) => void; testID?: string }) {
  const reduceMotion = useReduceMotion();
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Button testID={`${testID}-open`} label={label} variant="secondary" onPress={() => setOpen(true)} />
      <Modal visible={open} transparent animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={() => setOpen(false)}>
        <View style={styles.menuWrap}>
          <Pressable accessible={false} style={styles.backdrop} onPress={() => setOpen(false)} />
          <View testID={testID} aria-modal role="menu" accessibilityLabel={label} style={styles.menu}>
            {items.map((item, i) => (
              <Pressable
                key={item}
                testID={`${testID}-item-${i}`}
                role="button"
                accessibilityLabel={item}
                onPress={() => {
                  onSelect(item);
                  setOpen(false);
                }}
                style={styles.option}>
                <Text style={styles.optionText(false)}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}
