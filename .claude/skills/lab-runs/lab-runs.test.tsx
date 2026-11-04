import { expect, test } from 'claude-code/testing'

const PANE = {
  plugin: 'lab-runs',
  component: 'Pane',
  requestId: 'lab-runs',
  props: {
    title: 'Lab runs',
    isFocused: false,
    bodyColumns: 120,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 60 },
    view: {},
  },
} as const

const APPS = ['baseline', 'unistyles', 'uniwind', 'nativewind', 'tamagui', 'gluestack', 'heroui', 'reusables']

test('a re-render run shows each app: done, skipped, running, pending', async ($, on) => {
  const now = Date.now()
  const written: Record<string, number> = { baseline: now, unistyles: now - 3600000, uniwind: now, nativewind: now }

  on('command.register', () => ({ value: { command: 'lab-runs' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.status', () => ({ value: undefined }))
  on('clock.every', () => ({ value: undefined }))
  on('session.root', () => ({ value: '/lab' }))
  on('process.run', (_, e) => ({
    value: {
      stdout: e.argv[0] === 'ps' ? '  40  1    20:00 /bin/zsh -c for a in ...\n  41 40    10:00 node /lab/scripts/rerender-run.mjs tamagui dev.asimmalik.tamagui R5CXA2TFTKP\n' : '=== tamagui\n',
      stderr: '',
      exitCode: 0,
      isStdoutTruncated: false,
      isStderrTruncated: false,
    },
  }))
  on('fs.list', (_, e) => {
    const app = APPS.find(a => e.path === `/lab/results/${a}`)
    if (e.path === '/lab/results') return { value: [] }
    if (!app) throw new Error('missing')
    const t = written[app]
    return { value: t ? [{ name: 'android-metrics.json', kind: 'file', size: 1, mtimeMs: t, isLink: false }] : [] }
  })
  on('fs.read', (_, e) => {
    const app = APPS.find(a => e.path.includes(`/${a}/`)) ?? ''
    const date = new Date(written[app] ?? 0).toISOString()
    return { value: JSON.stringify({ date: new Date(now - 2 * 86400000).toISOString(), startup: { median: 2800 }, rerenders: { date, switches: [{ renders: 294 }] } }) }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('command.run', () => ({ text: '' }))

  await $.session.start({ cwd: '/lab', surface: 'desktop', isInteractive: true })
  await $.command.run({ command: 'lab-runs' })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect((await ui.find({ type: 'Text', text: /rerender · tamagui/ }))?.text).toBe('rerender · tamagui · 10:00')
    expect((await ui.find({ type: 'Text', text: /apps done/ }))?.text).toMatch(/3\/8 apps done · tamagui step/)
    expect(await ui.findAll({ type: 'Text', text: /^294r$/ })).toHaveLength(3)
    expect(await ui.findAll({ type: 'Text', text: /^✗$/ })).toHaveLength(1)
    expect((await ui.find({ type: 'Text', text: /^▶/ }))?.text).toBe('▶ 10:00')
    expect((await ui.find({ type: 'Text', text: /^=== tamagui$/ }))?.text).toBe('=== tamagui')
    await ui.unmount()
  }
})
