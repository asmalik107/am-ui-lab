import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Proc, Result, Run } from '../types'

const PANE = 'lab-runs'
const APPS = ['baseline', 'unistyles', 'uniwind', 'nativewind', 'tamagui', 'gluestack', 'heroui', 'reusables']
const STEPS = [
  { id: 'light', file: 'a11y' },
  { id: 'dark', file: 'a11y-dark' },
  { id: 'brand', file: 'a11y-brand' },
  { id: 'textsize', file: 'textsize' },
  { id: 'motion', file: 'motion' },
  { id: 'perf', file: 'perf' },
  { id: 'metrics', file: 'metrics' },
  { id: 'rerender', file: 'metrics' },
]
const DEVICES = [
  { id: 'sim', label: 'Simulator', short: 'sim', prefix: 'ios' },
  { id: '00008101-001E44222298001E', label: 'iPhone 12 Pro', short: 'iPhone', prefix: 'iphone' },
  { id: 'R5CXA2TFTKP', label: 'Galaxy A15', short: 'A15', prefix: 'android' },
]
const RUN_SHOWN = 6 * 3600000
const LOG = `ls -t /private/tmp/claude-$(id -u)/*/*/tasks/*.output 2>/dev/null | head -40 | while read f; do grep -q '^=== ' "$f" && { tail -n 6 "$f"; break; }; done`

const deviceOf = (id: string) => DEVICES.find(d => d.id === id) ?? DEVICES[0]!
const stepOf = (check: string) => (check === 'a11y' ? 'light' : check.replace(/^a11y-/, ''))

const procs = atom({ plugin: 'lab-runs', key: 'procs' } as const, [] as Proc[], { shape: 'procs-2' })
const runs = atom({ plugin: 'lab-runs', key: 'runs' } as const, {} as Record<string, Run>, { shape: 'runs-2' })
const results = atom({ plugin: 'lab-runs', key: 'results' } as const, {} as Record<string, Record<string, Result>>, {
  shape: 'results-1',
})
const log = atom({ plugin: 'lab-runs', key: 'log' } as const, [] as string[], { shape: 'log-1' })
const parsed = new Map<string, { mtime: number; json: any }>()

