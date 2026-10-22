import { FlatList, Text, View } from 'react-native';

import { ids, rows, type Row } from '@shared/content';
import { useListMeasure } from '../perf';

// 200 themed rows. gluestack has no list/row component, so rows are React
// Native primitives styled with token classNames (no theme context consumer:
// Uniwind restyles them on theme change).
function RowItem({ row }: { row: Row }) {
  return (
    <View
      accessible
      accessibilityLabel={`${row.title}, ${row.subtitle}`}
      className="flex-row items-center gap-md px-lg py-md border-b border-surface">
      <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
        <Text className="text-label text-primary-foreground">{row.id}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-body text-foreground">{row.title}</Text>
        <Text className="text-caption text-muted-foreground">{row.subtitle}</Text>
      </View>
    </View>
  );
}

export default function ListScreen() {
  return <FlatList onLayout={useListMeasure()} testID={ids.list} className="bg-background" data={rows} keyExtractor={(r) => r.id} renderItem={({ item }) => <RowItem row={item} />} />;
}
