import '../global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useThemeColor } from 'heroui-native/hooks';
import { HeroUINativeProvider } from 'heroui-native/provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { setTheme, useThemeName } from '../theme';
import { PerfReadout } from '../perf';

// Same starting theme as the baseline app.
setTheme('light');

function Navigator() {
  const name = useThemeName();
  const [surface, foreground, background] = useThemeColor(['surface', 'foreground', 'background']);
  return (
    <>
      <StatusBar style={name === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: surface },
          headerTintColor: foreground,
          contentStyle: { backgroundColor: background },
        }}>
        <Stack.Screen name="index" options={{ title: 'HeroUI Native' }} />
        <Stack.Screen name="list" options={{ title: '200 rows' }} />
      </Stack>
      <PerfReadout />
    </>
  );
}

// HeroUINativeProvider must sit inside GestureHandlerRootView (quick-start).
// BottomSheetModalProvider is only for the raw @gorhom/bottom-sheet modal
// (item 13); HeroUI's own BottomSheet renders through its PortalHost.
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <BottomSheetModalProvider>
          <Navigator />
        </BottomSheetModalProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
