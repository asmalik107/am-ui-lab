// Form controls built from Tamagui's own components. Accessibility comes from
// the components; the only a11y props passed are the ones Tamagui's docs and
// demos pass (Label htmlFor/id, aria-labelledby on the group, aria-label on the
// tab list, Field parts). See NOTES.md for what that does and doesn't give on iOS.
import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Accordion as TAccordion,
  Button as TButton,
  Checkbox as TCheckbox,
  Field,
  H2,
  Input,
  Label,
  Progress as TProgress,
  RadioGroup as TRadioGroup,
  SizableText,
  Slider as TSlider,
  Spinner,
  Switch,
  Tabs as TTabs,
  Text,
  ToggleGroup,
  XStack,
  YStack,
  style,
} from 'tamagui'

// Section heading. Tamagui's H2 renders role="heading" on native.
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <YStack gap="md" py="lg">
      <H2 color="color" fontSize={20} lineHeight="26px" fontWeight="700">
        {title}
      </H2>
      {children}
    </YStack>
  )
}

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

// Label + Switch linked by htmlFor/id, as in Tamagui's Switch demo.
// https://tamagui.dev/ui/switch
export function SwitchRow({ label, value, onValueChange, testID }: { label: string; value: boolean; onValueChange: (v: boolean) => void; testID?: string }) {
  const id = `${testID}-control`
  return (
    <XStack minH={44} items="center" justify="space-between" gap="md">
      <Label htmlFor={id} color="color" fontSize={16} lineHeight="22px" flex={1}>
        {label}
      </Label>
      <Switch id={id} testID={testID} checked={value} onCheckedChange={onValueChange} transition="quick">
        <Switch.Thumb transition="quickest" />
      </Switch>
    </XStack>
  )
}

// Checkbox with its indeterminate state, Label linked by htmlFor/id.
// https://tamagui.dev/ui/checkbox
export function Checkbox({ label, checked, onChange, testID }: { label: string; checked: boolean | 'indeterminate'; onChange: (v: boolean | 'indeterminate') => void; testID?: string }) {
  const id = `${testID}-control`
  return (
    <XStack minH={44} items="center" gap="md">
      <TCheckbox id={id} testID={testID} checked={checked} onCheckedChange={onChange}>
        <TCheckbox.Indicator>
          <Text color="color" fontWeight="700">
            {checked === 'indeterminate' ? '–' : '✓'}
          </Text>
        </TCheckbox.Indicator>
      </TCheckbox>
      <Label htmlFor={id} color="color" fontSize={16} lineHeight="22px" flex={1}>
        {label}
      </Label>
    </XStack>
  )
}

// RadioGroup: the group is labelled with aria-labelledby (as in Tamagui's demo),
// each item with a Label via htmlFor/id. https://tamagui.dev/ui/radio-group
export function RadioGroup({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  const labelId = `${testID}-label`
  return (
    <YStack gap="xs">
      <SizableText id={labelId} color="color" fontSize={15} lineHeight="20px" fontWeight="600">
        {label}
      </SizableText>
      <TRadioGroup testID={testID} aria-labelledby={labelId} value={value} onValueChange={onChange} gap="xs">
        {options.map((opt, i) => {
          const id = `${testID}-${i}`
          return (
            <XStack key={opt} minH={44} items="center" gap="md">
              <TRadioGroup.Item id={id} testID={id} value={opt}>
                <TRadioGroup.Indicator />
              </TRadioGroup.Item>
              <Label htmlFor={id} color="color" fontSize={16} lineHeight="22px">
                {opt}
              </Label>
            </XStack>
          )
        })}
      </TRadioGroup>
    </YStack>
  )
}

// Tabs: Tabs.List gets aria-label as in Tamagui's demo. v3 Tabs ship no visual
// defaults, so the selected tab is styled with activeStyle.
// https://tamagui.dev/ui/tabs
const activeTab = style({ borderColor: 'primary' })

export function Tabs({ tabs, panels, testID, label }: { tabs: readonly string[]; panels: readonly string[]; testID?: string; label: string }) {
  const [value, setValue] = useState('0')
  return (
    <TTabs value={value} onValueChange={setValue} orientation="horizontal" flexDirection="column" gap="md">
      <TTabs.List testID={testID} aria-label={label} borderBottomWidth={1} borderColor="border-color">
        {tabs.map((t, i) => (
          <TTabs.Tab
            key={t}
            testID={`${testID}-${i}`}
            value={String(i)}
            flex={1}
            minH={44}
            items="center"
            justify="center"
            borderBottomWidth={3}
            borderColor="transparent"
            activeStyle={activeTab}>
            <SizableText color={value === String(i) ? 'primary' : 'text-muted'} fontSize={15} lineHeight="20px" fontWeight="600">
              {t}
            </SizableText>
          </TTabs.Tab>
        ))}
      </TTabs.List>
      {panels.map((p, i) => (
        <TTabs.Content key={p} value={String(i)}>
          <Text color="color" fontSize={16} lineHeight="22px">
            {p}
          </Text>
        </TTabs.Content>
      ))}
    </TTabs>
  )
}

// Slider: one thumb, value as a one-item array. Tamagui gives the thumb
// role="slider" and aria-value*; the label goes on the thumb as aria-label.
// https://tamagui.dev/ui/slider
export function Slider({ label, unit, value, min, max, step, onChange, testID }: { label: string; unit: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; testID?: string }) {
  return (
    <YStack gap="xs">
      <SizableText color="color" fontSize={15} lineHeight="20px" fontWeight="600">
        {label}: {value} {unit}
      </SizableText>
      <TSlider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} minH={44} justify="center">
        <TSlider.Track bg="border-color">
          <TSlider.TrackActive bg="primary" />
        </TSlider.Track>
        <TSlider.Thumb testID={testID} index={0} circular width={28} height={28} aria-label={label} bg="surface-raised" borderColor="primary" borderWidth={2} />
      </TSlider>
    </YStack>
  )
}

