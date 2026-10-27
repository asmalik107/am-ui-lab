// Startup, memory and scrolling smoothness for one app on a booted simulator,
// against a Release build. Nothing else should be running while it does.
//
// - Startup: cold launches until the screen is in the accessibility tree;
//   see the comment at that step. Median of N runs.
// - Memory: `footprint` on the app's process (the simulator runs it as a
//   process on the Mac), once at idle after launch and again after scrolling
//   the 200-row list and opening every overlay once.
// - Scrolling: the list is flung 5 times while argent's native profiler
//   records; see the comment at that step for what can and can't be measured.
//
// Usage: node scripts/metrics-run.mjs <app> <bundleId> <udid> [runs=10]
// Output: results/<app>/ios-metrics.json and .md (re-render counts are added
// by scripts/rerender-run.mjs from a Debug build).
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { deviceInfo } from './device.mjs';
import { readMetrics, writeMetrics } from './metrics-md.mjs';

const [app, bundleId, udid, runsArg] = process.argv.slice(2);
const runs = Number(runsArg ?? 10);
if (!app || !bundleId || !udid) {
  console.error('Usage: node scripts/metrics-run.mjs <app> <bundleId> <udid> [runs]');
  process.exit(1);
}
const device = deviceInfo(udid);
const outDir = new URL(`../results/${app}/`, import.meta.url);
mkdirSync(outDir, { recursive: true });
const work = join(tmpdir(), `uilab-metrics-${app}`);
mkdirSync(work, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const step = (msg) => console.error(`[metrics ${new Date().toISOString().slice(11, 19)}] ${msg}`);
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
const byId = (els, id) => els.find((e) => e.identifier === id);
const hasLabel = (els, text) => els.some((e) => e.label.includes(text));
const tap = (e) => argent('gesture-tap', { x: e.nx, y: e.ny });
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
async function scrollTo(id) {
  for (let i = 0; i < 14; i++) {
    const e = byId(axTree(), id);
    if (e && e.y > 0.12 && e.y + e.h < 0.92) return e;
    const d = argent('native-describe-screen', { bundleId });
    const n = d.elements.find((x) => x.identifier === id);
    if (!n) throw new Error(`${id} not in view hierarchy`);
    const up = n.frame.y / d.screenFrame.height < 0.12;
    argent('gesture-swipe', { fromX: 0.5, fromY: up ? 0.35 : 0.65, toX: 0.5, toY: up ? 0.65 : 0.35, momentum: false, durationMs: 300 });
    await sleep(400);
  }
  throw new Error(`could not reach ${id}`);
}
const stats = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return { n: s.length, median: s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2, min: s[0], max: s[s.length - 1], samples: xs };
};
const terminate = () => {
  try {
    execFileSync('xcrun', ['simctl', 'terminate', udid, bundleId], { stdio: 'ignore' });
  } catch {
    // not running
  }
};
// The app's process id on the Mac, from the simulator's launchd.
function pid() {
  const out = execFileSync('xcrun', ['simctl', 'spawn', udid, 'launchctl', 'list'], { encoding: 'utf8' });
  const line = out.split('\n').find((l) => l.includes(`UIKitApplication:${bundleId}[`));
  const p = Number(line?.split('\t')[0]);
  if (!p) throw new Error(`no running process for ${bundleId}`);
  return p;
}
// footprint's JSON reports the process's physical footprint, the number
// Xcode's memory gauge and jetsam use.
function footprint() {
  const file = join(work, 'footprint.json');
  execFileSync('footprint', ['--pid', String(pid()), '-j', file, '--noCategories'], { stdio: 'ignore' });
  return JSON.parse(readFileSync(file, 'utf8'));
}

