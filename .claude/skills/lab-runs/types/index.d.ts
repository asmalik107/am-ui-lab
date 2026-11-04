export type Proc = { device: string; check: string; app: string; seconds: number; runSeconds: number }
export type Run = { since: number; last: number }
export type Result = { t: number; s: string }

declare module 'claude-code' {
  interface PluginState {
    'lab-runs': {
      procs: Shaped<Proc[]>
      runs: Shaped<Record<string, Run>>
      results: Shaped<Record<string, Record<string, Result>>>
      log: Shaped<string[]>
    }
  }
}
