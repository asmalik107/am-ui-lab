// 200 rows with Tamagui's ListItem (title, subTitle, icon). ListItem sets
// role="listitem"; no accessibility props are added by hand.
// https://tamagui.dev/ui/list-item
import { FlatList } from 'react-native'
import { ListItem, Text, View } from 'tamagui'

import { ids, rows, type Row } from '@shared/content'
import { useListMeasure } from '../perf'

function RowIcon({ id }: { id: string }) {
  return (
    <View w={40} h={40} rounded="full" bg="primary" items="center" justify="center">
      <Text color="on-primary" fontSize={15} lineHeight="20px" fontWeight="600">
        {id}
      </Text>
    </View>
  )
}

function RowItem({ row }: { row: Row }) {
  return (
    <ListItem
      icon={<RowIcon id={row.id} />}
      title={row.title}
      subTitle={row.subtitle}
      bg="background"
      px="lg"
      py="md"
      gap="md"
      borderBottomWidth={1}
      borderColor="surface"
    />
  )
}

export default function ListScreen() {
  return <FlatList onLayout={useListMeasure()} testID={ids.list} data={rows} keyExtractor={(r) => r.id} renderItem={({ item }) => <RowItem row={item} />} />
}
