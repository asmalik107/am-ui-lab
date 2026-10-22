// Baseline controls ported to Unistyles. Unistyles ships no components, so
// accessibility (roles, labels, states) is still hand-written exactly as in
// the baseline. What changes is styling: every style lives in
// StyleSheet.create((theme, rt) => ...), and a theme switch is applied by
// Unistyles' C++ core to the shadow tree without re-rendering these
// components. Props that are not styles (Switch trackColor,
// ActivityIndicator color) go through withUnistyles.
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Platform, Pressable, Switch as RNSwitch, Text, TextInput, View } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { minTarget } from '@shared/tokens';

import { announce } from '../a11y';

const target = Platform.OS === 'ios' ? minTarget.ios : minTarget.android;

// Indicator glyphs (checkbox box, radio ring) follow the system text size.
// RN Text already scales fontSize, so rt.fontScale is used only for
// non-text sizes, capped so the box never dwarfs its label.
const glyph = (size: number, fontScale: number) => Math.round(size * Math.min(fontScale, 2));

// Switch track colours and spinner colour are props, not styles, so they are
// mapped from the theme with withUnistyles (re-renders only this leaf on a
// theme change). https://www.unistyl.es/v3/references/with-unistyles
const ThemedSwitch = withUnistyles(RNSwitch, (theme) => ({
  trackColor: { true: theme.colors.primary, false: theme.colors.border },
}));
const ThemedSpinner = withUnistyles(ActivityIndicator);

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text role="heading" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  testID?: string;
};

// role="button" + aria-disabled / aria-busy map to the native button trait
// and disabled/busy states on both platforms. Colour per variant and the
// disabled look are Unistyles variants.
export function Button({ label, onPress, disabled, loading, variant = 'primary', testID }: ButtonProps) {
  const inactive = disabled || loading;
  buttonStyles.useVariants({ variant, disabled: !!disabled });
  return (
    <Pressable
      testID={testID}
      role="button"
      aria-disabled={inactive}
      aria-busy={loading}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [buttonStyles.button, buttonStyles.pressed(pressed && !disabled)]}>
      {loading && (
        <ThemedSpinner
          uniProps={(theme) => ({
            color: variant === 'primary' ? theme.colors.onPrimary : variant === 'danger' ? theme.colors.onDanger : theme.colors.primary,
          })}
        />
      )}
      <Text style={buttonStyles.label}>{label}</Text>
    </Pressable>
  );
}

type TextFieldProps = {
  label: string;
  helper: string;
  error?: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur?: () => void;
  testID?: string;
};

// The visible label is linked with accessibilityLabel (iOS) and
// aria-labelledby (Android). The error is an Android live region and is
// announced on iOS when it appears.
export function TextField({ label, helper, error, value, onChangeText, onBlur, testID }: TextFieldProps) {
  const labelId = `${testID}-label`;
  fieldStyles.useVariants({ invalid: !!error });
  return (
    <View style={fieldStyles.wrap}>
      <Text nativeID={labelId} style={styles.label}>
        {label}
      </Text>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        accessibilityLabel={label}
        aria-labelledby={labelId}
        accessibilityHint={error ?? helper}
        aria-invalid={!!error}
        autoCapitalize="none"
        keyboardType="email-address"
        style={fieldStyles.input}
      />
      <Text aria-live={error ? 'polite' : undefined} style={fieldStyles.message}>
        {error ?? helper}
      </Text>
    </View>
  );
}

// The whole row is one switch element so the label and state are read together.
export function SwitchRow({ label, value, onValueChange, testID }: { label: string; value: boolean; onValueChange: (v: boolean) => void; testID?: string }) {
  return (
    <Pressable testID={testID} role="switch" aria-checked={value} accessibilityLabel={label} onPress={() => onValueChange(!value)} style={styles.switchRow}>
      <Text style={styles.rowText}>{label}</Text>
      <ThemedSwitch value={value} onValueChange={onValueChange} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden />
    </Pressable>
  );
}

export function Checkbox({ label, checked, onChange, testID }: { label: string; checked: boolean | 'mixed'; onChange: (v: boolean) => void; testID?: string }) {
  return (
    <Pressable testID={testID} role="checkbox" aria-checked={checked} accessibilityLabel={label} onPress={() => onChange(checked !== true)} style={styles.choiceRow}>
      <View style={styles.checkbox(!!checked)}>
        {checked && <Text style={styles.checkmark}>{checked === 'mixed' ? '–' : '✓'}</Text>}
      </View>
      <Text style={styles.rowText}>{label}</Text>
    </Pressable>
  );
}

