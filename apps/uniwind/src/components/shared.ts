// Baseline controls ported to Uniwind. Uniwind ships no components, so
// accessibility (roles, labels, states) is still hand-written exactly as in
// the baseline. What changes is styling: every style is a Tailwind className
// resolved against the active theme's CSS variables (src/global.css), so a
// theme switch needs no React context.
//
// Class names are always written out in full (no string building), because
// Tailwind finds them by scanning the source.
// https://docs.uniwind.dev/tailwind-basics#working-with-dynamic-classnames

// Minimum target: 44 pt on iOS, 48 dp on Android (shared/tokens minTarget),
// via Uniwind's platform selectors. min-h, never h, so controls grow with the
// system text size. https://docs.uniwind.dev/api/platform-select
export const targetH = 'ios:min-h-11 android:min-h-12';
