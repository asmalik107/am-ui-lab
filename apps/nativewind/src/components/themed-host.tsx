import { Host } from '@expo/ui';
import { styled } from 'nativewind';

import { useThemeName } from '../theme';

// @expo/ui Host takes seedColor as a prop. styled() sends the colour of a
// className (text-primary, a theme variable) to that prop. colorScheme is
// not a style value, so it comes from the theme name.
// https://www.nativewind.dev/v5/guides/third-party-components
const StyledHost = styled(Host, {
  className: { target: false, nativeStyleMapping: { color: 'seedColor' } },
});

export function ThemedHost({ children }: { children: React.ReactNode }) {
  const { name } = useThemeName();
  return (
    <StyledHost matchContents colorScheme={name === 'dark' ? 'dark' : 'light'} className="text-primary">
      {children}
    </StyledHost>
  );
}
