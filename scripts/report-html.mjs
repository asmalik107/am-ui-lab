// Builds docs/checks.html: every check run on every app, side by side, plus
// text size, Reduce Motion, timings and bundle size. Reads only results/*.
// Usage: node scripts/report-html.mjs
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const apps = [
  ['baseline', 'Baseline', 'Plain RN, hand-built'],
  ['unistyles', 'Unistyles', 'Engine, hand-built'],
  ['uniwind', 'Uniwind', 'Engine, hand-built'],
  ['nativewind', 'NativeWind v5 RC', 'Engine, hand-built*'],
  ['heroui', 'HeroUI Native', 'Component kit'],
  ['gluestack', 'gluestack v5', 'Component kit'],
  ['tamagui', 'Tamagui', 'Component kit'],
  ['reusables', 'Reusables', 'Component kit'],
];
const load = (app, file) => {
  const u = new URL(`results/${app}/${file}`, root);
  return existsSync(u) ? JSON.parse(readFileSync(u, 'utf8')) : null;
};
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const data = Object.fromEntries(apps.map(([a]) => [a, {
  a11y: load(a, 'ios-a11y.json'),
  dark: load(a, 'ios-a11y-dark.json'),
  brand: load(a, 'ios-a11y-brand.json'),
  metrics: load(a, 'ios-metrics.json'),
  text: load(a, 'ios-textsize.json'),
  motion: load(a, 'ios-motion.json'),
  perf: load(a, 'ios-perf.json'),
  bundle: load(a, 'bundle.json'),
}]));

// Rows in first-seen order across apps, so extra checks (sheet variants) slot in.
const rows = [];
const seen = new Set();
for (const [a] of apps) for (const f of data[a].a11y?.findings ?? []) {
  const key = `${f.component} | ${f.check}`;
  if (!seen.has(key)) { seen.add(key); rows.push({ key, component: f.component, check: f.check }); }
}
const result = (a, key) => data[a].a11y?.findings.find((f) => `${f.component} | ${f.check}` === key);

const what = {
  'name, role, state': 'VoiceOver gets a label, the right role, and the current state (disabled, busy, on/off, checked, selected).',
  'target ≥ 44pt': "The touch target is at least 44 × 44 pt, Apple's default control size.",
  'all options exposed': 'All three options are separate elements VoiceOver can reach.',
  'group label read': 'The group label is in the tree.',
  'error shown': 'After an invalid entry, the error message appears in the tree.',
  'error reachable from field': "The error is part of the field's label, value or hint, so it's read with the field.",
  opens: 'Opens when its trigger is tapped.',
  'screen behind is hidden from VoiceOver': 'While open, nothing behind it is in the system accessibility tree.',
  'title is a heading': 'The title has the heading trait.',
  'actions are buttons': 'Its actions have the button trait.',
  closes: 'Closes from its own Close or Cancel button.',
  'title and body readable': "The sheet's title and body text are in the tree.",
  'screen reachable again after close': 'After closing, the screen behind is back in the tree.',
  'current option marked': 'The selected option is marked as checked or selected.',
  'options are actionable': 'Options have a button, radio or option role.',
  'new value read on trigger': 'After picking, the trigger announces the new value.',
  'in accessibility tree': 'The toast appears in the tree while it is on screen.',
  'test could run': 'The element the test needs was missing, so the test could not run.',
};

const cell = (f) => {
  if (!f) return '<td class="na" title="Not applicable: this app has no such element"><span aria-hidden="true">–</span><span class="sr">not applicable</span></td>';
  return `<td class="${f.pass ? 'pass' : 'fail'}" title="${esc(f.detail)}"><span aria-hidden="true">${f.pass ? '✓' : '✗'}</span><span class="sr">${f.pass ? 'pass' : 'fail'}</span></td>`;
};
const score = (a) => {
  const f = data[a].a11y?.findings ?? [];
  return `${f.filter((x) => x.pass).length} / ${f.length}`;
};

