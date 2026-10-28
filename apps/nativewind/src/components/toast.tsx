// Toast, the baseline's, restyled with NativeWind. Accessibility props are unchanged from baseline.
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
    <View testID={testID} role="alert" aria-live="polite" className="absolute bottom-xxl left-lg right-lg rounded-md bg-text p-lg">
      <Text className="text-body text-background">{message}</Text>
    </View>
  );
}
