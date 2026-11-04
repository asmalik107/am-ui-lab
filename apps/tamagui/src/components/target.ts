// The platform's minimum touch target, as in the baseline: 44 pt on iOS, 48 dp on Android.
import { Platform } from 'react-native'

import { minTarget } from '@shared/tokens'

export const target = Platform.OS === 'ios' ? minTarget.ios : minTarget.android
