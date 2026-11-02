// Counts React commits and component renders for one theme switch, three
// times (light → dark → brand → light), with argent's React profiler. The
// profiler needs Hermes over Metro, so this runs against a Debug build:
// install it and start Metro with scripts/audit-app.sh <app> <udid> Debug
// first, or the equivalent. On Android, install the Debug .apk and start
// Metro; the script forwards the phone's port 8081 to it with adb reverse.
// argent's profiler doesn't run on a physical iPhone. Durations are not
// recorded; Debug timings aren't representative.
//
// Usage: node scripts/rerender-run.mjs <app> <bundleId> <udid-or-serial>
// Output: adds `rerenders` to results/<app>/ios-metrics.json (or
// android-metrics.json) and rewrites the .md
import { execFileSync } from 'node:child_process';

import { platformOf } from './device.mjs';
import { readMetrics, writeMetrics } from './metrics-md.mjs';

const [app, bundleId, udid] = process.argv.slice(2);
if (!app || !bundleId || !udid) {
  console.error('Usage: node scripts/rerender-run.mjs <app> <bundleId> <udid>');
  process.exit(1);
}
const platform = platformOf(udid);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const run = (tool, args) => JSON.parse(execFileSync('argent', ['run', tool, '--json', '--args', JSON.stringify(args)], { encoding: 'utf8', maxBuffer: 64 << 20 }));
const argent = (tool, args) => run(tool, { udid, ...args });

function axTree() {
  const els = [];
  for (const line of argent('describe', {}).description.split('\n')) {
    // iOS roles start with AX; Android's are class names, and flags follow in brackets.
    const m = line.match(/^\s+(\w+)(?: "((?:[^"\\]|\\.)*)")?(?: value="((?:[^"\\]|\\.)*)")?(?: id="([^"]*)")?(?: \[[^\]]*\])?\s+\(([\d.]+), ([\d.]+), ([\d.]+), ([\d.]+)\)/);
    if (!m) continue;
    const [x, y, w, h] = m.slice(5, 9).map(Number);
    els.push({ label: m[2] ?? '', identifier: m[4], nx: x + w / 2, ny: y + h / 2, y, h });
  }
  return els;
}
async function waitFor(pred, ms = 60000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (pred(axTree())) return true;
    await sleep(300);
  }
  return false;
}

const themes = ['light', 'dark', 'brand'];
const rerenders = { date: new Date().toISOString(), build: 'Debug' };
try {
  // The Debug build loads its bundle from Metro on the Mac.
  if (platform === 'android') execFileSync('adb', ['-s', udid, 'reverse', 'tcp:8081', 'tcp:8081']);
  // A Debug build can take longer to start than the launch call waits for,
  // so a timeout there is ignored and the screen check below decides.
  try {
    argent('restart-app', { bundleId });
  } catch (err) {
    if (!/timeout/i.test(String(err.message))) throw err;
  }
  if (!(await waitFor((els) => els.some((e) => e.label.includes('Component test screen'))))) throw new Error('app did not show the test screen');
  await sleep(3000);
  // The app can show the screen before it has re-attached to Metro after the
  // restart (seen on Uniwind and NativeWind, 30 Oct), so retry for 30 s.
  for (let i = 0; ; i++) {
    try {
      run('debugger-connect', { device_id: udid });
      break;
    } catch (err) {
      if (i >= 14) throw err;
      await sleep(2000);
    }
  }
  // On Android the first profiling session after connecting records CPU
  // samples but no React renders (2 Nov), so one unmeasured session goes first.
  run('react-profiler-start', { device_id: udid });
  await sleep(1000);
  run('react-profiler-stop', { device_id: udid });
  // The theme radios sit near the top of the screen, visible at launch.
  rerenders.switches = [];
  for (const to of [1, 2, 0]) {
    const radio = axTree().find((e) => e.identifier === `test-theme-${to}`);
    if (!radio) throw new Error(`test-theme-${to} not on screen`);
    run('react-profiler-start', { device_id: udid });
    await sleep(500);
    argent('gesture-tap', { x: radio.nx, y: radio.ny });
    await sleep(2000);
    const s = run('react-profiler-stop', { device_id: udid });
    rerenders.switches.push({ from: themes[(to + 2) % 3], to: themes[to], commits: s.total_react_commits, renders: s.fiber_renders_captured, raw: s });
  }
} catch (err) {
  rerenders.error = String(err.message ?? err).split('\n')[0];
}
writeMetrics(app, { ...readMetrics(app, platform), app, platform, rerenders });
console.log(JSON.stringify(rerenders, null, 2));
