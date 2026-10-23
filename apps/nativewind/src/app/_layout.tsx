import '../global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { colors } from '@shared/tokens';

import { ThemeProvider, useThemeName } from '../theme';
import { PerfReadout } from '../perf';

// Navigation options are plain props, not styles, and the RC drops className
// on StatusBar, so the colours are read from the shared tokens by theme name.
function Navigator() {
  const { name } = useThemeName();
  const c = colors[name];
  return (
    <>
      <StatusBar style={name === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.surface },
          headerTintColor: c.text,
          contentStyle: { backgroundColor: c.background },
        }}>
        <Stack.Screen name="index" options={{ title: 'NativeWind v5 RC' }} />
        <Stack.Screen name="list" options={{ title: '200 rows' }} />
      </Stack>
      <PerfReadout />
    </>
  );
}

// ThemeProvider (VariableContextProvider) sits above BottomSheetModalProvider
// so the sheet's portal host and every RN Modal inherit the theme variables.
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <BottomSheetModalProvider>
          <Navigator />
        </BottomSheetModalProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
