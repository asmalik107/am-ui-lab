import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';

type TextFieldProps = {
  label: string;
  helper: string;
  error?: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur?: () => void;
  testID?: string;
};

// FormControl + Input. The Input docs ask for aria-label, so it is passed;
// without it the field is announced as "Input Field" (the library default).
export function TextField({ label, helper, error, value, onChangeText, onBlur, testID }: TextFieldProps) {
  return (
    <FormControl isInvalid={!!error}>
      <FormControlLabel>
        <FormControlLabelText className="text-label text-foreground">{label}</FormControlLabelText>
      </FormControlLabel>
      <Input className="my-xs">
        <InputField
          testID={testID}
          aria-label={label}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          autoCapitalize="none"
          keyboardType="email-address"
          className="text-body text-foreground"
        />
      </Input>
      {error ? (
        <FormControlError>
          <FormControlErrorText className="text-caption text-destructive">{error}</FormControlErrorText>
        </FormControlError>
      ) : (
        <FormControlHelper>
          <FormControlHelperText className="text-caption text-muted-foreground">{helper}</FormControlHelperText>
        </FormControlHelper>
      )}
    </FormControl>
  );
}
