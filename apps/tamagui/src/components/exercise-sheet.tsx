import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { forwardRef } from 'react'
import { styled, useTheme } from 'tamagui'

import { SheetBody, type SheetContentProps } from './sheet-body'

// Third-party component themed with Tamagui:
// - styled() wraps BottomSheetView (any component that takes `style`), so its
//   padding/gap come from Tamagui tokens. https://tamagui.dev/docs/core/styled
// - gorhom's non-`style` props (backgroundStyle, handleIndicatorStyle) can't go
//   through styled() (v3 removed `accept`), so they read useTheme() values.
//   https://tamagui.dev/docs/core/use-theme
const SheetView = styled(BottomSheetView, {
  p: 'xl',
  pb: 'xxl',
  gap: 'md',
})

export const ExerciseSheet = forwardRef<BottomSheetModal, SheetContentProps>(function ExerciseSheet(props, ref) {
  const theme = useTheme()
  return (
    <BottomSheetModal
      ref={ref}
      accessible={false}
      backgroundStyle={{ backgroundColor: theme['surface-raised'].val }}
      handleIndicatorStyle={{ backgroundColor: theme['border-color'].val }}
      backdropComponent={(p) => <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />}>
      <SheetView testID={props.testID}>
        <SheetBody {...props} />
      </SheetView>
    </BottomSheetModal>
  )
})
