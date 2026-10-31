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
  androidPerf: load(a, 'android-perf.json'),
  androidMetrics: load(a, 'android-metrics.json'),
  androidA11y: load(a, 'android-a11y.json'),
  androidDark: load(a, 'android-a11y-dark.json'),
  androidBrand: load(a, 'android-a11y-brand.json'),
  androidText: load(a, 'android-textsize.json'),
  androidMotion: load(a, 'android-motion.json'),
}]));
const norm = (check) => check.replace(/^target ≥ \d+(pt|dp)$/, 'touch target');
const keyOf = (f) => `${f.component} | ${norm(f.check)}`;
const set = { ios: { light: 'a11y', dark: 'dark', brand: 'brand' }, android: { light: 'androidA11y', dark: 'androidDark', brand: 'androidBrand' } };
const findingsOf = (a, p = 'ios', t = 'light') => data[a][set[p][t]]?.findings;

// Rows in first-seen order across apps, so extra checks (sheet variants) slot in.
const rows = [];
const seen = new Set();
for (const p of ['ios', 'android']) for (const [a] of apps) for (const f of findingsOf(a, p) ?? []) {
  const key = keyOf(f);
  if (!seen.has(key)) { seen.add(key); rows.push({ key, component: f.component, check: norm(f.check) }); }
}
// Keep each component's rows together: a check only one app produced (e.g. a
// later app's "test could run") would otherwise open a second group at the end.
const order = [...new Set(rows.map((r) => r.component))];
rows.sort((x, y) => order.indexOf(x.component) - order.indexOf(y.component));
const result = (a, key, p = 'ios') => findingsOf(a, p)?.find((f) => keyOf(f) === key);

