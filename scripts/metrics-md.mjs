// Writes results/<app>/ios-metrics.md from ios-metrics.json, which
// metrics-run.mjs (Release) and rerender-run.mjs (Debug) both add to.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const file = (app, platform, ext) => new URL(`../results/${app}/${platform}-metrics.${ext}`, import.meta.url);

export function readMetrics(app, platform = 'ios') {
  const u = file(app, platform, 'json');
  return existsSync(u) ? JSON.parse(readFileSync(u, 'utf8')) : {};
}

export function writeMetrics(app, m) {
  const platform = m.platform ?? 'ios';
  const android = platform === 'android';
  writeFileSync(file(app, platform, 'json'), JSON.stringify(m, null, 2));
  const mb = (b) => `${(b / 1048576).toFixed(1)} MiB`;
  const memLabel = android ? 'total PSS, dumpsys meminfo' : 'phys_footprint';
  const memOf = (x) => mb(android ? x.pss : x.physFootprint);
  const f = m.scroll?.frames;
  const lines = [`# ${app}: startup, memory, scrolling and re-renders (${android ? 'Android' : 'iOS'})`, ''];
  if (m.startup) {
    lines.push(
      `Run ${m.date.slice(0, 10)} on the ${android ? m.device.name : `${m.device.name} simulator`} (${m.device.runtime}, ${m.udid}), Release build, with \`scripts/metrics-run.mjs\`.`,
      '',
      '| Measure | Result |',
      '| --- | --- |',
      `| Startup until readable: launch call to the title in the accessibility tree, median of ${m.startup.n} | ${m.startup.median.toFixed(0)} ms (${m.startup.min.toFixed(0)}–${m.startup.max.toFixed(0)}) |`,
      m.launchCall ? `| of which the launch call itself, median | ${m.launchCall.median.toFixed(0)} ms |` : null,
      m.firstFrame ? `| \`am start -W\` TotalTime (first frame of the activity, the splash screen), median | ${m.firstFrame.median.toFixed(0)} ms (${m.firstFrame.min.toFixed(0)}–${m.firstFrame.max.toFixed(0)}) |` : null,
      `| Clock resolution (one describe poll, median) | ${m.poll.median.toFixed(0)} ms |`,
      `| Memory at idle, 5 s after launch (${memLabel}) | ${memOf(m.memory.idle)} |`,
      `| Memory after the list and every overlay (${memLabel}) | ${memOf(m.memory.used)} |`,
      m.scroll?.cpuMs
        ? `| App CPU time during ${m.scroll.flings} list flings (${(m.scroll.windowMs / 1000).toFixed(1)} s) | ${m.scroll.cpuMs.total.toFixed(0)} ms (main thread ${m.scroll.cpuMs.main.toFixed(0)}, JS thread ${m.scroll.cpuMs.js.toFixed(0)}) |`
        : `| Scrolling | not measured: ${m.scroll?.error ?? 'no data'} |`,
      m.scroll?.hangs != null ? `| Main-thread hangs during the flings | ${m.scroll.hangs} |` : null,
      f ? `| Janky frames during the flings (dumpsys gfxinfo) | ${f.janky} of ${f.total} (${f.total ? ((100 * f.janky) / f.total).toFixed(1) : 0}%) |` : null,
      f ? `| Frame time 50th / 90th / 99th percentile | ${f.p50} / ${f.p90} / ${f.p99} ms |` : null,
      '',
      `Overlays opened for the memory figure: ${m.memory.overlays.map((o) => `${o.overlay} ${o.error ? `(error: ${o.error})` : o.closed ? '' : '(did not close)'}`.trim()).join(', ')}.`,
      '',
      android
        ? 'Memory is total PSS from `dumpsys meminfo`, which is not the same measure as iOS phys_footprint, so compare apps within a platform only. CPU time is utime + stime of the app\'s threads from /proc during the flings (10 ms ticks). Startup until readable is when TalkBack could first read the screen; TotalTime is Android\'s own first-frame time, which here is the splash screen.'
        : 'Frame hitches were not measured: xctrace\'s Animation Hitches template fails on the simulator ("Hitches is not supported on this platform"). Startup is when VoiceOver could first read the screen, not first paint, which can be seconds earlier; timing first paint with a screen recording slowed the launches down, so it isn\'t reported.',
      '',
    );
  }
  if (m.rerenders) {
    const r = m.rerenders;
    lines.push(`## Re-renders on theme switch`, '', `Run ${r.date.slice(0, 10)}, Debug build with Metro, argent React profiler (\`scripts/rerender-run.mjs\`). Counts only: Debug timings aren't representative.`, '');
    if (r.error) lines.push(`Not measured: ${r.error}`, '');
    else
      lines.push(
        '| Switch | React commits | Component renders |',
        '| --- | --- | --- |',
        ...r.switches.map((s) => `| ${s.from} → ${s.to} | ${s.commits} | ${s.renders} |`),
        '',
      );
  }
  writeFileSync(file(app, platform, 'md'), lines.filter((l) => l !== null).join('\n'));
}
