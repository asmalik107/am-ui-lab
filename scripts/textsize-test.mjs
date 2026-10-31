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

import { androidA11y } from './android-a11y.mjs';
import { deviceInfo, platformOf } from './device.mjs';

const [app, bundleId, udid] = process.argv.slice(2);
if (!app || !bundleId || !udid) {
  console.error('Usage: node scripts/textsize-test.mjs <app> <bundleId> <udid>');
  process.exit(1);
}
const device = deviceInfo(udid);
const android = platformOf(udid) === 'android';
const platform = android ? 'android' : 'ios';
const outDir = new URL(`../results/${app}/`, import.meta.url);
mkdirSync(outDir, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const argent = (tool, args) =>
  JSON.parse(execFileSync('argent', ['run', tool, '--json', '--args', JSON.stringify({ udid, ...args })], { encoding: 'utf8', maxBuffer: 64 << 20 }));
const contentSize = (size) => execFileSync('xcrun', ['simctl', 'ui', udid, 'content_size', size]);
const swipe = (dy) => argent('gesture-swipe', { fromX: 0.5, fromY: 0.5 + dy / 2, toX: 0.5, toY: 0.5 - dy / 2, momentum: false, durationMs: 300 });
const droid = android && androidA11y({ udid, bundleId, swipe, sleep });
const unit = android ? 'dp' : 'pt';

async function launchAndroid() {
  argent('restart-app', { bundleId });
  for (let i = 0; i < 120 && !droid.focusable().some((e) => e.label.includes('Component test screen')); i++) await sleep(500);
  await sleep(1200);
  const all = await droid.everything();
  const elements = [];
  const pairs = new Set();
  for (const id of ids) {
    if (!all.some((e) => e.identifier === id)) continue;
    const e = await droid.reach(id).catch(() => null);
    if (!e) continue;
    elements.push({ identifier: id, frame: e.frame });
    const seen = droid.tree().filter((x) => x.visible && ids.includes(x.identifier));
    for (let i = 0; i < seen.length; i++)
      for (let j = i + 1; j < seen.length; j++) if (overlap(seen[i].frame, seen[j].frame) > 0) pairs.add([seen[i].identifier, seen[j].identifier].sort().join(' × '));
  }
  await droid.toTop();
  return { elements, overlaps: [...pairs], screenFrame: { width: droid.screen.width, height: droid.screen.height } };
}

async function launch() {
  if (android) return launchAndroid();
  argent('restart-app', { bundleId });
  for (let i = 0; i < 120; i++) {
    const d = argent('native-describe-screen', { bundleId });
    if (d.elements?.some((e) => (e.label ?? '').includes('Component test screen'))) break;
    await sleep(500);
  }
  await sleep(1200);
  return argent('native-describe-screen', { bundleId });
}

const ids = ['test-button', 'test-textfield', 'test-switch', 'test-checkbox', 'test-radiogroup-0', 'test-select', 'test-dialog-open', 'test-sheet-open', 'test-tabs-0', 'test-tabs-1', 'test-tabs-2', 'test-native-switch', 'test-list-link', 'test-slider', 'test-accordion-0', 'test-menu-open', 'test-segmented-0'];
const frame = (d, id) => d.elements.find((e) => e.identifier === id)?.frame;
const overlap = (a, b) => {
  const w = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  return w > 2 && h > 2 ? w * h : 0;
};

let restoreFont = () => {};
let normal;
let large;
if (android) {
  restoreFont = droid.setting('system', 'font_scale', 1.0);
  process.on('exit', () => restoreFont());
  try {
    normal = await launch();
    droid.setting('system', 'font_scale', 2.0);
    large = await launch();
  } catch (err) {
    restoreFont();
    throw err;
  }
} else {
  contentSize('large');
  normal = await launch();
  contentSize('accessibility-extra-extra-extra-large');
  large = await launch();
}

const growth = ids.map((id) => {
  const a = frame(normal, id);
  const b = frame(large, id);
  return { id, normal: a?.height ?? null, large: b?.height ?? null, ratio: a && b ? b.height / a.height : null };
});
const W = large.screenFrame.width;
const atEdge = (f) => f.x + f.width >= W - 1;
const offscreen = ids.filter((id) => {
  const f = frame(large, id);
  if (android && !f) return !!frame(normal, id);
  if (!f) return false;
  if (android) return atEdge(f) && !(frame(normal, id) && atEdge(frame(normal, id)));
  return f.x < -1 || f.x + f.width > W + 1;
});
const overlaps = android ? large.overlaps : [];
for (let i = 0; !android && i < ids.length; i++)
  for (let j = i + 1; j < ids.length; j++) {
    const a = frame(large, ids[i]);
    const b = frame(large, ids[j]);
    if (a && b && overlap(a, b) > 0) overlaps.push(`${ids[i]} × ${ids[j]}`);
  }

// Screenshots down the screen at AX5 for the visual check.
const shots = [];
if (android) await droid.toTop();
for (let i = 0; i < 4; i++) {
  const out = fileURLToPath(new URL(`${android ? 'android-' : ''}textsize-${i + 1}.png`, outDir));
  execFileSync('argent', ['run', 'screenshot', '--udid', udid, '--scale', '0.5', '--out', out]);
  shots.push(`${android ? 'android-' : ''}textsize-${i + 1}.png`);
  argent('gesture-swipe', { fromX: 0.5, fromY: 0.8, toX: 0.5, toY: 0.25, momentum: false, durationMs: 400 });
  await sleep(700);
}
if (android) restoreFont();
else contentSize('large');

const grew = growth.filter((g) => g.ratio && g.ratio > 1.2).length;
const result = { app, bundleId, udid, platform, device, date: new Date().toISOString(), growth, offscreen, overlaps, shots };
writeFileSync(new URL(`${platform}-textsize.json`, outDir), JSON.stringify(result, null, 2));
const md = [
  `# ${app}: largest text size (${android ? 'font scale 2.0' : 'AX5'})`,
  '',
  android
    ? `Run ${result.date.slice(0, 10)} on the ${device.name} (${device.runtime}) with \`scripts/textsize-test.mjs\`. Control heights at the default font scale (1.0) against the largest (2.0). Android clips bounds at the screen edge, so "pushed past the edge" means the control reaches the edge at 2.0 but not at 1.0.`
    : `Run ${result.date.slice(0, 10)} on the ${device.name} simulator (${device.runtime}) with \`scripts/textsize-test.mjs\`. Control heights at the default size (large) against the largest accessibility size (accessibility-extra-extra-extra-large).`,
  '',
  `- Controls that grew by more than 20%: ${grew} of ${growth.filter((g) => g.ratio).length}`,
  `- Controls pushed past the screen edge: ${offscreen.length ? offscreen.join(', ') : 'none'}`,
  `- Overlapping controls: ${overlaps.length ? overlaps.join('; ') : 'none'}`,
  `- Screenshots: ${shots.join(', ')}`,
  '',
  `| Control | Height at default (${unit}) | Height at ${android ? '2.0' : 'AX5'} (${unit}) | Ratio |`,
  '| --- | --- | --- | --- |',
  ...growth.map((g) => `| ${g.id} | ${g.normal?.toFixed(0) ?? 'missing'} | ${g.large?.toFixed(0) ?? 'missing'} | ${g.ratio?.toFixed(2) ?? '–'} |`),
  '',
].join('\n');
writeFileSync(new URL(`${platform}-textsize.md`, outDir), md);
console.log(md);
