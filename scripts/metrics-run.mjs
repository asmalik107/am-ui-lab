// Startup, memory and scrolling smoothness for one app on a booted simulator
// or a cabled iPhone, against a Release build. Nothing else should be running while it does.
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
// Output: results/<app>/ios-metrics.json and .md, iphone-metrics.* on a phone
// (re-render counts are added by scripts/rerender-run.mjs from a Debug build).
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { deviceInfo, isPhysical, platformOf } from './device.mjs';
import { iphone } from './iphone.mjs';
import { readMetrics, writeMetrics } from './metrics-md.mjs';

const [app, bundleId, udid, runsArg] = process.argv.slice(2);
const runs = Number(runsArg ?? 10);
if (!app || !bundleId || !udid) {
  console.error('Usage: node scripts/metrics-run.mjs <app> <bundleId> <udid> [runs]');
  process.exit(1);
}
const platform = platformOf(udid);
const android = platform === 'android';
const physical = isPhysical(udid);
const device = deviceInfo(udid);
const outDir = new URL(`../results/${app}/`, import.meta.url);
mkdirSync(outDir, { recursive: true });
const work = join(tmpdir(), `uilab-metrics-${app}`);
mkdirSync(work, { recursive: true });
const phone = physical && iphone(udid, bundleId, work);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const step = (msg) => console.error(`[metrics ${new Date().toISOString().slice(11, 19)}] ${msg}`);
function argent(tool, args, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      return JSON.parse(execFileSync('argent', ['run', tool, '--json', '--args', JSON.stringify({ udid, ...args })], { encoding: 'utf8', maxBuffer: 64 << 20 }));
    } catch (err) {
      // A phone's XCUITest runner sometimes drops and respawns on the next call.
      const respawn = physical && /runner/i.test(String(err.stderr ?? err.message));
      if (i >= tries || !(respawn || ['describe', 'list-devices'].includes(tool))) throw err;
      if (respawn) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000);
    }
  }
}