// Bottom sheets: every sheet gets the same five checks, but listing each
// sheet as its own block gave 25 mostly empty rows. Instead there is one row
// per kind of sheet, and each cell holds that app's score out of 5 plus the
// checks it failed. The audit names the sheets by test ID, so this maps them
// to kinds: in the HeroUI app the shared sheet slot holds HeroUI's own sheet
// and gorhom is the extra one.
const sheetChecks = ['opens', 'title and body readable', 'screen behind is hidden from VoiceOver', 'closes', 'screen reachable again after close'];
const failLabel = {
  opens: "doesn't open",
  'title and body readable': 'title and body hidden',
  'screen behind is hidden from VoiceOver': 'screen behind exposed',
  closes: "doesn't close",
  'screen reachable again after close': 'screen not back after close',
};
const shortName = { opens: 'opens', 'title and body readable': 'title and body', 'screen behind is hidden from VoiceOver': 'screen behind', closes: 'closes', 'screen reachable again after close': 'screen after close' };
const ownSheet = {
  heroui: ['Bottom sheet', 'HeroUI BottomSheet'],
  tamagui: ['Bottom sheet (Tamagui Sheet)', 'Tamagui Sheet'],
  gluestack: ['Bottom sheet (gluestack BottomSheet)', 'gluestack BottomSheet'],
};
const noOwnSheet = { baseline: 'none (plain React Native)', unistyles: 'none (styling engine)', uniwind: 'none (styling engine)', nativewind: 'none (styling engine)', reusables: 'none in the library' };
const sheetKinds = [
  { label: '@gorhom/bottom-sheet', what: 'The raw third-party sheet, themed with the library’s tokens.', pick: (a) => (a === 'heroui' ? 'Bottom sheet (@gorhom, raw)' : 'Bottom sheet') },
  { label: '@expo/ui BottomSheet', what: 'Native SwiftUI sheet on iOS, filled with @expo/ui’s own Text and Button.', pick: () => 'Bottom sheet (@expo/ui)' },
  { label: 'The library’s own sheet', what: 'The sheet component the library ships, set up as its docs show.', pick: (a) => ownSheet[a]?.[0], name: (a) => ownSheet[a]?.[1] },
];
const sheetCell = (a, kind) => {
  const comp = kind.pick(a);
  const fs = comp ? sheetChecks.map((c) => result(a, `${comp} | ${c}`)).filter(Boolean) : [];
  if (!fs.length) return `<td class="na sheet" title="Not applicable"><span class="sr">not applicable: </span>${esc(noOwnSheet[a] ?? '–')}</td>`;
  const passed = fs.filter((f) => f.pass).length;
  const name = kind.name ? `<span class="name">${esc(kind.name(a))}</span>` : '';
  const fails = fs.filter((f) => !f.pass).map((f) => `<span class="why">✗ ${esc(failLabel[f.check] ?? f.check)}</span>`).join('');
  // A check that couldn't run (e.g. nothing to check after a failed close) is named, not counted.
  const untested = sheetChecks.filter((c) => !fs.some((f) => f.check === c)).map((c) => `<span class="why untested">– ${esc(shortName[c])} not tested</span>`).join('');
  const title = fs.map((f) => `${f.pass ? '✓' : '✗'} ${f.check}: ${f.detail}`).join('\n');
  return `<td class="${passed === fs.length ? 'pass' : 'fail'} sheet" title="${esc(title)}">${name}<strong>${passed} / ${fs.length}</strong>${fails}${untested}</td>`;
};
const isSheet = (r) => r.component.startsWith('Bottom sheet');
const sheetSection = () => `<tr class="group"><th colspan="${apps.length + 2}" scope="colgroup"><span>Bottom sheets</span></th></tr>`
  + `<tr class="note"><td></td><th scope="row" colspan="${apps.length + 1}"><span class="what">Each sheet gets the same five checks: ${sheetChecks.join(', ')}. A cell shows how many passed and names any that failed.</span></th></tr>`
  + sheetKinds.map((k) => `<tr><td class="num"></td><th scope="row">${esc(k.label)}<span class="what">${esc(k.what)}</span></th>${apps.map(([a]) => sheetCell(a, k)).join('')}</tr>`).join('\n');

let group = '';
let n = 0;
let sheetsShown = false;
const checkRows = rows.map((r) => {
  if (isSheet(r)) {
    if (sheetsShown) return '';
    sheetsShown = true;
    group = 'Bottom sheets';
    return sheetSection();
  }
  const head = r.component !== group ? (group = r.component, `<tr class="group"><th colspan="${apps.length + 2}" scope="colgroup"><span>${esc(r.component)}</span></th></tr>`) : '';
  return `${head}<tr><td class="num">${++n}</td><th scope="row">${esc(r.check)}<span class="what">${esc(what[r.check] ?? '')}</span></th>${apps.map(([a]) => cell(result(a, r.key))).join('')}</tr>`;
}).filter(Boolean).join('\n');

