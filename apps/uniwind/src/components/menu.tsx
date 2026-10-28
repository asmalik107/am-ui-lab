// Menu, ported from the baseline to Uniwind. Accessibility is hand-written exactly as in the baseline.
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { useReduceMotion } from '../a11y';
import { Button } from './button';
import { targetH } from './shared';

// A button that opens a modal list of actions, built like the Select: the
// backdrop is a sibling of the list so aria-modal hides the screen behind it.
export function Menu({ label, items, onSelect, testID }: { label: string; items: readonly string[]; onSelect: (item: string) => void; testID?: string }) {
  const reduceMotion = useReduceMotion();
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Button testID={`${testID}-open`} label={label} variant="secondary" onPress={() => setOpen(true)} />
      <Modal visible={open} transparent animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-center p-6">
          <Pressable accessible={false} className="absolute inset-0 bg-scrim" onPress={() => setOpen(false)} />
          <View testID={testID} aria-modal role="menu" accessibilityLabel={label} className="rounded-lg bg-surface-raised py-2">
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
                className={`${targetH} justify-center px-4`}>
                <Text className="text-body text-text">{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}
