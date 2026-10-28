// Pieces RNR doesn't ship: the toast and the third-party bottom sheets.
import { useEffect } from 'react';
import { View } from 'react-native';

import { announce } from '@/a11y';
import { Text } from '@/components/ui/text';
import { type } from '@/lib/type';
import { cn } from '@/lib/utils';

// Hand-built: RNR has no toast. Uniwind classes on RN primitives, with the
// same announcement logic as the baseline (Android live region, iOS
// announceForAccessibility).
export function Toast({ message, visible, onHide, testID }: { message: string; visible: boolean; onHide: () => void; testID?: string }) {
  useEffect(() => {
    if (!visible) return;
    announce(message);
    const t = setTimeout(onHide, 4000);
    return () => clearTimeout(t);
  }, [visible, message, onHide]);
  if (!visible) return null;
  return (
    <View testID={testID} role="alert" aria-live="polite" className="bg-foreground absolute bottom-8 left-4 right-4 rounded-md p-4">
      <Text className={cn(type.body, 'text-background')}>{message}</Text>
    </View>
  );
}
