// Timing shared by every lab app, identical in each. It times from a user
// action to the second frame after the resulting update, and works in release
// builds, where React's Profiler callbacks don't run. <PerfReadout /> shows the
// results as text so scripts/perf-run.mjs can read them from the accessibility tree.
import { useRef, useSyncExternalStore } from 'react';
import { Text, View } from 'react-native';

let start = 0;
const results: Record<string, number> = {};
const listeners = new Set<() => void>();

export function mark() {
  start = performance.now();
}

// Call right after the state change (theme) or in the first layout (list).
// Two frames: the first rAF can run before the commit has been drawn.
export function measure(key: string) {
  const from = start;
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      results[key] = performance.now() - from;
      listeners.forEach((l) => l());
    }),
  );
}

// Times the first layout of the list after mark(). One per mount.
export function useListMeasure() {
  const done = useRef(false);
  return () => {
    if (done.current) return;
    done.current = true;
    measure('list');
  };
}

function usePerf(key: string) {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => results[key],
  );
}

const fmt = (name: string, ms: number | undefined) => `${name}: ${ms == null ? 'not measured' : `${ms.toFixed(1)} ms`}`;

// Rendered once in the root layout, above every screen, unstyled so it costs
// the same in every app.
export function PerfReadout() {
  const theme = usePerf('theme');
  const list = usePerf('list');
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 54, left: 4, opacity: 0.6 }}>
      <Text testID="perf-theme" style={{ fontSize: 9, color: '#888' }}>{fmt('Theme switch', theme)}</Text>
      <Text testID="perf-list" style={{ fontSize: 9, color: '#888' }}>{fmt('List mount', list)}</Text>
    </View>
  );
}
