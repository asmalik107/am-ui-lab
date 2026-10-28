// Items 15–19. Progress, Accordion, DropdownMenu and ToggleGroup are
// Reusables components added with its CLI (0.7.1) and used as its docs show.
// Reusables has no slider, so that one is the baseline's, built on a View
// with Uniwind classes and hand-written accessibility.
import { useState } from 'react';
import { View } from 'react-native';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { type } from '@/lib/type';

type SliderProps = { label: string; unit: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; testID?: string };

// Hand-built: accessibilityRole="adjustable" gives the iOS adjustable trait;
// VoiceOver's swipe up/down fires increment/decrement. Touch uses the
// responder system, as in the baseline.
export function WeightSlider({ label, unit, value, min, max, step, onChange, testID }: SliderProps) {
  const [width, setWidth] = useState(0);
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step));
  const fromX = (x: number) => (width ? onChange(clamp(min + (x / width) * (max - min))) : undefined);
  const pct = (value - min) / (max - min);
  return (
    <View className="gap-1">
      <Text className={type.label}>{`${label}: ${value} ${unit}`}</Text>
      <View
        testID={testID}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value} ${unit}`}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => onChange(clamp(value + (e.nativeEvent.actionName === 'increment' ? step : -step)))}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={(e) => fromX(e.nativeEvent.locationX)}
        onResponderMove={(e) => fromX(e.nativeEvent.locationX)}
        className="min-h-11 justify-center">
        <View pointerEvents="none" className="h-1.5 rounded-full bg-primary/20">
          <View className="h-1.5 rounded-full bg-primary" style={{ width: `${pct * 100}%` }} />
        </View>
        <View pointerEvents="none" className="absolute size-7 rounded-full border-2 border-primary bg-background" style={{ left: pct * width - 14 }} />
      </View>
    </View>
  );
}

// Progress as in the docs: value is a percentage (0–100).
export function WorkoutProgress({ label, value, max, valueText, testID }: { label: string; value: number; max: number; valueText: string; testID?: string }) {
  return (
    <View className="gap-1">
      <Text className={type.label}>{label}</Text>
      <Progress testID={testID} value={(value / max) * 100} />
      <Text className={`${type.caption} text-muted-foreground`}>{valueText}</Text>
    </View>
  );
}

// Accordion as in the docs, several sections open at once.
export function SectionsAccordion({ sections, panels, testID }: { sections: readonly string[]; panels: readonly string[]; testID?: string }) {
  return (
    <Accordion type="multiple">
      {sections.map((s, i) => (
        <AccordionItem key={s} value={s}>
          <AccordionTrigger testID={`${testID}-${i}`}>
            <Text className={type.label}>{s}</Text>
          </AccordionTrigger>
          <AccordionContent>
            <Text className={`${type.body} text-muted-foreground`}>{panels[i]}</Text>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

// DropdownMenu as in the docs, opened from an outline Button.
export function WorkoutMenu({ label, items, onSelect, testID }: { label: string; items: readonly string[]; onSelect: (item: string) => void; testID?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button testID={`${testID}-open`} variant="outline">
          <Text>{label}</Text>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent testID={testID} className="w-56">
        {items.map((item, i) => (
          <DropdownMenuItem key={item} testID={`${testID}-item-${i}`} onPress={() => onSelect(item)}>
            <Text>{item}</Text>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Segmented control as a single-choice ToggleGroup, as in the docs.
export function Segmented({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  return (
    <View className="gap-1">
      <Text className={type.label}>{label}</Text>
      <ToggleGroup testID={testID} type="single" variant="outline" value={value} onValueChange={(v) => v && onChange(v)}>
        {options.map((o, i) => (
          <ToggleGroupItem key={o} testID={`${testID}-${i}`} value={o} aria-label={o} isFirst={i === 0} isLast={i === options.length - 1} className="flex-1">
            <Text>{o}</Text>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </View>
  );
}
