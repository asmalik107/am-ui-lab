import { Text } from 'react-native';

import { Tabs as GSTabs, TabsContent, TabsContentWrapper, TabsIndicator, TabsList, TabsTrigger, TabsTriggerText } from '@/components/ui/tabs';

export function Tabs({ tabs, panels, testID }: { tabs: readonly string[]; panels: readonly string[]; testID?: string }) {
  return (
    <GSTabs defaultValue={tabs[0]}>
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
    </GSTabs>
  );
}
