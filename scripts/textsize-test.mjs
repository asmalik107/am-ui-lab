// Largest-text test. Launches the app at the default text size and at the
// largest accessibility size (AX5), then compares the trees: does text grow,
// and do any controls overlap or get pushed off the side of the screen.
// Screenshots at AX5 are saved for a visual check of clipping.
//
// Usage: node scripts/textsize-test.mjs <app> <bundleId> <udid>
// Output: results/<app>/ios-textsize.json, .md and textsize-*.png
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const [app, bundleId, udid] = process.argv.slice(2);
if (!app || !bundleId || !udid) {
  console.error('Usage: node scripts/textsize-test.mjs <app> <bundleId> <udid>');
  process.exit(1);
}
const outDir = new URL(`../results/${app}/`, import.meta.url);
mkdirSync(outDir, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const argent = (tool, args) =>
  JSON.parse(execFileSync('argent', ['run', tool, '--json', '--args', JSON.stringify({ udid, ...args })], { encoding: 'utf8', maxBuffer: 64 << 20 }));
const contentSize = (size) => execFileSync('xcrun', ['simctl', 'ui', udid, 'content_size', size]);

async function launch() {
  argent('restart-app', { bundleId });
  for (let i = 0; i < 120; i++) {
    const d = argent('native-describe-screen', { bundleId });
    if (d.elements.some((e) => (e.label ?? '').includes('Component test screen'))) break;
    await sleep(500);
  }
  await sleep(1200);
  return argent('native-describe-screen', { bundleId });
}

const ids = ['test-button', 'test-textfield', 'test-switch', 'test-checkbox', 'test-radiogroup-0', 'test-select', 'test-dialog-open', 'test-sheet-open', 'test-tabs-0', 'test-tabs-1', 'test-tabs-2', 'test-native-switch', 'test-list-link'];
const frame = (d, id) => d.elements.find((e) => e.identifier === id)?.frame;
const overlap = (a, b) => {
  const w = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  return w > 2 && h > 2 ? w * h : 0;
};

contentSize('large'); // iOS default
const normal = await launch();
contentSize('accessibility-extra-extra-extra-large');
const large = await launch();

const growth = ids.map((id) => {
  const a = frame(normal, id);
  const b = frame(large, id);
  return { id, normal: a?.height ?? null, large: b?.height ?? null, ratio: a && b ? b.height / a.height : null };
});
const W = large.screenFrame.width;
const offscreen = ids.filter((id) => {
  const f = frame(large, id);
  return f && (f.x < -1 || f.x + f.width > W + 1);
});
const overlaps = [];
for (let i = 0; i < ids.length; i++)
  for (let j = i + 1; j < ids.length; j++) {
    const a = frame(large, ids[i]);
    const b = frame(large, ids[j]);
    if (a && b && overlap(a, b) > 0) overlaps.push(`${ids[i]} × ${ids[j]}`);
  }

// Screenshots down the screen at AX5 for the visual check.
const shots = [];
for (let i = 0; i < 4; i++) {
  const out = fileURLToPath(new URL(`textsize-${i + 1}.png`, outDir));
  execFileSync('argent', ['run', 'screenshot', '--udid', udid, '--scale', '0.5', '--out', out]);
  shots.push(`textsize-${i + 1}.png`);
  argent('gesture-swipe', { fromX: 0.5, fromY: 0.8, toX: 0.5, toY: 0.25, momentum: false, durationMs: 400 });
  await sleep(700);
}
contentSize('large');

const grew = growth.filter((g) => g.ratio && g.ratio > 1.2).length;
const result = { app, bundleId, udid, date: new Date().toISOString(), growth, offscreen, overlaps, shots };
writeFileSync(new URL('ios-textsize.json', outDir), JSON.stringify(result, null, 2));
const md = [
  `# ${app}: largest text size (AX5)`,
  '',
  `Run ${result.date.slice(0, 10)} with \`scripts/textsize-test.mjs\`. Control heights at the default size (large) against the largest accessibility size (accessibility-extra-extra-extra-large).`,
  '',
  `- Controls that grew by more than 20%: ${grew} of ${growth.filter((g) => g.ratio).length}`,
  `- Controls pushed past the screen edge: ${offscreen.length ? offscreen.join(', ') : 'none'}`,
  `- Overlapping controls: ${overlaps.length ? overlaps.join('; ') : 'none'}`,
  `- Screenshots: ${shots.join(', ')}`,
  '',
  '| Control | Height at default (pt) | Height at AX5 (pt) | Ratio |',
  '| --- | --- | --- | --- |',
  ...growth.map((g) => `| ${g.id} | ${g.normal?.toFixed(0) ?? 'missing'} | ${g.large?.toFixed(0) ?? 'missing'} | ${g.ratio?.toFixed(2) ?? '–'} |`),
  '',
].join('\n');
writeFileSync(new URL('ios-textsize.md', outDir), md);
console.log(md);
