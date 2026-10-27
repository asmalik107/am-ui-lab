// Baseline controls ported to Uniwind. Uniwind ships no components, so
// accessibility (roles, labels, states) is still hand-written exactly as in
// the baseline. What changes is styling: every style is a Tailwind className
// resolved against the active theme's CSS variables (src/global.css), so a
// theme switch needs no React context.
//
// Class names are always written out in full (no string building), because
// Tailwind finds them by scanning the source.
// https://docs.uniwind.dev/tailwind-basics#working-with-dynamic-classnames
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Switch as RNSwitch, Text, TextInput, View } from 'react-native';

import { announce } from '../a11y';

// Minimum target: 44 pt on iOS, 48 dp on Android (shared/tokens minTarget),
// via Uniwind's platform selectors. min-h, never h, so controls grow with the
// system text size. https://docs.uniwind.dev/api/platform-select
const targetH = 'ios:min-h-11 android:min-h-12';
const targetHW = 'ios:min-h-11 ios:min-w-11 android:min-h-12 android:min-w-12';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3 py-4">
      <Text role="heading" className="text-title font-bold text-text">
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

const buttonBox: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-transparent border border-border',
  danger: 'bg-danger',
};
const buttonText: Record<ButtonVariant, string> = {
  primary: 'text-on-primary',
  secondary: 'text-primary',
  danger: 'text-on-danger',
};
// ActivityIndicator's `color` is a prop, not a style: Uniwind maps it from
// colorClassName with an accent-* class. https://docs.uniwind.dev/components/activity-indicator
const spinnerColor: Record<ButtonVariant, string> = {
  primary: 'accent-on-primary',
  secondary: 'accent-primary',
  danger: 'accent-on-danger',
};

// role="button" + aria-disabled / aria-busy map to the native button trait
// and disabled/busy states on both platforms. The pressed look uses
// Pressable's `active:` state selector; the loading button is disabled but
// keeps full opacity, as in the baseline.
// https://docs.uniwind.dev/components/pressable
export function Button({ label, onPress, disabled, loading, variant = 'primary', testID }: ButtonProps) {
  const inactive = disabled || loading;
  return (
    <Pressable
      testID={testID}
      role="button"
      aria-disabled={inactive}
      aria-busy={loading}
      disabled={inactive}
      onPress={onPress}
      className={`${targetHW} flex-row items-center justify-center gap-2 rounded-md px-4 ${buttonBox[variant]} ${disabled ? 'opacity-[0.45]' : 'active:opacity-80'}`}>
      {loading && <ActivityIndicator colorClassName={spinnerColor[variant]} />}
      <Text className={`text-label font-semibold ${buttonText[variant]}`}>{label}</Text>
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
    <View className="gap-1">
      <Text nativeID={labelId} className="text-label font-semibold text-text">
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
        className={`${targetH} rounded-md bg-surface-raised px-3 text-body text-text ${error ? 'border-2 border-danger' : 'border border-border'}`}
      />
      <Text aria-live={error ? 'polite' : undefined} className={`text-caption ${error ? 'text-danger' : 'text-text-muted'}`}>
        {error ?? helper}
      </Text>
    </View>
  );
}

// The whole row is one switch element so the label and state are read together.
// Switch takes no className; its track colour comes from trackColorOnClassName
// / trackColorOffClassName with accent-* classes. https://docs.uniwind.dev/components/switch
export function SwitchRow({ label, value, onValueChange, testID }: { label: string; value: boolean; onValueChange: (v: boolean) => void; testID?: string }) {
  return (
    <Pressable
      testID={testID}
      role="switch"
      aria-checked={value}
      accessibilityLabel={label}
      onPress={() => onValueChange(!value)}
      className={`${targetH} flex-row items-center justify-between`}>
      <Text className="flex-1 text-body text-text">{label}</Text>
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        trackColorOnClassName="accent-primary"
        trackColorOffClassName="accent-border"
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
      className={`${targetH} flex-row items-center gap-3`}>
      <View className={`size-6 items-center justify-center rounded-sm border-2 ${checked ? 'border-primary bg-primary' : 'border-border bg-transparent'}`}>
        {checked && <Text className="font-bold text-on-primary">{checked === 'mixed' ? '–' : '✓'}</Text>}
      </View>
      <Text className="flex-1 text-body text-text">{label}</Text>
    </Pressable>
  );
}