// Progress with getValueLabel for the text read out; Tamagui sets
// role="progressbar" and aria-value*. https://tamagui.dev/ui/progress
export function Progress({ label, value, max, valueText, testID }: { label: string; value: number; max: number; valueText: string; testID?: string }) {
  return (
    <YStack gap="xs">
      <SizableText color="color" fontSize={15} lineHeight="20px" fontWeight="600">
        {label}
      </SizableText>
      <TProgress testID={testID} aria-label={label} value={value} max={max} getValueLabel={() => valueText} bg="border-color">
        <TProgress.Indicator bg="primary" />
      </TProgress>
      <Text color="text-muted" fontSize={13} lineHeight="18px">
        {valueText}
      </Text>
    </YStack>
  )
}

// Accordion, several sections open at once; Trigger inside Header as the
// docs show. https://tamagui.dev/ui/accordion
export function Accordion({ sections, panels, testID }: { sections: readonly string[]; panels: readonly string[]; testID?: string }) {
  return (
    <TAccordion type="multiple" borderWidth={1} borderColor="border-color" rounded="md" overflow="hidden">
      {sections.map((s, i) => (
        <TAccordion.Item key={s} value={s}>
          <TAccordion.Header>
            <TAccordion.Trigger testID={`${testID}-${i}`} minH={44} flexDirection="row" justify="space-between" items="center" bg="background" borderWidth={0} borderTopWidth={i ? 1 : 0} borderColor="border-color">
              {({ open }: { open: boolean }) => (
                <>
                  <SizableText color="color" fontSize={15} lineHeight="20px" fontWeight="600">
                    {s}
                  </SizableText>
                  <Text color="text-muted">{open ? '▴' : '▾'}</Text>
                </>
              )}
            </TAccordion.Trigger>
          </TAccordion.Header>
          <TAccordion.Content bg="background">
            <Text color="text-muted" fontSize={16} lineHeight="22px">
              {panels[i]}
            </Text>
          </TAccordion.Content>
        </TAccordion.Item>
      ))}
    </TAccordion>
  )
}

// Segmented control as a single-choice ToggleGroup. disableDeactivation keeps
// one option selected. https://tamagui.dev/ui/toggle-group
export function Segmented({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  return (
    <YStack gap="xs">
      <SizableText color="color" fontSize={15} lineHeight="20px" fontWeight="600">
        {label}
      </SizableText>
      <ToggleGroup testID={testID} type="single" disableDeactivation value={value} onValueChange={(v: string) => v && onChange(v)} aria-label={label} orientation="horizontal" flexDirection="row">
        {options.map((o, i) => (
          <ToggleGroup.Item key={o} testID={`${testID}-${i}`} value={o} aria-label={o} flex={1} minH={44}>
            <SizableText color={o === value ? 'primary' : 'color'} fontSize={15} fontWeight="600">
              {o}
            </SizableText>
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>
    </YStack>
  )
}
