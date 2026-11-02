// Builds docs/checks.md (every accessibility check for every app, iOS and
// Android side by side, plus the charts as SVG files in docs/charts/) and
// docs/android-accessibility.md (every Android failure).
// Reads only results/*. Usage: node scripts/checks-md.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { anchored, nav } from './scorecard.mjs';
import { apps, charts, data, detail, differs, findingsOf, get, keyOf, norm, order, platform, result, root, rows, sheetChecks, sheetKinds, shown, what } from './checks-data.mjs';

// Table cells can't hold a line break on every renderer, so pipes are escaped
// and nothing here spans lines.
const cellText = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

const mark = (f) => (f?.notRun ? 'n/r' : !f ? '➖' : f.pass ? '✅' : '❌');

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
// of 5 on iOS and on Android.
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
mkdirSync(new URL('docs/charts/', root), { recursive: true });
const draw = (title, sub, s) => (s.kind === 'paired' ? pairedSvg(title, sub, s.rows) : singleSvg(title, sub, s.rows, s.cls));
for (const [file, title, sub, , series] of charts) writeFileSync(new URL(`docs/charts/${file}.svg`, root), draw(title, sub, series));
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

### Bundle size

${chartMd('bundle')}

### Measured on one platform only

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
