import { Button as TButton, Spinner } from 'tamagui'

type ButtonProps = {
  label: string
  onPress?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  testID?: string
  // anything else (e.g. props injected by Dialog.Trigger / Link asChild) goes to the Tamagui Button
  [key: string]: unknown
}

// Tamagui Button. Variants map to themes (brand / danger sub-themes in
// tamagui.config.ts) and the built-in `outlined` variant. There is no loading
// prop, so loading = disabled + a Spinner icon.
// https://tamagui.dev/ui/button
export function Button({ label, onPress, disabled, loading, variant = 'primary', testID, ...rest }: ButtonProps) {
  const theme = variant === 'primary' ? 'brand' : variant === 'danger' ? 'danger' : undefined
  return (
    <TButton
      {...rest}
      testID={testID}
      theme={theme}
      variant={variant === 'secondary' ? 'outlined' : undefined}
      disabled={disabled || loading}
      onPress={onPress}
      icon={loading ? <Spinner color="color" /> : undefined}
      minH={44}
      minW={44}>
      <TButton.Text color={variant === 'secondary' ? 'primary' : 'color'} fontSize={15} lineHeight="20px">
        {label}
      </TButton.Text>
    </TButton>
  )
}
