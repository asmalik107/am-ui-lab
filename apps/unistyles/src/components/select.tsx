// Baseline overlay ported to Unistyles; accessibility is hand-written as in the baseline.
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { useReduceMotion } from '../a11y';
import { styles } from './styles';

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
