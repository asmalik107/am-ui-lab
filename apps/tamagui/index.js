// App entry. Tamagui's native integrations must be imported before any Tamagui
// import: https://tamagui.dev/docs/core/native#integrations
// Gesture Handler: correct nested presses and native Sheet drag/scroll hand-off.
import '@tamagui/native/setup-gesture-handler';
// Menu: native menus through @expo/ui on Expo 57 / RN 0.86 (https://tamagui.dev/ui/menu).
import '@tamagui/native/setup-expo-ui-menu';
import 'expo-router/entry';