export function RadioGroup({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  return (
    <View testID={testID} role="radiogroup" accessibilityLabel={label} style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      {options.map((opt, i) => {
        const selected = opt === value;
        return (
          <Pressable
            key={opt}
            testID={`${testID}-${i}`}
            role="radio"
            aria-checked={selected}
            accessibilityLabel={opt}
            onPress={() => onChange(opt)}
            style={styles.choiceRow}>
            <View style={styles.radio(selected)}>{selected && <View style={styles.radioDot} />}</View>
            <Text style={styles.bodyText}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// role="tablist" / "tab" + aria-selected; the panel is a plain region below.
export function Tabs({ tabs, panels, testID }: { tabs: readonly string[]; panels: readonly string[]; testID?: string }) {
  const [index, setIndex] = useState(0);
  return (
    <View style={styles.tabsWrap}>
      <View testID={testID} role="tablist" style={styles.tablist}>
        {tabs.map((t, i) => (
          <Pressable
            key={t}
            testID={`${testID}-${i}`}
            role="tab"
            aria-selected={i === index}
            accessibilityLabel={t}
            accessibilityHint={`Tab ${i + 1} of ${tabs.length}`}
            onPress={() => setIndex(i)}
            style={styles.tab(i === index)}>
            <Text style={styles.tabLabel(i === index)}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.bodyText}>{panels[index]}</Text>
    </View>
  );
}

export { announce };

const buttonStyles = StyleSheet.create((theme) => ({
  button: {
    minHeight: target,
    minWidth: target,
    paddingHorizontal: theme.space.lg,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.space.sm,
    borderColor: theme.colors.border,
    variants: {
      variant: {
        primary: { backgroundColor: theme.colors.primary, borderWidth: 0 },
        secondary: { backgroundColor: 'transparent', borderWidth: 1 },
        danger: { backgroundColor: theme.colors.danger, borderWidth: 0 },
      },
      disabled: {
        true: { opacity: 0.45 },
        false: { opacity: 1 },
      },
    },
  },
  pressed: (pressed: boolean) => (pressed ? { opacity: 0.8 } : {}),
  label: {
    ...theme.type.label,
    variants: {
      variant: {
        primary: { color: theme.colors.onPrimary },
        secondary: { color: theme.colors.primary },
        danger: { color: theme.colors.onDanger },
      },
    },
  },
}));

const fieldStyles = StyleSheet.create((theme) => ({
  wrap: { gap: theme.space.xs },
  input: {
    ...theme.type.body,
    minHeight: target,
    paddingHorizontal: theme.space.md,
    borderRadius: theme.radius.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.surfaceRaised,
    variants: {
      invalid: {
        true: { borderWidth: 2, borderColor: theme.colors.danger },
        false: { borderWidth: 1, borderColor: theme.colors.border },
      },
    },
  },
  message: {
    ...theme.type.caption,
    variants: {
      invalid: {
        true: { color: theme.colors.danger },
        false: { color: theme.colors.textMuted },
      },
    },
  },
}));

const styles = StyleSheet.create((theme, rt) => ({
  section: { gap: theme.space.md, paddingVertical: theme.space.lg },
  sectionTitle: { ...theme.type.title, color: theme.colors.text },
  label: { ...theme.type.label, color: theme.colors.text },
  bodyText: { ...theme.type.body, color: theme.colors.text },
  rowText: { ...theme.type.body, color: theme.colors.text, flex: 1 },
  switchRow: { minHeight: target, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  choiceRow: { minHeight: target, flexDirection: 'row', alignItems: 'center', gap: theme.space.md },
  group: { gap: theme.space.xs },
  checkbox: (checked: boolean) => ({
    width: glyph(24, rt.fontScale),
    height: glyph(24, rt.fontScale),
    borderRadius: theme.radius.sm,
    borderWidth: 2,
    borderColor: checked ? theme.colors.primary : theme.colors.border,
    backgroundColor: checked ? theme.colors.primary : 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  checkmark: { color: theme.colors.onPrimary, fontWeight: '700' },
  radio: (selected: boolean) => ({
    width: glyph(22, rt.fontScale),
    height: glyph(22, rt.fontScale),
    borderRadius: glyph(11, rt.fontScale),
    borderWidth: 2,
    borderColor: selected ? theme.colors.primary : theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  }),
  radioDot: {
    width: glyph(10, rt.fontScale),
    height: glyph(10, rt.fontScale),
    borderRadius: glyph(5, rt.fontScale),
    backgroundColor: theme.colors.primary,
  },
  tabsWrap: { gap: theme.space.md },
  tablist: { flexDirection: 'row', borderBottomWidth: 1, borderColor: theme.colors.border },
  tab: (selected: boolean) => ({
    flex: 1,
    minHeight: target,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderColor: selected ? theme.colors.primary : 'transparent',
  }),
  tabLabel: (selected: boolean) => ({ ...theme.type.label, color: selected ? theme.colors.primary : theme.colors.textMuted }),
}));
