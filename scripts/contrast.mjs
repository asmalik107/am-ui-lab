// Checks WCAG 2.2 contrast for the token pairs every app uses.
// Usage: node scripts/contrast.mjs
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../shared/tokens.ts', import.meta.url), 'utf8');
const themes = {};
for (const m of src.matchAll(/(light|dark|brand): \{([^}]*)\}/g)) {
  themes[m[1]] = Object.fromEntries([...m[2].matchAll(/(\w+): '(#[0-9A-F]{6})'/gi)].map((x) => [x[1], x[2]]));
}
const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// [foreground, background, minimum] — 4.5 for text (SC 1.4.3), 3 for UI parts (SC 1.4.11)
const pairs = [
  ['text', 'background', 4.5], ['text', 'surface', 4.5], ['text', 'surfaceRaised', 4.5],
  ['textMuted', 'background', 4.5], ['textMuted', 'surface', 4.5],
  ['onPrimary', 'primary', 4.5], ['onDanger', 'danger', 4.5],
  ['primary', 'background', 4.5], ['danger', 'background', 4.5], ['danger', 'surface', 4.5],
  ['border', 'background', 3], ['border', 'surface', 3], ['focus', 'background', 3], ['success', 'background', 3],
];
let fail = 0;
for (const [name, t] of Object.entries(themes)) {
  for (const [fg, bg, min] of pairs) {
    const r = ratio(t[fg], t[bg]);
    const ok = r >= min;
    if (!ok) fail++;
    console.log(`${ok ? 'pass' : 'FAIL'}  ${name.padEnd(5)} ${fg} on ${bg}: ${r.toFixed(2)} (min ${min})`);
  }
}
process.exit(fail ? 1 : 0);
