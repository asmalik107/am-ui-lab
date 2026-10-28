import { Host } from '@expo/ui';
import type { ReactNode } from 'react';
import { useCSSVariable, useUniwind } from 'uniwind';

// @expo/ui Host takes colorScheme / seedColor as props, so they come from the
// active Uniwind theme: the name from useUniwind, the colour from
// useCSSVariable (--color-primary is used in classNames, so it resolves).
// https://docs.uniwind.dev/api/use-css-variable
export function ThemedHost({ children }: { children: ReactNode }) {
  const { theme } = useUniwind();
  const primary = useCSSVariable('--color-primary');
  return (
    <Host matchContents colorScheme={theme === 'dark' ? 'dark' : 'light'} seedColor={typeof primary === 'string' ? primary : undefined}>
      {children}
    </Host>
  );
}
