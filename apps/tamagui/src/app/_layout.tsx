import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TamaguiProvider, useTheme } from 'tamagui'
import { Toast } from 'tamagui/toast'

import { ids } from '@shared/content'

import { config, tamaguiThemeName } from '../../tamagui.config'
import { ThemeNameProvider, useThemeSwitch } from '../theme'
import { PerfReadout } from '../perf'

// expo-router's Stack is not a Tamagui component, so its colours come from
// useTheme() (https://tamagui.dev/docs/core/use-theme). `.val` is the raw string.
function Navigator() {
  const { name } = useThemeSwitch()
  const theme = useTheme()
  return (
    <>
      <StatusBar style={name === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.surface.val },
          headerTintColor: theme.color.val,
          contentStyle: { backgroundColor: theme.background.val },
        }}>
        <Stack.Screen name="index" options={{ title: 'Tamagui v3' }} />
        <Stack.Screen name="list" options={{ title: '200 rows' }} />
      </Stack>
      <PerfReadout />
    </>
  )
}

export default function RootLayout() {
  // Toasts read safe-area insets from TamaguiProvider.
  // https://tamagui.dev/ui/toast#native-safe-area
  const insets = useSafeAreaInsets()
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeNameProvider>
        {(name) => (
          <TamaguiProvider config={config} defaultTheme={tamaguiThemeName[name]} insets={insets}>
            {/* Toast root: toast() can be called from anywhere below. */}
            <Toast position="bottom-center">
              <BottomSheetModalProvider>
                <Navigator />
              </BottomSheetModalProvider>
              <Toast.Viewport>
                {/* Own renderItem only to put the shared testID on the toast. */}
                <Toast.List
                  renderItem={({ toast: t, index }) => (
                    <Toast.Item key={t.id} toast={t} index={index} testID={ids.toast}>
                      <Toast.Title>{typeof t.title === 'function' ? t.title() : t.title}</Toast.Title>
                    </Toast.Item>
                  )}
                />
              </Toast.Viewport>
            </Toast>
          </TamaguiProvider>
        )}
      </ThemeNameProvider>
    </GestureHandlerRootView>
  )
}
