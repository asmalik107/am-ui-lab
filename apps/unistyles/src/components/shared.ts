// Minimum touch target shared by the Unistyles components and styles.
import { Platform } from 'react-native';

import { minTarget } from '@shared/tokens';

export const target = Platform.OS === 'ios' ? minTarget.ios : minTarget.android;
