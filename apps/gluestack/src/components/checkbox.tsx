import { Checkbox as GSCheckbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from '@/components/ui/checkbox';
import { CheckIcon } from '@/components/ui/icon';

// `value` is required by the Checkbox types (the docs example omits it).
export function Checkbox({ label, checked, onChange, testID }: { label: string; checked: boolean; onChange: (v: boolean) => void; testID?: string }) {
  return (
    <GSCheckbox testID={testID} value="terms" isChecked={checked} onChange={onChange}>
      <CheckboxIndicator>
        <CheckboxIcon as={CheckIcon} />
      </CheckboxIndicator>
      <CheckboxLabel className="text-body text-foreground">{label}</CheckboxLabel>
    </GSCheckbox>
  );
}
