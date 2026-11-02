// Check results and chart series read from results/*, shared by
// scripts/checks-md.mjs (the markdown) and scripts/site.mjs (the Pages site).
import { existsSync, readFileSync } from 'node:fs';

export const root = new URL('../', import.meta.url);
export const apps = [
  ['baseline', 'Baseline'],
  ['unistyles', 'Unistyles'],
  ['uniwind', 'Uniwind'],
  ['nativewind', 'NativeWind'],
  ['heroui', 'HeroUI'],
  ['gluestack', 'gluestack'],
  ['tamagui', 'Tamagui'],
  ['reusables', 'Reusables'],
];
export const load = (app, file) => {
  const u = new URL(`results/${app}/${file}`, root);
  return existsSync(u) ? JSON.parse(readFileSync(u, 'utf8')) : null;
};
export const data = Object.fromEntries(apps.map(([a]) => [a, {
  a11y: load(a, 'ios-a11y.json'),
  dark: load(a, 'ios-a11y-dark.json'),
  brand: load(a, 'ios-a11y-brand.json'),
  metrics: load(a, 'ios-metrics.json'),
  perf: load(a, 'ios-perf.json'),
  bundle: load(a, 'bundle.json'),
  androidPerf: load(a, 'android-perf.json'),
  androidMetrics: load(a, 'android-metrics.json'),
  androidA11y: load(a, 'android-a11y.json'),
  androidDark: load(a, 'android-a11y-dark.json'),
  androidBrand: load(a, 'android-a11y-brand.json'),
}]));
export const norm = (check) => check.replace(/^target ≥ \d+(pt|dp)$/, 'touch target');
export const keyOf = (f) => `${f.component} | ${norm(f.check)}`;
const set = { ios: { light: 'a11y', dark: 'dark', brand: 'brand' }, android: { light: 'androidA11y', dark: 'androidDark', brand: 'androidBrand' } };
export const findingsOf = (a, p = 'ios', t = 'light') => data[a][set[p][t]]?.findings;
export const result = (a, key, p) => findingsOf(a, p)?.find((f) => keyOf(f) === key);
export const platform = (p) => (p === 'ios' ? 'iOS' : 'Android');

// Rows in first-seen order across apps, kept together by component.
export const rows = [];
const seen = new Set();
for (const p of ['ios', 'android']) for (const [a] of apps) for (const f of findingsOf(a, p) ?? []) {
  const key = keyOf(f);
  if (!seen.has(key)) { seen.add(key); rows.push({ key, component: f.component, check: norm(f.check) }); }
}
export const order = [...new Set(rows.map((r) => r.component))];
rows.sort((x, y) => order.indexOf(x.component) - order.indexOf(y.component));

export const shown = (check) => check.replace('from VoiceOver', 'from the screen reader');
// The audit's own detail for a result. A long list of exposed elements is
// cut to a count and the first few, which is what a reader needs.
export const detail = (f) => {
  const parts = f.detail?.split(' | ') ?? [];
  if (parts.length > 2) return `${parts[0]}, and ${parts.length - 1} more like it`;
  const m = f.detail?.match(/^still exposed: (.*)$/);
  if (!m) return f.detail;
  const items = m[1].split(', ');
  return items.length > 4 ? `still exposed: ${items.length} elements, such as ${items.slice(0, 3).join(', ')}` : f.detail;
};
export const what = {
  'touch target': 'At least 44 × 44 pt on iOS (Apple’s default) and 48 × 48 dp on Android (Google’s minimum).',
  'name, role, state': 'The screen reader gets a label, the right role, and the current state (disabled, busy, on/off, checked, selected).',
  'all options exposed': 'All three options are separate elements the screen reader can reach.',
  'group label read': 'The group label is in the tree.',
  'error shown': 'After an invalid entry, the error message appears in the tree.',
  'error reachable from field': 'The error is part of the field’s label, value or hint, so it’s read with the field.',
  opens: 'Opens when its trigger is tapped.',
  'screen behind is hidden from VoiceOver': 'While open, nothing behind it is in the accessibility tree.',
  'title is a heading': 'The title has the heading role.',
  'actions are buttons': 'Its actions have the button role.',
  closes: 'Closes from its own Close or Cancel button.',
  'title and body readable': 'The sheet’s title and body text are in the tree.',
  'screen reachable again after close': 'After closing, the screen behind is back in the tree.',
  'current option marked': 'The selected option is marked as checked or selected.',
  'options are actionable': 'Options have a button, radio or option role.',
  'new value read on trigger': 'After picking, the trigger announces the new value.',
  'in accessibility tree': 'The toast appears in the tree while it is on screen.',
  'test could run': 'The element the test needs was there, so the test could run.',
  'name, role, value': 'The screen reader gets a label, the adjustable role and the current value.',
  'dragging changes the value': 'Dragging the thumb changes the value in the tree. It stands in for the screen reader’s adjust gesture.',
  'name and value': 'The screen reader gets a label and the current value.',
  'header is a button': 'The section header has the button role.',
  'expanded state exposed': 'The header reads as expanded when open and not when closed.',
  'content shows and hides': 'The section text appears on the first tap and goes on the second.',
  'trigger name and role': 'The menu button has a label and the button role.',
  'items are buttons': 'Each menu action has the button role.',
  'closes after an action': 'Choosing an action closes the menu.',
  'options have name and role': 'Each option has a label and a button, radio or tab role.',
  'selected option marked': 'The selected option is marked as selected or checked, and the others aren’t.',
  'selection moves on tap': 'Tapping another option moves the selected state to it.',
};