const motion = (a, comp, rm) => data[a].motion?.runs.find((r) => r.component === comp && r.reduceMotion === rm)?.ms;
const ms = (v) => (v == null ? '–' : `${v} ms`);
const grew = (a) => {
  const g = data[a].text?.growth.filter((x) => x.ratio) ?? [];
  return g.length ? `${g.filter((x) => x.ratio > 1.2).length} / ${g.length}` : '–';
};
const otherRows = [
  ['Controls that grew at the largest text size (AX5)', (a) => grew(a)],
  ['Controls pushed past the screen edge at AX5', (a) => esc((data[a].text?.offscreen ?? []).join(', ') || 'none')],
  ['Dialog open, Reduce Motion off', (a) => ms(motion(a, 'Dialog', false))],
  ['Dialog open, Reduce Motion on', (a) => ms(motion(a, 'Dialog', true))],
  ['Bottom sheet open, Reduce Motion off', (a) => ms(motion(a, 'Bottom sheet', false))],
  ['Bottom sheet open, Reduce Motion on', (a) => ms(motion(a, 'Bottom sheet', true))],
  ['Theme switch, median', (a) => (data[a].perf ? `${data[a].perf.theme.median.toFixed(1)} ms` : '–')],
  ['200-row list mount, median', (a) => (data[a].perf ? `${data[a].perf.list.median.toFixed(1)} ms` : '–')],
  ['iOS JS bundle (Hermes)', (a) => (data[a].bundle ? `${(data[a].bundle.iosHbcBytes / 1e6).toFixed(2)} MB` : '–')],
].map(([label, fn]) => `<tr><th scope="row">${label}</th>${apps.map(([a]) => `<td>${fn(a)}</td>`).join('')}</tr>`).join('\n');


