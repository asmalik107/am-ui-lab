// `gluestack-ui init` injected GluestackUIProvider, SafeAreaListener and a
// second GestureHandlerRootView into the middle of the existing Navigator
// component, with mode="dark" hard-coded. Rewritten by hand; the global.css
// import and the Uniwind.updateInsets listener are kept from the CLI output.
import '@/global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaListener } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

import { ThemeProvider, useThemeName, useTokenColor } from '../theme';
import { PerfReadout } from '../perf';

function Navigator() {
  const { name } = useThemeName();
  const surface = useTokenColor('surface');
  const text = useTokenColor('foreground');
  const background = useTokenColor('background');
  return (
    <>
      <StatusBar style={name === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: surface },
          headerTintColor: text,
          contentStyle: { backgroundColor: background },
        }}>
        <Stack.Screen name="index" options={{ title: 'gluestack-ui v5' }} />
        <Stack.Screen name="list" options={{ title: '200 rows' }} />
      </Stack>
      <PerfReadout />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaListener onChange={({ insets }) => Uniwind.updateInsets(insets)}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <BottomSheetModalProvider>
            <Navigator />
          </BottomSheetModalProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaListener>
  );
}
