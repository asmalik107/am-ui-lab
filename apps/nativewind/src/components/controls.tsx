// Baseline controls restyled with NativeWind className. The accessibility
// props are unchanged from apps/baseline. Colours come from the theme CSS
// variables (src/global.css + src/theme.tsx); sizes from the shared tokens
// mapped into @theme. min-target / min-h-target are 44pt on iOS and 48dp on
// Android (custom utilities in global.css), and are minimums, so controls
// grow with the system text size.
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Switch as RNSwitch, Text, TextInput, View } from 'react-native';
import { styled } from 'nativewind';

import { announce } from '../a11y';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-md py-lg">
      <Text role="heading" className="text-title text-text">
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
  className?: string;
};

// Full class strings so Tailwind's source scanner sees every utility.
const buttonVariant = {
  primary: 'bg-primary',
  secondary: 'bg-transparent border border-border',
  danger: 'bg-danger',
} as const;
const buttonText = {
  primary: 'text-on-primary',
  secondary: 'text-primary',
  danger: 'text-on-danger',
} as const;

// role="button" + aria-disabled / aria-busy map to the native button trait
// and disabled/busy states on both platforms.
// The pressed look uses NativeWind's active: modifier (onPressIn/onPressOut).
// https://www.nativewind.dev/v5/core-concepts/states
// The dimmed look is keyed off `disabled` only, like the baseline; the
// disabled: modifier can't be used because `disabled` is also true while loading.
export function Button({ label, onPress, disabled, loading, variant = 'primary', testID, className }: ButtonProps) {
  const inactive = disabled || loading;
  return (
    <Pressable
      testID={testID}
      role="button"
      aria-disabled={inactive}
      aria-busy={loading}
      disabled={inactive}
      onPress={onPress}
      className={`min-target flex-row items-center justify-center gap-sm rounded-md px-lg active:opacity-80 ${buttonVariant[variant]} ${disabled ? 'opacity-45' : ''} ${className ?? ''}`}>
      {loading && <ActivityIndicator className={buttonText[variant]} />}
      <Text className={`text-label ${buttonText[variant]}`}>{label}</Text>
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
  return (
    <View className="gap-xs">
      <Text nativeID={labelId} className="text-label text-text">
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
        className={`min-h-target rounded-md bg-surface-raised px-md text-body text-text ${error ? 'border-2 border-danger' : 'border border-border'}`}
      />
      <Text aria-live={error ? 'polite' : undefined} className={`text-caption ${error ? 'text-danger' : 'text-text-muted'}`}>
        {error ?? helper}
      </Text>
    </View>
  );
}

// RN Switch's trackColor is an object prop, not a style. styled() sends a
// className colour into each nested prop path.
// https://www.nativewind.dev/v5/api/styled
const ThemedSwitch = styled(RNSwitch, {
  trackOnClassName: { target: false, nativeStyleMapping: { color: 'trackColor.true' } },
  trackOffClassName: { target: false, nativeStyleMapping: { color: 'trackColor.false' } },
});

// The whole row is one switch element so the label and state are read together.
export function SwitchRow({ label, value, onValueChange, testID }: { label: string; value: boolean; onValueChange: (v: boolean) => void; testID?: string }) {
  return (
    <Pressable
      testID={testID}
      role="switch"
      aria-checked={value}
      accessibilityLabel={label}
      onPress={() => onValueChange(!value)}
      className="min-h-target flex-row items-center justify-between">
      <Text className="flex-1 text-body text-text">{label}</Text>
      <ThemedSwitch
        value={value}
        onValueChange={onValueChange}
        trackOnClassName="text-primary"
        trackOffClassName="text-border"
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      />
    </Pressable>
  );
}

export function Checkbox({ label, checked, onChange, testID }: { label: string; checked: boolean | 'mixed'; onChange: (v: boolean) => void; testID?: string }) {
  return (
    <Pressable
      testID={testID}
      role="checkbox"
      aria-checked={checked}
      accessibilityLabel={label}
      onPress={() => onChange(checked !== true)}
      className="min-h-target flex-row items-center gap-md">
      <View
        className={`h-[24px] w-[24px] items-center justify-center rounded-sm border-2 ${checked ? 'border-primary bg-primary' : 'border-border bg-transparent'}`}>
        {checked && <Text className="font-bold text-on-primary">{checked === 'mixed' ? '–' : '✓'}</Text>}
      </View>
      <Text className="flex-1 text-body text-text">{label}</Text>
    </Pressable>
  );
}

export function RadioGroup({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  return (
    <View testID={testID} role="radiogroup" accessibilityLabel={label} className="gap-xs">
      <Text className="text-label text-text">{label}</Text>
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
            className="min-h-target flex-row items-center gap-md">
            <View className={`h-[22px] w-[22px] items-center justify-center rounded-[11px] border-2 ${selected ? 'border-primary' : 'border-border'}`}>
              {selected && <View className="h-[10px] w-[10px] rounded-[5px] bg-primary" />}
            </View>
            <Text className="text-body text-text">{opt}</Text>
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
    <View className="gap-md">
      <View testID={testID} role="tablist" className="flex-row border-b border-border">
        {tabs.map((t, i) => (
          <Pressable
            key={t}
            testID={`${testID}-${i}`}
            role="tab"
            aria-selected={i === index}
            accessibilityLabel={t}
            accessibilityHint={`Tab ${i + 1} of ${tabs.length}`}
            onPress={() => setIndex(i)}
            className={`min-h-target flex-1 items-center justify-center border-b-[3px] ${i === index ? 'border-primary' : 'border-transparent'}`}>
            <Text className={`text-label ${i === index ? 'text-primary' : 'text-text-muted'}`}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <Text className="text-body text-text">{panels[index]}</Text>
    </View>
  );
}

export { announce };
