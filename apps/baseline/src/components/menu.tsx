// Baseline overlay built on React Native primitives with hand-written accessibility.
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { useReduceMotion } from '../a11y';
import { useTheme } from '../theme';
import { Button } from './button';
import { target } from './shared';

// A button that opens a modal list of actions, built like the Select: the
// backdrop is a sibling of the list so aria-modal hides the screen behind it.
export function Menu({ label, items, onSelect, testID }: { label: string; items: readonly string[]; onSelect: (item: string) => void; testID?: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const reduceMotion = useReduceMotion();
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Button testID={`${testID}-open`} label={label} variant="secondary" onPress={() => setOpen(true)} />
      <Modal visible={open} transparent animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, justifyContent: 'center', padding: theme.space.xl }}>
          <Pressable accessible={false} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: c.scrim }} onPress={() => setOpen(false)} />
          <View testID={testID} aria-modal role="menu" accessibilityLabel={label} style={{ backgroundColor: c.surfaceRaised, borderRadius: theme.radius.lg, paddingVertical: theme.space.sm }}>
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
                style={{ minHeight: target, paddingHorizontal: theme.space.lg, justifyContent: 'center' }}>
                <Text style={[theme.type.body, { color: c.text }]}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}
