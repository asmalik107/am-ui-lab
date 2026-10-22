// Design tokens shared by every app in the lab. Each library maps these into
// its own theme format so all apps render the same colours, spacing and type.
// Plain data only: no imports, so any app's Metro can load it.

export type ThemeName = 'light' | 'dark' | 'brand';

export type ColorTokens = {
  background: string;
  surface: string;
  surfaceRaised: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  onPrimary: string;
  danger: string;
  onDanger: string;
  success: string;
  focus: string;
  scrim: string;
};

export const colors: Record<ThemeName, ColorTokens> = {
  light: {
    background: '#FFFFFF',
    surface: '#F4F4F5',
    surfaceRaised: '#FFFFFF',
    text: '#18181B',
    textMuted: '#52525B',
    border: '#71717A',
    primary: '#1D4ED8',
    onPrimary: '#FFFFFF',
    danger: '#B91C1C',
    onDanger: '#FFFFFF',
    success: '#15803D',
    focus: '#1D4ED8',
    scrim: 'rgba(0,0,0,0.5)',
  },
  dark: {
    background: '#09090B',
    surface: '#18181B',
    surfaceRaised: '#27272A',
    text: '#FAFAFA',
    textMuted: '#A1A1AA',
    border: '#A1A1AA',
    primary: '#93C5FD',
    onPrimary: '#0B1B3A',
    danger: '#FCA5A5',
    onDanger: '#450A0A',
    success: '#86EFAC',
    focus: '#93C5FD',
    scrim: 'rgba(0,0,0,0.7)',
  },
  brand: {
    background: '#FFF7ED',
    surface: '#FFEDD5',
    surfaceRaised: '#FFFFFF',
    text: '#1C1917',
    textMuted: '#57534E',
    border: '#78716C',
    primary: '#C2410C',
    onPrimary: '#FFFFFF',
    danger: '#B91C1C',
    onDanger: '#FFFFFF',
    success: '#15803D',
    focus: '#9A3412',
    scrim: 'rgba(28,25,23,0.5)',
  },
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 6, md: 10, lg: 16, full: 999 } as const;

// Font sizes in points, before the system text-size multiplier is applied.
export const type = {
  caption: { fontSize: 13, lineHeight: 18 },
  body: { fontSize: 16, lineHeight: 22 },
  label: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  heading: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
} as const;

// Apple HIG default control size and Material minimum target, in points/dp.
export const minTarget = { ios: 44, android: 48 } as const;
