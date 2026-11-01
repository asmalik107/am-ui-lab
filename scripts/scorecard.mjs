// The one-row-per-app scorecard and the hero chart, shared by readme-tables.mjs
// (README and docs/results.md) and checks-md.mjs (docs/checks.md). Reads only results/*.
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
export const names = {
  baseline: 'Baseline', unistyles: 'Unistyles', uniwind: 'Uniwind', nativewind: 'NativeWind',
  tamagui: 'Tamagui', gluestack: 'gluestack', heroui: 'HeroUI', reusables: 'Reusables',
};
const apps = Object.keys(names);
const load = (path) => {
  const u = new URL(path, root);
  return existsSync(u) ? JSON.parse(readFileSync(u, 'utf8')) : null;
};
const devcost = load('results/devcost.json');
const pass = (j) => (j?.findings ? { pass: j.findings.filter((f) => f.pass).length, total: j.findings.length } : null);
const ratio = (t) => (t ? t.pass / t.total : null);

export const rows = apps.map((app) => {
  const r = (f) => load(`results/${app}/${f}`);
  const aMet = r('android-metrics.json');
  const iMet = r('ios-metrics.json');
  return {
    app,
    name: names[app],
    a11yIos: pass(r('ios-a11y.json')),
    a11yAndroid: pass(r('android-a11y.json')),
    themeAndroid: r('android-perf.json')?.theme.median ?? null,
    memGrowth: aMet ? (aMet.memory.used.pss - aMet.memory.idle.pss) / 1048576 : null,
    bundle: r('bundle.json') ? r('bundle.json').iosHbcBytes / 1e6 : null,
    rerenders: iMet?.rerenders?.switches?.[0]?.renders ?? null,
    copied: devcost?.rows.find((x) => x.app === app)?.copiedLines ?? null,
  };
});

// Each column: how to read a value for ranking, which way is better, and how to
// print it. Ties all get the mark; a column where most apps tie (library code
// copied) only marks the worst.
export const columns = [
  { head: 'Accessibility, iOS', link: 'accessibility', section: 'Accessibility', get: (x) => ratio(x.a11yIos), better: 'high', fmt: (x) => `${x.a11yIos.pass} / ${x.a11yIos.total}` },
  { head: 'Accessibility, Android', link: 'accessibility', section: 'Accessibility', get: (x) => ratio(x.a11yAndroid), better: 'high', fmt: (x) => `${x.a11yAndroid.pass} / ${x.a11yAndroid.total}` },
  { head: 'Theme switch, Android', link: 'timings', section: 'Timings', get: (x) => x.themeAndroid, better: 'low', fmt: (x) => `${Math.round(x.themeAndroid)} ms` },
  { head: 'Memory growth, Android', link: 'startup-memory-and-scrolling', section: 'Startup, memory and scrolling', get: (x) => x.memGrowth, better: 'low', fmt: (x) => `+${Math.round(x.memGrowth)} MiB` },
  { head: 'JS bundle', link: 'bundle-size-and-re-renders-ios', section: 'Bundle size and re-renders', get: (x) => x.bundle, better: 'low', fmt: (x) => `${x.bundle.toFixed(2)} MB` },
  { head: 'Re-renders per theme switch', link: 'bundle-size-and-re-renders-ios', section: 'Bundle size and re-renders', get: (x) => x.rerenders, better: 'low', fmt: (x) => x.rerenders.toLocaleString('en-GB') },
  { head: 'Library code copied in', link: 'developer-cost', section: 'Developer cost', get: (x) => x.copied, better: 'low', fmt: (x) => x.copied.toLocaleString('en-GB'), worstOnly: true },
];

