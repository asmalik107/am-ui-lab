// Baseline overlay built on React Native primitives with hand-written accessibility.
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { useReduceMotion } from '../a11y';
import { useTheme } from '../theme';
import { target } from './shared';

type SelectProps = { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string };

// A trigger with role="combobox" + aria-expanded that opens a modal list of radios.
export function Select({ label, options, value, onChange, testID }: SelectProps) {
  const { theme } = useTheme();
  const c = theme.colors;
  const reduceMotion = useReduceMotion();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: theme.space.xs }}>
      <Text style={[theme.type.label, { color: c.text }]}>{label}</Text>
      <Pressable
        testID={testID}
        role="combobox"
        aria-expanded={open}
        accessibilityLabel={`${label}, ${value}`}
        onPress={() => setOpen(true)}
        style={{ minHeight: target, borderWidth: 1, borderColor: c.border, borderRadius: theme.radius.md, paddingHorizontal: theme.space.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.surfaceRaised }}>
        <Text style={[theme.type.body, { color: c.text }]}>{value}</Text>
        <Text importantForAccessibility="no" accessibilityElementsHidden style={{ color: c.textMuted }}>
          ▾
        </Text>
      </Pressable>
      <Modal visible={open} transparent animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={() => setOpen(false)}>
        {/* The backdrop is a sibling of the list, not its parent: aria-modal inside
            an accessible Pressable did not hide the screen behind it from VoiceOver. */}
        <View style={{ flex: 1, justifyContent: 'center', padding: theme.space.xl }}>
          <Pressable accessible={false} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: c.scrim }} onPress={() => setOpen(false)} />
          <View aria-modal role="list" accessibilityLabel={label} style={{ backgroundColor: c.surfaceRaised, borderRadius: theme.radius.lg, paddingVertical: theme.space.sm }}>
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
                style={{ minHeight: target, paddingHorizontal: theme.space.lg, justifyContent: 'center' }}>
                <Text style={[theme.type.body, { color: opt === value ? c.primary : c.text, fontWeight: opt === value ? '700' : '400' }]}>{opt}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}
