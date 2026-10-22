import { FlatList, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ids, rows, type Row } from '@shared/content';
import { useListMeasure } from '../perf';

// No theme hook or context: rows read the theme inside StyleSheet.create, and
// a theme switch is applied by Unistyles in C++ without re-rendering the list.
function RowItem({ row }: { row: Row }) {
  return (
    <View accessible accessibilityLabel={`${row.title}, ${row.subtitle}`} style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{row.id}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{row.title}</Text>
        <Text style={styles.subtitle}>{row.subtitle}</Text>
      </View>
    </View>
  );
}

export default function ListScreen() {
  return <FlatList onLayout={useListMeasure()} testID={ids.list} data={rows} keyExtractor={(r) => r.id} renderItem={({ item }) => <RowItem row={item} />} />;
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.md,
    borderBottomWidth: 1,
    borderColor: theme.colors.surface,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...theme.type.label, color: theme.colors.onPrimary },
  body: { flex: 1 },
  title: { ...theme.type.body, color: theme.colors.text },
  subtitle: { ...theme.type.caption, color: theme.colors.textMuted },
}));
