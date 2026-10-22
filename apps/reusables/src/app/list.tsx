import { FlatList, View } from 'react-native';

import { ids, rows, type Row } from '@shared/content';

import { Text } from '@/components/ui/text';
import { type } from '@/lib/type';
import { cn } from '@/lib/utils';
import { useListMeasure } from '../perf';

// Same row as the baseline, styled with Uniwind classes and RNR's Text.
// The accessible/accessibilityLabel grouping is copied from the baseline
// (RNR has no list or list-item component).
function RowItem({ row }: { row: Row }) {
  return (
    <View
      accessible
      accessibilityLabel={`${row.title}, ${row.subtitle}`}
      className="border-surface flex-row items-center gap-3 border-b px-4 py-3">
      <View className="bg-primary size-10 items-center justify-center rounded-full">
        <Text className={cn(type.label, 'text-primary-foreground')}>{row.id}</Text>
      </View>
      <View className="flex-1">
        <Text className={type.body}>{row.title}</Text>
        <Text className={cn(type.caption, 'text-muted-foreground')}>{row.subtitle}</Text>
      </View>
    </View>
  );
}

export default function ListScreen() {
  return <FlatList onLayout={useListMeasure()} testID={ids.list} data={rows} keyExtractor={(r) => r.id} renderItem={({ item }) => <RowItem row={item} />} />;
}
