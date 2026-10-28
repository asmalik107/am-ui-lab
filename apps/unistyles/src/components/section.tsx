// Baseline control ported to Unistyles; accessibility is hand-written as in the baseline.
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text role="heading" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: { gap: theme.space.md, paddingVertical: theme.space.lg },
  sectionTitle: { ...theme.type.title, color: theme.colors.text },
}));