// [{ app, name, cells: [{ text, mark: 'best' | 'worst' | null }] }]
export function scorecard() {
  return rows.map((x) => ({
    ...x,
    cells: columns.map((c) => {
      const v = c.get(x);
      if (v == null) return { text: 'not measured', mark: null };
      const all = rows.map(c.get).filter((n) => n != null);
      const [lo, hi] = [Math.min(...all), Math.max(...all)];
      const best = c.better === 'high' ? hi : lo;
      const worst = c.better === 'high' ? lo : hi;
      const mark = !c.worstOnly && v === best ? 'best' : v === worst ? 'worst' : null;
      return { text: c.fmt(x), mark };
    }),
  }));
}

// The four hand-built apps share one accessibility score, so their labels
// alternate above and below the dots; the rest sit to the right.
const place = { unistyles: 'above', baseline: 'below', uniwind: 'above', nativewind: 'below' };

// Accessibility (share of checks passed on TalkBack) against the theme switch
// on the Galaxy A15. Top left is best. Colours follow the light and dark
// colours of the other charts, so it reads on GitHub in either theme.
export function heroSvg() {
  const W = 720;
  const H = 400;
  const m = { l: 64, r: 24, t: 56, b: 52 };
  // Log scale, 50 to 800 ms: each step to the right doubles the time.
  const [xMin, xMax] = [50, 800];
  const [yMin, yMax] = [50, 100];
  const X = (ms) => m.l + (Math.log(ms / xMin) / Math.log(xMax / xMin)) * (W - m.l - m.r);
  const Y = (pct) => m.t + ((yMax - pct) / (yMax - yMin)) * (H - m.t - m.b);
  const hand = new Set(['baseline', 'unistyles', 'uniwind', 'nativewind']);
  const grid = [50, 60, 70, 80, 90, 100].map((p) => `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(p)}" y2="${Y(p)}" class="grid"/><text x="${m.l - 8}" y="${Y(p) + 4}" text-anchor="end" class="tick">${p}%</text>`).join('')
    + [50, 100, 200, 400, 800].map((ms) => `<line x1="${X(ms)}" x2="${X(ms)}" y1="${m.t}" y2="${H - m.b}" class="grid"/><text x="${X(ms)}" y="${H - m.b + 18}" text-anchor="middle" class="tick">${ms}</text>`).join('');
  const dots = rows.filter((x) => x.themeAndroid != null && x.a11yAndroid).map((x) => {
    const cx = X(x.themeAndroid);
    const cy = Y(ratio(x.a11yAndroid) * 100);
    const v = place[x.app] ?? 'right';
    const tx = v === 'right' ? cx + 10 : cx;
    const ty = v === 'above' ? cy - 12 : v === 'below' ? cy + 22 : cy + 4;
    return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="6" class="${hand.has(x.app) ? 'hand' : 'kit'}"/><text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="${v === 'right' ? 'start' : 'middle'}" class="lbl">${x.name}</text>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">Accessibility against theme-switch time on a Galaxy A15 5G</title>
<desc id="d">${rows.map((x) => `${x.name}: ${x.a11yAndroid.pass} of ${x.a11yAndroid.total} accessibility checks, theme switch ${Math.round(x.themeAndroid)} ms`).join('; ')}.</desc>
<style>
svg { font: 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
.bg { fill: #f7f6f3; } .h { fill: #1d1d21; font-size: 17px; font-weight: 700; } .sub, .tick, .axis { fill: #5d5a55; } .tick { font-size: 12px; }
.grid { stroke: #dcd8d0; } .lbl { fill: #1d1d21; font-weight: 600; } .hand { fill: #1f7a45; } .kit { fill: #b5651d; } .zone { fill: #1f7a45; fill-opacity: .07; }
@media (prefers-color-scheme: dark) {
  .bg { fill: #151517; } .h, .lbl { fill: #ececee; } .sub, .tick, .axis { fill: #a3a09b; } .grid { stroke: #34343a; } .hand { fill: #7fd6a0; } .kit { fill: #e9a25f; } .zone { fill: #7fd6a0; }
}
</style>
<rect width="${W}" height="${H}" rx="12" class="bg"/>
<rect x="${m.l}" y="${m.t}" width="${X(200) - m.l}" height="${Y(90) - m.t}" class="zone"/>
<text x="${m.l}" y="26" class="h">Accessibility against speed, on a budget Android phone</text>
<text x="${m.l}" y="44" class="sub">Galaxy A15 5G, Release builds. Top left is best. <tspan class="hand">●</tspan> baseline and styling engines  <tspan class="kit">●</tspan> component libraries</text>
${grid}${dots}
<text x="${(m.l + W - m.r) / 2}" y="${H - 12}" text-anchor="middle" class="axis">Theme switch, median of 10 runs (ms, log scale: each step doubles)</text>
<text transform="translate(16 ${(m.t + H - m.b) / 2}) rotate(-90)" text-anchor="middle" class="axis">TalkBack checks passed</text>
</svg>
`;
}

// The conclusion, in plain sentences, with every number read from results/.
const by = Object.fromEntries(rows.map((x) => [x.app, x]));
const pct = (t) => Math.round(ratio(t) * 100);
const ms = (app) => Math.round(by[app].themeAndroid);
const kits = ['tamagui', 'gluestack', 'heroui', 'reusables'];
const kitPct = kits.map((a) => pct(by[a].a11yAndroid));
const devRow = (app) => devcost?.rows.find((x) => x.app === app);

// [where, what happens there]: one line each.
export const headline = [
  ['On the iPhone simulator', 'the libraries are almost equally fast'],
  ['On a budget Android phone', 'some are much slower'],
];
// What the two kinds of library are, shown above the answer wherever the
// words "styling engine" and "component library" are used.
// Installed versions, read from each app's node_modules so they can't drift.
export const ver = (app, pkg) => load(`apps/${app}/node_modules/${pkg}/package.json`)?.version ?? '?';
// [text, link]: each links to the docs or release notes for that exact version.
const sdk = ver('baseline', 'expo').split('.')[0];
export const stack = [
  [`Expo SDK ${sdk} (expo ${ver('baseline', 'expo')})`, `https://docs.expo.dev/versions/v${sdk}.0.0/`],
  [`React Native ${ver('baseline', 'react-native')}`, `https://github.com/react/react-native/releases/tag/v${ver('baseline', 'react-native')}`],
  ['New Architecture', 'https://reactnative.dev/architecture/landing-page'],
  [`React ${ver('baseline', 'react')}`, `https://github.com/react/react/releases/tag/v${ver('baseline', 'react')}`],
  [`Reanimated ${ver('baseline', 'react-native-reanimated')}`, `https://github.com/software-mansion/react-native-reanimated/releases/tag/${ver('baseline', 'react-native-reanimated')}`],
];
// The version shown after each library's name, and what it was built on.
export const versions = {
  unistyles: [ver('unistyles', 'react-native-unistyles')],
  uniwind: [ver('uniwind', 'uniwind'), `Tailwind ${ver('uniwind', 'tailwindcss')}`],
  nativewind: [ver('nativewind', 'nativewind'), `react-native-css ${ver('nativewind', 'react-native-css')}`, `Tailwind ${ver('nativewind', 'tailwindcss')}`],
  tamagui: [ver('tamagui', 'tamagui')],
  gluestack: [ver('gluestack', '@gluestack-ui/core'), 'The version of @gluestack-ui/core', `On Uniwind ${ver('gluestack', 'uniwind')}`],
  heroui: [ver('heroui', 'heroui-native'), `On Uniwind ${ver('heroui', 'uniwind')}`],
  // The CLI isn't installed in the app; its version is recorded in NOTES.md.
  reusables: ['CLI 0.7.1', `@rn-primitives ${ver('reusables', '@rn-primitives/slot')}`, `On Uniwind ${ver('reusables', 'uniwind')}`],
};
export const kinds = [
  { title: 'Baseline', what: 'This project’s own reference app, not a library.', items: [
    'Plain React Native, with every component written by hand',
    'Accessibility written by hand too',
    'Every library is measured against it',
  ] },
  { title: 'Styling engines', what: 'They style components you write yourself. Here they restyle the baseline’s components, so they keep its accessibility.', items: [
    ['Unistyles', 'https://www.unistyl.es', 'unistyles'], ['Uniwind', 'https://uniwind.dev', 'uniwind'], ['NativeWind', 'https://www.nativewind.dev', 'nativewind'],
  ] },
  { title: 'Component libraries', what: 'Ready-made buttons, dialogs, sheets and more, each with its own accessibility.', items: [
    ['Tamagui', 'https://tamagui.dev', 'tamagui'], ['gluestack', 'https://gluestack.io', 'gluestack'], ['HeroUI Native', 'https://heroui.com/docs/native', 'heroui'], ['React Native Reusables', 'https://reactnativereusables.com', 'reusables'],
  ] },
];
const kindOf = { baseline: 'Baseline', unistyles: 'Styling engine', uniwind: 'Styling engine', nativewind: 'Styling engine', tamagui: 'Component library', gluestack: 'Component library', heroui: 'Component library', reusables: 'Component library' };
export const kind = (app) => kindOf[app];

const n = (v) => v.toLocaleString('en-GB');

// Each point: a short bold lead, then one fact per bullet.
// An item is a string, or [text, sub-items] when it holds more than one value.
export const points = [
  { lead: 'Accessibility depends on who writes the components', items: [
    ['**Baseline and styling engines**', [`TalkBack: ${by.baseline.a11yAndroid.pass} of ${by.baseline.a11yAndroid.total} checks`, `VoiceOver: ${by.baseline.a11yIos.pass} of ${by.baseline.a11yIos.total} checks`]],
    `**Component libraries:** ${Math.min(...kitPct)}–${Math.max(...kitPct)}% of checks`,
  ] },
  { lead: 'Speed differences only show on the real phone', items: [
    ['**Galaxy A15:** a theme switch takes', [`Unistyles: ${ms('unistyles')} ms, the fastest`, `Tamagui: ${ms('tamagui')} ms, the slowest`]],
    '**iPhone simulator:** every app but Tamagui finishes within a frame or two',
  ] },
  { lead: 'Unistyles is the best all-rounder', items: [
    'Fastest theme switch on the phone',
    'Fewest re-renders',
    'The baseline’s accessibility',
  ] },
  { lead: 'Each component library costs you something', items: [
    `**HeroUI:** memory grows by ${Math.round(by.heroui.memGrowth)} MiB`,
    ['**Their code copied into your app**', [`gluestack: ${n(by.gluestack.copied)} lines`, `Reusables: ${n(by.reusables.copied)} lines`]],
    '**Reusables:** button labels cut off at large text sizes',
    `**Tamagui:** the slowest app, ${ms('tamagui')} ms per theme switch on the phone`,
  ] },
];
const access = (app, text = 'Accessibility') => [text, [`TalkBack: ${by[app].a11yAndroid.pass} of ${by[app].a11yAndroid.total}`, `VoiceOver: ${by[app].a11yIos.pass} of ${by[app].a11yIos.total}`]];

// Where each library lands on the phone's theme switch, slowest and fastest first.
function themeSwitching() {
  const sorted = rows.filter((x) => x.app !== 'baseline' && x.themeAndroid != null).sort((p, q) => p.themeAndroid - q.themeAndroid);
  const [fast, slow] = [sorted[0], sorted.at(-1)];
  const near = sorted.filter((x) => x !== fast && Math.abs(x.themeAndroid - by.baseline.themeAndroid) < 10);
  const rest = sorted.filter((x) => x !== fast && x !== slow && !near.includes(x));
  return [
    `**Slowest:** ${names[slow.app]}, ${ms(slow.app)} ms, about ${Math.round(slow.themeAndroid / by.baseline.themeAndroid)} times the baseline`,
    `**Fastest:** ${names[fast.app]}, ${ms(fast.app)} ms`,
    ...near.map((x) => `**Level with the baseline (${ms('baseline')} ms):** ${names[x.app]}, ${ms(x.app)} ms`),
    [`**The rest:** ${ms(rest[0].app)}–${ms(rest.at(-1).app)} ms`, rest.map((x) => `${names[x.app]}: ${ms(x.app)} ms`)],
  ];
}

// [what you want, the pick (or null for a heading on its own), the reasons]
export const picks = [
  ['Accessibility and speed first', 'Unistyles', ['Fastest theme switch on the phone', 'The baseline’s accessibility']],
  ['Tailwind classes', 'Uniwind', [['Faster than NativeWind on the phone', [`Uniwind: ${ms('uniwind')} ms`, `NativeWind: ${ms('nativewind')} ms`]]]],
  ['Ready-made components', 'HeroUI', [access('heroui', 'The most accessible component library'), `Its memory grows the most on the phone: +${Math.round(by.heroui.memGrowth)} MiB after use`, ['Accessibility gaps you’d fix yourself', ['Labelled switch and checkbox rows hide the control’s name, role and state', 'The field error isn’t linked to the field']]]],
  ['Theme switching on a budget Android phone', null, themeSwitching()],
];

// One section per library: a one-line role, then what's good (✅) and what to
// watch (⚠️), one fact per bullet.
const a11y = (app) => `${by[app].a11yAndroid.pass}/${by[app].a11yAndroid.total} TalkBack, ${by[app].a11yIos.pass}/${by[app].a11yIos.total} VoiceOver`;
// An entry is a string, or [text, sub-items] when it holds more than one value.
export const libraries = [
  { app: 'unistyles', role: 'Best all-rounder', good: [
    ['Fastest theme switch on the phone', [`Unistyles: ${ms('unistyles')} ms`, `Baseline: ${ms('baseline')} ms`]],
    ['Fewest re-renders per theme switch', [`Unistyles: ${by.unistyles.rerenders}`, `Baseline: ${by.baseline.rerenders}`]],
    access('unistyles', 'The baseline’s accessibility, as the components are hand-built'),
  ], bad: ['You build every component yourself, as with the baseline'] },
  { app: 'uniwind', role: 'Best if you want Tailwind classes', good: [
    access('uniwind', 'The baseline’s accessibility'),
    'No setup problems hit',
  ], bad: [
    'You build every component yourself, as with the baseline',
    ['Slower theme switch on the phone', [`Uniwind: ${ms('uniwind')} ms`, `Baseline: ${ms('baseline')} ms`]],
    ['More re-renders per theme switch', [`Uniwind: ${by.uniwind.rerenders}`, `Unistyles: ${by.unistyles.rerenders}`]],
  ] },
  { app: 'nativewind', role: 'Tailwind, still a release candidate', good: [
    access('nativewind', 'The baseline’s accessibility'),
    `Least memory growth on the phone: +${Math.round(by.nativewind.memGrowth)} MiB`,
  ], bad: [
    'You build every component yourself, as with the baseline',
    ['Still a release candidate (5.0.0-rc.0)', ['Needed a line-height workaround', 'Without it, the page was 18 screens tall']],
    `Theme switch on the phone: ${ms('nativewind')} ms`,
  ] },
  { app: 'baseline', role: 'Plain React Native, the reference point', good: [
    access('baseline', 'Top accessibility score'),
    `Smallest bundle: ${by.baseline.bundle.toFixed(2)} MB`,
  ], bad: [['Everything written by hand', ['Every component', `All ${devRow('baseline').a11yProps} accessibility props`]]] },
  { app: 'heroui', role: 'The most accessible component library', good: [
    access('heroui', 'Best accessibility of the component libraries'),
  ], bad: [
    `Memory grows the most on the phone: +${Math.round(by.heroui.memGrowth)} MiB after use`,
    `Most re-renders per theme switch: ${n(by.heroui.rerenders)}`,
    `Theme switch on the phone: ${ms('heroui')} ms`,
    'Labelled switch and checkbox rows hide the control’s name, role and state',
  ] },
  { app: 'reusables', role: 'Fast, with rough edges', good: [
    ['Theme switch on the phone level with the baseline', [`Reusables: ${ms('reusables')} ms`, `Baseline: ${ms('baseline')} ms`]],
  ], bad: [
    ['Largest bundle', [`${by.reusables.bundle.toFixed(2)} MB`, 'Bundles all 1,917 lucide icons and uses 4']],
    'Button labels are cut off at the largest text size, on both platforms',
    access('reusables', 'Low accessibility'),
    'The checkbox is 16 tall',
    'Progress always reads 0%',
    `Copies ${n(by.reusables.copied)} lines of its code into your app`,
  ] },
  { app: 'gluestack', role: 'Most code to own', good: [`Fewest setup steps: ${devRow('gluestack').setupSteps}`], bad: [
    ['Copies its code into your app', [`${n(by.gluestack.copied)} lines`, `${devRow('gluestack').tsc.all - devRow('gluestack').tsc.src} type errors in them`]],
    access('gluestack', 'Lowest accessibility'),
    'Controls are 22 to 40 tall',
    `Most setup problems hit: ${devRow('gluestack').errorsHit}`,
    `Memory grows by ${Math.round(by.gluestack.memGrowth)} MiB on the phone`,
  ] },
  { app: 'tamagui', role: 'Slowest on both platforms', good: [
    'A full component library with its own compiler',
    `Only ${devRow('tamagui').a11yProps} accessibility props written by hand`,
  ], bad: [
    ['Slowest theme switch', [`Phone: ${ms('tamagui')} ms, about ${Math.round(by.tamagui.themeAndroid / by.baseline.themeAndroid)} times the baseline`, `iOS: ${Math.round(load('results/tamagui/ios-perf.json').theme.median)} ms`]],
    access('tamagui', 'Low accessibility'),
    'The switch and checkbox have no name',
    'Its Debug build crashes, so re-renders aren’t counted',
    'Select and Accordion couldn’t be tested on iOS',
  ] },
];

// The nav bar every doc carries, top and bottom. `from` is 'root' for the
// README and 'docs' for files in docs/.
// [label, path, what it is]
export const pages = [
  ['README', 'README.md', 'the answer, the scorecard and each library'],
  ['Results', 'docs/results.md', 'every check, with the iOS and Android numbers'],
  ['Method', 'docs/method.md', 'how each check was measured, its limits, and how to reproduce it'],
  ['iOS accessibility', 'docs/ios-accessibility.md', 'every iOS accessibility failure, with the line of code that causes it'],
  ['Android accessibility', 'docs/android-accessibility.md', 'every Android accessibility failure, from the audit’s output'],
  ['All checks', 'docs/checks.md', 'every accessibility check for every app, one table per component, plus the charts'],
];
export const href = (path, from) => (from === 'root' ? path : path === 'README.md' ? '../README.md' : path.replace(/^docs\//, ''));
export const nav = (current, from) => ['**The docs:**', pages.map(([label, path, what]) => (label === current ? `- **${label}** (this page): ${what}` : `- [${label}](${href(path, from)}): ${what}`)).join('\n')].join('\n\n');

// GitHub's heading anchors: lower case, punctuation dropped, spaces to hyphens.
export const slug = (h) => h.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s/g, '-');

// An explicit <a id> above every heading, named as GitHub names the heading,
// so previews that don't make heading anchors still jump to the section.
// Re-running replaces the anchors rather than adding more.
export function anchored(md) {
  const lines = md.replace(/<a id="[^"]*"><\/a>\n\n(?=#{1,6} )/g, '').split('\n');
  const seen = {};
  let code = false;
  return lines.flatMap((l) => {
    if (l.startsWith('\`\`\`')) code = !code;
    const h = !code && l.match(/^#{1,6} (.+)$/);
    if (!h) return [l];
    const base = slug(h[1].replace(/[\`*]/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1'));
    const n = seen[base] ?? 0;
    seen[base] = n + 1;
    return [`<a id="${n ? `${base}-${n}` : base}"></a>`, '', l];
  }).join('\n');
}
