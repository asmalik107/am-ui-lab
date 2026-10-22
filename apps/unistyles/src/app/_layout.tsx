import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { PerfReadout } from '../perf';

// Navigation options are plain props, not styles, so Unistyles can't patch
// them in the shadow tree. The docs name navigation screenOptions as the
// intended use of useUnistyles: https://www.unistyl.es/v3/references/use-unistyles
function Navigator() {
  const { theme } = useUnistyles();
  const c = theme.colors;
  return (
    <>
      <StatusBar style={theme.name === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.surface },
          headerTintColor: c.text,
          contentStyle: { backgroundColor: c.background },
        }}>
        <Stack.Screen name="index" options={{ title: 'Unistyles' }} />
        <Stack.Screen name="list" options={{ title: '200 rows' }} />
      </Stack>
      <PerfReadout />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <BottomSheetModalProvider>
        <Navigator />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
