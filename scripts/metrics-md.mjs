// Writes results/<app>/ios-metrics.md from ios-metrics.json, which
// metrics-run.mjs (Release) and rerender-run.mjs (Debug) both add to.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

export function readMetrics(app) {
  const u = new URL(`../results/${app}/ios-metrics.json`, import.meta.url);
  return existsSync(u) ? JSON.parse(readFileSync(u, 'utf8')) : {};
}

export function writeMetrics(app, m) {
  writeFileSync(new URL(`../results/${app}/ios-metrics.json`, import.meta.url), JSON.stringify(m, null, 2));
  const mb = (b) => `${(b / 1048576).toFixed(1)} MiB`;
  const lines = [`# ${app}: startup, memory, scrolling and re-renders`, ''];
  if (m.startup) {
    lines.push(
      `Run ${m.date.slice(0, 10)} on the ${m.device.name} simulator (${m.device.runtime}, ${m.udid}), Release build, with \`scripts/metrics-run.mjs\`.`,
      '',
      '| Measure | Result |',
      '| --- | --- |',
      `| Startup until readable: launch-app call to the title in the accessibility tree, median of ${m.startup.n} | ${m.startup.median.toFixed(0)} ms (${m.startup.min.toFixed(0)}–${m.startup.max.toFixed(0)}) |`,
      m.launchCall ? `| of which the launch-app call itself, median | ${m.launchCall.median.toFixed(0)} ms |` : null,
      `| Clock resolution (one describe poll, median) | ${m.poll.median.toFixed(0)} ms |`,
      `| Memory at idle, 5 s after launch (phys_footprint) | ${mb(m.memory.idle.physFootprint)} |`,
      `| Memory after the list and every overlay (phys_footprint) | ${mb(m.memory.used.physFootprint)} |`,
      m.scroll?.cpuMs
        ? `| App CPU time during ${m.scroll.flings} list flings (${(m.scroll.windowMs / 1000).toFixed(1)} s) | ${m.scroll.cpuMs.total.toFixed(0)} ms (main thread ${m.scroll.cpuMs.main.toFixed(0)}, JS thread ${m.scroll.cpuMs.js.toFixed(0)}) |`
        : `| Scrolling | not measured: ${m.scroll?.error ?? 'no data'} |`,
      m.scroll?.cpuMs ? `| Main-thread hangs during the flings | ${m.scroll.hangs} |` : null,
      '',
      `Overlays opened for the memory figure: ${m.memory.overlays.map((o) => `${o.overlay} ${o.error ? `(error: ${o.error})` : o.closed ? '' : '(did not close)'}`.trim()).join(', ')}.`,
      '',
      'Frame hitches were not measured: xctrace\'s Animation Hitches template fails on the simulator ("Hitches is not supported on this platform"). Startup is when VoiceOver could first read the screen, not first paint, which can be seconds earlier; timing first paint with a screen recording slowed the launches down, so it isn\'t reported.',
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
  writeFileSync(new URL(`../results/${app}/ios-metrics.md`, import.meta.url), lines.filter((l) => l !== null).join('\n'));
}
