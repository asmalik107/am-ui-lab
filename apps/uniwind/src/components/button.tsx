// Button, ported from the baseline to Uniwind.
import { ActivityIndicator, Pressable, Text } from 'react-native';

// Minimum target in both directions (see shared.ts).
const targetHW = 'ios:min-h-11 ios:min-w-11 android:min-h-12 android:min-w-12';

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
