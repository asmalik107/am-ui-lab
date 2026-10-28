// Items 15–19. Slider, Accordion and Menu are HeroUI's own components, set up
// as its docs show. HeroUI Native 1.0.11 ships no progress bar and no
// segmented control, so those two are built on React Native primitives with
// HeroUI's theme classes and the baseline's hand-written accessibility.
import { Accordion } from 'heroui-native/accordion';
import { Button } from 'heroui-native/button';
import { Label } from 'heroui-native/label';
import { Menu } from 'heroui-native/menu';
import { Slider } from 'heroui-native/slider';
import { Pressable, Text, View } from 'react-native';

import { space, type } from '../theme';

// https://heroui.com/docs/native/components/slider. Each thumb gets
// role="slider"; the docs document no label, so the thumb's aria-label is
// passed by hand (a standard View prop).
export function WeightSlider({ label, unit, value, min, max, step, onChange, testID }: { label: string; unit: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; testID?: string }) {
  return (
    <View style={{ gap: space.xs }}>
      <Label>{`${label}: ${value} ${unit}`}</Label>
      <Slider value={value} minValue={min} maxValue={max} step={step} onChange={(v) => onChange(v as number)}>
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb testID={testID} aria-label={label} />
        </Slider.Track>
      </Slider>
    </View>
  );
}

// Hand-built: role="progressbar" with aria-value*, as in the baseline.
export function WorkoutProgress({ label, value, max, valueText, testID }: { label: string; value: number; max: number; valueText: string; testID?: string }) {
  return (
    <View style={{ gap: space.xs }}>
      <Label>{label}</Label>
      <View testID={testID} accessible role="progressbar" accessibilityLabel={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-valuetext={valueText} className="h-2 rounded-full bg-border">
        <View className="h-2 rounded-full bg-accent" style={{ width: `${(value / max) * 100}%` }} />
      </View>
      <Text className="text-muted" style={type.caption}>
        {valueText}
      </Text>
    </View>
  );
}

// https://heroui.com/docs/native/components/accordion, several open at once.
export function SectionsAccordion({ sections, panels, testID }: { sections: readonly string[]; panels: readonly string[]; testID?: string }) {
  return (
    <Accordion selectionMode="multiple">
      {sections.map((s, i) => (
        <Accordion.Item key={s} value={s}>
          <Accordion.Trigger testID={`${testID}-${i}`}>
            <Text className="text-foreground" style={type.label}>
              {s}
            </Text>
            <Accordion.Indicator />
          </Accordion.Trigger>
          <Accordion.Content>
            <Text className="text-muted" style={type.body}>
              {panels[i]}
            </Text>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

// https://heroui.com/docs/native/components/menu, popover presentation.
// Items close the menu on press (shouldCloseOnSelect defaults to true).
export function WorkoutMenu({ label, items, onSelect, testID }: { label: string; items: readonly string[]; onSelect: (item: string) => void; testID?: string }) {
  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button testID={`${testID}-open`} variant="outline">
          {label}
        </Button>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Overlay />
        <Menu.Content presentation="popover" width={220} testID={testID}>
          {items.map((item, i) => (
            <Menu.Item key={item} testID={`${testID}-item-${i}`} onPress={() => onSelect(item)}>
              <Menu.ItemTitle>{item}</Menu.ItemTitle>
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu.Portal>
    </Menu>
  );
}

// Hand-built: a row of buttons with aria-selected (the iOS selected trait).
export function Segmented({ label, options, value, onChange, testID }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; testID?: string }) {
  return (
    <View style={{ gap: space.xs }}>
      <Label>{label}</Label>
      <View testID={testID} accessibilityLabel={label} className="flex-row rounded-xl border border-border p-0.5">
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
              className={`min-h-11 flex-1 items-center justify-center rounded-lg ${selected ? 'bg-accent' : 'bg-transparent'}`}>
              <Text className={selected ? 'text-accent-foreground' : 'text-foreground'} style={type.label}>
                {o}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
