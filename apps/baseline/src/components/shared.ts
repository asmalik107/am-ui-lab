// Helpers shared by the baseline components.
import { Platform } from 'react-native';

import { minTarget } from '@shared/tokens';

export const target = Platform.OS === 'ios' ? minTarget.ios : minTarget.android;
