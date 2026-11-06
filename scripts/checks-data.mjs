// Check results and chart series read from results/*, shared by
// scripts/checks-md.mjs (the markdown) and scripts/site.mjs (the Pages site).
import { existsSync, readFileSync } from 'node:fs';
import { measuredOn } from './scorecard.mjs';
import { alt, pictureFor } from './check-pictures.mjs';

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
  // iOS performance is from the cabled iPhone where it has been run, else the simulator.
  metrics: load(a, 'iphone-metrics.json') ?? load(a, 'ios-metrics.json'),
  perf: load(a, 'iphone-perf.json') ?? load(a, 'ios-perf.json'),
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
// Every check, explained for a reader: a plain name, what the audit does,
// what passing and failing look like, and the diagram that shows it
// (scripts/check-pictures.mjs). Keyed by the check's name in results/*.
// [name, does, passes, fails, picture]
const E = (name, does, passes, fails, picture) => ({ name, does, passes, fails, picture });
export const explain = {
  'touch target': E('touch target', 'Measures the control’s frame in the accessibility tree.', 'At least 44 × 44 pt on iOS (Apple’s default control size) and 48 × 48 dp on Android (Google’s minimum).', 'Either side is smaller, so it is easy to miss with a finger.', 'target-button'),
  'name, role, state': E('name, role, state', 'Reads the control from the accessibility tree.', 'It has a label, the right role (button, switch, checkbox…) and its current state: disabled, busy, on/off, checked or selected.', 'Any of the three is missing or wrong, e.g. a switch read as just “Workout reminders”.', 'switch-nrs'),
  'all options exposed': E('all options exposed', 'Counts the radio options in the accessibility tree.', 'All three options are separate elements the screen reader can move to.', 'Fewer than three: options are merged into one element or missing.', 'radio-options'),
  'group label read': E('group label read', 'Looks for the radio group’s label in the accessibility tree.', 'The label “Experience level” is in the tree.', 'It is drawn on screen but the screen reader can’t reach it.', 'radio-label'),
  'error shown': E('error shown', 'Types “not-an-email” into the email field, moves focus away, then looks for the error.', 'The message “Enter a valid email” appears in the tree.', 'The error never appears in the tree.', 'field-error-shown'),
  'error reachable from field': E('error reachable from field', 'Reads the email field after the error appears.', 'The error is part of the field’s label, value or hint, so it is read with the field.', 'The field is read without the error, so a screen reader user has to go looking for it.', 'field-error-linked'),
  opens: E('opens', 'Taps the trigger and waits for the overlay’s content in the tree.', 'Its title or content appears.', 'Nothing appears in the tree after the tap.', 'dialog-opens'),
  'screen behind is hidden from VoiceOver': E('screen behind is hidden from the screen reader', 'With the overlay open, lists every element the screen reader can reach.', 'Only the overlay’s own elements: nothing from the screen behind it.', 'Controls behind the overlay can still be reached, e.g. “Delete workout, button” behind the dialog.', 'dialog-behind'),
  'title is a heading': E('title is a heading', 'Reads the dialog title’s role.', 'The title has the heading role, so it is read as “…, heading”.', 'It is read as plain text.', 'dialog-heading'),
  'actions are buttons': E('actions are buttons', 'Reads the role of the dialog’s Cancel action.', 'It has the button role.', 'It is read as plain text, so the user isn’t told it can be activated.', 'dialog-buttons'),
  closes: E('closes', 'Taps the overlay’s own Close or Cancel button.', 'The overlay leaves the tree.', 'It is still open.', 'dialog-closes'),
  'title and body readable': E('title and body readable', 'Looks for the sheet’s title and body text in the tree.', 'Both are in the tree.', 'The text is drawn but the screen reader can’t reach it.', 'sheet-text'),
  'screen reachable again after close': E('screen reachable again after close', 'After the sheet closes, looks for the screen’s controls in the tree.', 'They are back, so the screen reader can use the screen again.', 'They are still hidden, as if the sheet were open.', 'sheet-after'),
  'current option marked': E('current option marked', 'Opens the select and reads the option that is already chosen (60 seconds).', 'It is marked as selected or checked.', 'Nothing says which option is chosen.', 'select-current'),
  'options are actionable': E('options are actionable', 'Reads the role of every option in the open select.', 'Each has a button, radio or option role.', 'At least one is read as plain text.', 'select-options'),
  'new value read on trigger': E('new value read on trigger', 'Picks 90 seconds, then reads the select’s trigger.', 'The trigger reads the new value.', 'It still reads the old value, or no value.', 'select-new-value'),
  'in accessibility tree': E('screen reader can find it', 'Shows the toast and looks for its text in the tree within 3 s.', 'The toast is in the tree while it is on screen.', 'It is drawn but not in the tree, so the screen reader never finds it.', 'toast'),
  'test could run': E('test could start', 'Looks for the element the test starts from.', 'It was there, so the test’s other checks ran.', 'It wasn’t, so the test’s other checks are marked not run (n/r).', 'test-ran'),
  'name, role, value': E('name, role, value', 'Reads the slider from the accessibility tree.', 'It has a label, the adjustable role and its current value.', 'Any of the three is missing.', 'slider-nrs'),
  'dragging changes the value': E('dragging changes the value', 'Drags the thumb across the track and reads the value before and after. It stands in for the screen reader’s adjust gesture.', 'The value in the tree changes.', 'The value stays the same.', 'slider-drag'),
  'name and value': E('name and value', 'Reads the progress bar from the accessibility tree.', 'It has a label and its current value.', 'The label or the value is missing.', 'progress-nrs'),
  'header is a button': E('header is a button', 'Reads the role of the accordion’s first header.', 'It has the button role.', 'It is read as plain text.', 'accordion-button'),
  'expanded state exposed': E('expanded state exposed', 'Reads the header closed, taps it, and reads it open.', 'It reads as expanded when open and not when closed.', 'It reads the same either way.', 'accordion-expanded'),
  'content shows and hides': E('content shows and hides', 'Taps the header twice, looking for the section text after each tap.', 'The text appears on the first tap and goes on the second.', 'It doesn’t appear, or doesn’t go.', 'accordion-content'),
  'trigger name and role': E('trigger name and role', 'Reads the menu button from the accessibility tree.', 'It has a label and the button role.', 'The label or the role is missing.', 'menu-trigger'),
  'items are buttons': E('items are buttons', 'Reads the role of each menu action.', 'Each has the button role.', 'At least one is read as plain text.', 'menu-items'),
  'closes after an action': E('closes after an action', 'Taps the first menu action.', 'The menu leaves the tree.', 'It is still open.', 'menu-closes'),
  'options have name and role': E('options have name and role', 'Reads each segment of the segmented control.', 'Each has a label and a button, radio or tab role.', 'A label or role is missing.', 'segmented-nrs'),
  'selected option marked': E('selected option marked', 'Reads every segment’s state.', 'The selected one is marked as selected or checked, and the others aren’t.', 'Nothing says which is selected.', 'segmented-selected'),
  'selection moves on tap': E('selection moves on tap', 'Taps the second segment and reads the states again.', 'The selected state moves to it.', 'It stays on the first, or isn’t marked at all.', 'segmented-moves'),
  'every stop has a name': E('everything the screen reader lands on has a name', 'With the overlay open, lists every element the screen reader can move to (each “stop”) and looks for any without a label.', 'Every one has a name.', 'At least one has none, e.g. a full-screen dimmed backdrop that TalkBack reads as “Unlabelled”.', 'dialog-unnamed'),
};
// A check the explain map doesn't cover would show up blank, so the
// generators call this and fail instead.
export const explained = (checks) => {
  const missing = [...new Set(checks)].filter((c) => !explain[c]);
  if (missing.length) throw new Error(`No entry in explain (scripts/checks-data.mjs) for: ${missing.join(', ')}`);
};
export const shown = (check) => explain[check]?.name ?? check;
// A check's full explanation in markdown, as one list item.
export const explainMd = (check) => {
  const e = explain[check];
  return `- **${e.name}:** ${e.does}\n  - **Passes:** ${e.passes}\n  - **Fails:** ${e.fails}`;
};
// The picture for a component's check: drawn as that component where there
// is one, else the check's default.
export const pictureOf = (component, check) => pictureFor(component, check, explain[check].picture);
// What the audit read, cut to fit under a picture: sizes only for touch
// targets, empty values dropped, long lists cut to their first item.
const exampleText = (f) => {
  const d = String(f.detail ?? '');
  if (/^target/.test(f.check)) return `frame ${d.replace(/ \(system tree.*\)$/, '')}, minimum ${f.check.replace('target ≥ ', '')}`;
  if (d === 'missing') return 'missing: not found in the tree';
  const exposed = d.match(/^still exposed: (.*)$/);
  if (exposed) { const items = exposed[1].split(', '); return `still exposed: ${items.length} elements, e.g. ${items.slice(0, 2).join(', ')}`; }
  const parts = d.split(' | ');
  const clean = (x) => x.replace(/ value=""/g, '').replace(/ \d+(\.\d+)?×\d+(\.\d+)?(pt|dp)/g, '').replace(/ \(system tree[^)]*\)/g, '').replace(/ role="[^"]*"/, '');
  return clean(parts[0]) + (parts.length > 1 ? ` (+${parts.length - 1} more)` : '');
};
const appName = Object.fromEntries(apps);
const shortComponent = (c) => (c.startsWith('Bottom sheet (') ? `${c.slice(14, -1).replace(/ BottomSheet| Sheet/, '')} sheet` : c);
const sourceOf = (a, p, f) => `${appName[a]}, ${platform(p)} · ${shortComponent(f.component)}`;
// One real passing and one real failing result per picture, light theme. The
// pass prefers the baseline on iOS; the fail is the first app that fails.
export const examples = (() => {
  const out = {};
  for (const p of ['ios', 'android']) for (const [a] of apps) for (const f of findingsOf(a, p) ?? []) {
    const id = pictureOf(f.component, norm(f.check));
    const slot = (out[id] ??= {});
    const key = f.pass ? 'pass' : 'fail';
    const ex = { text: exampleText(f), source: sourceOf(a, p, f) };
    const preferred = f.pass && a === 'baseline' && p === 'ios';
    if (!slot[key] || (preferred && !slot.fromBaseline)) { slot[key] = ex; if (preferred) slot.fromBaseline = true; }
  }
  for (const slot of Object.values(out)) delete slot.fromBaseline;
  return out;
})();
// Markdown image for a picture, from a page in docs/.
export const pictureMd = (id) => `![${alt(id)}](checks/pictures/${id}.svg)`;
// Every check once, with its picture: the glossary on docs/method.md. Each
// component's own picture is with its table in docs/checks.md.
export const glossaryMd = () => [
  '**Each picture** shows a pass next to a fail, drawn as one component the check runs on. The dashed outline is where the screen reader’s focus is, a pink dot is a tap, and the bubble under the screen is what the screen reader is given. Each component’s own pictures are under its table in [All checks](checks.md).',
  ...Object.keys(explain).map((c) => [`#### ${explain[c].name}`, pictureMd(explain[c].picture), explainMd(c)].join('\n\n')),
].join('\n\n');
// One line: what is checked and what passes.
export const what = Object.fromEntries(Object.entries(explain).map(([k, e]) => [k, `${e.does} Passes when: ${e.passes.charAt(0).toLowerCase()}${e.passes.slice(1)}`]));


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
    'iOS: five apps take two frames (about 33 ms), gluestack and HeroUI about 65 ms, Tamagui 116 ms.',
    'Android: Tamagui (630 ms) stands out, then HeroUI (239 ms).',
    'The other gaps are within each app’s run-to-run spread.',
  ], paired(apps.map(([a, name]) => ({ label: name, ios: val(a, (d) => d.perf.theme.median, msF), android: val(a, (d) => d.androidPerf.theme.median, msF) })))],
  ['list-mount', '200-row list mount, median of 10', 'From the tap to the second frame after the list’s first layout. Shorter is better.', [
    'iOS: 94–102 ms in most apps, NativeWind 118 ms and Tamagui 135 ms.',
    'Android: most apps take 150–180 ms, with overlapping ranges. Tamagui takes 365 ms.',
  ], paired(apps.map(([a, name]) => ({ label: name, ios: val(a, (d) => d.perf.list.median, msF), android: val(a, (d) => d.androidPerf.list.median, msF) })))],
  ['startup', 'Startup until readable, median of 10', 'Until the screen title is in the accessibility tree. Not first paint.', [
    'Within each platform the apps sit close together, so read them as groups.',
    'iOS: 1.2–1.3 s in every app, which is within one poll of the accessibility tree (about 0.5 s), so they can’t be told apart.',
    'Android: 2.8–3.5 s, with the component libraries at the slow end.',
  ], paired(apps.map(([a, name]) => ({ label: name, ios: val(a, (d) => d.metrics.startup.median, sF), android: val(a, (d) => d.androidMetrics.startup.median, sF) })))],
  ['memory-idle', 'Memory at idle', '5 s after launch. Shorter is better. iOS phys_footprint, Android total PSS.', [
    'Compare apps within a platform, not across: the two are different measures.',
    'On both, the component libraries use more than the baseline, and HeroUI the most.',
  ], paired(apps.map(([a, name]) => ({ label: name, ios: val(a, (d) => d.metrics.memory.idle.physFootprint / 1048576, mibF), android: val(a, (d) => d.androidMetrics.memory.idle.pss / 1048576, mibF) })))],
  ['memory-used', 'Memory after use', 'After scrolling the list and opening every overlay once. Shorter is better.', [
    'iOS: Tamagui (144 MiB) stands out.',
    'Android: HeroUI (416 MiB) and gluestack (286 MiB) grow far more than the rest.',
  ], paired(apps.map(([a, name]) => ({ label: name, ios: val(a, (d) => d.metrics.memory.used.physFootprint / 1048576, mibF), android: val(a, (d) => d.androidMetrics.memory.used.pss / 1048576, mibF) })))],
  ['cpu-flings', 'App CPU time during 5 list flings', 'CPU used by the app while the list is flung 5 times. Shorter is better.', [
    'Compare apps within a platform: on the iPhone each fling is injected by XCUITest, which spreads the 5 over about 27 s and adds its own work.',
    'Tamagui uses the most on iOS, HeroUI on Android, and each is second on the other.',
  ], paired(apps.map(([a, name]) => ({ label: name, ios: val(a, (d) => d.metrics.scroll.cpuMs.total, sF), android: val(a, (d) => d.androidMetrics.scroll.cpuMs.total, sF) })))],
  ['dropped-frames', 'Dropped frames during the flings', 'iOS: hitches from Instruments, of about 1,000 frames. Android: janky frames from dumpsys gfxinfo, of about 1,250. Fewer is better.', [
    'At most 1 in any app on either phone, so scrolling is smooth everywhere.',
  ], paired(apps.map(([a, name]) => ({ label: name, ios: val(a, (d) => d.metrics.scroll.hitches.count, String), android: val(a, (d) => d.androidMetrics.scroll.frames.janky, String) })))],
  ['bundle', 'JS bundle', 'Hermes bytecode from expo export. Shorter is better.', [
    'Exact, with no run-to-run noise.',
    'The baseline is plain React Native, so the gap to it is what the library adds.',
  ], paired(apps.map(([a, name]) => ({ label: name, ios: val(a, (d) => d.bundle.iosHbcBytes / 1e6, mbF), android: val(a, (d) => d.bundle.androidHbcBytes / 1e6, mbF) })))],
  ['rerenders', 'Components re-rendered on one theme switch', 'Light → dark, React profiler on a Debug build. Fewer is better.', [
    'Unistyles re-renders the fewest on both platforms, HeroUI and Tamagui the most.',
    'Tamagui has Android counts only: its Debug build aborts on iOS. A closed Select keeps a hidden `display: none` view, which trips an open React Native bug, [react-native#52349](https://github.com/react/react-native/issues/52349). Release builds aren’t affected.',
  ], paired(apps.map(([a, name]) => ({ label: name, ios: val(a, (d) => d.metrics.rerenders.switches[0].renders, String), android: val(a, (d) => d.androidMetrics.rerenders.switches[0].renders, String) })))],
];

// The devices behind each chart, from the shared map in scorecard.mjs.
export const chartGroup = {
  'accessibility-test-screen': 'accessibility', 'accessibility-extra-sheets': 'accessibility',
  'theme-switch': 'timings', 'list-mount': 'timings',
  startup: 'metrics', 'memory-idle': 'metrics', 'memory-used': 'metrics', 'cpu-flings': 'metrics', 'dropped-frames': 'metrics',
  bundle: 'bundle', rerenders: 'rerenders',
};
export const chartDevices = (file) => {
  const [ios, android] = measuredOn[chartGroup[file]];
  const one = charts.find((c) => c[0] === file)[4];
  if (one.kind === 'single') return one.cls === 'ios' ? `iOS: ${ios}.` : `Android: ${android}.`;
  return file === 'bundle' ? 'no device, built with expo export.' : `iOS: ${ios}. Android: ${android}.`;
};
