// Baseline control ported to Unistyles; accessibility is hand-written as in the baseline.
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { target } from './shared';

// The spinner colour is a prop, not a style, so it is mapped from the theme
// with withUnistyles (re-renders only this leaf on a theme change).
// https://www.unistyl.es/v3/references/with-unistyles
const ThemedSpinner = withUnistyles(ActivityIndicator);

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
