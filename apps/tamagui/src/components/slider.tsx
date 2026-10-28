import { SizableText, Slider as TSlider, YStack } from 'tamagui'

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
