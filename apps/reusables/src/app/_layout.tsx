import '../global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Uniwind, useCSSVariable, useUniwind } from 'uniwind';
import { PerfReadout } from '../perf';

// Uniwind starts in adaptive "system" mode. The lab starts every app in the
// light theme, so pin it before the first render.
// https://docs.uniwind.dev/theming/basics#switch-to-a-specific-theme
Uniwind.setTheme('light');

function Navigator() {
  const { theme } = useUniwind();
  // react-navigation only takes colour strings, so read the CSS variables.
  // https://docs.uniwind.dev/api/use-css-variable
  const [surface, text, background] = useCSSVariable(['--color-surface', '--color-foreground', '--color-background']);
  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: String(surface) },
          headerTintColor: String(text),
          contentStyle: { backgroundColor: String(background) },
        }}>
        <Stack.Screen name="index" options={{ title: 'React Native Reusables' }} />
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
        {/* RNR: PortalHost goes last inside the providers; Select and
            AlertDialog content render here.
            https://reactnativereusables.com/docs/installation/manual#add-the-portal-host-to-your-root-layout */}
        <PortalHost />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
