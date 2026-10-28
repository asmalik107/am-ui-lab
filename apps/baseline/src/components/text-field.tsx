// Baseline control built on React Native primitives with hand-written accessibility.
import { Text, TextInput, View } from 'react-native';

import { useTheme } from '../theme';
import { target } from './shared';

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