const shown = (check) => check.replace('from VoiceOver', 'from the screen reader');
const what = {
  'touch target': 'At least 44 × 44 pt on iOS (Apple’s default) and 48 × 48 dp on Android (Google’s minimum).',
  'name, role, state': 'The screen reader gets a label, the right role, and the current state (disabled, busy, on/off, checked, selected).',
  'target ≥ 44pt': "The touch target is at least 44 × 44 pt, Apple's default control size.",
  'all options exposed': 'All three options are separate elements the screen reader can reach.',
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
  'name, role, value': 'The screen reader gets a label, the adjustable role and the current value.',
  'dragging changes the value': 'Dragging the thumb changes the value in the accessibility tree (stands in for the screen reader’s swipe up, which needs the screen reader running).',
  'name and value': 'The screen reader gets a label and the current value.',
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

const half = (f, p) => {
  const tag = p === 'ios' ? 'iOS' : 'Android';
  if (f?.notRun) return `<span class="r na" title="${tag}: not run, the test could not start"><span aria-hidden="true">n/r</span><span class="sr">${tag} not run</span></span>`;
  if (!f) return `<span class="r na" title="${tag}: not applicable, no such element"><span aria-hidden="true">–</span><span class="sr">${tag} not applicable</span></span>`;
  return `<span class="r ${f.pass ? 'pass' : 'fail'}" title="${esc(`${tag}: ${f.detail}`)}"><span aria-hidden="true">${f.pass ? '✓' : '✗'}</span><span class="sr">${tag} ${f.pass ? 'pass' : 'fail'}</span></span>`;
};
const differs = (i, d) => !!i && !!d && !i.notRun && !d.notRun && i.pass !== d.pass;
const cell = (i, d) => `<td class="pair${differs(i, d) ? ' differs' : ''}">${half(i, 'ios')}${half(d, 'android')}${differs(i, d) ? '<span class="flag" title="Different result on iOS and Android">⚠<span class="sr"> differs between platforms</span></span>' : ''}</td>`;
const ran = (a, r, p) => {
  const own = findingsOf(a, p)?.filter((f) => f.component === r.component);
  if (!own) return null;
  if (r.check === 'test could run') return own.length ? { pass: true, detail: 'test ran' } : null;
  return own.some((f) => f.check === 'test could run' && !f.pass) ? { notRun: true } : null;
};
const tallyText = (fs) => (fs ? `${fs.filter((x) => x.pass).length} / ${fs.length}` : 'not run');
const score = (a, t = 'light') => `<span class="r2">${tallyText(findingsOf(a, 'ios', t))}</span><span class="r2">${tallyText(findingsOf(a, 'android', t))}</span>`;
const themeDiffs = ['ios', 'android'].flatMap((p) => apps.flatMap(([a, name]) => ['dark', 'brand'].flatMap((t) => (findingsOf(a, p, t) ?? []).filter((f) => {
  const l = result(a, keyOf(f), p);
  return l && l.pass !== f.pass;
}).map((f) => ({ name, platform: p === 'ios' ? 'iOS' : 'Android', theme: t, f })))));
const themeDiffHtml = themeDiffs.length
  ? `<ul>${themeDiffs.map((d) => `<li><strong>${esc(d.name)}, ${d.platform}, ${d.theme}:</strong> ${esc(d.f.component)} – ${esc(d.f.check)}: ${d.f.pass ? 'passes' : 'fails'} (light: ${d.f.pass ? 'fails' : 'passes'}). <span class="what">${esc(d.f.detail)}</span></li>`).join('')}</ul>`
  : '<p>No check gave a different result in the dark or brand theme than in light, on either platform.</p>';
const differCount = apps.map(([a, name]) => ({ name, n: rows.filter((r) => differs(result(a, r.key, 'ios'), result(a, r.key, 'android'))).length }));

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
const sheetHalf = (a, kind, p) => {
  const tag = p === 'ios' ? 'iOS' : 'Android';
  const comp = kind.pick(a);
  const fs = comp ? sheetChecks.map((c) => result(a, `${comp} | ${c}`, p)).filter(Boolean) : [];
  if (!fs.length) return { html: `<span class="sh na"><span class="tag">${tag}</span> ${esc(comp ? 'not run' : noOwnSheet[a] ?? '–')}</span>`, full: null };
  const passed = fs.filter((f) => f.pass).length;
  const fails = fs.filter((f) => !f.pass).map((f) => `<span class="why">✗ ${esc(failLabel[f.check] ?? f.check)}</span>`).join('');
  const untested = sheetChecks.filter((c) => !fs.some((f) => f.check === c)).map((c) => `<span class="why untested">– ${esc(shortName[c])} not tested</span>`).join('');
  const title = fs.map((f) => `${tag} ${f.pass ? '✓' : '✗'} ${f.check}: ${f.detail}`).join('\n');
  return { html: `<span class="sh ${passed === fs.length ? 'pass' : 'fail'}" title="${esc(title)}"><span class="tag">${tag}</span> <strong>${passed} / ${fs.length}</strong>${fails}${untested}</span>`, full: passed === fs.length };
};
const sheetCell = (a, kind) => {
  const i = sheetHalf(a, kind, 'ios');
  const d = sheetHalf(a, kind, 'android');
  const name = kind.name && kind.pick(a) ? `<span class="name">${esc(kind.name(a))}</span>` : '';
  const diff = i.full != null && d.full != null && i.full !== d.full;
  return `<td class="sheet${diff ? ' differs' : ''}">${name}${i.html}${d.html}</td>`;
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
  return `${head}<tr><td class="num">${++n}</td><th scope="row">${esc(shown(r.check))}<span class="what">${esc(what[r.check] ?? '')}</span></th>${apps.map(([a]) => cell(result(a, r.key, 'ios') ?? ran(a, r, 'ios'), result(a, r.key, 'android') ?? ran(a, r, 'android'))).join('')}</tr>`;
}).filter(Boolean).join('\n');

