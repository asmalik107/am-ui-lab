// Baseline control built on React Native primitives with hand-written accessibility.
import { ActivityIndicator, Pressable, Text, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import { target } from './shared';

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
