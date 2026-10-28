import { Button as GSButton, ButtonSpinner, ButtonText } from '@/components/ui/button';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  testID?: string;
};

const variantMap = { primary: 'default', secondary: 'outline', danger: 'destructive' } as const;
const spinnerColor = {
  primary: 'accent-primary-foreground',
  secondary: 'accent-foreground',
  danger: 'accent-destructive-foreground',
} as const;

// gluestack's Button has no loading prop; the documented pattern is
// isDisabled + a ButtonSpinner child.
export function Button({ label, onPress, disabled, loading, variant = 'primary', testID }: ButtonProps) {
  return (
    <GSButton testID={testID} variant={variantMap[variant]} isDisabled={disabled || loading} onPress={onPress}>
      {loading && <ButtonSpinner colorClassName={spinnerColor[variant]} />}
      <ButtonText className="text-label">{label}</ButtonText>
    </GSButton>
  );
}