const motionOf = (m, comp, rm) => m?.runs.find((r) => r.component === comp && r.reduceMotion === rm)?.ms;
const ms = (v) => (v == null ? '–' : `${v} ms`);
const grewOf = (t) => {
  const g = t?.growth.filter((x) => x.ratio) ?? [];
  return g.length ? `${g.filter((x) => x.ratio > 1.2).length} / ${g.length}` : '–';
};
const edgeOf = (t) => (t ? (t.offscreen ?? []).map((id) => id.replace(/^test-/, '')).join(', ') || 'none' : '–');
const otherRows = [
  ['Controls that grew at the largest text size', 'iOS: AX5. Android: font scale 2.0.', (d) => grewOf(d.text), (d) => grewOf(d.androidText)],
  ['Controls pushed to or past the screen edge', 'At the largest text size.', (d) => edgeOf(d.text), (d) => edgeOf(d.androidText)],
  ['Dialog open, animations on', 'Real-time recording, 30 fps; one frame is 33 ms.', (d) => ms(motionOf(d.motion, 'Dialog', false)), (d) => ms(motionOf(d.androidMotion, 'Dialog', false))],
  ['Dialog open, Reduce Motion / Remove animations', 'iOS Reduce Motion; Android Remove animations. Set before launch.', (d) => ms(motionOf(d.motion, 'Dialog', true)), (d) => ms(motionOf(d.androidMotion, 'Dialog', true))],
  ['Bottom sheet open, animations on', '', (d) => ms(motionOf(d.motion, 'Bottom sheet', false)), (d) => ms(motionOf(d.androidMotion, 'Bottom sheet', false))],
  ['Bottom sheet open, Reduce Motion / Remove animations', '', (d) => ms(motionOf(d.motion, 'Bottom sheet', true)), (d) => ms(motionOf(d.androidMotion, 'Bottom sheet', true))],
].map(([label, note, ios, droid]) => `<tr><th scope="row">${label}${note ? `<span class="what">${esc(note)}</span>` : ''}</th>${apps.map(([a]) => `<td class="pair2"><span class="r2">${esc(ios(data[a]))}</span><span class="r2">${esc(droid(data[a]))}</span></td>`).join('')}</tr>`).join('\n');


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
  ['Test screen', `All 19 items of the test screen, from buttons, form controls, dialog, sheet, tabs and toast to the slider, progress bar, accordion, menu and segmented control. Results are ${themeNote}.`, (a, p) => tally(findingsOf(a, p), 'screen')],
  ['Extra bottom sheets', 'The @expo/ui sheet in every app, plus Tamagui’s and gluestack’s own sheets, and a raw @gorhom sheet in the HeroUI app (whose own sheet is on the test screen): 5 checks per sheet.', (a, p) => tally(findingsOf(a, p), 'sheets')],
  ...(themesDiffer
    ? [
        ['Everything, dark theme', 'All the checks above, re-run with the app switched to its dark theme.', (a, p) => tally(findingsOf(a, p, 'dark'))],
        ['Everything, brand theme', 'All the checks above, re-run with the app switched to its brand theme.', (a, p) => tally(findingsOf(a, p, 'brand'))],
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
const scoreCharts = () => scoreParts.map(([title, note, fn], i) => {
  const val = (t) => ({ value: t ? (t.pass / t.total) * 100 : null, text: t ? `${t.pass} / ${t.total}` : 'not run' });
  const rows = apps.map(([a, name]) => ({ label: name, ios: val(fn(a, 'ios')), android: val(fn(a, 'android')) }));
  return pairedFigure(`score-${i}`, title, note, rows, 'The baseline and the three engines are the same hand-built components, so their bars are what careful hand-built accessibility reaches; a library’s gap to them is what you would have to fix yourself. A library that scores differently on the two platforms handles the platforms’ accessibility APIs differently.');
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
const SUB = 14;
function pairedBars(rows, max) {
  const per = SUB * 2 + 10;
  const h = rows.length * per + 8;
  const inner = W - LABEL - 78;
  const one = (v, y, cls) => {
    const w = v.value == null ? 0 : Math.max(1, (v.value / max) * inner);
    return (v.value == null ? '' : `<rect x="${LABEL}" y="${y + 1}" width="${w.toFixed(1)}" height="${SUB - 3}" rx="2" class="bar ${cls}"/>`)
      + `<text x="${LABEL + w + 6}" y="${y + SUB - 3}" class="val">${esc(v.text)}</text>`;
  };
  return `<svg viewBox="0 0 ${W} ${h}" width="100%" aria-hidden="true" focusable="false" class="chart">${rows
    .map((r, i) => {
      const y = 4 + i * per;
      return `<text x="${LABEL - 8}" y="${y + SUB + 3}" text-anchor="end" class="lbl">${esc(r.label)}</text>` + one(r.ios, y, 'ios') + one(r.android, y + SUB, 'android');
    })
    .join('')}</svg>`;
}
const pairedKey = '<span class="key"><i class="sw ios"></i>iOS, iPhone 17 simulator <i class="sw android"></i>Android, Galaxy A15 5G</span>';
function pairedFigure(id, title, note, rows, read) {
  const max = Math.max(...rows.flatMap((r) => [r.ios.value ?? 0, r.android.value ?? 0])) || 1;
  const table = `<table class="sr"><caption>${esc(title)}</caption><thead><tr><th scope="col">App</th><th scope="col">iOS</th><th scope="col">Android</th></tr></thead><tbody>${rows.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.ios.text)}</td><td>${esc(r.android.text)}</td></tr>`).join('')}</tbody></table>`;
  return `<figure class="fig" aria-labelledby="${id}"><figcaption id="${id}"><strong>${esc(title)}</strong> <span>${esc(note)}</span>${pairedKey}</figcaption>${pairedBars(rows, max)}<p class="read"><strong>How to read it:</strong> ${esc(read)}</p>${table}</figure>`;
}
const pairedCharts = [
  ['Theme switch, median', 'From the tap to the second frame after the update. Lower is better.', 'iOS: every app finishes within a frame (about 32 ms) except Tamagui (99 ms). Android, on a budget phone: Tamagui (632 ms) and HeroUI (246 ms) stand out; the other gaps are within each app’s run-to-run spread.', (d) => d.perf.theme.median, (d) => d.androidPerf.theme.median, (v) => `${v.toFixed(1)} ms`],
  ['200-row list mount, median', 'From the tap to the second frame after the list’s first layout. Lower is better.', 'iOS: about 83 ms everywhere except Tamagui (115 ms). Android: most apps 150–180 ms with overlapping ranges, Tamagui 374 ms.', (d) => d.perf.list.median, (d) => d.androidPerf.list.median, (v) => `${v.toFixed(1)} ms`],
  ['Startup until readable, median of 10', 'From the launch call until the screen title is in the accessibility tree, when VoiceOver or TalkBack could first read it. Not first paint.', 'Within each platform the apps sit close together (iOS 7.9–8.4 s, Android 2.9–3.4 s), so read them as groups. Don’t compare the platforms: the simulator’s accessibility tree is slow to become readable.', (d) => d.metrics.startup.median, (d) => d.androidMetrics.startup.median, (v) => `${(v / 1000).toFixed(2)} s`],
  ['Memory at idle', '5 s after launch. Lower is better. iOS is phys_footprint, Android is total PSS: different measures.', 'Compare apps within a platform, not across. On both, the kits use more than the baseline, and HeroUI the most.', (d) => d.metrics.memory.idle.physFootprint / 1048576, (d) => d.androidMetrics.memory.idle.pss / 1048576, (v) => `${v.toFixed(1)} MiB`],
  ['Memory after use', 'After scrolling the list and opening every overlay once. Lower is better. Same measures as above.', 'iOS: Tamagui (161 MiB) stands out. Android: HeroUI (416 MiB) and gluestack (292 MiB) grow far more than the rest.', (d) => d.metrics.memory.used.physFootprint / 1048576, (d) => d.androidMetrics.memory.used.pss / 1048576, (v) => `${v.toFixed(1)} MiB`],
  ['App CPU time during 5 list flings', 'CPU used by the app’s threads over about 7.5 s of flinging the list. Lower is better.', 'The simulator runs on the Mac’s CPU and the phone on a budget one, so compare apps within a platform. HeroUI uses the most on both.', (d) => d.metrics.scroll.cpuMs.total, (d) => d.androidMetrics.scroll.cpuMs.total, (v) => `${(v / 1000).toFixed(2)} s`],
].map(([title, note, read, ios, android, fmt], i) => {
  const val = (a, get) => {
    const v = num(a, get);
    return { value: v, text: v == null ? 'not measured' : fmt(v) };
  };
  const rows = apps.map(([a, name]) => ({ label: name, ios: val(a, ios), android: val(a, android) }));
  return pairedFigure(`paired-${i}`, title, note, rows, read);
}).join('\n');

const singleCharts = [
  ['iOS JS bundle', 'Hermes bytecode from expo export, with all 19 items. Lower is better.', 'Exact, with no run-to-run noise. The baseline is plain React Native, so the gap to it is what the library adds.', (d) => d.bundle.iosHbcBytes / 1e6, (v) => `${v.toFixed(2)} MB`],
  ['iOS: components re-rendered on one theme switch', 'Light → dark, counted by argent’s React profiler on a Debug build. Fewer means less work for React.', 'Counts repeat closely for light → dark and dark → brand in every app, but brand → light can be lower (Uniwind 302 against 507). Tamagui isn’t measured: its Debug build aborts.', (d) => d.metrics.rerenders.switches[0].renders, (v) => `${v}`],
  ['Android: janky frames during the flings', 'Frames dumpsys gfxinfo marks as janky, out of about 1,250. Lower is better. The iOS simulator can’t record frame hitches.', 'At most 1 janky frame in any app, so scrolling is smooth everywhere.', (d) => d.androidMetrics.scroll.frames.janky, (v) => `${v}`],
].map(([title, note, read, get, fmt], i) => {
  const rows = apps.map(([a, name]) => {
    const v = num(a, get);
    return { label: name, value: v, text: v == null ? 'not measured' : fmt(v) };
  });
  const max = Math.max(...rows.map((r) => r.value ?? 0)) || 1;
  return figure(`single-${i}`, title, note, rows, max, title, read);
}).join('\n');
const rng = (x) => (x ? `${x.median.toFixed(1)} ms (${x.min.toFixed(0)}–${x.max.toFixed(0)})` : '–');
const mib = (v) => (v == null ? '–' : `${(v / 1048576).toFixed(1)} MiB`);
const exactRows = [
  ['Theme switch, median (range)', (d) => rng(d.perf?.theme), (d) => rng(d.androidPerf?.theme)],
  ['200-row list mount, median (range)', (d) => rng(d.perf?.list), (d) => rng(d.androidPerf?.list)],
  ['Startup until readable, median', (d) => `${(d.metrics.startup.median / 1000).toFixed(2)} s`, (d) => `${(d.androidMetrics.startup.median / 1000).toFixed(2)} s`],
  ['Memory at idle', (d) => mib(d.metrics.memory.idle.physFootprint), (d) => mib(d.androidMetrics.memory.idle.pss)],
  ['Memory after use', (d) => mib(d.metrics.memory.used.physFootprint), (d) => mib(d.androidMetrics.memory.used.pss)],
  ['App CPU during 5 list flings', (d) => `${(d.metrics.scroll.cpuMs.total / 1000).toFixed(2)} s`, (d) => `${(d.androidMetrics.scroll.cpuMs.total / 1000).toFixed(2)} s`],
  ['Main-thread hangs (iOS) / janky frames (Android)', (d) => `${d.metrics.scroll.hangs} hangs`, (d) => `${d.androidMetrics.scroll.frames.janky} of ${d.androidMetrics.scroll.frames.total}`],
].map(([label, ios, droid]) => `<tr><th scope="row">${label}</th>${apps.map(([a]) => `<td class="pair2"><span class="r2">${esc(num(a, ios) ?? '–')}</span><span class="r2">${esc(num(a, droid) ?? '–')}</span></td>`).join('')}</tr>`).join('\n');
const androidDevice = apps.map(([a]) => data[a].androidMetrics?.device).find(Boolean);
const phoneNames = { 'SM-A156E': 'Samsung Galaxy A15 5G' };
const androidDeviceText = androidDevice
  ? `the ${phoneNames[androidDevice.name] ? `${phoneNames[androidDevice.name]} (${androidDevice.name})` : androidDevice.name} running ${androidDevice.runtime}`
  : 'an Android device';

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
:root { --bg: #f7f6f3; --fg: #1d1d21; --muted: #5d5a55; --line: #dcd8d0; --surface: #fff; --pass: #1f7a45; --pass-bg: #e3f3e8; --fail: #a32a1c; --fail-bg: #fbe6e2; --na: #8a867f; --accent: #3d5a98; --android: #b5651d; }
@media (prefers-color-scheme: dark) { :root { --bg: #151517; --fg: #ececee; --muted: #a3a09b; --line: #34343a; --surface: #1d1d21; --pass: #7fd6a0; --pass-bg: #18301f; --fail: #ff9d8c; --fail-bg: #3a1c17; --na: #7c7a76; --accent: #8fb0ef; --android: #f0a868; } }
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
td.pair { text-align: center; white-space: nowrap; width: 8%; }
td.pair .r, .legend .r { display: inline-block; min-width: 1.8em; padding: 2px 4px; margin: 0 1px; border-radius: 4px; font-weight: 700; font-size: 15px; }
.r.pass { color: var(--pass); background: var(--pass-bg); }
.r.fail { color: var(--fail); background: var(--fail-bg); }
.r.na { color: var(--na); }
td.differs { box-shadow: inset 0 0 0 2px var(--android); }
td .flag { display: block; font-size: 12px; color: var(--android); }
td.pair2 { white-space: nowrap; }
td.pair2 .r2 { display: inline-block; min-width: 46%; }
td.pair2 .r2 + .r2 { color: var(--android); padding-left: 6px; border-left: 1px solid var(--line); }
thead small.pl { display: flex; justify-content: space-around; margin-top: 2px; }
thead small.pl span + span { color: var(--android); }
td.sheet .sh { display: block; margin-top: 4px; }
td.sheet .sh.pass strong { color: var(--pass); }
td.sheet .sh.fail strong { color: var(--fail); }
td.sheet .tag { font-size: 11px; color: var(--muted); text-transform: uppercase; }
table.diffs { min-width: 0; }
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
.chart .bar.android { fill: var(--android); }
.key { display: block; font-size: 13px; color: var(--muted); margin-top: 4px; }
.key .sw { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin: 0 4px 0 0; vertical-align: -1px; background: var(--accent); }
.key .sw.android { background: var(--android); margin-left: 12px; }
.chart .bar.full { fill: var(--pass); }
.legend { display: flex; gap: 16px; flex-wrap: wrap; font-size: 14px; color: var(--muted); margin: 8px 0 16px; }
</style>
</head>
<body>
<main>
<h1>UI library checks</h1>
<p>The same checks, run on iOS and Android for every app, side by side. Generated from <code>results/</code> by <code>scripts/report-html.mjs</code>. All apps build the same test screen. iOS: Release builds on ${esc(deviceText)}. Android: Release builds on ${esc(androidDeviceText)}. The accessibility checks read the tree each screen reader is given (VoiceOver on iOS, TalkBack on Android); they don't hear what it says. Hover a result for the measured detail.</p>
<div class="legend"><span><span class="r pass">✓</span> pass</span><span><span class="r fail">✗</span> fail</span><span>– not applicable (no such element)</span><span>n/r not run (the test could not start)</span><span>⚠ different result on iOS and Android</span><span>* NativeWind results use a line-height workaround; see apps/nativewind/NOTES.md</span></div>
<p class="legend">In every cell, the left result is <strong>iOS</strong> and the right result is <strong>Android</strong>.</p>

<h2>Platform differences in how things are tested</h2>
<div class="wrap"><table class="diffs">
<thead><tr><th scope="col" class="check">What</th><th scope="col">iOS</th><th scope="col">Android</th></tr></thead>
<tbody>
<tr><th scope="row">Device</th><td>${esc(deviceText)}</td><td>${esc(androidDeviceText)}</td></tr>
<tr><th scope="row">Accessibility tree</th><td>What VoiceOver is given (system tree and view hierarchy, through argent)</td><td>What TalkBack is given: the active window’s tree, read through UiAutomation (<code>scripts/android-a11y-dump</code>)</td></tr>
<tr><th scope="row">Touch target</th><td>≥ 44 × 44 pt (Apple’s default)</td><td>≥ 48 × 48 dp (Google’s minimum)</td></tr>
<tr><th scope="row">Largest text size</th><td>AX5 (accessibility-extra-extra-extra-large)</td><td>Font scale 2.0, the largest Android offers</td></tr>
<tr><th scope="row">Reduced motion</th><td>Reduce Motion</td><td>Remove animations (animation scales 0)</td></tr>
<tr><th scope="row">Memory</th><td>phys_footprint</td><td>Total PSS (not comparable with iOS)</td></tr>
<tr><th scope="row">Scrolling</th><td>CPU during flings and main-thread hangs; frame hitches can’t be recorded on the simulator</td><td>CPU during flings and janky frames (dumpsys gfxinfo)</td></tr>
</tbody>
</table></div>

<h2>Accessibility scores at a glance</h2>
<p>Each chart is one group of accessibility checks. For each app, the blue bar is iOS and the orange bar Android: the share of that group’s checks the app passed, with the count at the end. The full spec is in <code>docs/method.md</code>, and every check is in the grid below.</p>
<div class="charts">
${scoreCharts()}
</div>

<h2>Accessibility checks</h2>
<p>Results that differ between iOS and Android, per app: ${differCount.map((d) => `${esc(d.name)} ${d.n}`).join(', ')}.</p>
<div class="wrap"><table>
<thead><tr><th>#</th><th scope="col" class="check">Check</th>${apps.map(([, name, kind]) => `<th scope="col">${esc(name)}<small>${esc(kind)}</small><small class="pl"><span>iOS</span><span>Android</span></small></th>`).join('')}</tr></thead>
<tbody>
${themesDiffer
  ? ['light', 'dark', 'brand'].map((t) => `<tr class="score"><td></td><th scope="row">Checks passed, ${t} theme</th>${apps.map(([a]) => `<td class="pair2">${score(a, t)}</td>`).join('')}</tr>`).join('\n')
  : `<tr class="score"><td></td><th scope="row">Checks passed<span class="what">Same in the light, dark and brand themes.</span></th>${apps.map(([a]) => `<td class="pair2">${score(a)}</td>`).join('')}</tr>`}
${checkRows}
</tbody>
</table></div>

<h2>Dark and brand themes</h2>
<p>Every check also ran with the app switched to its dark and brand themes, on both platforms. The grid above shows light; this lists every check whose result changed.</p>
${themeDiffHtml}

<h2>Text size and reduced motion</h2>
<p>Left value iOS, right value Android. Transition times come from a real-time screen recording at 30 fps; an instant change is one frame (33 ms).</p>
<div class="wrap"><table>
<thead><tr><th scope="col" class="check">Measure</th>${apps.map(([, name]) => `<th scope="col">${esc(name)}<small class="pl"><span>iOS</span><span>Android</span></small></th>`).join('')}</tr></thead>
<tbody>
${otherRows}
</tbody>
</table></div>

<h2>Speed, memory and scrolling</h2>
<p>For each app, the blue bar is iOS and the orange bar Android. Shorter is better on every chart. The same scripts measured both, but the devices are very different (a simulator on a Mac and a budget phone), so compare apps within a platform; the pairs show whether a library is slow on both or only on one. Under each chart, “How to read it” says which gaps are real.</p>
<div class="charts">
${pairedCharts}
</div>

<h2>Measured on one platform only</h2>
<p>Bundle size and re-render counts come from iOS builds; janky frames can only be recorded on Android.</p>
<div class="charts">
${singleCharts}
</div>

<h2>Speed, memory and scrolling: exact values</h2>
<p>Left value iOS, right value Android. Medians of 10 runs, with the range for the timings.</p>
<div class="wrap"><table>
<thead><tr><th scope="col" class="check">Measure</th>${apps.map(([, name]) => `<th scope="col">${esc(name)}<small class="pl"><span>iOS</span><span>Android</span></small></th>`).join('')}</tr></thead>
<tbody>
${exactRows}
</tbody>
</table></div>

<h2>Developer cost (both platforms)</h2>
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
