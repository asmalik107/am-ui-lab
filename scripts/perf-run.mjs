// Drives the in-app timings (src/perf.ts in each app) on a booted simulator
// and records median and range. Run against a Release build.
//
// Usage: node scripts/perf-run.mjs <app> <bundleId> <udid> [runs=10]
// Output: results/<app>/ios-perf.json and results/<app>/ios-perf.md
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

import { deviceInfo } from './device.mjs';

const [app, bundleId, udid, runsArg] = process.argv.slice(2);
const runs = Number(runsArg ?? 10);
if (!app || !bundleId || !udid) {
  console.error('Usage: node scripts/perf-run.mjs <app> <bundleId> <udid> [runs]');
  process.exit(1);
}
const device = deviceInfo(udid);
const outDir = new URL(`../results/${app}/`, import.meta.url);
mkdirSync(outDir, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const argent = (tool, args) =>
  JSON.parse(execFileSync('argent', ['run', tool, '--json', '--args', JSON.stringify({ udid, ...args })], { encoding: 'utf8', maxBuffer: 64 << 20 }));

function axTree() {
  const els = [];
  for (const line of argent('describe', {}).description.split('\n')) {
    const m = line.match(/^\s+(AX\w+)(?: "((?:[^"\\]|\\.)*)")?(?: value="((?:[^"\\]|\\.)*)")?(?: id="([^"]*)")?\s+\(([\d.]+), ([\d.]+), ([\d.]+), ([\d.]+)\)/);
    if (!m) continue;
    const [x, y, w, h] = m.slice(5, 9).map(Number);
    els.push({ role: m[1], label: m[2] ?? '', identifier: m[4], nx: x + w / 2, ny: y + h / 2, y, h });
  }
  return els;
}
const tap = (e) => argent('gesture-tap', { x: e.nx, y: e.ny });
const byId = (els, id) => els.find((e) => e.identifier === id);
async function waitFor(pred, ms = 8000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const els = axTree();
    const hit = pred(els);
    if (hit) return hit;
    await sleep(200);
  }
  return null;
}
// Scrolls until the element is on screen. The system tree only lists what is
// visible, so the view hierarchy (which lists everything) gives the direction.
async function scrollTo(id) {
  for (let i = 0; i < 14; i++) {
    const e = byId(axTree(), id);
    if (e && e.y > 0.12 && e.y + e.h < 0.92) return e;
    const d = argent('native-describe-screen', { bundleId });
    const n = d.elements.find((x) => x.identifier === id);
    if (!n) throw new Error(`${id} not in view hierarchy`);
    const up = n.frame.y / d.screenFrame.height < 0.12; // target is above: drag content down
    argent('gesture-swipe', { fromX: 0.5, fromY: up ? 0.35 : 0.65, toX: 0.5, toY: up ? 0.65 : 0.35, momentum: false, durationMs: 300 });
    await sleep(400);
  }
  throw new Error(`could not reach ${id}`);
}
// The readout's testIDs are not exposed on text in the system tree, so the
// value is found by its label prefix.
const prefix = { 'perf-theme': 'Theme switch:', 'perf-list': 'List mount:' };
const readMs = (els, id) => {
  const e = els.find((x) => x.label.startsWith(prefix[id]));
  const m = e?.label.match(/([\d.]+) ms/);
  return m ? Number(m[1]) : null;
};
const stats = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return { n: s.length, median: s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2, min: s[0], max: s[s.length - 1], samples: xs };
};

argent('restart-app', { bundleId });
await waitFor((els) => els.some((e) => e.label.includes('Component test screen')), 60000);
await sleep(1500);

// Theme switch: cycle Light → Dark → Brand and read the timing after each tap.
const theme = [];
const order = ['test-theme-1', 'test-theme-2', 'test-theme-0'];
for (let i = 0; i < runs; i++) {
  const radio = await scrollTo(order[i % 3]);
  const before = readMs(axTree(), 'perf-theme');
  tap(radio);
  const ms = await waitFor((els) => {
    const v = readMs(els, 'perf-theme');
    return v != null && v !== before ? v : null;
  });
  if (ms != null) theme.push(ms);
  await sleep(500);
}
// Back to light so list timings start from the same theme in every app.
tap(await scrollTo('test-theme-0'));
await sleep(800);

// List mount: open the 200-row list, read the timing, go back.
const list = [];
for (let i = 0; i < runs; i++) {
  tap(await scrollTo('test-list-link'));
  const ms = await waitFor((els) => readMs(els, 'perf-list'));
  if (ms != null) list.push(ms);
  argent('gesture-swipe', { fromX: 0.0, fromY: 0.5, toX: 0.7, toY: 0.5, durationMs: 300 }); // edge swipe back
  await waitFor((els) => byId(els, 'test-list-link') || els.some((e) => e.label.includes('Native control')));
  await sleep(700);
}

const result = { app, bundleId, udid, device, date: new Date().toISOString(), theme: stats(theme), list: stats(list) };
writeFileSync(new URL('ios-perf.json', outDir), JSON.stringify(result, null, 2));
const row = (name, s) => `| ${name} | ${s.n} | ${s.median.toFixed(1)} | ${s.min.toFixed(1)}–${s.max.toFixed(1)} |`;
const md = [
  `# ${app}: iOS timings`,
  '',
  `Run ${result.date.slice(0, 10)} on the ${device.name} simulator (${device.runtime}, ${udid}) with \`scripts/perf-run.mjs\`, Release build. Times are from the tap to the second frame after the update (\`src/perf.ts\`).`,
  '',
  '| Measure | Runs | Median (ms) | Range (ms) |',
  '| --- | --- | --- | --- |',
  row('Theme switch', result.theme),
  row('200-row list mount', result.list),
  '',
].join('\n');
writeFileSync(new URL('ios-perf.md', outDir), md);
console.log(md);
