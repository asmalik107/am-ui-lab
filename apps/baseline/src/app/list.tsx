import { FlatList, Text, View } from 'react-native';

import { ids, rows, type Row } from '@shared/content';

import { useTheme } from '../theme';

function RowItem({ row }: { row: Row }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View
      accessible
      accessibilityLabel={`${row.title}, ${row.subtitle}`}
      style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.md, paddingHorizontal: theme.space.lg, paddingVertical: theme.space.md, borderBottomWidth: 1, borderColor: c.surface }}>
      <View style={{ width: 40, height: 40, borderRadius: theme.radius.full, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={[theme.type.label, { color: c.onPrimary }]}>{row.id}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[theme.type.body, { color: c.text }]}>{row.title}</Text>
        <Text style={[theme.type.caption, { color: c.textMuted }]}>{row.subtitle}</Text>
      </View>
    </View>
  );
}

export default function ListScreen() {
  return <FlatList testID={ids.list} data={rows} keyExtractor={(r) => r.id} renderItem={({ item }) => <RowItem row={item} />} />;
}
