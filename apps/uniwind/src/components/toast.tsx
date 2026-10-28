// Toast, ported from the baseline to Uniwind. Accessibility is hand-written exactly as in the baseline.
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { announce } from '../a11y';

// Android reads it through the live region; iOS gets an explicit announcement.
export function Toast({ message, visible, onHide, testID }: { message: string; visible: boolean; onHide: () => void; testID?: string }) {
  useEffect(() => {
    if (!visible) return;
    announce(message);
    const t = setTimeout(onHide, 4000);
    return () => clearTimeout(t);
  }, [visible, message, onHide]);
  if (!visible) return null;
  return (
    <View testID={testID} role="alert" aria-live="polite" className="absolute bottom-8 left-4 right-4 rounded-md bg-text p-4">
      <Text className="text-body text-background">{message}</Text>
    </View>
  );
}