export function RadioGroup({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  return (
    <View testID={testID} role="radiogroup" accessibilityLabel={label} className="gap-1">
      <Text className="text-label font-semibold text-text">{label}</Text>
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
            className={`${targetH} flex-row items-center gap-3`}>
            <View className={`size-[22px] items-center justify-center rounded-full border-2 ${selected ? 'border-primary' : 'border-border'}`}>
              {selected && <View className="size-2.5 rounded-full bg-primary" />}
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
    <View className="gap-3">
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
            className={`${targetH} flex-1 items-center justify-center border-b-[3px] ${i === index ? 'border-primary' : 'border-transparent'}`}>
            <Text className={`text-label font-semibold ${i === index ? 'text-primary' : 'text-text-muted'}`}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <Text className="text-body text-text">{panels[index]}</Text>
    </View>
  );
}

type SliderProps = { label: string; unit: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; testID?: string };

// React Native has no slider, so this is the baseline's, built from a View.
// accessibilityRole="adjustable" (role has no such value) gives the iOS
// adjustable trait; VoiceOver's swipe up/down fires increment/decrement.
// The fill width and thumb position depend on the value, so they stay inline
// styles; Tailwind classes can't be built at runtime.
export function Slider({ label, unit, value, min, max, step, onChange, testID }: SliderProps) {
  const [width, setWidth] = useState(0);
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step));
  const fromX = (x: number) => (width ? onChange(clamp(min + (x / width) * (max - min))) : undefined);
  const pct = (value - min) / (max - min);
  return (
    <View className="gap-1">
      <Text className="text-label font-semibold text-text">
        {label}: {value} {unit}
      </Text>
      <View
        testID={testID}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value} ${unit}`}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => onChange(clamp(value + (e.nativeEvent.actionName === 'increment' ? step : -step)))}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={(e) => fromX(e.nativeEvent.locationX)}
        onResponderMove={(e) => fromX(e.nativeEvent.locationX)}
        className={`${targetH} justify-center`}>
        <View pointerEvents="none" className="h-1.5 rounded-full bg-border">
          <View className="h-1.5 rounded-full bg-primary" style={{ width: `${pct * 100}%` }} />
        </View>
        <View pointerEvents="none" className="absolute size-7 rounded-full border-2 border-primary bg-surface-raised" style={{ left: pct * width - 14 }} />
      </View>
    </View>
  );
}

// role="progressbar" with aria-value*: the value text is what VoiceOver reads.
export function Progress({ label, value, max, valueText, testID }: { label: string; value: number; max: number; valueText: string; testID?: string }) {
  return (
    <View className="gap-1">
      <Text className="text-label font-semibold text-text">{label}</Text>
      <View testID={testID} accessible role="progressbar" accessibilityLabel={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-valuetext={valueText} className="h-2 rounded-full bg-border">
        <View className="h-2 rounded-full bg-primary" style={{ width: `${(value / max) * 100}%` }} />
      </View>
      <Text className="text-caption text-text-muted">{valueText}</Text>
    </View>
  );
}

// Each header is a button with aria-expanded. On iOS, React Native adds
// "expanded" to the value when open and nothing when closed.
export function Accordion({ sections, panels, testID }: { sections: readonly string[]; panels: readonly string[]; testID?: string }) {
  const [open, setOpen] = useState<number[]>([]);
  return (
    <View className="rounded-md border border-border">
      {sections.map((s, i) => {
        const expanded = open.includes(i);
        return (
          <View key={s} className={i > 0 ? 'border-t border-border' : ''}>
            <Pressable
              testID={`${testID}-${i}`}
              role="button"
              aria-expanded={expanded}
              accessibilityLabel={s}
              onPress={() => setOpen(expanded ? open.filter((x) => x !== i) : [...open, i])}
              className={`${targetH} flex-row items-center justify-between px-3`}>
              <Text className="text-label font-semibold text-text">{s}</Text>
              <Text importantForAccessibility="no" accessibilityElementsHidden className="text-text-muted">
                {expanded ? '▴' : '▾'}
              </Text>
            </Pressable>
            {expanded && <Text className="text-body text-text-muted px-3 pb-3">{panels[i]}</Text>}
          </View>
        );
      })}
    </View>
  );
}

// A row of buttons; aria-selected gives the iOS selected trait, as UIKit's
// segmented control does.
export function Segmented({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  return (
    <View className="gap-1">
      <Text className="text-label font-semibold text-text">{label}</Text>
      <View testID={testID} accessibilityLabel={label} className="flex-row rounded-md border border-border p-0.5">
        {options.map((o, i) => {
          const selected = o === value;
          return (
            <Pressable
              key={o}
              testID={`${testID}-${i}`}
              role="button"
              aria-selected={selected}
              accessibilityLabel={o}
              onPress={() => onChange(o)}
              className={`${targetH} flex-1 items-center justify-center rounded-sm ${selected ? 'bg-primary' : 'bg-transparent'}`}>
              <Text className={selected ? 'text-label font-semibold text-on-primary' : 'text-label font-semibold text-text'}>{o}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export { announce };
