// Email text field, the baseline's, restyled with NativeWind className. Accessibility props are unchanged from apps/baseline.
import { Text, TextInput, View } from 'react-native';

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
