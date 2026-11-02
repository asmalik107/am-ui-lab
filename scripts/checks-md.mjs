// Builds docs/checks.md (every accessibility check for every app, iOS and
// Android side by side, plus the charts as SVG files in docs/charts/) and
// docs/android-accessibility.md (every Android failure).
// Reads only results/*. Usage: node scripts/checks-md.mjs
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { anchored, nav } from './scorecard.mjs';

const root = new URL('../', import.meta.url);
const apps = [
  ['baseline', 'Baseline'],
  ['unistyles', 'Unistyles'],
  ['uniwind', 'Uniwind'],
  ['nativewind', 'NativeWind'],
  ['heroui', 'HeroUI'],
  ['gluestack', 'gluestack'],
  ['tamagui', 'Tamagui'],
  ['reusables', 'Reusables'],
];
const load = (app, file) => {
  const u = new URL(`results/${app}/${file}`, root);
  return existsSync(u) ? JSON.parse(readFileSync(u, 'utf8')) : null;
};
const data = Object.fromEntries(apps.map(([a]) => [a, {
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
const norm = (check) => check.replace(/^target ≥ \d+(pt|dp)$/, 'touch target');
const keyOf = (f) => `${f.component} | ${norm(f.check)}`;
const set = { ios: { light: 'a11y', dark: 'dark', brand: 'brand' }, android: { light: 'androidA11y', dark: 'androidDark', brand: 'androidBrand' } };
const findingsOf = (a, p = 'ios', t = 'light') => data[a][set[p][t]]?.findings;
const result = (a, key, p) => findingsOf(a, p)?.find((f) => keyOf(f) === key);
const platform = (p) => (p === 'ios' ? 'iOS' : 'Android');
// Table cells can't hold a line break on every renderer, so pipes are escaped
// and nothing here spans lines.
const cellText = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

// Rows in first-seen order across apps, kept together by component.
const rows = [];
const seen = new Set();
for (const p of ['ios', 'android']) for (const [a] of apps) for (const f of findingsOf(a, p) ?? []) {
  const key = keyOf(f);
  if (!seen.has(key)) { seen.add(key); rows.push({ key, component: f.component, check: norm(f.check) }); }
}
const order = [...new Set(rows.map((r) => r.component))];
rows.sort((x, y) => order.indexOf(x.component) - order.indexOf(y.component));

const shown = (check) => check.replace('from VoiceOver', 'from the screen reader');
// The audit's own detail for a result. A long list of exposed elements is
// cut to a count and the first few, which is what a reader needs.
const detail = (f) => {
  const parts = f.detail?.split(' | ') ?? [];
  if (parts.length > 2) return `${parts[0]}, and ${parts.length - 1} more like it`;
  const m = f.detail?.match(/^still exposed: (.*)$/);
  if (!m) return f.detail;
  const items = m[1].split(', ');
  return items.length > 4 ? `still exposed: ${items.length} elements, such as ${items.slice(0, 3).join(', ')}` : f.detail;
};
const what = {
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
const mark = (f) => (f?.notRun ? 'n/r' : !f ? '➖' : f.pass ? '✅' : '❌');
const differs = (i, d) => !!i && !!d && !i.notRun && !d.notRun && i.pass !== d.pass;
const get = (a, r, p) => result(a, r.key, p) ?? ran(a, r, p);

// One section per component: a table of its checks, then what each check
// means and why any failed, folded away.
const isSheet = (c) => c.startsWith('Bottom sheet');
const components = order.filter((c) => !isSheet(c));
const componentSection = (c) => {
  const own = rows.filter((r) => r.component === c);
  const table = [
    `| Check | ${apps.map(([, name]) => `${name}<br>iOS / Android`).join(' | ')} |`,
    `| --- | ${apps.map(() => '---').join(' | ')} |`,
    ...own.map((r) => `| ${cellText(shown(r.check))} | ${apps.map(([a]) => {
      const i = get(a, r, 'ios');
      const d = get(a, r, 'android');
      return `${mark(i)} / ${mark(d)}${differs(i, d) ? ' ⚠️' : ''}`;
    }).join(' | ')} |`),
  ].join('\n');
  const meanings = own.map((r) => `- **${shown(r.check)}:** ${what[r.check] ?? ''}`).join('\n');
  const failures = apps.map(([a, name]) => {
    const fails = own.flatMap((r) => ['ios', 'android'].map((p) => [p, r, result(a, r.key, p)])).filter(([, , f]) => f && !f.pass);
    return fails.length ? [`- **${name}**`, ...fails.map(([p, r, f]) => `  - ${platform(p)}, ${shown(r.check)}: ${detail(f)}`)].join('\n') : '';
  }).filter(Boolean).join('\n');
  return [
    `### ${c}`,
    table,
    `<details>\n<summary>What each check means</summary>\n\n${meanings}\n\n</details>`,
    failures ? `<details>\n<summary>Why checks failed</summary>\n\n${failures}\n\n</details>` : 'No check failed for any app.',
  ].join('\n\n');
};

// Bottom sheets: one row per kind of sheet. Each cell is the app's score out
// of 5 on iOS and on Android. In the HeroUI app the shared sheet slot holds
// HeroUI's own sheet and @gorhom is the extra one.
const sheetChecks = ['opens', 'title and body readable', 'screen behind is hidden from VoiceOver', 'closes', 'screen reachable again after close'];
const ownSheet = { heroui: 'Bottom sheet', tamagui: 'Bottom sheet (Tamagui Sheet)', gluestack: 'Bottom sheet (gluestack BottomSheet)' };
const sheetKinds = [
  ['@gorhom/bottom-sheet', 'the raw third-party sheet, themed with the library’s tokens', (a) => (a === 'heroui' ? 'Bottom sheet (@gorhom, raw)' : 'Bottom sheet')],
  ['@expo/ui BottomSheet', 'the native sheet, filled with @expo/ui’s own Text and Button', () => 'Bottom sheet (@expo/ui)'],
  ['The library’s own sheet', 'the sheet component the library ships, set up as its docs show', (a) => ownSheet[a]],
];
const sheetScore = (a, comp, p) => {
  const fs = comp ? sheetChecks.map((c) => result(a, `${comp} | ${c}`, p)).filter(Boolean) : [];
  const n = fs.filter((f) => f.pass).length;
  return fs.length ? `${n === fs.length ? '✅' : '❌'} ${n}/${fs.length}` : '➖';
};
const sheetSection = () => {
  const table = [
    `| Sheet | ${apps.map(([, name]) => `${name}<br>iOS / Android`).join(' | ')} |`,
    `| --- | ${apps.map(() => '---').join(' | ')} |`,
    ...sheetKinds.map(([label, , pick]) => `| ${label} | ${apps.map(([a]) => `${sheetScore(a, pick(a), 'ios')} / ${sheetScore(a, pick(a), 'android')}`).join(' | ')} |`),
  ].join('\n');
  const kinds = sheetKinds.map(([label, about]) => `- **${label}:** ${about}`).join('\n');
  const failures = apps.map(([a, name]) => {
    const fails = sheetKinds.flatMap(([label, , pick]) => ['ios', 'android'].flatMap((p) => sheetChecks.map((c) => [label, p, c, pick(a) && result(a, `${pick(a)} | ${c}`, p)])))
      .filter(([, , , f]) => f && !f.pass);
    return fails.length ? [`- **${name}**`, ...fails.map(([label, p, c, f]) => `  - ${label}, ${platform(p)}, ${shown(c)}: ${detail(f)}`)].join('\n') : '';
  }).filter(Boolean).join('\n');
  return [
    '### Bottom sheets',
    `Each sheet gets the same 5 checks: ${sheetChecks.map(shown).join(', ')}. Each cell is the number passed, iOS / Android: ✅ all passed, ❌ at least one failed, ➖ the app has no such sheet.`,
    table,
    `<details>\n<summary>The three sheets</summary>\n\n${kinds}\n\n</details>`,
    failures ? `<details>\n<summary>Why checks failed</summary>\n\n${failures}\n\n</details>` : '',
  ].filter(Boolean).join('\n\n');
};

// Checks whose result in the dark or brand theme differs from light.
const themeDiffs = ['ios', 'android'].flatMap((p) => apps.flatMap(([a, name]) => ['dark', 'brand'].flatMap((t) => (findingsOf(a, p, t) ?? [])
  .filter((f) => { const l = result(a, keyOf(f), p); return l && l.pass !== f.pass; })
  .map((f) => `- **${name}, ${platform(p)}, ${t} theme:** ${f.component}, ${shown(norm(f.check))}: ${f.pass ? 'passes' : 'fails'}, where light ${f.pass ? 'fails' : 'passes'}. ${detail(f)}`))));

// --- Charts: one standalone SVG per chart in docs/charts/, with its own
// light and dark colours, so GitHub and editors show it as an image.
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const W = 640;
const LABEL = 120;
const style = `<style>
svg { font: 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
.bg { fill: #ffffff; } .h { fill: #1d1d21; font-size: 15px; font-weight: 700; } .sub, .val { fill: #5d5a55; } .lbl { fill: #1d1d21; }
.ios { fill: #3d5a98; } .android { fill: #b5651d; }
@media (prefers-color-scheme: dark) { .bg { fill: #1d1d21; } .h, .lbl { fill: #ececee; } .sub, .val { fill: #a3a09b; } .ios { fill: #8fb0ef; } .android { fill: #f0a868; } }
</style>`;
const svgDoc = (title, sub, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${h}" width="${W}" height="${h}" role="img" aria-label="${esc(title)}">
${style}
<rect width="${W}" height="${h}" rx="10" class="bg"/>
<text x="16" y="26" class="h">${esc(title)}</text>
<text x="16" y="44" class="sub">${esc(sub)}</text>
${body}</svg>
`;
// rows: [{ label, ios: {value, text}, android: {value, text} }] or, for one
// platform, [{ label, value, text }].
function pairedSvg(title, sub, rows) {
  const max = Math.max(...rows.flatMap((r) => [r.ios.value ?? 0, r.android.value ?? 0])) || 1;
  const inner = W - LABEL - 110;
  const per = 34;
  const bar = (v, y, cls) => {
    const w = v.value == null ? 0 : Math.max(1, (v.value / max) * inner);
    return (v.value == null ? '' : `<rect x="${LABEL}" y="${y}" width="${w.toFixed(1)}" height="12" rx="2" class="${cls}"/>`) + `<text x="${LABEL + w + 6}" y="${y + 11}" class="val">${esc(v.text)}</text>`;
  };
  const top = 78;
  const key = `<rect x="16" y="56" width="10" height="10" class="ios"/><text x="30" y="65" class="sub">iOS, iPhone 17 simulator</text><rect x="200" y="56" width="10" height="10" class="android"/><text x="214" y="65" class="sub">Android, Galaxy A15 5G</text>`;
  const body = rows.map((r, i) => {
    const y = top + i * per;
    return `<text x="${LABEL - 8}" y="${y + 18}" text-anchor="end" class="lbl">${esc(r.label)}</text>${bar(r.ios, y, 'ios')}${bar(r.android, y + 14, 'android')}`;
  }).join('');
  return svgDoc(title, sub, top + rows.length * per + 10, key + body);
}
function singleSvg(title, sub, rows, cls) {
  const max = Math.max(...rows.map((r) => r.value ?? 0)) || 1;
  const inner = W - LABEL - 110;
  const per = 24;
  const top = 60;
  const body = rows.map((r, i) => {
    const y = top + i * per;
    const w = r.value == null ? 0 : Math.max(1, (r.value / max) * inner);
    return `<text x="${LABEL - 8}" y="${y + 13}" text-anchor="end" class="lbl">${esc(r.label)}</text>`
      + (r.value == null ? '' : `<rect x="${LABEL}" y="${y + 2}" width="${w.toFixed(1)}" height="14" rx="2" class="${cls}"/>`)
      + `<text x="${LABEL + w + 6}" y="${y + 13}" class="val">${esc(r.text)}</text>`;
  }).join('');
  return svgDoc(title, sub, top + rows.length * per + 10, body);
}
const num = (a, f) => { try { return f(data[a]); } catch { return null; } };
const part = (f) => (f.component.startsWith('Bottom sheet (') ? 'sheets' : 'screen');
const tally = (fs, which) => {
  const x = (fs ?? []).filter((f) => part(f) === which);
  return x.length ? { pass: x.filter((f) => f.pass).length, total: x.length } : null;
};
const score = (t) => ({ value: t ? (t.pass / t.total) * 100 : null, text: t ? `${t.pass} / ${t.total}` : 'not run' });
const val = (a, get, fmt) => { const v = num(a, get); return { value: v, text: v == null ? 'not measured' : fmt(v) }; };
const msF = (v) => `${v.toFixed(1)} ms`;
const sF = (v) => `${(v / 1000).toFixed(2)} s`;
const mibF = (v) => `${v.toFixed(1)} MiB`;

// [file, title, subtitle, how to read it, svg]
const charts = [
  ['accessibility-test-screen', 'Accessibility: the test screen', 'Share of checks passed, all 19 items. Longer is better.', [
    'The baseline and the three styling engines share the same hand-built components. Their bars are what careful hand-built accessibility reaches.',
    'A library’s gap to them is what you would have to fix yourself.',
  ], (t, s) => pairedSvg(t, s, apps.map(([a, name]) => ({ label: name, ios: score(tally(findingsOf(a, 'ios'), 'screen')), android: score(tally(findingsOf(a, 'android'), 'screen')) })))],
  ['accessibility-extra-sheets', 'Accessibility: the extra bottom sheets', '5 checks per sheet. Longer is better.', [
    'Sheets: @expo/ui in every app, Tamagui’s and gluestack’s own, and a raw @gorhom sheet in HeroUI.',
  ], (t, s) => pairedSvg(t, s, apps.map(([a, name]) => ({ label: name, ios: score(tally(findingsOf(a, 'ios'), 'sheets')), android: score(tally(findingsOf(a, 'android'), 'sheets')) })))],
  ['theme-switch', 'Theme switch, median of 10', 'From the tap to the second frame after the update. Shorter is better.', [
    'iOS: every app finishes within a frame (about 32 ms), except Tamagui (99 ms).',
    'Android: Tamagui (630 ms) stands out, then HeroUI (239 ms).',
    'The other gaps are within each app’s run-to-run spread.',
  ], (t, s) => pairedSvg(t, s, apps.map(([a, name]) => ({ label: name, ios: val(a, (d) => d.perf.theme.median, msF), android: val(a, (d) => d.androidPerf.theme.median, msF) })))],
  ['list-mount', '200-row list mount, median of 10', 'From the tap to the second frame after the list’s first layout. Shorter is better.', [
    'iOS: about 83 ms everywhere, except Tamagui (115 ms).',
    'Android: most apps take 150–180 ms, with overlapping ranges. Tamagui takes 365 ms.',
  ], (t, s) => pairedSvg(t, s, apps.map(([a, name]) => ({ label: name, ios: val(a, (d) => d.perf.list.median, msF), android: val(a, (d) => d.androidPerf.list.median, msF) })))],
  ['startup', 'Startup until readable, median of 10', 'Until the screen title is in the accessibility tree. Not first paint.', [
    'Within each platform the apps sit close together, so read them as groups.',
    'Don’t compare the platforms: the simulator’s accessibility tree is slow to become readable.',
  ], (t, s) => pairedSvg(t, s, apps.map(([a, name]) => ({ label: name, ios: val(a, (d) => d.metrics.startup.median, sF), android: val(a, (d) => d.androidMetrics.startup.median, sF) })))],
  ['memory-idle', 'Memory at idle', '5 s after launch. Shorter is better. iOS phys_footprint, Android total PSS.', [
    'Compare apps within a platform, not across: the two are different measures.',
    'On both, the component libraries use more than the baseline, and HeroUI the most.',
  ], (t, s) => pairedSvg(t, s, apps.map(([a, name]) => ({ label: name, ios: val(a, (d) => d.metrics.memory.idle.physFootprint / 1048576, mibF), android: val(a, (d) => d.androidMetrics.memory.idle.pss / 1048576, mibF) })))],
  ['memory-used', 'Memory after use', 'After scrolling the list and opening every overlay once. Shorter is better.', [
    'iOS: Tamagui (161 MiB) stands out.',
    'Android: HeroUI (416 MiB) and gluestack (286 MiB) grow far more than the rest.',
  ], (t, s) => pairedSvg(t, s, apps.map(([a, name]) => ({ label: name, ios: val(a, (d) => d.metrics.memory.used.physFootprint / 1048576, mibF), android: val(a, (d) => d.androidMetrics.memory.used.pss / 1048576, mibF) })))],
  ['cpu-flings', 'App CPU time during 5 list flings', 'CPU used by the app over about 7.5 s of flinging. Shorter is better.', [
    'Compare apps within a platform: the simulator runs on a Mac, the phone on a budget CPU.',
    'HeroUI uses the most on both.',
  ], (t, s) => pairedSvg(t, s, apps.map(([a, name]) => ({ label: name, ios: val(a, (d) => d.metrics.scroll.cpuMs.total, sF), android: val(a, (d) => d.androidMetrics.scroll.cpuMs.total, sF) })))],
  ['bundle', 'iOS JS bundle', 'Hermes bytecode from expo export. Shorter is better.', [
    'Exact, with no run-to-run noise.',
    'The baseline is plain React Native, so the gap to it is what the library adds.',
  ], (t, s) => singleSvg(t, s, apps.map(([a, name]) => ({ label: name, ...val(a, (d) => d.bundle.iosHbcBytes / 1e6, (v) => `${v.toFixed(2)} MB`) })), 'ios')],
  ['rerenders', 'iOS: components re-rendered on one theme switch', 'Light → dark, React profiler on a Debug build. Fewer is better.', [
    'Tamagui isn’t measured: its Debug build aborts.',
  ], (t, s) => singleSvg(t, s, apps.map(([a, name]) => ({ label: name, ...val(a, (d) => d.metrics.rerenders.switches[0].renders, String) })), 'ios')],
  ['janky-frames', 'Android: janky frames during the flings', 'Out of about 1,250 frames, from dumpsys gfxinfo. Fewer is better.', [
    'At most 1 janky frame in any app, so scrolling is smooth everywhere.',
  ], (t, s) => singleSvg(t, s, apps.map(([a, name]) => ({ label: name, ...val(a, (d) => d.androidMetrics.scroll.frames.janky, String) })), 'android')],
];
mkdirSync(new URL('docs/charts/', root), { recursive: true });
for (const [file, title, sub, , draw] of charts) writeFileSync(new URL(`docs/charts/${file}.svg`, root), draw(title, sub));
const chartMd = (file) => {
  const [, title, , read] = charts.find((c) => c[0] === file);
  return [`![${title}](charts/${file}.svg)`, `**How to read it:**\n\n${read.map((r) => `- ${r}`).join('\n')}`].join('\n\n');
};

const differCount = apps.map(([a, name]) => `- **${name}:** ${rows.filter((r) => differs(result(a, r.key, 'ios'), result(a, r.key, 'android'))).length}`);

const md = `# All checks

<!-- begin:nav -->
${nav('All checks', 'docs')}
<!-- end:nav -->

Every accessibility check, for every app, with iOS and Android side by side. Generated from \`results/\` by \`scripts/checks-md.mjs\`.

- **The summary tables** (scores, text size, reduced motion, speed, memory, developer cost) are in [Results](results.md).
- **How each check works** is in [Method](method.md#accessibility-checks).

## Contents

- [How to read the tables](#how-to-read-the-tables)
- [Accessibility checks](#accessibility-checks)
- [Dark and brand themes](#dark-and-brand-themes)
- [Charts](#charts)

## How to read the tables

- **Each cell** is iOS / Android.
- ✅ pass, ❌ fail.
- ➖ not applicable: the app has no such element.
- **n/r** not run: the test could not start.
- ⚠️ the two platforms give different results.
- **Under each table**, two fold-outs say what each check means and why any check failed.
- **NativeWind** results use a line-height workaround. See \`apps/nativewind/NOTES.md\`.

## Accessibility checks

**Checks that give a different result on iOS and Android,** per app:

${differCount.join('\n')}

${components.map(componentSection).join('\n\n')}

${sheetSection()}

## Dark and brand themes

Every check also ran in the dark and brand themes, on both platforms. The tables above show light.

${themeDiffs.length ? themeDiffs.join('\n') : '- **No check changed:** every check gave the same result in the dark and brand themes as in light, on both platforms.'}

## Charts

### Accessibility

${chartMd('accessibility-test-screen')}

${chartMd('accessibility-extra-sheets')}

### Speed, memory and scrolling

Compare apps within a platform. iOS is a simulator on a Mac, Android a budget phone.

${chartMd('theme-switch')}

${chartMd('list-mount')}

${chartMd('startup')}

${chartMd('memory-idle')}

${chartMd('memory-used')}

${chartMd('cpu-flings')}

### Measured on one platform only

${chartMd('bundle')}

${chartMd('rerenders')}

${chartMd('janky-frames')}

<!-- begin:navfoot -->

---

← [Back to README](../README.md)
<!-- end:navfoot -->
`;
writeFileSync(new URL('docs/checks.md', root), anchored(md));

// --- docs/android-accessibility.md: every Android failure, from the audit's
// output. Unlike the iOS page, nothing here was traced by hand.
// Sheets are matched by kind: in the HeroUI app the shared "Bottom sheet"
// slot is HeroUI's own sheet and the raw @gorhom one has its own name.
const sheetName = (a, c) => (c === 'Bottom sheet' ? (a === 'heroui' ? 'HeroUI’s own bottom sheet' : '@gorhom bottom sheet') : c === 'Bottom sheet (@gorhom, raw)' ? '@gorhom bottom sheet' : c);
const androidFails = (a) => (findingsOf(a, 'android') ?? []).filter((f) => !f.pass).map((f) => ({ ...f, component: sheetName(a, f.component) }));
const failKeys = (a) => new Set(androidFails(a).map(keyOf));
const everyApp = [...failKeys('baseline')].filter((k) => apps.every(([a]) => failKeys(a).has(k)));
const byComponent = (fs) => {
  const groups = [...new Set(fs.map((f) => f.component))];
  return groups.map((c) => [`- **${c}**`, ...fs.filter((f) => f.component === c).map((f) => `  - ${shown(norm(f.check))}: ${detail(f)}`)].join('\n')).join('\n');
};
const same = (a, b) => { const x = failKeys(a); const y = failKeys(b); return x.size === y.size && [...x].every((k) => y.has(k)); };
const librarySection = ([a, name]) => {
  const own = androidFails(a).filter((f) => !everyApp.includes(keyOf(f)));
  const total = (findingsOf(a, 'android') ?? []).length;
  const passed = total - androidFails(a).length;
  const head = `### ${name}\n\n**${passed} of ${total}** checks pass on Android.`;
  if (a !== 'baseline' && same(a, 'baseline')) return `${head}\n\n- **Same failures as the baseline.** It restyles the baseline’s components, so it keeps their accessibility.`;
  return `${head}\n\n${own.length ? byComponent(own) : '- **No failures** beyond those every app has.'}`;
};
const platformDiffs = ([a, name]) => {
  const diffs = rows.map((r) => [r, result(a, r.key, 'ios'), result(a, r.key, 'android')]).filter(([, i, d]) => differs(i, d));
  if (!diffs.length) return '';
  const list = (want) => diffs.filter(([, , d]) => d.pass === want).map(([r]) => `  - ${sheetName(a, r.component)}, ${shown(r.check)}`);
  const onlyAndroid = list(true);
  const onlyIos = list(false);
  return [`- **${name}**`, ...(onlyAndroid.length ? ['  - **Passes on Android only:**', ...onlyAndroid.map((x) => `  ${x}`)] : []), ...(onlyIos.length ? ['  - **Passes on iOS only:**', ...onlyIos.map((x) => `  ${x}`)] : [])].join('\n');
};
const device = data.baseline.androidA11y;
const android = `# Android accessibility: what failed

<!-- begin:nav -->
${nav('Android accessibility', 'docs')}
<!-- end:nav -->

Every Android accessibility failure, from the audit’s own output. Generated from \`results/\` by \`scripts/checks-md.mjs\`.

- **Not checked by hand.** Unlike [iOS accessibility](ios-accessibility.md), these failures weren’t traced to the code that causes them. Each one is what the audit read from the tree TalkBack is given.
- **Device:** Samsung Galaxy A15 5G (${device?.device?.name ?? 'SM-A156E'}), ${device?.device?.runtime ?? 'Android 16'}.
- **Touch targets** are checked against Google’s 48 × 48 dp.
- **Per-check results for each app:**
  - Light theme: \`results/<app>/android-a11y.md\`
  - Dark theme: \`android-a11y-dark.md\`
  - Brand theme: \`android-a11y-brand.md\`
  - Side by side with iOS: [All checks](checks.md)

## Contents

- [Failures in every app](#failures-in-every-app)
- [Failures by library](#failures-by-library)
- [Where Android and iOS differ](#where-android-and-ios-differ)

## Failures in every app

The baseline included, so no library fixes these.

${byComponent(androidFails('baseline').filter((f) => everyApp.includes(keyOf(f))))}

## Failures by library

Each library’s failures beyond the ones above.

${apps.map(librarySection).join('\n\n')}

## Where Android and iOS differ

Checks that pass on one platform and fail on the other.

${apps.map(platformDiffs).filter(Boolean).join('\n')}

<!-- begin:navfoot -->

---

← [Back to README](../README.md)
<!-- end:navfoot -->
`;
writeFileSync(new URL('docs/android-accessibility.md', root), anchored(android));
console.log(`docs/checks.md: ${rows.length} checks × ${apps.length} apps, ${charts.length} charts in docs/charts/; docs/android-accessibility.md`);
