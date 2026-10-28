// Baseline overlay built on React Native primitives with hand-written accessibility.
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { announce } from '../a11y';
import { useTheme } from '../theme';

// Android reads it through the live region; iOS gets an explicit announcement.
export function Toast({ message, visible, onHide, testID }: { message: string; visible: boolean; onHide: () => void; testID?: string }) {
  const { theme } = useTheme();
  useEffect(() => {
    if (!visible) return;
    announce(message);
    const t = setTimeout(onHide, 4000);
    return () => clearTimeout(t);
  }, [visible, message, onHide]);
  if (!visible) return null;
  return (
    <View
      testID={testID}
      role="alert"
      aria-live="polite"
      style={{ position: 'absolute', left: theme.space.lg, right: theme.space.lg, bottom: theme.space.xxl, backgroundColor: theme.colors.text, borderRadius: theme.radius.md, padding: theme.space.lg }}>
      <Text style={[theme.type.body, { color: theme.colors.background }]}>{message}</Text>
    </View>
  );
}