// Sums Time Profiler sample weights for one process, per thread. The export
// writes each thread and weight once with an id and refers back to it after.
function cpuByThread(file, p) {
  const x = readFileSync(file, 'utf8');
  const threads = new Map();
  const weights = new Map();
  const ms = {};
  for (const row of x.split('<row>').slice(1)) {
    let m = row.match(/<thread id="(\d+)" fmt="([^"]*)"/);
    const thread = m ? (threads.set(m[1], m[2]), m[2]) : threads.get(row.match(/<thread ref="(\d+)"/)?.[1]);
    m = row.match(/<weight id="(\d+)" fmt="[^"]*">(\d+)</);
    const w = m ? (weights.set(m[1], Number(m[2])), Number(m[2])) : weights.get(row.match(/<weight ref="(\d+)"/)?.[1]) ?? 0;
    if (!thread?.endsWith(`pid: ${p})`)) continue;
    const name = /^Main Thread/.test(thread) ? 'main' : /JavaScript/.test(thread) ? 'js' : 'other';
    ms[name] = (ms[name] ?? 0) + w / 1e6;
  }
  return { cpuMs: { main: ms.main ?? 0, js: ms.js ?? 0, other: ms.other ?? 0, total: (ms.main ?? 0) + (ms.js ?? 0) + (ms.other ?? 0) } };
}
// Rows of the potential-hangs table that belong to the app's process.
function hangs(file, p) {
  const rows = readFileSync(file, 'utf8').split('<row>').slice(1);
  return rows.filter((r) => r.includes(`pid: ${p})`) || r.includes(`(${p})`)).length;
}

// --- Startup: from the launch-app call until "Component test screen" is in
// the system accessibility tree, i.e. when VoiceOver can read the screen.
// This is later than first paint: Unistyles' screen was visible 4–6 s after
// launch in screenshots but readable at ~8 s. Recording the screen to time
// first paint was tried and dropped, because the recorder itself slowed the
// launches down (8.0 s became 7.7–12.1 s). The clock's resolution is one
// describe poll, measured here.
const polls = [];
for (let i = 0; i < 5; i++) {
  const t = performance.now();
  axTree();
  polls.push(performance.now() - t);
}
const startup = [];
const launchCall = [];
for (let i = 0; i < runs; i++) {
  step(`startup run ${i + 1}`);
  terminate();
  await sleep(1500);
  const t0 = performance.now();
  argent('launch-app', { bundleId });
  const t1 = performance.now();
  if (await waitFor((els) => hasLabel(els, 'Component test screen'), 60000)) {
    startup.push(performance.now() - t0);
    launchCall.push(t1 - t0);
  }
  await sleep(1000);
}

step('memory at idle');
// --- Memory at idle: 5 s after a fresh launch.
terminate();
await sleep(1500);
argent('launch-app', { bundleId });
await waitFor((els) => hasLabel(els, 'Component test screen'), 60000);
await sleep(5000);
const idle = footprint();

// --- Scrolling: open the list and fling it 5 times while argent's native
// profiler (xctrace Time Profiler, all processes) records. Frame hitches can't
// be measured: xctrace's Animation Hitches template fails on the simulator
// with "Hitches is not supported on this platform". What is reported instead
// is main-thread hangs (Instruments' potential-hangs table) and the CPU time
// the app's own threads used during the flings.
step('scrolling');
tap(await scrollTo('test-list-link'));
await waitFor((els) => hasLabel(els, 'Exercise 1,'));
await sleep(1000);
const appPid = pid();
// The profiler's export sometimes comes back without the CPU table, so a
// recording is retried once; the attempts are kept in the results.
let scroll;
const attempts = [];
for (let attempt = 0; attempt < 2 && !scroll?.cpuMs; attempt++) {
  try {
    const exe = execFileSync('ps', ['-p', String(appPid), '-o', 'comm='], { encoding: 'utf8' }).trim().split('/').pop();
    argent('native-profiler-start', { device_id: udid, app_process: exe, udid: undefined });
    await sleep(3000);
    const t0 = performance.now();
    for (let i = 0; i < 5; i++) {
      argent('gesture-swipe', { fromX: 0.5, fromY: i % 2 ? 0.25 : 0.8, toX: 0.5, toY: i % 2 ? 0.8 : 0.25, durationMs: 150 });
      await sleep(1200);
    }
    const windowMs = Math.round(performance.now() - t0);
    const { exportedFiles, exportDiagnostics } = argent('native-profiler-stop', { device_id: udid, udid: undefined });
    if (!exportedFiles?.cpu) throw new Error(`no CPU export (${JSON.stringify(exportDiagnostics?.errors ?? {})})`);
    scroll = { flings: 5, windowMs, ...cpuByThread(exportedFiles.cpu, appPid), hangs: hangs(exportedFiles.hangs, appPid) };
  } catch (err) {
    attempts.push(String(err.message ?? err).split('\n')[0]);
    scroll = { error: attempts.at(-1) };
  }
}
if (attempts.length) scroll.failedAttempts = attempts;

