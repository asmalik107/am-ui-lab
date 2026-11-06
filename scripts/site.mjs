// Builds site/index.html, the GitHub Pages site: the answer, a sortable
// scorecard, a filterable grid of every accessibility check and the charts.
// One self-contained page, with the data inlined as JSON, so it needs no build
// step on GitHub. Reads only results/* (through the shared modules).
// Usage: node scripts/site.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { columns, devices, heading, headline, kind, kinds, libraries, pages, points, scope, scorecard, slug, stack, versions } from './scorecard.mjs';
import { picture, pictures, siteStyle } from './check-pictures.mjs';
import { apps, chartDevices, charts, detail, differs, examples, explain, explained, get, pictureOf, result, root, rows, sheetChecks, sheetKinds, shown } from './checks-data.mjs';

explained([...rows.map((r) => r.check), ...sheetChecks]);
// How a check is tested, shown with its picture (see scripts/check-pictures.mjs).
const ex = (component, c) => { const { does, passes, fails } = explain[c]; return { does, passes, fails, pic: pictureOf(component, c) }; };

const repo = 'https://github.com/asmalik107/am-ui-lab';
// The page's own address, from the docs list in scorecard.mjs, and what a
// link preview (Slack, LinkedIn, X, iMessage) shows. og.png is made by
// scripts/og-image.mjs.
const siteUrl = pages.find(([label]) => label === 'Site')[1];
const title = 'React Native UI Lab: 8 UI libraries compared on accessibility and speed';
const summary = 'Eight React Native UI libraries compared on accessibility, theming speed and memory, on an iPhone and a budget Android phone.';
// Google Search Console's HTML-tag verification for the URL-prefix property
// https://asmalik107.github.io/am-ui-lab/. The tag must stay on the page for
// the property to stay verified.
const googleVerification = process.env.GOOGLE_SITE_VERIFICATION ?? '4geVNT0EzCJQwPaMFld_LXh4LL2GauQ_n-mWJfP-3XM';
const blob = `${repo}/blob/main/`;

// Every check, with each app's result on each platform:
// 'pass' | 'fail' | 'na' (no such element) | 'nr' (not run), plus why it failed.
const state = (f) => (f?.notRun ? 'nr' : !f ? 'na' : f.pass ? 'pass' : 'fail');
const cell = (f) => ({ s: state(f), d: f && !f.pass && !f.notRun ? detail(f) ?? '' : '' });
const both = (i, d) => ({ ios: cell(i), android: cell(d), differs: differs(i, d) });
const isSheet = (c) => c.startsWith('Bottom sheet');
const checks = [
  ...rows.filter((r) => !isSheet(r.component)).map((r) => ({
    component: r.component,
    check: shown(r.check),
    ...ex(r.component, r.check),
    cells: Object.fromEntries(apps.map(([a]) => [a, both(get(a, r, 'ios'), get(a, r, 'android'))])),
  })),
  // Sheets by kind, as in docs/checks.md: each app names its sheets
  // differently, so one row per component name would scatter them.
  ...sheetKinds.flatMap(([label, , pick]) => sheetChecks.map((c) => ({
    component: `Bottom sheet: ${label}`,
    check: shown(c),
    ...ex('Bottom sheet', c),
    cells: Object.fromEntries(apps.map(([a]) => {
      const comp = pick(a);
      const f = (p) => (comp ? result(a, `${comp} | ${c}`, p) : null);
      return [a, both(f('ios'), f('android'))];
    })),
  }))),
];

// The scorecard with each raw value kept for sorting.
const card = {
  columns: columns.map((c) => ({ head: c.head, better: c.better, link: `${blob}docs/results.md#${c.link}` })),
  rows: scorecard().map((x) => ({
    app: x.app,
    name: x.name,
    kind: kind(x.app),
    href: `${blob}README.md#${slug(heading(libraries.find((l) => l.app === x.app)))}`,
    cells: x.cells.map((c, i) => ({ ...c, value: columns[i].get(x) })),
  })),
};

// Four headline numbers for the top of the page, picked by the scorecard's
// own best and worst marks so they follow the results.
const marked = (col, mark) => card.rows.filter((r) => r.cells[col].mark === mark);
const names = (rs) => (rs.length > 3 ? 'The baseline and the styling engines' : rs.map((r) => r.name).join(', '));
const col = (head) => columns.findIndex((c) => c.head === head);
const theme = col('Theme switch, Android');
const talk = col('Accessibility, Android');
const mem = col('Memory growth, Android');
const stats = [
  { value: marked(theme, 'best')[0].cells[theme].text, label: `${names(marked(theme, 'best'))}: the fastest theme switch on a budget Android phone`, tone: 'good' },
  { value: marked(theme, 'worst')[0].cells[theme].text, label: `${names(marked(theme, 'worst'))}: the slowest theme switch on the same phone`, tone: 'bad' },
  { value: marked(talk, 'best')[0].cells[talk].text, label: `${names(marked(talk, 'best'))}: the most TalkBack checks passed`, tone: 'good' },
  { value: marked(mem, 'worst')[0].cells[mem].text, label: `${names(marked(mem, 'worst'))}: the most memory growth after use, on the phone`, tone: 'bad' },
];

