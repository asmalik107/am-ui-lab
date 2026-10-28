// Button, the baseline's, restyled with NativeWind className. Accessibility props are unchanged from apps/baseline.
import { ActivityIndicator, Pressable, Text } from 'react-native';

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
