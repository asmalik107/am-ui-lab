// Baseline control ported to Unistyles; accessibility is hand-written as in the baseline.
import { Text, TextInput, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { target } from './shared';
import { styles } from './styles';

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
