import { useCallback } from 'react';

import { Toast, ToastTitle, useToast } from '@/components/ui/toast';

// Toast via gluestack's useToast. ToastTitle itself calls
// AccessibilityInfo.announceForAccessibility and sets role="alert".
export function useLogSetToast(message: string, testID: string) {
  const toast = useToast();
  return useCallback(() => {
    toast.show({
      placement: 'bottom',
      duration: 4000,
      render: ({ id }) => (
        <Toast nativeID={`toast-${id}`} testID={testID} action="muted" variant="solid">
          <ToastTitle className="text-body text-popover-foreground">{message}</ToastTitle>
        </Toast>
      ),
    });
  }, [toast, message, testID]);
}
