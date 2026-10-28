import { useEffect, useRef } from 'react'
import { Field, Input } from 'tamagui'

type TextFieldProps = {
  label: string
  helper: string
  error: string
  testID?: string
}

// Field wires the label, description and error to the control: on native it
// passes accessibilityLabel (label text) and accessibilityHint (description +
// error text) through useFieldControl(). Tamagui's Input does not read Field by
// itself, so this wrapper follows the integration pattern from the Field docs.
// https://tamagui.dev/ui/field
function EmailInput({ testID }: { testID?: string }) {
  const field = Field.useFieldControl()
  const ref = useRef<any>(null)
  const value = useRef('')
  useEffect(() => {
    return field.registerControl({
      id: field.ariaProps.id,
      controlRef: ref,
      inputRef: ref,
      getValue: () => value.current,
    })
  }, [field.ariaProps.id, field.registerControl])
  return (
    <Input
      {...field.ariaProps}
      {...field.dataProps}
      ref={ref}
      testID={testID}
      name={field.name}
      type="email"
      autoCapitalize="none"
      disabled={field.disabled}
      minH={44}
      fontSize={16}
      onFocus={field.onFocus}
      onBlur={() => field.onBlur(value.current)}
      onChange={(event) => {
        value.current = event.target.value
        field.onChange(value.current)
      }}
    />
  )
}

export function TextField({ label, helper, error, testID }: TextFieldProps) {
  return (
    <Field
      name="email"
      validationMode="onBlur"
      validate={(v) => (/.+@.+\..+/.test(String(v ?? '')) ? null : error)}
      gap="xs">
      <Field.Label color="color" fontSize={15} lineHeight="20px" fontWeight="600">
        {label}
      </Field.Label>
      <EmailInput testID={testID} />
      <Field.Description color="text-muted" fontSize={13} lineHeight="18px">
        {helper}
      </Field.Description>
      <Field.Error color="danger" fontSize={13} lineHeight="18px" />
    </Field>
  )
}
