// Helpers for a cabled iPhone, where the simulator's tools (simctl, the Mac's
// footprint, argent's native profiler) don't reach: devicectl for processes
// and xctrace, recording on the phone, for memory, CPU and frame hitches.
// xctrace can't attach to a process on the phone ("Cannot find process"), so
// it records all processes and the app's rows are picked out by pid.
// The phone must stay unlocked: when it locks, argent's runner stops answering.
import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export function iphone(udid, bundleId, work) {
  mkdirSync(work, { recursive: true });
  const devicectl = (...args) => {
    const out = join(work, 'devicectl.json');
    execFileSync('xcrun', ['devicectl', ...args, '--device', udid, '--quiet', '--json-output', out], { stdio: 'ignore' });
    return JSON.parse(readFileSync(out, 'utf8')).result;
  };
  // The app's executable is <Name>.app/<Name>; its process is found by that path.
  let exe;
  function pid() {
    if (!exe) {
      const { apps } = devicectl('device', 'info', 'apps', '--bundle-id', bundleId);
      if (!apps?.length) throw new Error(`${bundleId} is not installed on ${udid}`);
      exe = decodeURI(apps[0].url.replace(/^file:\/\//, '')).replace(/\/$/, '');
    }
    const { runningProcesses } = devicectl('device', 'info', 'processes');
    const p = runningProcesses.find((x) => decodeURI(x.executable ?? '').replace(/^file:\/\//, '').startsWith(`${exe}/`));
    return p?.processIdentifier ?? null;
  }
  function terminate() {
    const p = pid();
    if (p) devicectl('device', 'process', 'terminate', '--pid', String(p));
  }

  const tracePath = (name) => {
    const trace = join(work, `${name}-${Date.now()}.trace`);
    rmSync(trace, { recursive: true, force: true });
    return trace;
  };
  const recordArgs = (template, trace) => ['xctrace', 'record', '--template', template, '--device', udid, '--all-processes', '--output', trace, '--no-prompt'];
  const table = (trace, schema) =>
    execFileSync('xcrun', ['xctrace', 'export', '--input', trace, '--xpath', `/trace-toc/run[@number="1"]/data/table[@schema="${schema}"]`], { encoding: 'utf8', maxBuffer: 512 << 20, stdio: ['ignore', 'pipe', 'ignore'] });
  // Values are written once with an id and referred back to after; this
  // returns, per row, the first value of the given element type (for pid,
  // that is the row's process).
  function column(xml, type) {
    const seen = new Map();
    const out = [];
    for (const row of xml.split('<row>').slice(1)) {
      let v;
      for (const m of row.matchAll(new RegExp(`<${type} (?:id="(\\d+)"[^>]*>(\\d+)<|ref="(\\d+)")`, 'g'))) {
        const val = m[1] ? Number(m[2]) : seen.get(m[3]);
        if (m[1]) seen.set(m[1], val);
        if (v === undefined) v = val;
      }
      out.push(v);
    }
    return out;
  }

  // Physical footprint from a 3 s Activity Monitor recording: the same
  // measure as phys_footprint from `footprint` on the simulator.
  function memory(p) {
    const trace = tracePath('memory');
    execFileSync('xcrun', [...recordArgs('Activity Monitor', trace), '--time-limit', '3s'], { stdio: 'ignore' });
    const xml = table(trace, 'activity-monitor-process-live');
    const pids = column(xml, 'pid');
    const bytes = column(xml, 'size-in-bytes').filter((_, i) => pids[i] === p);
    rmSync(trace, { recursive: true, force: true });
    if (!bytes.length) throw new Error(`no Activity Monitor row for pid ${p}`);
    return { physFootprint: bytes.at(-1) };
  }

  // Starts an Animation Hitches recording and resolves once it is recording.
  // The template keeps only a trailing window (about 1 s by default on the
  // phone), so the window is set to cover the flings. stop() ends it with
  // SIGINT, as Ctrl-C would, and returns the hitches, frames and the trace.
  async function startHitches(p) {
    const trace = tracePath('hitches');
    const child = spawn('xcrun', [...recordArgs('Animation Hitches', trace), '--window', '30s'], { stdio: ['ignore', 'pipe', 'pipe'] });
    let log = '';
    const done = new Promise((resolve, reject) =>
      child.on('exit', (code) => (/Output file saved/.test(log) ? resolve() : reject(new Error(`xctrace exited ${code}: ${log.trim().split('\n').pop()}`)))),
    );
    await new Promise((resolve, reject) => {
      const on = (b) => {
        log += b;
        if (/Ctrl-C to stop/.test(log)) resolve();
      };
      child.stdout.on('data', on);
      child.stderr.on('data', on);
      done.catch(reject);
    });
    return {
      async stop() {
        child.kill('SIGINT');
        await done;
        const xml = table(trace, 'hitches');
        const pids = column(xml, 'pid');
        const hitchNs = column(xml, 'duration').filter((_, i) => pids[i] === p);
        const frames = column(table(trace, 'hitches-frame-lifetimes'), 'duration').length;
        const cpuFile = join(work, 'time-profile.xml');
        writeFileSync(cpuFile, table(trace, 'time-profile'));
        rmSync(trace, { recursive: true, force: true });
        return { hitches: { count: hitchNs.length, hitchMs: hitchNs.reduce((a, b) => a + b, 0) / 1e6, frames }, cpuFile };
      },
    };
  }

  return { pid, terminate, memory, startHitches };
}
