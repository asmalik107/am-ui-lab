import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { ChevronDownIcon } from '@/components/ui/icon';
import {
  Select as GSSelect,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from '@/components/ui/select';

type SelectProps = { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string };

// gluestack Select = trigger + Actionsheet of SelectItems.
export function Select({ label, options, value, onChange, testID }: SelectProps) {
  return (
    <FormControl>
      <FormControlLabel>
        <FormControlLabelText className="text-label text-foreground">{label}</FormControlLabelText>
      </FormControlLabel>
      <GSSelect selectedValue={value} initialLabel={value} onValueChange={onChange}>
        <SelectTrigger testID={testID} className="bg-card">
          <SelectInput className="text-body text-foreground" />
          <SelectIcon className="mr-md" as={ChevronDownIcon} />
        </SelectTrigger>
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent className="bg-card">
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            {options.map((opt, i) => (
              <SelectItem key={opt} testID={`${testID}-option-${i}`} label={opt} value={opt} />
            ))}
          </SelectContent>
        </SelectPortal>
      </GSSelect>
    </FormControl>
  );
}
