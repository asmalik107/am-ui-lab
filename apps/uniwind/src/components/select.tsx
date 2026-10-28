// Select, ported from the baseline to Uniwind. Accessibility is hand-written exactly as in the baseline.
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { useReduceMotion } from '../a11y';
import { targetH } from './shared';

type SelectProps = { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string };

// A trigger with role="combobox" + aria-expanded that opens a modal list of radios.
export function Select({ label, options, value, onChange, testID }: SelectProps) {
  const reduceMotion = useReduceMotion();
  const [open, setOpen] = useState(false);
  return (
    <View className="gap-1">
      <Text className="text-label font-semibold text-text">{label}</Text>
      <Pressable
        testID={testID}
        role="combobox"
        aria-expanded={open}
        accessibilityLabel={`${label}, ${value}`}
        onPress={() => setOpen(true)}
        className={`${targetH} flex-row items-center justify-between rounded-md border border-border bg-surface-raised px-3`}>
        <Text className="text-body text-text">{value}</Text>
        <Text importantForAccessibility="no" accessibilityElementsHidden className="text-text-muted">
          ▾
        </Text>
      </Pressable>
      <Modal visible={open} transparent animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={() => setOpen(false)}>
        {/* The backdrop is a sibling of the list, not its parent: aria-modal inside
            an accessible Pressable did not hide the screen behind it from VoiceOver. */}
        <View className="flex-1 justify-center p-6">
          <Pressable accessible={false} className="absolute inset-0 bg-scrim" onPress={() => setOpen(false)} />
          <View aria-modal role="list" accessibilityLabel={label} className="rounded-lg bg-surface-raised py-2">
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
                className={`${targetH} justify-center px-4`}>
                <Text className={`text-body ${opt === value ? 'font-bold text-primary' : 'font-normal text-text'}`}>{opt}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}
