// Accessibility helpers the baseline has to provide by hand.
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

// Live regions (aria-live) only work on Android, so iOS needs an explicit
// announcement. https://reactnative.dev/docs/accessibility#accessibilityliveregion-android
export function announce(message: string) {
  if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(message);
}

// Reads the setting at mount and follows changes, so it is right both when
// Reduce Motion is on at launch and when it is switched on while running.
export function useReduceMotion() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setEnabled);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setEnabled);
    return () => sub.remove();
  }, []);
  return enabled;
}