function axTree() {
  const els = [];
  for (const line of argent('describe', {}).description.split('\n')) {
    const m = line.match(/^\s+(\w+)(?: "((?:[^"\\]|\\.)*)")?(?: value="((?:[^"\\]|\\.)*)")?(?: id="([^"]*)")?(?: \[[^\]]*\])?\s+\(([\d.]+), ([\d.]+), ([\d.]+), ([\d.]+)\)/);
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
function aboveOnIos(id) {
  const d = argent('native-describe-screen', { bundleId });
  const n = d.elements.find((x) => x.identifier === id);
  if (!n) throw new Error(`${id} not in view hierarchy`);
  return n.frame.y / d.screenFrame.height < 0.12;
}
const adb = (...args) => execFileSync('adb', ['-s', udid, ...args], { encoding: 'utf8', maxBuffer: 64 << 20 });
async function scrollTo(id) {
  let down = true;
  let last = '';
  for (let i = 0; i < 40; i++) {
    const els = axTree();
    const e = byId(els, id);
    if (e && e.y > 0.12 && e.y + e.h < 0.92) return e;
    const seen = els.map((x) => x.label).join('|');
    if (!e && seen === last) down = !down;
    last = seen;
    // A phone has no view-hierarchy tool, so it uses the same rule as Android.
    const up = android || physical ? (e ? e.y < 0.12 : !down) : aboveOnIos(id);
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
  if (android) return void adb('shell', 'am', 'force-stop', bundleId);
  if (physical) return void phone.terminate();
  try {
    execFileSync('xcrun', ['simctl', 'terminate', udid, bundleId], { stdio: 'ignore' });
  } catch {
    // not running
  }
};
// The app's process id on the Mac, from the simulator's launchd.
function pid() {
  if (android) {
    const p = Number(adb('shell', 'pidof', bundleId).trim().split(/\s+/)[0]);
    if (!p) throw new Error(`no running process for ${bundleId}`);
    return p;
  }
  if (physical) {
    const p = phone.pid();
    if (!p) throw new Error(`no running process for ${bundleId}`);
    return p;
  }
  const out = execFileSync('xcrun', ['simctl', 'spawn', udid, 'launchctl', 'list'], { encoding: 'utf8' });
  const line = out.split('\n').find((l) => l.includes(`UIKitApplication:${bundleId}[`));
  const p = Number(line?.split('\t')[0]);
  if (!p) throw new Error(`no running process for ${bundleId}`);
  return p;
}
// footprint's JSON reports the process's physical footprint, the number
// Xcode's memory gauge and jetsam use.
function footprint() {
  if (android) {
    const out = adb('shell', 'dumpsys', 'meminfo', bundleId);
    const kb = (re) => Number(out.match(re)?.[1] ?? NaN) * 1024;
    return { pss: kb(/TOTAL PSS:\s+(\d+)/), rss: kb(/TOTAL RSS:\s+(\d+)/) };
  }
  if (physical) return phone.memory(pid());
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
function threadMs(p) {
  const ms = { main: 0, js: 0, other: 0 };
  for (const line of adb('shell', `cat /proc/${p}/task/*/stat`).split('\n')) {
    const m = line.match(/^(\d+) \((.*)\) (.*)$/);
    if (!m) continue;
    const f = m[3].split(' ');
    const t = (Number(f[11]) + Number(f[12])) * 10;
    const name = Number(m[1]) === p ? 'main' : /^mqt_(v_)?js/.test(m[2]) ? 'js' : 'other';
    ms[name] += t;
  }
  return ms;
}
function gfxinfo() {
  const out = adb('shell', 'dumpsys', 'gfxinfo', bundleId);
  const n = (re) => Number(out.match(re)?.[1] ?? NaN);
  return { total: n(/Total frames rendered: (\d+)/), janky: n(/Janky frames: (\d+)/), p50: n(/50th percentile: (\d+)ms/), p90: n(/90th percentile: (\d+)ms/), p99: n(/99th percentile: (\d+)ms/) };
}
async function androidScroll(p) {
  adb('shell', 'dumpsys', 'gfxinfo', bundleId, 'reset');
  const before = threadMs(p);
  const t0 = performance.now();
  for (let i = 0; i < 5; i++) {
    argent('gesture-swipe', { fromX: 0.5, fromY: i % 2 ? 0.25 : 0.8, toX: 0.5, toY: i % 2 ? 0.8 : 0.25, durationMs: 150 });
    await sleep(1200);
  }
  const windowMs = Math.round(performance.now() - t0);
  const after = threadMs(p);
  const cpuMs = { main: after.main - before.main, js: after.js - before.js, other: after.other - before.other };
  cpuMs.total = cpuMs.main + cpuMs.js + cpuMs.other;
  return { flings: 5, windowMs, cpuMs, frames: gfxinfo() };
}
// On a phone: the same 5 flings while Instruments' Animation Hitches template
// records. Its trace also has a Time Profiler table, read as on the simulator.
async function phoneScroll(p) {
  const rec = await phone.startHitches(p);
  await sleep(3000);
  // One run-sequence call: a single gesture-swipe on a phone is followed by an
  // accessibility snapshot, which keeps the app's main thread busy.
  const t0 = performance.now();
  argent('run-sequence', {
    steps: Array.from({ length: 5 }, (_, i) => ({ tool: 'gesture-swipe', args: { fromX: 0.5, fromY: i % 2 ? 0.25 : 0.8, toX: 0.5, toY: i % 2 ? 0.8 : 0.25, durationMs: 150 }, delayMs: 1200 })),
  });
  const windowMs = Math.round(performance.now() - t0);
  const { hitches, cpuFile } = await rec.stop();
  return { flings: 5, windowMs, ...cpuByThread(cpuFile, p), hitches: { ...hitches, ratio: hitches.hitchMs / (windowMs / 1000) } };
}
const goBack = () => (android ? argent('button', { button: 'back' }) : argent('gesture-swipe', { fromX: 0.0, fromY: 0.5, toX: 0.7, toY: 0.5, durationMs: 300 }));
function launch() {
  if (!android) return { call: argent('launch-app', { bundleId }) };
  const out = adb('shell', 'am', 'start', '-W', '-n', `${bundleId}/.MainActivity`);
  return { totalTime: Number(out.match(/TotalTime: (\d+)/)?.[1] ?? NaN) };
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
const firstFrame = [];
for (let i = 0; i < runs; i++) {
  step(`startup run ${i + 1}`);
  terminate();
  await sleep(1500);
  const t0 = performance.now();
  const { totalTime } = launch();
  const t1 = performance.now();
  if (await waitFor((els) => hasLabel(els, 'Component test screen'), 60000)) {
    startup.push(performance.now() - t0);
    launchCall.push(t1 - t0);
    if (Number.isFinite(totalTime)) firstFrame.push(totalTime);
  }
  await sleep(1000);
}

step('memory at idle');
// --- Memory at idle: 5 s after a fresh launch.
terminate();
await sleep(1500);
launch();
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
if (android) scroll = await androidScroll(appPid);
if (physical) scroll = await phoneScroll(appPid);
for (let attempt = 0; !android && !physical && attempt < 2 && !scroll?.cpuMs; attempt++) {
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
  const back = !android && byId(axTree(), 'BackButton');
  if (back) tap(back);
  else goBack();
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

const mem = (f) => (android || physical ? f : { physFootprint: f.processes[0].auxiliary.phys_footprint, footprint: f.processes[0].footprint });
// Re-render counts come from a separate Debug run, so they are kept.
// On a phone they come from the simulator's file: argent can't profile React there.
const { rerenders } = readMetrics(app, platform);
writeMetrics(app, { app, bundleId, udid, platform, device, date: new Date().toISOString(), poll: stats(polls), startup: stats(startup), launchCall: stats(launchCall), firstFrame: firstFrame.length ? stats(firstFrame) : undefined, memory: { idle: mem(idle), used: mem(used), overlays: opened }, scroll, rerenders });
console.log(readFileSync(new URL(`${physical ? 'iphone' : platform}-metrics.md`, outDir), 'utf8'));
