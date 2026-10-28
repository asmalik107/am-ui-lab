// Test-screen controls built from gluestack-ui v5 components (copied into
// components/ui by the gluestack CLI). Colours, spacing and type come from the
// shared tokens via Uniwind classNames (see theme.generated.css).
// Accessibility: only props the gluestack docs ask for are passed. Nothing
// here adds roles, states or announcements by hand; see NOTES.md.
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  Accordion,
  AccordionContent,
  AccordionContentText,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from '@/components/ui/checkbox';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, CircleIcon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Progress, ProgressFilledTrack } from '@/components/ui/progress';
import { Radio, RadioGroup, RadioIcon, RadioIndicator, RadioLabel } from '@/components/ui/radio';
import { Slider, SliderFilledTrack, SliderThumb, SliderTrack } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsContentWrapper, TabsIndicator, TabsList, TabsTrigger, TabsTriggerText } from '@/components/ui/tabs';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-md py-lg">
      <Heading className="text-title text-foreground">{title}</Heading>
      {children}
    </View>
  );
}

type AppButtonProps = {
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
export function AppButton({ label, onPress, disabled, loading, variant = 'primary', testID }: AppButtonProps) {
  return (
    <Button testID={testID} variant={variantMap[variant]} isDisabled={disabled || loading} onPress={onPress}>
      {loading && <ButtonSpinner colorClassName={spinnerColor[variant]} />}
      <ButtonText className="text-label">{label}</ButtonText>
    </Button>
  );
}

type EmailFieldProps = {
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
export function EmailField({ label, helper, error, value, onChangeText, onBlur, testID }: EmailFieldProps) {
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

// gluestack's Switch is React Native's Switch with no label support. Its docs'
// "Switch With Label" example only places a Text next to it, so that is what is
// done here. Track colours use Uniwind's Switch className bindings.
export function SwitchRow({ label, value, onValueChange, testID }: { label: string; value: boolean; onValueChange: (v: boolean) => void; testID?: string }) {
  return (
    <View className="flex-row items-center justify-between gap-md">
      <Text className="text-body text-foreground flex-1">{label}</Text>
      <Switch
        testID={testID}
        value={value}
        onValueChange={onValueChange}
        trackColorOnClassName="accent-primary"
        trackColorOffClassName="accent-border"
        ios_backgroundColorClassName="accent-border"
      />
    </View>
  );
}

// `value` is required by the Checkbox types (the docs example omits it).
export function TermsCheckbox({ label, checked, onChange, testID }: { label: string; checked: boolean; onChange: (v: boolean) => void; testID?: string }) {
  return (
    <Checkbox testID={testID} value="terms" isChecked={checked} onChange={onChange}>
      <CheckboxIndicator>
        <CheckboxIcon as={CheckIcon} />
      </CheckboxIndicator>
      <CheckboxLabel className="text-body text-foreground">{label}</CheckboxLabel>
    </Checkbox>
  );
}

export function RadioField({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  return (
    <View className="gap-xs">
      <Text className="text-label text-foreground">{label}</Text>
      <RadioGroup testID={testID} value={value} onChange={onChange} className="gap-sm">
        {options.map((opt, i) => (
          <Radio key={opt} testID={`${testID}-${i}`} value={opt}>
            <RadioIndicator>
              <RadioIcon as={CircleIcon} />
            </RadioIndicator>
            <RadioLabel className="text-body text-foreground">{opt}</RadioLabel>
          </Radio>
        ))}
      </RadioGroup>
    </View>
  );
}

export function TestTabs({ tabs, panels, testID }: { tabs: readonly string[]; panels: readonly string[]; testID?: string }) {
  return (
    <Tabs defaultValue={tabs[0]}>
      <TabsList testID={testID}>
        {tabs.map((t, i) => (
          <TabsTrigger key={t} value={t} testID={`${testID}-${i}`}>
            <TabsTriggerText>{t}</TabsTriggerText>
          </TabsTrigger>
        ))}
        <TabsIndicator />
      </TabsList>
      <TabsContentWrapper>
        {tabs.map((t, i) => (
          <TabsContent key={t} value={t}>
            <Text className="text-body text-foreground py-md">{panels[i]}</Text>
          </TabsContent>
        ))}
      </TabsContentWrapper>
    </Tabs>
  );
}

// Slider as in the gluestack docs: Track, FilledTrack, Thumb. The docs pass
// no label, so none is added here. https://gluestack.io/ui/docs/components/slider
export function WeightSlider({ label, unit, value, min, max, step, onChange, testID }: { label: string; unit: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; testID?: string }) {
  return (
    <View className="gap-xs">
      <Text className="text-label text-foreground">
        {label}: {value} {unit}
      </Text>
      <Slider testID={testID} value={value} minValue={min} maxValue={max} step={step} onChange={onChange} className="my-md">
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </View>
  );
}

// Progress as in the docs; the library sets role="progressbar" and a
// percentage value text. https://gluestack.io/ui/docs/components/progress
export function WorkoutProgress({ label, value, max, valueText, testID }: { label: string; value: number; max: number; valueText: string; testID?: string }) {
  return (
    <View className="gap-xs">
      <Text className="text-label text-foreground">{label}</Text>
      <Progress testID={testID} value={value} max={max}>
        <ProgressFilledTrack />
      </Progress>
      <Text className="text-caption text-muted-foreground">{valueText}</Text>
    </View>
  );
}

// Accordion as in the docs, several sections open at once.
// https://gluestack.io/ui/docs/components/accordion
export function SectionsAccordion({ sections, panels, testID }: { sections: readonly string[]; panels: readonly string[]; testID?: string }) {
  return (
    <Accordion type="multiple" isCollapsible className="border border-border">
      {sections.map((s, i) => (
        <AccordionItem key={s} value={s}>
          <AccordionHeader>
            <AccordionTrigger testID={`${testID}-${i}`}>
              {({ isExpanded }: { isExpanded: boolean }) => (
                <>
                  <AccordionTitleText>{s}</AccordionTitleText>
                  <AccordionIcon as={isExpanded ? ChevronUpIcon : ChevronDownIcon} />
                </>
              )}
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>
            <AccordionContentText>{panels[i]}</AccordionContentText>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

// gluestack-ui ships no segmented control, so this is built on Pressable with
// gluestack's classNames and the baseline's hand-written accessibility:
// role="button" + aria-selected (the iOS selected trait).
export function Segmented({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  return (
    <View className="gap-xs">
      <Text className="text-label text-foreground">{label}</Text>
      <View testID={testID} accessibilityLabel={label} className="flex-row rounded-md border border-border p-0.5">
        {options.map((o, i) => {
          const selected = o === value;
          return (
            <Pressable
              key={o}
              testID={`${testID}-${i}`}
              role="button"
              aria-selected={selected}
              accessibilityLabel={o}
              onPress={() => onChange(o)}
              className={`min-h-11 flex-1 items-center justify-center rounded-sm ${selected ? 'bg-primary' : 'bg-transparent'}`}>
              <Text className={selected ? 'text-label text-primary-foreground' : 'text-label text-foreground'}>{o}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