// --- Charts: inline SVG drawn from the results, no library. Each chart is a
// figure with a visible caption; the numbers are also in a table that screen
// readers get instead of the drawing (the SVG is aria-hidden).
const newItems = ['Slider', 'Progress', 'Accordion', 'Menu', 'Segmented control'];
const part = (f) => (f.component.startsWith('Bottom sheet') ? 'sheets' : newItems.includes(f.component) ? 'new' : 'core');
const tally = (findings, which) => {
  const fs = (findings ?? []).filter((f) => !which || part(f) === which);
  return fs.length ? { pass: fs.filter((f) => f.pass).length, total: fs.length } : null;
};
const scoreParts = [
  ['Core checks (items 1–14)', (a) => tally(data[a].a11y?.findings, 'core')],
  ['Bottom sheets', (a) => tally(data[a].a11y?.findings, 'sheets')],
  ['New items (15–19)', (a) => tally(data[a].a11y?.findings, 'new')],
  ['All checks, dark theme', (a) => tally(data[a].dark?.findings)],
  ['All checks, brand theme', (a) => tally(data[a].brand?.findings)],
];
const W = 640;
const LABEL = 150;
const ROW = 26;
// One horizontal bar per app. rows: [{ label, value, text }]; value null = not measured.
function bars(rows, max) {
  const h = rows.length * ROW + 8;
  const inner = W - LABEL - 90;
  return `<svg viewBox="0 0 ${W} ${h}" width="100%" aria-hidden="true" focusable="false" class="chart">${rows
    .map((r, i) => {
      const y = 4 + i * ROW;
      const w = r.value == null ? 0 : Math.max(1, (r.value / max) * inner);
      return `<text x="${LABEL - 8}" y="${y + 16}" text-anchor="end" class="lbl">${esc(r.label)}</text>`
        + (r.value == null ? '' : `<rect x="${LABEL}" y="${y + 4}" width="${w.toFixed(1)}" height="${ROW - 10}" rx="3" class="bar${r.cls ? ` ${r.cls}` : ''}"/>`)
        + `<text x="${LABEL + w + 6}" y="${y + 16}" class="val">${esc(r.text)}</text>`;
    })
    .join('')}</svg>`;
}
function figure(id, title, note, rows, max, head) {
  const table = `<table class="sr"><caption>${esc(title)}</caption><thead><tr><th scope="col">App</th><th scope="col">${esc(head)}</th></tr></thead><tbody>${rows.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.text)}</td></tr>`).join('')}</tbody></table>`;
  return `<figure class="fig" aria-labelledby="${id}"><figcaption id="${id}"><strong>${esc(title)}</strong>${note ? ` <span>${esc(note)}</span>` : ''}</figcaption>${bars(rows, max)}${table}</figure>`;
}
const scoreCharts = scoreParts.map(([title, fn], i) => {
  const rows = apps.map(([a, name]) => {
    const t = fn(a);
    return { label: name, value: t ? (t.pass / t.total) * 100 : null, text: t ? `${t.pass} / ${t.total}` : 'not run', cls: t && t.pass === t.total ? 'full' : '' };
  });
  return figure(`score-${i}`, title, 'share of checks passed', rows, 100, 'Checks passed');
}).join('\n');
const num = (a, f) => {
  try {
    return f(data[a]);
  } catch {
    return null;
  }
};
const metricCharts = [
  ['Startup, median of 10', 'launch-app call until the title is in the accessibility tree; lower is better', (d) => d.metrics.startup.median, (v) => `${v.toFixed(0)} ms`],
  ['Memory at idle', 'phys_footprint 5 s after launch; lower is better', (d) => d.metrics.memory.idle.physFootprint / 1048576, (v) => `${v.toFixed(1)} MiB`],
  ['Memory after use', 'after the 200-row list and every overlay; lower is better', (d) => d.metrics.memory.used.physFootprint / 1048576, (v) => `${v.toFixed(1)} MiB`],
  ['App CPU time during 5 list flings', 'all of the app’s threads; lower is better', (d) => d.metrics.scroll.cpuMs.total, (v) => `${v.toFixed(0)} ms`],
  ['Theme switch, median', 'tap to second frame after the update; one frame is 16.7 ms', (d) => d.perf.theme.median, (v) => `${v.toFixed(1)} ms`],
  ['200-row list mount, median', 'tap to second frame after first layout', (d) => d.perf.list.median, (v) => `${v.toFixed(1)} ms`],
  ['iOS JS bundle', 'Hermes bytecode from expo export', (d) => d.bundle.iosHbcBytes / 1e6, (v) => `${v.toFixed(2)} MB`],
  ['Components rendered on one theme switch', 'light → dark, Debug build, argent React profiler', (d) => d.metrics.rerenders.switches[0].renders, (v) => `${v}`],
].map(([title, note, get, fmt], i) => {
  const rows = apps.map(([a, name]) => {
    const v = num(a, get);
    return { label: name, value: v, text: v == null ? 'not measured' : fmt(v) };
  });
  const max = Math.max(...rows.map((r) => r.value ?? 0)) || 1;
  return figure(`metric-${i}`, title, note, rows, max, title);
}).join('\n');

// The device each app's audit actually ran on, as recorded in its results.
const devices = [...new Set(apps.map(([a]) => data[a].a11y?.device).filter(Boolean).map((d) => `an ${d.name} simulator running ${d.runtime}`))];
const deviceText = devices.length ? devices.join(' and ') : 'a simulator (device not recorded in these results)';

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>UI library checks</title>
<style>
:root { --bg: #f7f6f3; --fg: #1d1d21; --muted: #5d5a55; --line: #dcd8d0; --surface: #fff; --pass: #1f7a45; --pass-bg: #e3f3e8; --fail: #a32a1c; --fail-bg: #fbe6e2; --na: #8a867f; --accent: #3d5a98; }
@media (prefers-color-scheme: dark) { :root { --bg: #151517; --fg: #ececee; --muted: #a3a09b; --line: #34343a; --surface: #1d1d21; --pass: #7fd6a0; --pass-bg: #18301f; --fail: #ff9d8c; --fail-bg: #3a1c17; --na: #7c7a76; --accent: #8fb0ef; } }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--fg); font: 15px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
main { max-width: 1400px; margin: 0 auto; padding: 32px 16px 64px; }
h1 { font-size: 28px; margin: 0 0 8px; }
h2 { font-size: 20px; margin: 40px 0 8px; }
p { max-width: 75ch; color: var(--muted); margin: 0 0 12px; }
.wrap { overflow: auto; max-height: calc(100vh - 140px); border: 1px solid var(--line); border-radius: 10px; background: var(--surface); }
/* The table scrolls inside .wrap in both directions, so the header row and the
   check column can stick to .wrap's edges. */
table { border-collapse: separate; border-spacing: 0; }
table { width: 100%; min-width: 1100px; }
th, td { padding: 8px 10px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
thead th { position: sticky; top: 0; background: var(--surface); font-size: 13px; z-index: 3; box-shadow: inset 0 -2px 0 var(--line); }
tbody th[scope="row"], thead th.check { position: sticky; left: 0; background: var(--surface); z-index: 2; min-width: 260px; max-width: 320px; box-shadow: inset -1px 0 0 var(--line); }
thead th.check { z-index: 4; }
tr.group th span { position: sticky; left: 12px; }
thead th small { display: block; font-weight: 400; color: var(--muted); }
tbody th { font-weight: 600; }
.what { display: block; font-weight: 400; color: var(--muted); font-size: 13px; }
tr.group th { background: var(--bg); font-size: 13px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); }
td.num { color: var(--muted); width: 2.5em; }
td.pass, td.fail, td.na { text-align: center; font-weight: 700; font-size: 16px; width: 8%; }
td.pass { color: var(--pass); background: var(--pass-bg); }
td.fail { color: var(--fail); background: var(--fail-bg); }
td.na { color: var(--na); }
td.sheet { text-align: left; font-size: 13px; font-weight: 400; }
td.sheet strong { display: block; font-size: 16px; }
td.sheet .name { display: block; font-size: 12px; color: var(--muted); }
td.sheet .why { display: block; }
td.sheet .untested { color: var(--muted); }
tr.note th { font-weight: 400; }
tr.score td, tr.score th { font-weight: 700; background: var(--bg); }
tr.score th[scope="row"] { background: var(--bg); }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
.charts { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 460px), 1fr)); gap: 16px; }
.fig { margin: 0; padding: 12px 14px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); }
.fig figcaption { font-size: 14px; margin-bottom: 4px; }
.fig figcaption span { color: var(--muted); }
.chart .lbl, .chart .val { font-size: 13px; fill: var(--fg); }
.chart .val { fill: var(--muted); }
.chart .bar { fill: var(--accent); }
.chart .bar.full { fill: var(--pass); }
.legend { display: flex; gap: 16px; flex-wrap: wrap; font-size: 14px; color: var(--muted); margin: 8px 0 16px; }
</style>
</head>
<body>
<main>
<h1>UI library checks</h1>
<p>Every check run on every app, generated from <code>results/</code> by <code>scripts/report-html.mjs</code>. All apps build the same test screen; results are from Release builds on ${esc(deviceText)}. The accessibility checks read the iOS accessibility tree, which is what VoiceOver is given. They don't hear what it says. Hover a cell for the measured detail.</p>
<div class="legend"><span>✓ pass</span><span>✗ fail</span><span>– not applicable (the app has no such element)</span><span>* NativeWind results use a line-height workaround; see apps/nativewind/NOTES.md</span></div>

<h2>Scores at a glance</h2>
<p>Green bars mean every check in that group passed. The same numbers are in the tables below.</p>
<div class="charts">
${scoreCharts}
</div>

<h2>Accessibility checks (iOS)</h2>
<div class="wrap"><table>
<thead><tr><th>#</th><th scope="col" class="check">Check</th>${apps.map(([, name, kind]) => `<th scope="col">${esc(name)}<small>${esc(kind)}</small></th>`).join('')}</tr></thead>
<tbody>
<tr class="score"><td></td><th scope="row">Checks passed</th>${apps.map(([a]) => `<td>${score(a)}</td>`).join('')}</tr>
${checkRows}
</tbody>
</table></div>

<h2>Startup, memory, scrolling, timings and size</h2>
<p>Bars compare the eight apps on one measure; shorter is better on every chart here. Frame hitches couldn’t be measured on the simulator (xctrace: “Hitches is not supported on this platform”), so scrolling is shown as the app’s CPU time while flinging the list.</p>
<div class="charts">
${metricCharts}
</div>

<h2>Text size, motion, timings and size</h2>
<p>Transition times come from a real-time screen recording; an instant change is one frame (33 ms). Timings are medians of 10 runs, accurate to one frame (16.7 ms).</p>
<div class="wrap"><table>
<thead><tr><th scope="col" class="check">Measure</th>${apps.map(([, name]) => `<th scope="col">${esc(name)}</th>`).join('')}</tr></thead>
<tbody>
${otherRows}
</tbody>
</table></div>
</main>
</body>
</html>
`;
writeFileSync(new URL('docs/checks.html', root), html);
console.log(`docs/checks.html: ${rows.length} checks × ${apps.length} apps (${rows.filter(isSheet).length} of them sheet checks, shown as ${sheetKinds.length} rows)`);
