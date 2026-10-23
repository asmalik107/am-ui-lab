import '../global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Uniwind, useCSSVariable, useUniwind } from 'uniwind';

import { PerfReadout } from '../perf';

// Uniwind starts on the device colour scheme by default; the baseline starts
// on light, so set it once at module load. https://docs.uniwind.dev/theming/basics
Uniwind.setTheme('light');

// Navigation options are plain props, not styles, so they read the token
// values with useCSSVariable (re-renders this component on a theme change).
// https://docs.uniwind.dev/api/use-css-variable
function Navigator() {
  const { theme } = useUniwind();
  const [surface, text, background] = useCSSVariable(['--color-surface', '--color-text', '--color-background']) as (string | undefined)[];
  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: surface },
          headerTintColor: text,
          contentStyle: { backgroundColor: background },
        }}>
        <Stack.Screen name="index" options={{ title: 'Uniwind' }} />
        <Stack.Screen name="list" options={{ title: '200 rows' }} />
      </Stack>
      <PerfReadout />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Navigator />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