const toSeconds = (etime: string) => {
  const [days = '0', rest = ''] = etime.includes('-') ? etime.split('-') : ['0', etime]
  return rest.split(':').reduce((sum, part) => sum * 60 + Number(part), 0) + Number(days) * 86400
}
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
const hhmm = (ms: number) => new Date(ms).toTimeString().slice(0, 5)
const age = (ms: number) => {
  const m = Math.round((Date.now() - ms) / 60000)
  return m < 60 ? `${m}m` : m < 2880 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`
}

const summary = (step: string, j: any, mtime: number): Result | undefined => {
  if (step === 'rerender') {
    if (!j.rerenders?.date) return
    const renders = (j.rerenders.switches ?? []).reduce((n: number, s: any) => n + (s.renders ?? 0), 0)
    return { t: Date.parse(j.rerenders.date), s: `${renders}r` }
  }
  const issues = (j.overlaps?.length ?? 0) + (j.offscreen?.length ?? 0)
  const s =
    step === 'textsize'
      ? issues === 0
        ? 'ok'
        : `${issues} iss`
      : step === 'motion'
        ? `${j.runs?.length ?? 0} runs`
        : step === 'perf'
          ? `${Math.round(j.theme?.median ?? 0)}ms`
          : step === 'metrics'
            ? `${((j.startup?.median ?? 0) / 1000).toFixed(1)}s`
            : `${(j.findings ?? []).filter((f: any) => f.pass).length}/${j.findings?.length ?? 0}`
  return { t: Date.parse(j.date) || mtime, s }
}

async function resultsDir($: EngineInterface) {
  const root = await $.session.root()
  for (const dir of [`${root}/results`, `${root}/am-ui-lab/results`]) {
    if (await $.fs.list(dir).then(() => true, () => false)) return dir
  }
}

async function pollProcs($: EngineInterface) {
  const { stdout } = await $.process.run(['ps', '-axo', 'pid=,ppid=,etime=,command='])
  const lines = stdout.split('\n').map(line => line.match(/^\s*(\d+)\s+(\d+)\s+(\S+)\s+(.*)$/)?.slice(1) ?? [])
  const elapsed = new Map(lines.map(([pid = '', , etime = '']) => [pid, toSeconds(etime)]))
  const seen: Proc[] = []
  for (const [, ppid = '', etime = '', command = ''] of lines) {
    const m = command.match(/^node \S*scripts\/([\w-]+)\.mjs (\w+) \S+ (\S+)(.*)$/)
    if (!m) continue
    const [, script = '', app = '', device = '', rest = ''] = m
    const theme = rest.match(/--theme (\w+)/)?.[1]
    const check = script.replace(/-(test|run|audit)$/, '') + (theme && theme !== 'light' ? `-${theme}` : '')
    const seconds = toSeconds(etime)
    seen.push({ device: deviceOf(device).id, check, app, seconds, runSeconds: elapsed.get(ppid) ?? seconds })
  }
  await update($, procs, () => seen)
  const now = Date.now()
  await update($, runs, old => {
    const next = { ...old }
    for (const p of seen) next[p.device] = { since: now - p.runSeconds * 1000, last: now }
    return next
  })
  const busy = seen.map(p => {
    const d = deviceOf(p.device)
    return `${d.short} ${stepOf(p.check)} · ${p.app} ${APPS.indexOf(p.app) + 1}/8 · ${clock(p.seconds)}`
  })
  $.ui.status(busy.length ? busy.join('  |  ') : undefined)
  const tail = await $.process.run(['sh', '-c', LOG]).catch(() => undefined)
  await update($, log, () => (tail?.stdout ?? '').split('\n').filter(Boolean))
}

async function pollFiles($: EngineInterface) {
  const dir = await resultsDir($)
  if (!dir) return
  const found: Record<string, Record<string, Result>> = {}
  for (const app of APPS) {
    const entries = await $.fs.list(`${dir}/${app}`).catch(() => [])
    for (const d of DEVICES) {
      const row: Record<string, Result> = {}
      for (const step of STEPS) {
        const name = `${d.prefix}-${step.file}.json`
        const entry = entries.find(e => e.name === name)
        if (!entry) continue
        const path = `${dir}/${app}/${name}`
        if (parsed.get(path)?.mtime !== entry.mtimeMs) {
          const json = await $.fs.read(path).then(JSON.parse, () => ({}))
          parsed.set(path, { mtime: entry.mtimeMs, json })
        }
        const result = summary(step.id, parsed.get(path)?.json ?? {}, entry.mtimeMs)
        if (result) row[step.id] = result
      }
      found[`${d.prefix}/${app}`] = row
    }
  }
  await update($, results, () => found)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command
      .register({ name: 'lab-runs', description: 'Show am-ui-lab runs, app by app' })
      .catch(() => {})
    $.clock.every(5000, () => void pollProcs($).catch(() => {}))
    $.clock.every(20000, () => void pollFiles($).catch(() => {}))
    void pollProcs($).catch(() => {})
    void pollFiles($).catch(() => {})
    void $.ui.open({ id: PANE, title: 'Lab runs' })
    return next(e)
  })

  on('command.run', { command: 'lab-runs' }, async $ => {
    await Promise.all([pollProcs($), pollFiles($)])
    await $.ui.open({ id: PANE, title: 'Lab runs' })
    return { text: 'Lab runs pane opened.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const [ps, rs, rows, lines] = [await read($, procs), await read($, runs), await read($, results), await read($, log)]
    const now = Date.now()
    const cell = (text: string, width: number, color?: string, bold?: boolean, sub?: string) => (
      <Box width={width} flexDirection="column">
        <Text color={color} dimColor={!color} bold={bold} tabular>
          {text}
        </Text>
        {sub !== undefined && (
          <Text dimColor tabular>
            {sub || ' '}
          </Text>
        )}
      </Box>
    )

    const grid = (d: (typeof DEVICES)[number], run: Run, p?: Proc) => {
      const res = (app: string, step: string) => rows[`${d.prefix}/${app}`]?.[step]
      const fresh = (app: string, step: string) => (res(app, step)?.t ?? 0) >= run.since
      const running = p && stepOf(p.check)
      const inRun = (step: string) => step === running || APPS.some(a => fresh(a, step))
      const steps = STEPS.filter(s => inRun(s.id) || APPS.some(a => res(a, s.id)))
      const ai = p ? APPS.indexOf(p.app) : -1
      const si = steps.findIndex(s => s.id === running)
      const ran = steps.filter(s => inRun(s.id))
      const done = APPS.filter(a => ran.length && ran.every(s => fresh(a, s.id))).length
      const finishes = APPS.flatMap(a => STEPS.map(s => res(a, s.id)?.t ?? 0)).filter(t => t >= run.since)
      const took = (t: number) => {
        const before = Math.max(run.since, ...finishes.filter(f => f < t))
        return `${Math.max(1, Math.round((t - before) / 60000))}m`
      }
      return (
        <Box flexDirection="column">
          <Text dimColor tabular>
            started {hhmm(run.since)} · {done}/8 apps done
            {p ? ` · ${p.app} step ${si + 1}/${steps.length}` : ` · idle since ${hhmm(run.last)}`}
          </Text>
          <Box flexDirection="row">
            {cell('', 11)}
            {steps.map(s => cell(s.id === 'textsize' ? 'text' : s.id === 'rerender' ? 'rerend' : s.id, 9, inRun(s.id) ? 'claude' : undefined))}
          </Box>
          {APPS.map((app, i) => (
            <Box flexDirection="row">
              {cell(app, 11, i === ai ? 'claude' : undefined, i === ai, '')}
              {steps.map((s, j) => {
                const x = res(app, s.id)
                if (p && app === p.app && s.id === running)
                  return cell(`▶ ${clock(p.seconds)}`, 9, 'claude', true, `from ${hhmm(now - p.seconds * 1000)}`)
                if (x && fresh(app, s.id)) return cell(x.s, 9, 'success', false, `${hhmm(x.t)} ${took(x.t)}`)
                if (p && inRun(s.id) && (i < ai || (i === ai && j < si))) return cell('✗', 9, 'error', false, '')
                if (inRun(s.id)) return cell('·', 9, undefined, false, '')
                return cell(x ? age(x.t) : '—', 9, undefined, false, '')
              })}
            </Box>
          ))}
        </Box>
      )
    }

    return (
      <Box flexDirection="column" gap="md">
        <Box flexDirection="column">
          <Text size="heading" bold>
            Lab runs
          </Text>
          <Text dimColor>Each device's run, app by app: results as they land, ▶ running, ✗ skipped or failed.</Text>
        </Box>

        <Box flexDirection="column" gap="sm">
          {DEVICES.map(d => {
            const p = ps.find(one => one.device === d.id)
            const run = rs[d.id]
            return (
              <Box
                flexDirection="column"
                borderStyle="round"
                borderColor={p ? 'claude' : 'subtle'}
                borderDimColor={!p}
                paddingX={1}
                gap="xs"
              >
                <Box flexDirection="row" justifyContent="space-between">
                  <Text bold color={p ? 'claude' : undefined}>
                    {p ? '●' : '○'} {d.label}
                  </Text>
                  <Text dimColor={!p} color={p ? 'claude' : undefined} tabular>
                    {p ? `${stepOf(p.check)} · ${p.app} · ${clock(p.seconds)}` : 'idle'}
                  </Text>
                </Box>
                {run && now - run.last < RUN_SHOWN && grid(d, run, p)}
              </Box>
            )
          })}
        </Box>

        {lines.length > 0 && (
          <Box flexDirection="column">
            <Text bold>Run log</Text>
            <Text dimColor tabular>
              {lines.join('\n')}
            </Text>
          </Box>
        )}
      </Box>
    )
  })
}
