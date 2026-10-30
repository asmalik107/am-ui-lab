// Counts React commits and component renders for one theme switch, three
// times (light → dark → brand → light), with argent's React profiler. The
// profiler needs Hermes over Metro, so this runs against a Debug build:
// install it and start Metro with scripts/audit-app.sh <app> <udid> Debug
// first, or the equivalent. Durations are not recorded; Debug timings aren't
// representative.
//
// Usage: node scripts/rerender-run.mjs <app> <bundleId> <udid>
// Output: adds `rerenders` to results/<app>/ios-metrics.json and rewrites .md
import { execFileSync } from 'node:child_process';

import { readMetrics, writeMetrics } from './metrics-md.mjs';

const [app, bundleId, udid] = process.argv.slice(2);
if (!app || !bundleId || !udid) {
  console.error('Usage: node scripts/rerender-run.mjs <app> <bundleId> <udid>');
  process.exit(1);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const run = (tool, args) => JSON.parse(execFileSync('argent', ['run', tool, '--json', '--args', JSON.stringify(args)], { encoding: 'utf8', maxBuffer: 64 << 20 }));
const argent = (tool, args) => run(tool, { udid, ...args });

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
  argent('restart-app', { bundleId });
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
writeMetrics(app, { ...readMetrics(app), app, rerenders });
console.log(JSON.stringify(rerenders, null, 2));
