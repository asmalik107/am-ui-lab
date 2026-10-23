import { FlatList, Text, View } from 'react-native';

import { ids, rows, type Row } from '@shared/content';
import { useListMeasure } from '../perf';

// No theme hook: rows read the theme variables through className, which
// resolve against the VariableContextProvider in the root layout.
function RowItem({ row }: { row: Row }) {
  return (
    <View accessible accessibilityLabel={`${row.title}, ${row.subtitle}`} className="flex-row items-center gap-md border-b border-surface px-lg py-md">
      <View className="h-[40px] w-[40px] items-center justify-center rounded-full bg-primary">
        <Text className="text-label text-on-primary">{row.id}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-body text-text">{row.title}</Text>
        <Text className="text-caption text-text-muted">{row.subtitle}</Text>
      </View>
    </View>
  );
}

export default function ListScreen() {
  return <FlatList onLayout={useListMeasure()} testID={ids.list} data={rows} keyExtractor={(r) => r.id} renderItem={({ item }) => <RowItem row={item} />} />;
}
