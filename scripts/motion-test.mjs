// Reduce Motion test. Records the screen while the dialog and the bottom sheet
// open, with Reduce Motion off and then on, and counts the video frames that
// change during the 1.5 s after the tap. An open animation shows up as many
// changing frames; respecting Reduce Motion shows up as a few.
//
// Reduce Motion is set in the simulator's accessibility defaults before the app
// is launched, so this tests "on at launch". Switching it while the app runs is
// not tested: writing the default does not post the change notification.
//
// Usage: node scripts/motion-test.mjs <app> <bundleId> <udid>
// Output: results/<app>/ios-motion.json and results/<app>/ios-motion.md
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

import { deviceInfo } from './device.mjs';

const [app, bundleId, udid] = process.argv.slice(2);
if (!app || !bundleId || !udid) {
  console.error('Usage: node scripts/motion-test.mjs <app> <bundleId> <udid>');
  process.exit(1);
}
const device = deviceInfo(udid);
const outDir = new URL(`../results/${app}/`, import.meta.url);
mkdirSync(outDir, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const argent = (tool, args) =>
  JSON.parse(execFileSync('argent', ['run', tool, '--json', '--args', JSON.stringify({ udid, ...args })], { encoding: 'utf8', maxBuffer: 64 << 20 }));
const setReduceMotion = (on) =>
  execFileSync('xcrun', ['simctl', 'spawn', udid, 'defaults', 'write', 'com.apple.Accessibility', 'ReduceMotionEnabled', '-bool', on ? 'true' : 'false']);

function axTree() {
  const els = [];
  for (const line of argent('describe', {}).description.split('\n')) {
    const m = line.match(/^\s+(AX\w+)(?: "((?:[^"\\]|\\.)*)")?(?: value="((?:[^"\\]|\\.)*)")?(?: id="([^"]*)")?\s+\(([\d.]+), ([\d.]+), ([\d.]+), ([\d.]+)\)/);
    if (!m) continue;
    const [x, y, w, h] = m.slice(5, 9).map(Number);
    els.push({ label: m[2] ?? '', identifier: m[4], nx: x + w / 2, ny: y + h / 2, y, h });
  }
  return els;
}
async function scrollTo(id) {
  for (let i = 0; i < 14; i++) {
    const e = axTree().find((x) => x.identifier === id);
    if (e && e.y > 0.12 && e.y + e.h < 0.85) return e;
    const d = argent('native-describe-screen', { bundleId });
    const n = d.elements.find((x) => x.identifier === id);
    const up = n && n.frame.y / d.screenFrame.height < 0.12;
    argent('gesture-swipe', { fromX: 0.5, fromY: up ? 0.35 : 0.65, toX: 0.5, toY: up ? 0.65 : 0.35, momentum: false, durationMs: 300 });
    await sleep(500);
  }
  throw new Error(`could not reach ${id}`);
}

// Transition duration of the overlay opening. Mean luma difference between
// consecutive frames (0–255, via ffmpeg) is computed for the whole recording;
// the overlay appearing is the largest change. The transition is the run of
// frames around that peak whose difference is above 1.0, allowing one quiet
// frame inside the run. This ignores the button's press highlight and anything
// else that moves on screen independently (a spinning loading indicator).
// An instant change is one frame (33 ms at 30 fps).
const THRESHOLD = 1.0;
function transitionMs(file) {
  const out = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', 'tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 64 << 20 });
  const diffs = [...out.matchAll(/YAVG=([\d.]+)/g)].map((m) => Number(m[1]));
  const fps = Number(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', file], { encoding: 'utf8' }).trim().split('/').reduce((n, d) => n / d));
  const skip = Math.round(fps * 0.3); // recorder start-up
  let peak = skip;
  for (let i = skip; i < diffs.length; i++) if (diffs[i] > diffs[peak]) peak = i;
  if (!(diffs[peak] > THRESHOLD)) return { fps, ms: null, frames: [] };
  const moving = (i) => diffs[i] > THRESHOLD || diffs[i + 1] > THRESHOLD; // one quiet frame allowed
  let start = peak;
  while (start - 1 >= skip && diffs[start - 1] > THRESHOLD) start--; // no gap going back: the press highlight sits just before
  let end = peak;
  while (end + 1 < diffs.length && moving(end + 1)) end++;
  while (end > peak && !(diffs[end] > THRESHOLD)) end--;
  while (start < peak && !(diffs[start] > THRESHOLD)) start++;
  return { fps, peak: +diffs[peak].toFixed(1), ms: Math.round(((end - start + 1) * 1000) / fps), frames: diffs.slice(start, end + 1).map((d) => +d.toFixed(1)) };
}

async function measure(openId, label) {
  argent('restart-app', { bundleId });
  for (let i = 0; i < 120 && !axTree().some((e) => e.label.includes('Component test screen')); i++) await sleep(500);
  await sleep(1000);
  const trigger = await scrollTo(openId);
  await sleep(800);
  argent('screen-recording-start', { timeLimitSeconds: 10, trimStatic: false, showTouches: false });
  await sleep(700);
  argent('gesture-tap', { x: trigger.nx, y: trigger.ny });
  await sleep(1500);
  const rec = argent('screen-recording-stop', {});
  const file = rec.video;
  if (!file) throw new Error(`no video path in ${JSON.stringify(rec)}`);
  return { label, video: file, ...transitionMs(file) };
}

const runs = [];
try {
  for (const rm of [false, true]) {
    setReduceMotion(rm);
    for (const [id, name] of [['test-dialog-open', 'Dialog'], ['test-sheet-open', 'Bottom sheet']]) {
      runs.push({ reduceMotion: rm, component: name, ...(await measure(id, name)) });
    }
  }
} finally {
  setReduceMotion(false); // never leave the simulator with Reduce Motion on
}

writeFileSync(new URL('ios-motion.json', outDir), JSON.stringify({ app, bundleId, udid, device, date: new Date().toISOString(), runs }, null, 2));
const md = [
  `# ${app}: Reduce Motion`,
  '',
  `Run ${new Date().toISOString().slice(0, 10)} on the ${device.name} simulator (${device.runtime}) with \`scripts/motion-test.mjs\`. Transition duration of the open, from a real-time 30 fps screen recording: the run of visibly changing frames (mean luma difference above 1.0) around the largest change, which is the overlay appearing. An instant change is one frame (33 ms); an animation lasts as long as it runs. Reduce Motion was set before launch; switching it while the app runs was not tested.`,
  '',
  '| Component | Reduce Motion off | Reduce Motion on |',
  '| --- | --- | --- |',
  ...['Dialog', 'Bottom sheet'].map((c) => {
    const off = runs.find((r) => r.component === c && !r.reduceMotion);
    const on = runs.find((r) => r.component === c && r.reduceMotion);
    return `| ${c} | ${off.ms} ms | ${on.ms} ms |`;
  }),
  '',
].join('\n');
writeFileSync(new URL('ios-motion.md', outDir), md);
console.log(md);