// A check the app never produced is either not applicable or, when its own
// "test could run" check failed, not run.
const ran = (a, r, p) => {
  const own = findingsOf(a, p)?.filter((f) => f.component === r.component);
  if (!own) return null;
  if (r.check === 'test could run') return own.length ? { pass: true, detail: 'test ran' } : null;
  return own.some((f) => f.check === 'test could run' && !f.pass) ? { notRun: true } : null;
};
export const differs = (i, d) => !!i && !!d && !i.notRun && !d.notRun && i.pass !== d.pass;
export const get = (a, r, p) => result(a, r.key, p) ?? ran(a, r, p);

// Bottom sheets: the five checks every sheet gets, and which component holds
// each kind of sheet in each app. In the HeroUI app the shared sheet slot holds
// HeroUI's own sheet and @gorhom is the extra one.
export const sheetChecks = ['opens', 'title and body readable', 'screen behind is hidden from VoiceOver', 'closes', 'screen reachable again after close'];
const ownSheet = { heroui: 'Bottom sheet', tamagui: 'Bottom sheet (Tamagui Sheet)', gluestack: 'Bottom sheet (gluestack BottomSheet)' };
export const sheetKinds = [
  ['@gorhom/bottom-sheet', 'the raw third-party sheet, themed with the library’s tokens', (a) => (a === 'heroui' ? 'Bottom sheet (@gorhom, raw)' : 'Bottom sheet')],
  ['@expo/ui BottomSheet', 'the native sheet, filled with @expo/ui’s own Text and Button', () => 'Bottom sheet (@expo/ui)'],
  ['The library’s own sheet', 'the sheet component the library ships, set up as its docs show', (a) => ownSheet[a]],
];

// --- Chart series. rows: [{ label, ios: {value, text}, android: {value, text} }]
// or, for one platform, [{ label, value, text }].
const num = (a, f) => { try { return f(data[a]); } catch { return null; } };
export const part = (f) => (f.component.startsWith('Bottom sheet (') ? 'sheets' : 'screen');
export const tally = (fs, which) => {
  const x = (fs ?? []).filter((f) => part(f) === which);
  return x.length ? { pass: x.filter((f) => f.pass).length, total: x.length } : null;
};
const score = (t) => ({ value: t ? (t.pass / t.total) * 100 : null, text: t ? `${t.pass} / ${t.total}` : 'not run' });
const val = (a, get, fmt) => { const v = num(a, get); return { value: v, text: v == null ? 'not measured' : fmt(v) }; };
const msF = (v) => `${v.toFixed(1)} ms`;
const sF = (v) => `${(v / 1000).toFixed(2)} s`;
const mbF = (v) => `${v.toFixed(2)} MB`;
const mibF = (v) => `${v.toFixed(1)} MiB`;