const data = {
  stats,
  apps: apps.map(([a, name]) => ({ app: a, name, version: versions[a]?.[0] ?? '' })),
  headline,
  scope,
  // The three kinds of app, each library with its link and versions.
  kinds: kinds.map((k) => ({ title: k.title, what: k.what, items: k.items.map((i) => (typeof i === 'string' ? { text: i } : { name: i[0], url: i[1], versions: versions[i[2]] })) })),
  points,
  stack,
  card,
  checks,
  pictures: Object.fromEntries(Object.keys(pictures).map((id) => [id, picture(id, { standalone: false, examples: examples[id] })])),
  charts: charts.map(([file, title, sub, read, series]) => ({ file, title, sub, read, on: chartDevices(file), ...series })),
  pages: pages.filter(([label]) => label !== 'Site').map(([label, path, about]) => ({ label, href: blob + path, about })),
  repo,
};
// Safe inside a <script> element.
const json = JSON.stringify(data).replace(/</g, '\\u003c');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<script>document.documentElement.classList.add('js');</script>
<meta name="description" content="${summary}">
<link rel="canonical" href="${siteUrl}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="React Native UI Lab">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${summary}">
<meta property="og:url" content="${siteUrl}">
<meta property="og:image" content="${siteUrl}og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Accessibility against theme-switch time for eight React Native UI libraries on a budget Android phone">
<meta name="twitter:card" content="summary_large_image">${googleVerification ? `\n<meta name="google-site-verification" content="${googleVerification}">` : ''}
<style>
:root {
  --bg: #f6f5f1; --surface: #ffffff; --raised: #fbfaf7; --text: #18181b; --muted: #5d5a55; --line: #e3dfd6;
  --accent: #4f46e5; --accent-2: #db2777; --accent-ink: #ffffff; --glow: rgba(79, 70, 229, .16);
  --ios: #4f63c9; --android: #c2620f; --pass-bg: #e2f4e8; --fail-bg: #fde4e1; --warn-bg: #fdf0d2; --na: #8a867f;
  --best-bg: #e2f4e8; --worst-bg: #fde4e1; --shadow: 0 1px 2px rgba(24, 24, 27, .05), 0 8px 24px rgba(24, 24, 27, .06);
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0e0e11; --surface: #17171c; --raised: #1c1c22; --text: #ececf1; --muted: #a09da6; --line: #2b2b33;
    --accent: #8b8cff; --accent-2: #f472b6; --accent-ink: #0e0e11; --glow: rgba(139, 140, 255, .18);
    --ios: #8fa3ff; --android: #f5a25a; --pass-bg: #15301f; --fail-bg: #3a1c1b; --warn-bg: #362c17; --na: #75727b;
    --best-bg: #15301f; --worst-bg: #3a1c1b; --shadow: 0 1px 2px rgba(0, 0, 0, .4), 0 8px 24px rgba(0, 0, 0, .3);
    color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --bg: #0e0e11; --surface: #17171c; --raised: #1c1c22; --text: #ececf1; --muted: #a09da6; --line: #2b2b33;
  --accent: #8b8cff; --accent-2: #f472b6; --accent-ink: #0e0e11; --glow: rgba(139, 140, 255, .18);
  --ios: #8fa3ff; --android: #f5a25a; --pass-bg: #15301f; --fail-bg: #3a1c1b; --warn-bg: #362c17; --na: #75727b;
  --best-bg: #15301f; --worst-bg: #3a1c1b; --shadow: 0 1px 2px rgba(0, 0, 0, .4), 0 8px 24px rgba(0, 0, 0, .3);
  color-scheme: dark;
}
* { box-sizing: border-box; }
@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }
body { margin: 0; background: var(--bg); color: var(--text); font: 16px/1.55 ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
a { color: var(--accent); text-underline-offset: 2px; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 4px; }
.wrap { max-width: 1120px; margin: 0 auto; padding: 0 16px; }

/* Hero */
.hero { position: relative; overflow: hidden; padding: 56px 0 40px; isolation: isolate; }
.hero::before, .hero::after { content: ""; position: absolute; z-index: -1; width: 520px; height: 520px; border-radius: 50%; filter: blur(80px); opacity: .55; }
.hero::before { background: var(--glow); top: -220px; left: -120px; }
.hero::after { background: color-mix(in srgb, var(--accent-2) 18%, transparent); top: -160px; right: -160px; }
@media (prefers-reduced-motion: no-preference) {
  .hero::before { animation: drift 18s ease-in-out infinite alternate; }
  .hero::after { animation: drift 22s ease-in-out infinite alternate-reverse; }
}
@keyframes drift { to { transform: translate(80px, 40px) scale(1.1); } }
.bar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 28px; }
.brand { font-weight: 700; font-size: 14px; letter-spacing: .02em; color: var(--muted); text-decoration: none; }
.eyebrow { display: inline-block; font-size: 13px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--accent); margin: 0 0 10px; }
h1 { font-size: clamp(36px, 7vw, 64px); line-height: 1.02; letter-spacing: -.035em; margin: 0 0 16px; text-wrap: balance; }
h1 .grad { background: linear-gradient(90deg, var(--accent), var(--accent-2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
h2 { font-size: clamp(26px, 4vw, 34px); letter-spacing: -.025em; line-height: 1.1; margin: 0 0 6px; }
h3 { font-size: 17px; letter-spacing: -.01em; margin: 0 0 4px; }
.lede { color: var(--muted); font-size: clamp(16px, 2.2vw, 19px); max-width: 62ch; margin: 0 0 20px; }
.stack { display: flex; flex-wrap: wrap; gap: 6px; padding: 0; margin: 0; list-style: none; font-size: 13px; }
.stack a { display: inline-block; padding: 3px 10px; border: 1px solid var(--line); border-radius: 999px; text-decoration: none; color: var(--muted); background: color-mix(in srgb, var(--surface) 70%, transparent); transition: color .15s, border-color .15s; }
.stack a:hover { color: var(--text); border-color: var(--muted); }
.theme-btn { background: var(--surface); color: var(--text); border: 1px solid var(--line); border-radius: 999px; padding: 6px 14px; font: inherit; font-size: 14px; cursor: pointer; transition: transform .15s; }
.theme-btn:active { transform: scale(.96); }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 12px; margin: 32px 0 0; padding: 0; list-style: none; }
.stats li { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 18px 18px 16px; box-shadow: var(--shadow); }
.stats .v { display: block; font-size: clamp(28px, 4vw, 36px); font-weight: 750; letter-spacing: -.03em; font-variant-numeric: tabular-nums; line-height: 1.1; }
.stats .good .v { color: color-mix(in srgb, #16a34a 80%, var(--text)); }
.stats .bad .v { color: color-mix(in srgb, #dc2626 80%, var(--text)); }
.stats .l { display: block; color: var(--muted); font-size: 14px; margin-top: 6px; }

/* Section nav: sticky pills, the current section filled in. */
nav.jump { position: sticky; top: 0; z-index: 10; background: color-mix(in srgb, var(--bg) 80%, transparent); backdrop-filter: saturate(1.4) blur(12px); -webkit-backdrop-filter: saturate(1.4) blur(12px); border-bottom: 1px solid transparent; transition: border-color .2s; }
nav.jump.stuck { border-bottom-color: var(--line); }
nav.jump ul { display: flex; gap: 4px; list-style: none; margin: 0; padding: 10px 0; overflow-x: auto; scrollbar-width: none; }
nav.jump ul::-webkit-scrollbar { display: none; }
nav.jump a { display: block; padding: 6px 14px; border-radius: 999px; text-decoration: none; color: var(--muted); font-size: 14px; font-weight: 550; white-space: nowrap; transition: background-color .2s, color .2s; }
nav.jump a:hover { color: var(--text); background: var(--raised); }
nav.jump a[aria-current="true"] { background: var(--text); color: var(--bg); }

section { padding: 64px 0 8px; scroll-margin-top: 56px; }
.sec-num { font-size: 13px; font-weight: 600; color: var(--accent); font-variant-numeric: tabular-nums; letter-spacing: .06em; display: block; margin-bottom: 6px; }
.note { border: 1px solid var(--line); border-left: 4px solid var(--accent); background: var(--surface); padding: 14px 18px; border-radius: 12px; margin: 18px 0; box-shadow: var(--shadow); }
.note p { margin: 0; }
.note.scope { border-left-color: var(--android); }
.note ul { margin: 6px 0 0; padding-left: 18px; } .note p + p { margin-top: 4px; }
.points { display: grid; grid-template-columns: 1fr; gap: 12px; margin: 0; padding: 0; list-style: none; counter-reset: pt; }
.points > li { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 18px 20px; box-shadow: var(--shadow); counter-increment: pt; transition: transform .2s, box-shadow .2s; }
.points > li:hover { transform: translateY(-2px); }
.points > li::before { content: counter(pt, decimal-leading-zero); display: block; font-size: 12px; font-weight: 700; color: var(--accent); margin-bottom: 6px; }
.points ul { margin: 8px 0 0; padding-left: 18px; font-size: 15px; }
.points ul ul { margin: 2px 0; }
.kinds { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 12px; margin: 0; padding: 0; list-style: none; }
.kinds > li { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 18px 20px; box-shadow: var(--shadow); }
.kinds > li:first-child { border-top: 3px solid var(--accent); }
.kinds > li > p { color: var(--muted); font-size: 14px; margin: 4px 0 10px; }
.kinds ul { margin: 0; padding-left: 18px; font-size: 15px; }
.kinds ul li + li { margin-top: 4px; }
.kinds .ver { color: var(--muted); font-size: 13px; font-variant-numeric: tabular-nums; }
.kinds small { display: block; color: var(--muted); font-size: 12px; }
.hint { color: var(--muted); font-size: 15px; margin: 4px 0 16px; max-width: 75ch; }
ul.hint { padding-left: 20px; } ul.hint li { margin: 2px 0; } ul.hint ul { padding-left: 18px; margin: 2px 0; }
.scroll { overflow-x: auto; border: 1px solid var(--line); border-radius: 14px; background: var(--surface); box-shadow: var(--shadow); }
table { border-collapse: collapse; width: 100%; font-size: 14px; }
th, td { padding: 10px 12px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
tr:last-child td, tr:last-child th { border-bottom: 0; }
thead th { font-weight: 600; background: var(--raised); position: sticky; top: 0; font-size: 13px; }
th:first-child, td:first-child { position: sticky; left: 0; background: var(--surface); z-index: 1; }
thead th:first-child { background: var(--raised); }
.card td, .card th { white-space: nowrap; }
.card tbody tr { transition: background-color .15s; }
.card tbody tr:hover td { filter: brightness(.98); }
.card td.num { font-variant-numeric: tabular-nums; }
.card td.best { background: var(--best-bg); font-weight: 600; }
.card td.worst { background: var(--worst-bg); }
.sort { all: unset; cursor: pointer; display: inline-flex; gap: 4px; align-items: center; }
.sort:hover { color: var(--accent); }
.sort .arrow { color: var(--muted); font-size: 11px; }
.kind { display: block; color: var(--muted); font-size: 12px; font-weight: 400; }
.filters { display: flex; flex-wrap: wrap; gap: 10px 18px; align-items: center; margin: 12px 0; font-size: 14px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--line); border-radius: 999px; padding: 4px 12px; background: var(--surface); cursor: pointer; user-select: none; transition: border-color .15s, background-color .15s; }
.chip:has(input:checked) { border-color: color-mix(in srgb, var(--accent) 50%, var(--line)); background: color-mix(in srgb, var(--accent) 8%, var(--surface)); }
.chip input { margin: 0; accent-color: var(--accent); }
.seg { display: inline-flex; border: 1px solid var(--line); border-radius: 999px; overflow: hidden; background: var(--surface); padding: 2px; margin-left: 6px; }
.seg button { all: unset; padding: 4px 12px; cursor: pointer; border-radius: 999px; transition: background-color .2s, color .2s; }
.seg button[aria-pressed="true"] { background: var(--text); color: var(--bg); }
select { font: inherit; padding: 5px 8px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); color: var(--text); margin-left: 6px; }
.grid td.cell { padding: 0; text-align: center; }
.grid td.cell button { all: unset; display: block; width: 100%; padding: 10px 8px; cursor: pointer; white-space: nowrap; transition: transform .12s; }
.grid td.cell button:hover { transform: scale(1.08); }
.grid td.cell.fail { background: var(--fail-bg); }
.grid td.cell.pass { background: var(--pass-bg); }
.grid td.cell.differs { background: var(--warn-bg); }
/* The check table scrolls both ways inside its own box, so its header can
   stick: the page's sticky nav is above it, and the box is never taller than
   the window below that nav. */
.scroll.tall { overflow: auto; max-height: calc(100dvh - var(--nav-h, 60px) - 24px); overscroll-behavior: contain; }
.grid { border-collapse: separate; border-spacing: 0; }
.grid thead th { z-index: 3; box-shadow: inset 0 -1px var(--line); border-bottom: 0; }
.grid thead th:first-child { z-index: 4; }
/* One tbody per component: a heading row that sticks under the table header,
   a gap above it, and a firm line under the section's last row. */
.grid tbody.group tr.comp th { position: sticky; top: var(--head-h, 52px); z-index: 2; padding: 0; background: var(--raised); border-bottom: 0; box-shadow: inset 0 -1px var(--line), inset 0 1px var(--line); }
.grid tr.gap td { height: 14px; padding: 0; background: var(--bg); border: 0; }
.grid tbody.group tr.comp .comp-label { position: sticky; left: 0; display: inline-flex; align-items: baseline; gap: 10px; padding: 10px 12px 10px 14px; border-left: 4px solid var(--accent); font-size: 15px; font-weight: 700; color: var(--text); }
.grid tbody.group tr.comp .comp-label small { font-size: 12px; font-weight: 500; color: var(--muted); }
.grid tbody.group tr:last-child td { border-bottom: 2px solid color-mix(in srgb, var(--muted) 45%, var(--line)); }
.grid td.name { min-width: 200px; }
.grid td.name small { display: block; color: var(--muted); }
.grid td.name .how { all: unset; cursor: pointer; color: var(--accent); font-size: 12px; font-weight: 600; margin-top: 2px; display: inline-block; }
.grid td.name .how:hover { text-decoration: underline; }
.grid tr.info dl { margin: 4px 0 8px; display: grid; grid-template-columns: auto 1fr; gap: 2px 10px; }
.grid tr.info dt { font-weight: 650; }
.grid tr.info dd { margin: 0; }
${siteStyle}
.grid tr.info td { position: static; background: var(--raised); font-size: 14px; padding: 12px 16px; }
.grid tr.info .box { position: sticky; left: 16px; max-width: min(70ch, calc(100vw - 64px)); white-space: normal; }
.grid tr.info p { margin: 4px 0; }
.grid tr.info .close { all: unset; cursor: pointer; color: var(--accent); font-size: 13px; font-weight: 600; }
@media (prefers-reduced-motion: no-preference) { .grid tr.info { animation: pop .25s ease-out; } }
@keyframes pop { from { opacity: 0; transform: translateY(-4px); } }
.na { color: var(--na); }
.count { color: var(--muted); font-size: 14px; font-variant-numeric: tabular-nums; }
.legend { display: flex; flex-wrap: wrap; gap: 14px; font-size: 13px; color: var(--muted); margin: 8px 0 12px; }
.charts { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 480px), 1fr)); gap: 16px; }
.chart { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 18px; box-shadow: var(--shadow); }
.chart .sub { color: var(--muted); font-size: 13px; margin: 0 0 12px; }
.chart .row { display: grid; grid-template-columns: 92px 1fr; gap: 10px; align-items: center; padding: 4px 6px; border-radius: 8px; cursor: pointer; transition: opacity .2s, background-color .2s; }
.chart .row:hover { background: var(--raised); }
.chart .row.on { background: color-mix(in srgb, var(--accent) 10%, var(--surface)); }
.chart .row.dim { opacity: .3; }
.chart .lbl { font-size: 13px; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chart .bars { display: grid; gap: 3px; }
.chart .b { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); font-variant-numeric: tabular-nums; }
.chart .fill { height: 11px; border-radius: 3px; min-width: 2px; transform-origin: left; }
.chart .fill.ios { background: var(--ios); } .chart .fill.android { background: var(--android); }
@media (prefers-reduced-motion: no-preference) {
  .js .chart .fill { transform: scaleX(0); transition: transform .8s cubic-bezier(.2, .8, .2, 1); }
  .js .chart.in .fill { transform: none; }
}
.chart details { margin-top: 12px; font-size: 13px; color: var(--muted); }
.chart summary { cursor: pointer; }
.chart details ul { margin: 6px 0 0; padding-left: 18px; }
.chart .tools { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.chart .tools button { all: unset; font-size: 12px; font-weight: 600; color: var(--accent); cursor: pointer; white-space: nowrap; }
.key { display: inline-flex; align-items: center; gap: 6px; }
.key i { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }

/* Scroll reveal: only when scripts run and motion is welcome, so the page
   never hides content otherwise. */
@media (prefers-reduced-motion: no-preference) {
  .js .reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s ease-out, transform .7s cubic-bezier(.2, .8, .2, 1); transition-delay: var(--d, 0ms); }
  .js .reveal.in { opacity: 1; transform: none; }
}

footer { margin-top: 72px; padding: 40px 0 56px; color: var(--muted); font-size: 15px; border-top: 1px solid var(--line); }
footer h2 { color: var(--text); }
.docs { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 10px; padding: 0; list-style: none; margin: 16px 0 0; }
.docs a { display: block; height: 100%; padding: 14px 16px; border: 1px solid var(--line); border-radius: 14px; background: var(--surface); text-decoration: none; color: var(--muted); font-size: 14px; transition: transform .2s, border-color .2s; }
.docs a strong { display: block; color: var(--text); font-size: 15px; margin-bottom: 2px; }
.docs a:hover { transform: translateY(-2px); border-color: var(--accent); }
@media (min-width: 700px) { .points { grid-template-columns: 1fr 1fr; } }
@media (max-width: 600px) {
  .chart .row { grid-template-columns: 76px 1fr; }
  .grid td.name { min-width: 150px; }
  th, td { padding: 8px 10px; }
  section { padding-top: 48px; }
}
</style>
</head>
<body>
<header class="hero">
  <div class="wrap">
    <div class="bar">
      <a class="brand" href="${repo}">asmalik107 / am-ui-lab</a>
      <button class="theme-btn" id="theme" type="button" aria-label="Switch colour theme">◐ Theme</button>
    </div>
    <p class="eyebrow">React Native · 8 apps · 2 platforms</p>
    <h1>React Native UI libraries: <span class="grad">the pros and cons</span> of each, measured</h1>
    <p class="lede">The same test screen built eight times: plain React Native, three styling engines and four component libraries. Each was checked for accessibility, theming speed and memory, on an iPhone and a budget Android phone.</p>
    <ul class="stack" id="stack"></ul>
    <ul class="stats" id="stats"></ul>
  </div>
</header>
<nav class="jump" aria-label="Sections"><div class="wrap"><ul>
  <li><a href="#compared">What is compared</a></li>
  <li><a href="#answer">The answer</a></li>
  <li><a href="#scorecard">Scorecard</a></li>
  <li><a href="#checks">Every check</a></li>
  <li><a href="#charts">Charts</a></li>
  <li><a href="#docs">The docs</a></li>
</ul></div></nav>
<main class="wrap">
  <section id="compared">
    <div class="reveal"><span class="sec-num">01</span><h2>What is compared</h2></div>
    <p class="hint reveal">Eight apps, each building the same test screen. One is plain React Native, the reference point for the other seven.</p>
    <ul class="kinds" id="kinds"></ul>
  </section>
  <section id="answer">
    <div class="reveal"><span class="sec-num">02</span><h2>The answer</h2></div>
    <div class="note reveal" id="headline"></div>
    <div class="note scope reveal"><p><strong>What this covers</strong></p><ul id="scope"></ul></div>
    <ul class="points" id="points"></ul>
  </section>
  <section id="scorecard">
    <div class="reveal"><span class="sec-num">03</span><h2>Scorecard</h2></div>
    <ul class="hint reveal">
      <li>One row per app. Click a column to rank by it.</li>
      <li>🟢 best, 🔴 worst.</li>
      <li><strong>Android:</strong> ${devices.android}, a real budget phone, for everything, re-renders included. The Android emulator kept crashing on this Mac</li>
      <li><strong>iOS speed and memory:</strong> ${devices.iphone}, a real phone</li>
      <li><strong>iOS accessibility and re-renders:</strong> ${devices.simulator}</li>
      <li><strong>Why two iOS devices:</strong>
        <ul>
          <li>Speed and memory depend on the hardware, so they’re measured on a real iPhone</li>
          <li>Accessibility checks read what the screen reader sees, which is the same on the simulator</li>
          <li>argent’s React profiler, which counts the re-renders, doesn’t support physical iPhones</li>
        </ul></li>
      <li><strong>Accessibility:</strong> checks passed, light theme.</li>
    </ul>
    <div class="scroll reveal"><table class="card" id="card"></table></div>
  </section>
  <section id="checks">
    <div class="reveal"><span class="sec-num">04</span><h2>Every check</h2></div>
    <ul class="hint reveal">
      <li>Each cell is iOS / Android.</li>
      <li>Click a cell to see why a check failed.</li>
      <li><strong>iOS:</strong> ${devices.simulator}. Accessibility doesn’t depend on the hardware.</li>
      <li><strong>Android:</strong> ${devices.android}.</li>
    </ul>
    <div class="filters">
      <div class="chips" id="lib-filter" role="group" aria-label="Libraries"></div>
    </div>
    <div class="filters">
      <span>Platform <span class="seg" id="plat" role="group" aria-label="Platform">
        <button type="button" data-p="both" aria-pressed="true">Both</button><button type="button" data-p="ios" aria-pressed="false">iOS</button><button type="button" data-p="android" aria-pressed="false">Android</button>
      </span></span>
      <label>Component <select id="comp"><option value="">All</option></select></label>
      <label class="chip"><input type="checkbox" id="fails"> Failures only</label>
      <label class="chip"><input type="checkbox" id="diff"> iOS and Android differ</label>
      <span class="count" id="count" aria-live="polite"></span>
    </div>
    <div class="legend"><span>✅ pass</span><span>❌ fail</span><span>⚠️ the platforms differ</span><span>➖ no such element</span><span>n/r not run</span></div>
    <div class="scroll tall" id="grid-box"><table class="grid" id="grid"></table></div>
  </section>
  <section id="charts">
    <div class="reveal"><span class="sec-num">05</span><h2>Charts</h2></div>
    <ul class="hint reveal">
      <li>Click a library to pick it out in every chart.</li>
      <li>Paired charts sort by the Android bar.</li>
      <li>Each chart says which devices it was measured on.</li>
      <li><strong>Compare apps within a platform:</strong> the iPhone 12 Pro is a 2020 flagship, the Galaxy A15 a budget phone.</li>
    </ul>
    <div class="legend"><span class="key"><i style="background:var(--ios)"></i>iOS</span><span class="key"><i style="background:var(--android)"></i>Android</span></div>
    <div class="charts" id="chart-list"></div>
  </section>
</main>
<footer id="docs"><div class="wrap">
  <span class="sec-num">06</span><h2>The docs</h2>
  <p>Generated from the same results as this page, in <a id="repo-link"></a>.</p>
  <ul class="docs" id="doc-list"></ul>
</div></footer>
<script id="data" type="application/json">${json}</script>
<script>
const D = JSON.parse(document.getElementById('data').textContent);
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// The docs' inline markdown: bold, code and links (relative ones point at GitHub).
const md = (s) => esc(s)
  .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
  .replace(/\`(.+?)\`/g, '<code>$1</code>')
  .replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, (_, t, u) => '<a href="' + (/^https?:/.test(u) ? u : D.repo + '/blob/main/' + u) + '">' + t + '</a>');
const item = (i) => Array.isArray(i) ? '<li>' + md(i[0]) + '<ul>' + i[1].map((x) => '<li>' + md(x) + '</li>').join('') + '</ul></li>' : '<li>' + md(i) + '</li>';

// Theme: follows the system until the button is used, then remembers the choice.
const root = document.documentElement;
try { const t = localStorage.getItem('theme'); if (t) root.dataset.theme = t; } catch {}
$('#theme').onclick = () => {
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch {}
};

$('#stack').innerHTML = D.stack.map(([t, u]) => '<li><a href="' + esc(u) + '">' + esc(t) + '</a></li>').join('');
$('#kinds').innerHTML = D.kinds.map((k, i) => '<li class="reveal" style="--d:' + i * 80 + 'ms"><h3>' + esc(k.title) + '</h3><p>' + esc(k.what) + '</p><ul>'
  + k.items.map((x) => x.text ? '<li>' + esc(x.text) + '</li>' : '<li><a href="' + esc(x.url) + '">' + esc(x.name) + '</a> <span class="ver">' + esc(x.versions[0]) + '</span>' + (x.versions.length > 1 ? '<small>' + x.versions.slice(1).map(esc).join(' · ') + '</small>' : '') + '</li>').join('') + '</ul></li>').join('');
$('#scope').innerHTML = D.scope.map((x) => '<li>' + md(x) + '</li>').join('');
$('#headline').innerHTML = D.headline.map(([w, x]) => '<p><strong>' + esc(w) + ':</strong> ' + esc(x) + '.</p>').join('');
$('#stats').innerHTML = D.stats.map((x, i) => '<li class="reveal ' + x.tone + '" style="--d:' + i * 80 + 'ms"><span class="v">' + esc(x.value) + '</span><span class="l">' + esc(x.label) + '</span></li>').join('');
$('#points').innerHTML = D.points.map((p, i) => '<li class="reveal" style="--d:' + i * 80 + 'ms"><h3>' + md(p.lead) + '</h3><ul>' + p.items.map(item).join('') + '</ul></li>').join('');

// --- Scorecard: click a header to rank by it, best first; click again to flip.
let sortBy = null, flip = false;
function drawCard() {
  const rows = D.card.rows.slice();
  if (sortBy != null) {
    const c = D.card.columns[sortBy];
    const dir = (c.better === 'high' ? -1 : 1) * (flip ? -1 : 1);
    rows.sort((a, b) => {
      const x = a.cells[sortBy].value, y = b.cells[sortBy].value;
      if (x == null) return 1; if (y == null) return -1;
      return (x - y) * dir;
    });
  }
  const arrow = (i) => sortBy === i ? (flip ? '▲' : '▼') : '↕';
  $('#card').innerHTML = '<thead><tr><th scope="col">App</th>' + D.card.columns.map((c, i) =>
    '<th scope="col" aria-sort="' + (sortBy === i ? (flip ? 'ascending' : 'descending') : 'none') + '"><button class="sort" data-i="' + i + '">' + esc(c.head) + ' <span class="arrow" aria-hidden="true">' + arrow(i) + '</span></button></th>').join('') + '</tr></thead><tbody>'
    + rows.map((r) => '<tr><th scope="row"><a href="' + esc(r.href) + '">' + esc(r.name) + '</a><span class="kind">' + esc(r.kind) + '</span></th>'
      + r.cells.map((c) => '<td class="num ' + (c.mark ?? '') + '">' + (c.mark === 'best' ? '🟢 ' : c.mark === 'worst' ? '🔴 ' : '') + esc(c.text) + '</td>').join('') + '</tr>').join('') + '</tbody>';
  document.querySelectorAll('#card .sort').forEach((b) => b.onclick = () => {
    const i = Number(b.dataset.i);
    flip = sortBy === i ? !flip : false;
    sortBy = i;
    drawCard();
  });
}
drawCard();

// --- Checks grid.
const shownApps = new Set(D.apps.map((a) => a.app));
let plat = 'both';
const icon = { pass: '✅', fail: '❌', na: '<span class="na">➖</span>', nr: '<span class="na">n/r</span>' };
$('#lib-filter').innerHTML = D.apps.map((a) => '<label class="chip"><input type="checkbox" value="' + a.app + '" checked> ' + esc(a.name) + '</label>').join('');
const comps = [...new Set(D.checks.map((c) => c.component))];
$('#comp').innerHTML += comps.map((c) => '<option>' + esc(c) + '</option>').join('');
const plats = () => plat === 'both' ? ['ios', 'android'] : [plat];
function drawGrid() {
  const apps = D.apps.filter((a) => shownApps.has(a.app));
  const comp = $('#comp').value, fails = $('#fails').checked, diff = $('#diff').checked;
  const keep = D.checks.filter((r) => (!comp || r.component === comp)
    && (!fails || apps.some((a) => plats().some((p) => r.cells[a.app][p].s === 'fail')))
    && (!diff || apps.some((a) => r.cells[a.app].differs)));
  const head = '<thead><tr><th scope="col">Check</th>' + apps.map((a) => '<th scope="col">' + esc(a.name) + '<br><small class="na">' + (plat === 'both' ? 'iOS / Android' : plat === 'ios' ? 'iOS' : 'Android') + '</small></th>').join('') + '</tr></thead>';
  // One tbody per component, opened by its heading row.
  let last = null;
  const count = (c) => keep.filter((r) => r.component === c).length;
  const body = keep.map((r) => {
    const group = r.component !== last ? (last === null ? '' : '</tbody>') + '<tbody class="group">' + (last === null ? '' : '<tr class="gap" aria-hidden="true"><td colspan="' + (apps.length + 1) + '"></td></tr>') + '<tr class="comp"><th scope="rowgroup" colspan="' + (apps.length + 1) + '"><span class="comp-label">' + esc(r.component) + ' <small>' + count(r.component) + ' check' + (count(r.component) === 1 ? '' : 's') + '</small></span></th></tr>' : '';
    last = r.component;
    const idx = D.checks.indexOf(r);
    return group + '<tr><td class="name">' + esc(r.check) + '<small>' + esc(r.passes) + '</small><button type="button" class="how" data-r="' + idx + '" aria-label="How ' + esc(r.check) + ' is tested">How it’s tested</button></td>' + apps.map((a) => {
      const c = r.cells[a.app];
      const ss = plats().map((p) => c[p].s);
      const cls = plat === 'both' && c.differs ? 'differs' : ss.includes('fail') ? 'fail' : ss.includes('pass') ? 'pass' : '';
      const label = r.check + ', ' + a.name + ': ' + plats().map((p) => (p === 'ios' ? 'iOS ' : 'Android ') + c[p].s).join(', ');
      return '<td class="cell ' + cls + '"><button type="button" data-r="' + idx + '" data-a="' + a.app + '" aria-label="' + esc(label) + '">' + ss.map((s) => icon[s]).join(' / ') + (plat === 'both' && c.differs ? ' ⚠️' : '') + '</button></td>';
    }).join('') + '</tr>';
  }).join('');
  $('#grid').innerHTML = head + (body ? body + '</tbody>' : '<tbody><tr><td colspan="' + (apps.length + 1) + '">No check matches these filters.</td></tr></tbody>');
  sizes();
  $('#count').textContent = 'Showing ' + keep.length + ' of ' + D.checks.length + ' checks';
}
// The heading rows stick under the table header, and the table's box fits
// under the page's sticky nav, so both heights are measured.
function sizes() {
  const thead = $('#grid thead');
  if (thead) $('#grid').style.setProperty('--head-h', thead.offsetHeight + 'px');
  const nav = document.querySelector('nav.jump');
  if (nav) document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px');
}
addEventListener('resize', sizes);
$('#grid').onclick = (e) => {
  const b = e.target.closest('button[data-r]');
  if (!b) return;
  const r = D.checks[b.dataset.r], a = b.dataset.a && D.apps.find((x) => x.app === b.dataset.a), c = a && r.cells[a.app];
  const word = { pass: '✅ passes', fail: '❌ fails', na: '➖ no such element', nr: 'not run: the test could not start' };
  document.querySelector('#grid tr.info')?.remove();
  const tr = b.closest('tr');
  const info = document.createElement('tr');
  info.className = 'info';
  // The picture and how the check is tested, then, from a result cell, that app's results.
  info.innerHTML = '<td colspan="' + tr.children.length + '" aria-live="polite"><div class="box"><p><strong>' + (a ? esc(a.name) + ' · ' : '') + esc(r.component) + ' · ' + esc(r.check) + '</strong></p>'
    + D.pictures[r.pic]
    + '<dl><dt>What it does</dt><dd>' + esc(r.does) + '</dd><dt>Passes</dt><dd>' + esc(r.passes) + '</dd><dt>Fails</dt><dd>' + esc(r.fails) + '</dd></dl>'
    + (a ? ['ios', 'android'].map((p) => '<p><strong>' + (p === 'ios' ? 'iOS' : 'Android') + ':</strong> ' + word[c[p].s] + (c[p].d ? '. ' + esc(c[p].d) : '') + '</p>').join('') : '')
    + '<button type="button" class="close">Close</button></div></td>';
  tr.after(info);
  info.querySelector('.close').onclick = () => { info.remove(); b.focus(); };
};
$('#lib-filter').onchange = (e) => { e.target.checked ? shownApps.add(e.target.value) : shownApps.delete(e.target.value); drawGrid(); };
$('#plat').onclick = (e) => {
  const b = e.target.closest('button'); if (!b) return;
  plat = b.dataset.p;
  document.querySelectorAll('#plat button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  drawGrid();
};
['#comp', '#fails', '#diff'].forEach((s) => $(s).onchange = drawGrid);
drawGrid();

// --- Charts: bars as HTML, so they reflow at any width. Click a library to
// pick it out in every chart; a chart can be sorted by value.
let picked = null;
const grown = new Set();
const sorted = new Set();
function drawCharts() {
  $('#chart-list').innerHTML = D.charts.map((c, ci) => {
    const v = (r) => c.kind === 'paired' ? [r.ios, r.android] : [{ value: r.value, text: r.text }];
    const max = Math.max(...c.rows.flatMap((r) => v(r).map((x) => x.value ?? 0))) || 1;
    let rows = c.rows.map((r, i) => ({ ...r, app: D.apps[i].app }));
    // Best first: the subtitle says which way is better.
    const dir = /Longer is better/.test(c.sub) ? -1 : 1;
    if (sorted.has(ci)) rows.sort((a, b) => { const x = v(a).at(-1).value, y = v(b).at(-1).value; return x == null ? 1 : y == null ? -1 : (x - y) * dir; });
    const cls = c.kind === 'paired' ? ['ios', 'android'] : [c.cls];
    return '<figure class="chart' + (grown.has(ci) ? ' in' : '') + '" data-ci="' + ci + '" style="margin:0"><div class="tools"><h3>' + esc(c.title) + '</h3><button type="button" data-sort="' + ci + '">' + (sorted.has(ci) ? 'Original order' : c.kind === 'paired' ? 'Sort by Android' : 'Sort by value') + '</button></div><p class="sub">' + esc(c.sub) + '</p><p class="sub"><strong>Measured on</strong> ' + esc(c.on) + '</p>'
      + rows.map((r) => '<div class="row ' + (picked ? (picked === r.app ? 'on' : 'dim') : '') + '" data-app="' + r.app + '" role="button" tabindex="0" aria-pressed="' + (picked === r.app) + '"><span class="lbl">' + esc(r.label) + '</span><span class="bars">'
        + v(r).map((x, i) => '<span class="b" title="' + esc(r.label + ': ' + x.text) + '"><span class="fill ' + cls[i] + '" style="width:calc(' + ((x.value ?? 0) / max * 100).toFixed(1) + '% - 70px)"></span>' + esc(x.text) + '</span>').join('')
        + '</span></div>').join('')
      + '<details><summary>How to read it</summary><ul>' + c.read.map((x) => '<li>' + md(x) + '</li>').join('') + '</ul></details></figure>';
  }).join('');
}
$('#chart-list').onclick = (e) => {
  const s = e.target.closest('[data-sort]');
  if (s) { const i = Number(s.dataset.sort); sorted.has(i) ? sorted.delete(i) : sorted.add(i); return drawCharts(); }
  const r = e.target.closest('.row');
  if (r) { picked = picked === r.dataset.app ? null : r.dataset.app; drawCharts(); }
};
$('#chart-list').onkeydown = (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.row')) { e.preventDefault(); e.target.click(); } };
drawCharts();

// --- Motion: sections rise in as they scroll into view, chart bars grow, and
// the nav pill follows the section on screen.
const seen = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  if (e.target.dataset.ci) grown.add(Number(e.target.dataset.ci));
  seen.unobserve(e.target);
}), { rootMargin: '0px 0px -8% 0px' });
const watch = () => document.querySelectorAll('.reveal:not(.in), .chart:not(.in)').forEach((el) => seen.observe(el));
watch();
new MutationObserver(watch).observe($('#chart-list'), { childList: true });
const links = [...document.querySelectorAll('nav.jump a')];
const current = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  links.forEach((a) => a.setAttribute('aria-current', String(a.hash === '#' + e.target.id)));
  // Keep the current pill in view on narrow screens, without moving the page.
  const on = links.find((a) => a.hash === '#' + e.target.id);
  if (on) on.parentElement.parentElement.scrollTo({ left: on.offsetLeft - 16, behavior: 'smooth' });
}), { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section, footer').forEach((el) => current.observe(el));
const nav = $('nav.jump');
new IntersectionObserver(([e]) => nav.classList.toggle('stuck', !e.isIntersecting)).observe($('.hero'));

$('#repo-link').href = D.repo;
$('#repo-link').textContent = D.repo.replace('https://', '');
$('#doc-list').innerHTML = D.pages.map((p) => '<li><a href="' + esc(p.href) + '"><strong>' + esc(p.label) + ' →</strong>' + esc(p.about) + '</a></li>').join('');
</script>
</body>
</html>
`;

mkdirSync(new URL('site/', root), { recursive: true });
writeFileSync(new URL('site/index.html', root), html);
console.log(`site/index.html: ${checks.length} checks × ${apps.length} apps, ${charts.length} charts`);
