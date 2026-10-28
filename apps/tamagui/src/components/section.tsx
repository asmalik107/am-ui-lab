// Form controls built from Tamagui's own components. Accessibility comes from
// the components; the only a11y props passed are the ones Tamagui's docs and
// demos pass (Label htmlFor/id, aria-labelledby on the group, aria-label on the
// tab list, Field parts). See NOTES.md for what that does and doesn't give on iOS.
import type { ReactNode } from 'react'
import { H2, YStack } from 'tamagui'

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
