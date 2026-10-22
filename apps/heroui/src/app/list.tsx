import { ListGroup } from 'heroui-native/list-group';
import { FlatList, Text, View } from 'react-native';

import { ids, rows, type Row } from '@shared/content';

import { space, type } from '../theme';
import { useListMeasure } from '../perf';

// ListGroup.Item is HeroUI's row (a Pressable). No onPress and no
// ItemSuffix chevron: the rows are not navigable. No accessibility props
// added; whatever grouping the library gives is what gets measured.
function RowItem({ row }: { row: Row }) {
  return (
    <ListGroup.Item className="border-b border-surface bg-background">
      <ListGroup.ItemPrefix>
        <View className="bg-accent" style={{ width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
          <Text className="text-accent-foreground" style={type.label}>
            {row.id}
          </Text>
        </View>
      </ListGroup.ItemPrefix>
      <ListGroup.ItemContent>
        <ListGroup.ItemTitle>{row.title}</ListGroup.ItemTitle>
        <ListGroup.ItemDescription>{row.subtitle}</ListGroup.ItemDescription>
      </ListGroup.ItemContent>
    </ListGroup.Item>
  );
}

export default function ListScreen() {
  return (
    <FlatList
      onLayout={useListMeasure()}
      testID={ids.list}
      className="bg-background"
      contentContainerStyle={{ paddingVertical: space.sm }}
      data={rows}
      keyExtractor={(r) => r.id}
      renderItem={({ item }) => <RowItem row={item} />}
    />
  );
}