// [file, title, subtitle, how to read it, series]
const paired = (rows) => ({ kind: 'paired', rows });
const single = (rows, cls) => ({ kind: 'single', rows, cls });
export const charts = [
  ['accessibility-test-screen', 'Accessibility: the test screen', 'Share of checks passed, all 19 items. Longer is better.', [
    'The baseline and the three styling engines share the same hand-built components. Their bars are what careful hand-built accessibility reaches.',
    'A library’s gap to them is what you would have to fix yourself.',
  ], paired(apps.map(([a, name]) => ({ label: name, ios: score(tally(findingsOf(a, 'ios'), 'screen')), android: score(tally(findingsOf(a, 'android'), 'screen')) })))],
  ['accessibility-extra-sheets', 'Accessibility: the extra bottom sheets', '5 checks per sheet. Longer is better.', [
    'Sheets: @expo/ui in every app, Tamagui’s and gluestack’s own, and a raw @gorhom sheet in HeroUI.',
  ], paired(apps.map(([a, name]) => ({ label: name, ios: score(tally(findingsOf(a, 'ios'), 'sheets')), android: score(tally(findingsOf(a, 'android'), 'sheets')) })))],
  ['theme-switch', 'Theme switch, median of 10', 'From the tap to the second frame after the update. Shorter is better.', [
    'iOS: every app finishes within a frame (about 32 ms), except Tamagui (99 ms).',
    'Android: Tamagui (630 ms) stands out, then HeroUI (239 ms).',
    'The other gaps are within each app’s run-to-run spread.',
  ], paired(apps.map(([a, name]) => ({ label: name, ios: val(a, (d) => d.perf.theme.median, msF), android: val(a, (d) => d.androidPerf.theme.median, msF) })))],
  ['list-mount', '200-row list mount, median of 10', 'From the tap to the second frame after the list’s first layout. Shorter is better.', [
    'iOS: about 83 ms everywhere, except Tamagui (115 ms).',
    'Android: most apps take 150–180 ms, with overlapping ranges. Tamagui takes 365 ms.',
  ], paired(apps.map(([a, name]) => ({ label: name, ios: val(a, (d) => d.perf.list.median, msF), android: val(a, (d) => d.androidPerf.list.median, msF) })))],
  ['startup', 'Startup until readable, median of 10', 'Until the screen title is in the accessibility tree. Not first paint.', [
    'Within each platform the apps sit close together, so read them as groups.',
    'Don’t compare the platforms: the simulator’s accessibility tree is slow to become readable.',
  ], paired(apps.map(([a, name]) => ({ label: name, ios: val(a, (d) => d.metrics.startup.median, sF), android: val(a, (d) => d.androidMetrics.startup.median, sF) })))],
  ['memory-idle', 'Memory at idle', '5 s after launch. Shorter is better. iOS phys_footprint, Android total PSS.', [
    'Compare apps within a platform, not across: the two are different measures.',
    'On both, the component libraries use more than the baseline, and HeroUI the most.',
  ], paired(apps.map(([a, name]) => ({ label: name, ios: val(a, (d) => d.metrics.memory.idle.physFootprint / 1048576, mibF), android: val(a, (d) => d.androidMetrics.memory.idle.pss / 1048576, mibF) })))],
  ['memory-used', 'Memory after use', 'After scrolling the list and opening every overlay once. Shorter is better.', [
    'iOS: Tamagui (161 MiB) stands out.',
    'Android: HeroUI (416 MiB) and gluestack (286 MiB) grow far more than the rest.',
  ], paired(apps.map(([a, name]) => ({ label: name, ios: val(a, (d) => d.metrics.memory.used.physFootprint / 1048576, mibF), android: val(a, (d) => d.androidMetrics.memory.used.pss / 1048576, mibF) })))],
  ['cpu-flings', 'App CPU time during 5 list flings', 'CPU used by the app over about 7.5 s of flinging. Shorter is better.', [
    'Compare apps within a platform: the simulator runs on a Mac, the phone on a budget CPU.',
    'HeroUI uses the most on both.',
  ], paired(apps.map(([a, name]) => ({ label: name, ios: val(a, (d) => d.metrics.scroll.cpuMs.total, sF), android: val(a, (d) => d.androidMetrics.scroll.cpuMs.total, sF) })))],
  ['bundle', 'JS bundle', 'Hermes bytecode from expo export. Shorter is better.', [
    'Exact, with no run-to-run noise.',
    'The baseline is plain React Native, so the gap to it is what the library adds.',
  ], paired(apps.map(([a, name]) => ({ label: name, ios: val(a, (d) => d.bundle.iosHbcBytes / 1e6, mbF), android: val(a, (d) => d.bundle.androidHbcBytes / 1e6, mbF) })))],
  ['rerenders', 'iOS: components re-rendered on one theme switch', 'Light → dark, React profiler on a Debug build. Fewer is better.', [
    'Tamagui isn’t measured: its Debug build aborts.',
  ], single(apps.map(([a, name]) => ({ label: name, ...val(a, (d) => d.metrics.rerenders.switches[0].renders, String) })), 'ios')],
  ['janky-frames', 'Android: janky frames during the flings', 'Out of about 1,250 frames, from dumpsys gfxinfo. Fewer is better.', [
    'At most 1 janky frame in any app, so scrolling is smooth everywhere.',
  ], single(apps.map(([a, name]) => ({ label: name, ...val(a, (d) => d.androidMetrics.scroll.frames.janky, String) })), 'android')],
];
