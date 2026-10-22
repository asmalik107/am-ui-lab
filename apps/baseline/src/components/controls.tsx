// Baseline controls built on React Native primitives with hand-written
// accessibility. Each one documents which props carry its role and state.
import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Switch as RNSwitch,
  Text,
  TextInput,
  View,
  type ViewStyle,
} from 'react-native';

import { minTarget } from '@shared/tokens';

import { announce } from '../a11y';
import { useTheme } from '../theme';

const target = Platform.OS === 'ios' ? minTarget.ios : minTarget.android;

export function Section({ title, children }: { title: string; children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={{ gap: theme.space.md, paddingVertical: theme.space.lg }}>
      <Text role="heading" style={[theme.type.title, { color: theme.colors.text }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  testID?: string;
  style?: ViewStyle;
};

// role="button" + aria-disabled / aria-busy map to the native button trait
// and disabled/busy states on both platforms.
export function Button({ label, onPress, disabled, loading, variant = 'primary', testID, style }: ButtonProps) {
  const { theme } = useTheme();
  const c = theme.colors;
  const bg = variant === 'primary' ? c.primary : variant === 'danger' ? c.danger : 'transparent';
  const fg = variant === 'primary' ? c.onPrimary : variant === 'danger' ? c.onDanger : c.primary;
  const inactive = disabled || loading;
  return (
    <Pressable
      testID={testID}
      role="button"
      aria-disabled={inactive}
      aria-busy={loading}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: target,
          minWidth: target,
          paddingHorizontal: theme.space.lg,
          borderRadius: theme.radius.md,
          backgroundColor: bg,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: c.border,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: theme.space.sm,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
        style,
      ]}>
      {loading && <ActivityIndicator color={fg} />}
      <Text style={[theme.type.label, { color: fg }]}>{label}</Text>
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
  const { theme } = useTheme();
  const c = theme.colors;
  const labelId = `${testID}-label`;
  return (
    <View style={{ gap: theme.space.xs }}>
      <Text nativeID={labelId} style={[theme.type.label, { color: c.text }]}>
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
        style={[
          theme.type.body,
          {
            minHeight: target,
            paddingHorizontal: theme.space.md,
            borderRadius: theme.radius.md,
            borderWidth: error ? 2 : 1,
            borderColor: error ? c.danger : c.border,
            color: c.text,
            backgroundColor: c.surfaceRaised,
          },
        ]}
      />
      <Text
        aria-live={error ? 'polite' : undefined}
        style={[theme.type.caption, { color: error ? c.danger : c.textMuted }]}>
        {error ?? helper}
      </Text>
    </View>
  );
}

// The whole row is one switch element so the label and state are read together.
export function SwitchRow({ label, value, onValueChange, testID }: { label: string; value: boolean; onValueChange: (v: boolean) => void; testID?: string }) {
  const { theme } = useTheme();
  return (
    <Pressable
      testID={testID}
      role="switch"
      aria-checked={value}
      accessibilityLabel={label}
      onPress={() => onValueChange(!value)}
      style={{ minHeight: target, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={[theme.type.body, { color: theme.colors.text, flex: 1 }]}>{label}</Text>
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      />
    </Pressable>
  );
}

export function Checkbox({ label, checked, onChange, testID }: { label: string; checked: boolean | 'mixed'; onChange: (v: boolean) => void; testID?: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <Pressable
      testID={testID}
      role="checkbox"
      aria-checked={checked}
      accessibilityLabel={label}
      onPress={() => onChange(checked !== true)}
      style={{ minHeight: target, flexDirection: 'row', alignItems: 'center', gap: theme.space.md }}>
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: theme.radius.sm,
          borderWidth: 2,
          borderColor: checked ? c.primary : c.border,
          backgroundColor: checked ? c.primary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {checked && <Text style={{ color: c.onPrimary, fontWeight: '700' }}>{checked === 'mixed' ? '–' : '✓'}</Text>}
      </View>
      <Text style={[theme.type.body, { color: c.text, flex: 1 }]}>{label}</Text>
    </Pressable>
  );
}

export function RadioGroup({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View testID={testID} role="radiogroup" accessibilityLabel={label} style={{ gap: theme.space.xs }}>
      <Text style={[theme.type.label, { color: c.text }]}>{label}</Text>
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
            style={{ minHeight: target, flexDirection: 'row', alignItems: 'center', gap: theme.space.md }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: selected ? c.primary : c.border, alignItems: 'center', justifyContent: 'center' }}>
              {selected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.primary }} />}
            </View>
            <Text style={[theme.type.body, { color: c.text }]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// role="tablist" / "tab" + aria-selected; the panel is a plain region below.
export function Tabs({ tabs, panels, testID }: { tabs: readonly string[]; panels: readonly string[]; testID?: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [index, setIndex] = useState(0);
  return (
    <View style={{ gap: theme.space.md }}>
      <View testID={testID} role="tablist" style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: c.border }}>
        {tabs.map((t, i) => (
          <Pressable
            key={t}
            testID={`${testID}-${i}`}
            role="tab"
            aria-selected={i === index}
            accessibilityLabel={t}
            accessibilityHint={`Tab ${i + 1} of ${tabs.length}`}
            onPress={() => setIndex(i)}
            style={{ flex: 1, minHeight: target, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 3, borderColor: i === index ? c.primary : 'transparent' }}>
            <Text style={[theme.type.label, { color: i === index ? c.primary : c.textMuted }]}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[theme.type.body, { color: c.text }]}>{panels[index]}</Text>
    </View>
  );
}

export { announce };
