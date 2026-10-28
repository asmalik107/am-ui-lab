// Test-screen controls built from gluestack-ui v5 components (copied into
// components/ui by the gluestack CLI). Colours, spacing and type come from the
// shared tokens via Uniwind classNames (see theme.generated.css).
// Accessibility: only props the gluestack docs ask for are passed. Nothing
// here adds roles, states or announcements by hand; see NOTES.md.
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Heading } from '@/components/ui/heading';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-md py-lg">
      <Heading className="text-title text-foreground">{title}</Heading>
      {children}
    </View>
  );
}
