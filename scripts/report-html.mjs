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
  'name, role, value': 'VoiceOver gets a label, the adjustable trait and the current value.',
  'dragging changes the value': 'Dragging the thumb changes the value in the accessibility tree (stands in for VoiceOver’s swipe up, which needs VoiceOver).',
  'name and value': 'VoiceOver gets a label and the current value.',
  'header is a button': 'The section header has the button trait.',
  'expanded state exposed': 'The header reads as expanded when open and not when closed.',
  'content shows and hides': 'The section text appears on the first tap and goes on the second.',
  'trigger name and role': 'The menu button has a label and the button trait.',
  'items are buttons': 'Each menu action has the button trait.',
  'closes after an action': 'Choosing an action closes the menu.',
  'options have name and role': 'Each option has a label and a button, radio or tab role.',
  'selected option marked': 'The selected option is marked as selected or checked, and the others aren’t.',
  'selection moves on tap': 'Tapping another option moves the selected state to it.',
};

const cell = (f) => {
  if (!f) return '<td class="na" title="Not applicable: this app has no such element"><span aria-hidden="true">–</span><span class="sr">not applicable</span></td>';
  return `<td class="${f.pass ? 'pass' : 'fail'}" title="${esc(f.detail)}"><span aria-hidden="true">${f.pass ? '✓' : '✗'}</span><span class="sr">${f.pass ? 'pass' : 'fail'}</span></td>`;
};
const score = (a, key = 'a11y') => {
  const f = data[a][key]?.findings;
  return f ? `${f.filter((x) => x.pass).length} / ${f.length}` : 'not run';
};
// Checks whose result in the dark or brand theme differs from light.
const themeDiffs = apps.flatMap(([a, name]) => ['dark', 'brand'].flatMap((t) => (data[a][t]?.findings ?? []).filter((f) => {
  const l = result(a, `${f.component} | ${f.check}`);
  return l && l.pass !== f.pass;
}).map((f) => ({ name, theme: t, f }))));
const themeDiffHtml = themeDiffs.length
  ? `<ul>${themeDiffs.map((d) => `<li><strong>${esc(d.name)}, ${d.theme}:</strong> ${esc(d.f.component)} – ${esc(d.f.check)}: ${d.f.pass ? 'passes' : 'fails'} (light: ${d.f.pass ? 'fails' : 'passes'}). <span class="what">${esc(d.f.detail)}</span></li>`).join('')}</ul>`
  : '<p>No check gave a different result in the dark or brand theme than in light.</p>';

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
// Groups as in the README: the test screen is all 19 items, including the
// shared sheet slot; the extra sheets are the named variants, e.g.
// "Bottom sheet (@expo/ui)".
const part = (f) => (f.component.startsWith('Bottom sheet (') ? 'sheets' : 'screen');
const tally = (findings, which) => {
  const fs = (findings ?? []).filter((f) => !which || part(f) === which);
  return fs.length ? { pass: fs.filter((f) => f.pass).length, total: fs.length } : null;
};
// The dark and brand audits are only shown separately if some check in some
// app gave a different result from light; otherwise one score covers all three.
const themesDiffer = themeDiffs.length > 0;
const themeNote = themesDiffer ? 'light theme' : 'the same in the light, dark and brand themes';
const scoreParts = [
  ['Test screen', `All 19 items of the test screen, from buttons, form controls, dialog, sheet, tabs and toast to the slider, progress bar, accordion, menu and segmented control. 57 checks (fewer for Tamagui, where some couldn’t run). Results are ${themeNote}.`, (a) => tally(data[a].a11y?.findings, 'screen')],
  ['Extra bottom sheets', 'The @expo/ui sheet in every app, plus Tamagui’s and gluestack’s own sheets, and a raw @gorhom sheet in the HeroUI app (whose own sheet is on the test screen): 5 checks per sheet.', (a) => tally(data[a].a11y?.findings, 'sheets')],
  ...(themesDiffer
    ? [
        ['Everything, dark theme', 'All the checks above, re-run with the app switched to its dark theme.', (a) => tally(data[a].dark?.findings)],
        ['Everything, brand theme', 'All the checks above, re-run with the app switched to its brand theme.', (a) => tally(data[a].brand?.findings)],
      ]
    : []),
];
const W = 400;
const LABEL = 118;
const ROW = 26;
// One horizontal bar per app. rows: [{ label, value, text }]; value null = not measured.
function bars(rows, max) {
  const h = rows.length * ROW + 8;
  const inner = W - LABEL - 78;
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
function figure(id, title, note, rows, max, head, read) {
  const table = `<table class="sr"><caption>${esc(title)}</caption><thead><tr><th scope="col">App</th><th scope="col">${esc(head)}</th></tr></thead><tbody>${rows.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.text)}</td></tr>`).join('')}</tbody></table>`;
  return `<figure class="fig" aria-labelledby="${id}"><figcaption id="${id}"><strong>${esc(title)}</strong>${note ? ` <span>${esc(note)}</span>` : ''}</figcaption>${bars(rows, max)}${read ? `<p class="read"><strong>How to read it:</strong> ${esc(read)}</p>` : ''}${table}</figure>`;
}
const scoreCharts = scoreParts.map(([title, note, fn], i) => {
  const rows = apps.map(([a, name]) => {
    const t = fn(a);
    return { label: name, value: t ? (t.pass / t.total) * 100 : null, text: t ? `${t.pass} / ${t.total}` : 'not run', cls: t && t.pass === t.total ? 'full' : '' };
  });
  return figure(`score-${i}`, title, note, rows, 100, 'Checks passed', 'The baseline and the three engines are the same hand-built components, so their bar is what careful hand-built accessibility reaches; a library’s gap to it is what you would have to fix yourself. Every failure was checked by hand on the simulator.');
}).join('\n');
const num = (a, f) => {
  try {
    return f(data[a]);
  } catch {
    return null;
  }
};
// Each metric chart says what one unit means and how much the same app moved
// when measured twice (the baseline on 27 and 28 Oct), so a reader can tell a
// real gap from noise.
const metricCharts = [
  ['Startup until readable by VoiceOver, median of 10', 'From the launch-app call until the screen title is in the accessibility tree. Not first paint.', 'Not meaningful between apps: every app is 7.8–9.4 s, and the baseline measured 4.8 s one day and 8.1 s the next.', (d) => d.metrics.startup.median, (v) => `${v.toFixed(0)} ms`],
  ['Memory at idle', 'phys_footprint 5 s after launch. Lower is better.', 'The baseline measured twice differed by 0.3 MiB, so the kits’ 12–28 MiB more than the baseline’s 63 MiB is real.', (d) => d.metrics.memory.idle.physFootprint / 1048576, (v) => `${v.toFixed(1)} MiB`],
  ['Memory after use', 'After scrolling the 200-row list and opening every overlay once. Lower is better.', 'The baseline measured twice differed by 2.4 MiB; Tamagui (162 MiB) stands out; the rest are within about 20 MiB of the baseline’s 122–124.', (d) => d.metrics.memory.used.physFootprint / 1048576, (v) => `${v.toFixed(1)} MiB`],
  ['App CPU time during 5 list flings', 'CPU used by all of the app’s threads over 7.5 s of flinging. Lower is better.', 'The baseline measured twice differed by 0.2 s (1.95 and 2.16 s), so only HeroUI (2.5 s) stands apart. No app had a main-thread hang.', (d) => d.metrics.scroll.cpuMs.total, (v) => `${v.toFixed(0)} ms`],
  ['Theme switch, median', 'From the tap to the second frame after the update.', 'One frame is 16.7 ms, so about 32 ms means it finished within a frame. Only Tamagui (6 frames) and HeroUI (depends on direction, 32–65 ms) take longer.', (d) => d.perf.theme.median, (v) => `${v.toFixed(1)} ms`],
  ['200-row list mount, median', 'From the tap to the second frame after the list’s first layout.', 'Results land on frame steps (about 82, 98 and 115 ms) and each app’s 10 runs span two to four of them, so a one-step difference is noise.', (d) => d.perf.list.median, (v) => `${v.toFixed(1)} ms`],
  ['iOS JS bundle', 'Hermes bytecode from expo export, with all 19 items.', 'Exact, with no run-to-run noise. The baseline is plain React Native, so the gap to it is what the library adds.', (d) => d.bundle.iosHbcBytes / 1e6, (v) => `${v.toFixed(2)} MB`],
  ['Components re-rendered on one theme switch', 'Light → dark, counted by argent’s React profiler on a Debug build. Fewer means less work for React.', 'Counts repeat closely for light → dark and dark → brand in every app, but brand → light can be lower (Uniwind 302 against 507). Tamagui isn’t measured: its Debug build aborts.', (d) => d.metrics.rerenders.switches[0].renders, (v) => `${v}`],
].map(([title, note, read, get, fmt], i) => {
  const rows = apps.map(([a, name]) => {
    const v = num(a, get);
    return { label: name, value: v, text: v == null ? 'not measured' : fmt(v) };
  });
  const max = Math.max(...rows.map((r) => r.value ?? 0)) || 1;
  return figure(`metric-${i}`, title, note, rows, max, title, read);
}).join('\n');

// Developer cost, from results/devcost.json (scripts/devcost.mjs).
const devcostFile = new URL('results/devcost.json', root);
const devcost = existsSync(devcostFile) ? JSON.parse(readFileSync(devcostFile, 'utf8')) : null;
const devRow = (label, fn, note) => `<tr><th scope="row">${label}<span class="what">${esc(note)}</span></th>${apps.map(([a]) => `<td>${esc(fn(devcost.rows.find((r) => r.app === a)))}</td>`).join('')}</tr>`;
const devcostRows = devcost
  ? [
      devRow('Lines of screen code you write', (r) => r.screenLines, devcost.how.screenLines),
      devRow('Kit code copied into your app (lines)', (r) => r.copiedLines, devcost.how.copiedLines),
      devRow('Config files added or changed', (r) => r.configFiles.length, devcost.how.configFiles),
      devRow('Setup steps', (r) => r.setupSteps ?? 'n/a (reference app)', devcost.how.setupSteps),
      devRow('Setup problems hit', (r) => r.errorsHit ?? 'n/a (reference app)', devcost.how.errorsHit),
      devRow('Type errors in your own code', (r) => r.tsc.src, devcost.how.tscOwn),
      devRow('Type errors in copied kit code', (r) => r.tsc.all - r.tsc.src, devcost.how.tscKit),
      devRow('Accessibility props written by hand', (r) => r.a11yProps, devcost.how.a11yProps),
    ].join('\n')
  : '';

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
.sr { position: absolute; top: 0; left: 0; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.charts { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 460px), 1fr)); gap: 16px; }
.fig { position: relative; overflow: hidden; margin: 0; padding: 12px 14px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); }
.fig figcaption { font-size: 14px; margin-bottom: 4px; }
.fig .read { font-size: 13px; color: var(--muted); margin: 6px 0 0; max-width: none; }
.fig figcaption span { display: block; color: var(--muted); font-size: 13px; margin-top: 2px; }
.chart .lbl, .chart .val { font-size: 12px; fill: var(--fg); }
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
<p>Each chart is one group of accessibility checks; a bar is the share of that group's checks the app passed, with the count at its end. Green means it passed every check in the group. The full spec is in <code>docs/method.md</code>, and every check is listed in the table below.</p>
<div class="charts">
${scoreCharts}
</div>

<h2>Accessibility checks (iOS)</h2>
<div class="wrap"><table>
<thead><tr><th>#</th><th scope="col" class="check">Check</th>${apps.map(([, name, kind]) => `<th scope="col">${esc(name)}<small>${esc(kind)}</small></th>`).join('')}</tr></thead>
<tbody>
${themesDiffer
  ? ['light', 'dark', 'brand'].map((t) => `<tr class="score"><td></td><th scope="row">Checks passed, ${t} theme</th>${apps.map(([a]) => `<td>${score(a, t === 'light' ? 'a11y' : t)}</td>`).join('')}</tr>`).join('\n')
  : `<tr class="score"><td></td><th scope="row">Checks passed<span class="what">Same in the light, dark and brand themes.</span></th>${apps.map(([a]) => `<td>${score(a)}</td>`).join('')}</tr>`}
${checkRows}
</tbody>
</table></div>

<h2>Dark and brand themes</h2>
<p>Every check also ran with the app switched to its dark and brand themes. The grid above shows light; this lists every check whose result changed.</p>
${themeDiffHtml}

<h2>Startup, memory, scrolling, timings and size</h2>
<p>Bars compare the eight apps on one measure; shorter is better on every chart here. Under each chart, “How to read it” says how much the same app moved when measured twice, so you can tell a real gap from noise. Frame hitches couldn’t be measured on the simulator (xctrace: “Hitches is not supported on this platform”), so scrolling is shown as the app’s CPU time while flinging the list.</p>
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
<h2>Developer cost</h2>
<p>Counted with <code>scripts/devcost.mjs</code>${devcost ? ` on ${esc(devcost.date)}` : ''}. What it would cost a developer to build the same screen with each library. Each row says what it counts and how.</p>
<div class="wrap"><table>
<thead><tr><th scope="col" class="check">Count</th>${apps.map(([, name]) => `<th scope="col">${esc(name)}</th>`).join('')}</tr></thead>
<tbody>
${devcostRows}
</tbody>
</table></div>
</main>
</body>
</html>
`;
writeFileSync(new URL('docs/checks.html', root), html);
console.log(`docs/checks.html: ${rows.length} checks × ${apps.length} apps (${rows.filter(isSheet).length} of them sheet checks, shown as ${sheetKinds.length} rows)`);