// More list scrolling for the memory figure, then back.
for (let i = 0; i < 4; i++) argent('gesture-swipe', { fromX: 0.5, fromY: 0.8, toX: 0.5, toY: 0.2, durationMs: 150 });
await sleep(2000); // let the last fling settle, or the back gesture is taken as a scroll
// Back through the header's back button (expo-router gives it id BackButton).
for (let i = 0; i < 3 && !byId(axTree(), 'test-list-link') && !hasLabel(axTree(), 'Native control'); i++) {
  const back = byId(axTree(), 'BackButton');
  if (back) tap(back);
  else argent('gesture-swipe', { fromX: 0.0, fromY: 0.5, toX: 0.7, toY: 0.5, durationMs: 300 });
  await waitFor((els) => byId(els, 'test-list-link') || hasLabel(els, 'Native control'), 4000);
}
await sleep(800);

// --- Open every overlay once, closing each through its own control.
const overlays = [
  ['test-dialog-open', 'Delete this workout?', 'test-dialog-cancel', 'Cancel'],
  ['test-sheet-open', 'Goblet squat', 'test-sheet-close', 'Close'],
  ['test-sheet-open-expoui', 'Goblet squat', 'test-sheet-expoui-close', 'Close'],
  ['test-select', '90 seconds', null, '60 seconds'],
  ['test-menu-open', 'Duplicate', null, 'Duplicate'],
  ['test-toast-show', 'Set logged', null, null],
];
step('overlays');
const opened = [];
for (const [open, sign, closeId, closeLabel] of overlays) {
  try {
    tap(await scrollTo(open));
    const shown = await waitFor((els) => hasLabel(els, sign) && els, 5000);
    await sleep(800);
    let closed = true;
    if (closeLabel) {
      const els = axTree();
      const c = (closeId && byId(els, closeId)) || els.filter((e) => e.label.includes(closeLabel) && e.identifier !== open).pop();
      if (c) tap(c);
      closed = !!(await waitFor((e) => !hasLabel(e, sign) || (open === 'test-select' && byId(e, open)), 4000));
    } else await sleep(4500); // toast hides itself
    opened.push({ overlay: open, opened: !!shown, closed });
  } catch (err) {
    opened.push({ overlay: open, error: String(err.message ?? err) });
  }
}
await sleep(2000);
const used = footprint();

const mem = (f) => ({ physFootprint: f.processes[0].auxiliary.phys_footprint, footprint: f.processes[0].footprint });
// Re-render counts come from a separate Debug run, so they are kept.
const { rerenders } = readMetrics(app);
writeMetrics(app, { app, bundleId, udid, device, date: new Date().toISOString(), poll: stats(polls), startup: stats(startup), launchCall: stats(launchCall), memory: { idle: mem(idle), used: mem(used), overlays: opened }, scroll, rerenders });
console.log(readFileSync(new URL('ios-metrics.md', outDir), 'utf8'));
