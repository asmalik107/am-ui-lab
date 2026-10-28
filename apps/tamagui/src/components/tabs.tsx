import { useState } from 'react'
import { SizableText, Tabs as TTabs, Text, style } from 'tamagui'

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
