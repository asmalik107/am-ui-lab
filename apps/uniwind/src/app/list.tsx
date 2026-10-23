import { FlatList, Text, View } from 'react-native';

import { ids, rows, type Row } from '@shared/content';

import { useListMeasure } from '../perf';

// No theme hook or context: rows style themselves with classNames that point
// at the active theme's CSS variables.
function RowItem({ row }: { row: Row }) {
  return (
    <View
      accessible
      accessibilityLabel={`${row.title}, ${row.subtitle}`}
      className="flex-row items-center gap-3 border-b border-surface px-4 py-3">
      <View className="size-10 items-center justify-center rounded-full bg-primary">
        <Text className="text-label font-semibold text-on-primary">{row.id}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-body text-text">{row.title}</Text>
        <Text className="text-caption text-text-muted">{row.subtitle}</Text>
      </View>
    </View>
  );
}

export default function ListScreen() {
  return (
    <FlatList
      onLayout={useListMeasure()}
      testID={ids.list}
      data={rows}
      keyExtractor={(r) => r.id}
      renderItem={({ item }) => <RowItem row={item} />}
    />
  );
}
