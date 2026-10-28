import { type RefObject } from 'react';
import { Text } from 'react-native';

import {
  BottomSheet as GluestackBottomSheet,
  BottomSheetBackdrop as GluestackSheetBackdrop,
  BottomSheetContent,
  BottomSheetDragIndicator,
  BottomSheetPortal,
  type BottomSheetRef,
} from '@/components/ui/bottomsheet';
import { Heading } from '@/components/ui/heading';

import { Button } from './button';

// gluestack's own BottomSheet (`npx gluestack-ui add bottomsheet`), built as
// its docs show: BottomSheet > BottomSheetPortal (backdrop, drag indicator) >
// BottomSheetContent. It wraps @gorhom/bottom-sheet's BottomSheet in
// gluestack's Overlay and colours it from the theme (bg-background), so no
// colours are passed in. It is opened and closed through its documented ref
// (open/close) from the app's own button, like the other sheets, and has no
// accessibility props added by hand.
// https://gluestack.io/ui/docs/components/bottomsheet
export function GluestackSheet({ sheetRef, title, body, close, testID }: { sheetRef: RefObject<BottomSheetRef | null>; title: string; body: string; close: string; testID?: string }) {
  return (
    <GluestackBottomSheet ref={sheetRef}>
      <BottomSheetPortal snapPoints={['40%']} backdropComponent={GluestackSheetBackdrop} handleComponent={BottomSheetDragIndicator}>
        <BottomSheetContent testID={testID} className="p-xl gap-md pb-xxl">
          <Heading className="text-title text-foreground">{title}</Heading>
          <Text className="text-body text-muted-foreground">{body}</Text>
          <Button testID={`${testID}-close`} label={close} variant="secondary" onPress={() => sheetRef.current?.close()} />
        </BottomSheetContent>
      </BottomSheetPortal>
    </GluestackBottomSheet>
  );
}
