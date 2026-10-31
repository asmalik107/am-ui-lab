import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const apps = ['baseline', 'unistyles', 'uniwind', 'nativewind', 'tamagui', 'gluestack', 'heroui', 'reusables'];
const load = (app, file) => {
  const u = new URL(`results/${app}/${file}`, root);
  return existsSync(u) ? JSON.parse(readFileSync(u, 'utf8')) : null;
};
const d = Object.fromEntries(apps.map((a) => [a, {
  iA11y: load(a, 'ios-a11y.json'),
  aA11y: load(a, 'android-a11y.json'),
  iText: load(a, 'ios-textsize.json'),
  aText: load(a, 'android-textsize.json'),
  iMotion: load(a, 'ios-motion.json'),
  aMotion: load(a, 'android-motion.json'),
  iPerf: load(a, 'ios-perf.json'),
  aPerf: load(a, 'android-perf.json'),
  iMet: load(a, 'ios-metrics.json'),
  aMet: load(a, 'android-metrics.json'),
  bundle: load(a, 'bundle.json'),
}]));

const norm = (c) => c.replace(/^target ≥ \d+(pt|dp)$/, 'touch target');
const key = (f) => `${f.component} | ${norm(f.check)}`;
const part = (f) => (f.component.startsWith('Bottom sheet (') ? 'sheets' : 'screen');
const tally = (fs, which) => {
  const x = (fs ?? []).filter((f) => !which || part(f) === which);
  return x.length ? `${x.filter((f) => f.pass).length} / ${x.length}` : '–';
};
const differ = (a) => {
  const i = d[a].iA11y?.findings;
  const n = d[a].aA11y?.findings;
  if (!i || !n) return '–';
  const m = new Map(n.map((f) => [key(f), f.pass]));
  return String(i.filter((f) => m.has(key(f)) && m.get(key(f)) !== f.pass).length);
};
const grew = (t) => {
  const g = t?.growth.filter((x) => x.ratio) ?? [];
  return g.length ? `${g.filter((x) => x.ratio > 1.2).length} / ${g.length}` : '–';
};
const edge = (t) => (t ? (t.offscreen ?? []).map((id) => id.replace(/^test-/, '')).join(', ') || 'none' : '–');
const mo = (m, c) => {
  const off = m?.runs.find((r) => r.component === c && !r.reduceMotion)?.ms;
  const on = m?.runs.find((r) => r.component === c && r.reduceMotion)?.ms;
  return off == null ? '–' : `${off} → ${on} ms`;
};
const med = (x) => (x ? `${x.median.toFixed(1)} ms (${Math.round(x.min)}–${Math.round(x.max)})` : '–');
const sec = (v) => (v == null ? '–' : `${(v / 1000).toFixed(2)} s`);
const mib = (v) => (v == null ? '–' : (v / 1048576).toFixed(1));
const memPair = (idle, used) => (idle == null ? '–' : `${mib(idle)} → ${mib(used)} MiB`);
const table = (head, rows) => [`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');

const tables = {
  accessibility: table(
    ['App', 'Test screen, iOS', 'Test screen, Android', 'Extra sheets, iOS', 'Extra sheets, Android', 'All checks, iOS', 'All checks, Android', 'Checks that differ'],
    apps.map((a) => [a, tally(d[a].iA11y?.findings, 'screen'), tally(d[a].aA11y?.findings, 'screen'), tally(d[a].iA11y?.findings, 'sheets'), tally(d[a].aA11y?.findings, 'sheets'), tally(d[a].iA11y?.findings), tally(d[a].aA11y?.findings), differ(a)]),
  ),
  textsize: table(
    ['App', 'Controls that grew, iOS (AX5)', 'Controls that grew, Android (2.0)', 'Pushed off screen, iOS', 'Pushed off screen, Android'],
    apps.map((a) => [a, grew(d[a].iText), grew(d[a].aText), edge(d[a].iText), edge(d[a].aText)]),
  ),
  motion: table(
    ['App', 'Dialog, iOS', 'Dialog, Android', 'Bottom sheet, iOS', 'Bottom sheet, Android'],
    apps.map((a) => [a, mo(d[a].iMotion, 'Dialog'), mo(d[a].aMotion, 'Dialog'), mo(d[a].iMotion, 'Bottom sheet'), mo(d[a].aMotion, 'Bottom sheet')]),
  ),
  timings: table(
    ['App', 'Theme switch, iOS', 'Theme switch, Android', 'List mount, iOS', 'List mount, Android'],
    apps.map((a) => [a, med(d[a].iPerf?.theme), med(d[a].aPerf?.theme), med(d[a].iPerf?.list), med(d[a].aPerf?.list)]),
  ),
  metrics: table(
    ['App', 'Startup, iOS', 'Startup, Android', 'Memory idle → used, iOS', 'Memory idle → used, Android', 'CPU in flings, iOS', 'CPU in flings, Android', 'Janky frames, Android'],
    apps.map((a) => {
      const i = d[a].iMet;
      const n = d[a].aMet;
      return [a, sec(i?.startup.median), sec(n?.startup.median), memPair(i?.memory.idle.physFootprint, i?.memory.used.physFootprint), memPair(n?.memory.idle.pss, n?.memory.used.pss), sec(i?.scroll.cpuMs?.total), sec(n?.scroll.cpuMs?.total), n ? `${n.scroll.frames.janky} of ${n.scroll.frames.total}` : '–'];
    }),
  ),
  ioscode: table(
    ['App', 'JS bundle', 'Components rendered per theme switch'],
    apps.map((a) => [a, d[a].bundle ? `${(d[a].bundle.iosHbcBytes / 1e6).toFixed(2)} MB` : '–', d[a].iMet?.rerenders?.switches?.map((s) => s.renders).join(' / ') ?? 'not measured']),
  ),
};

const file = new URL('README.md', root);
let md = readFileSync(file, 'utf8');
for (const [name, body] of Object.entries(tables)) {
  const re = new RegExp(`(<!-- begin:${name} -->)[\\s\\S]*?(<!-- end:${name} -->)`);
  if (re.test(md)) md = md.replace(re, `$1\n${body}\n$2`);
  else console.error(`README has no ${name} markers`);
}
writeFileSync(file, md);
console.log(`README tables updated: ${Object.keys(tables).join(', ')}`);
