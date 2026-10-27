// iOS JS bundle size: the main Hermes bytecode file from `npx expo export
// --platform ios`, as measured since 22 October.
// Usage: node scripts/bundle-size.mjs <app>
// Output: results/<app>/bundle.json
import { execFileSync } from 'node:child_process';
import { readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = process.argv[2];
if (!app) {
  console.error('Usage: node scripts/bundle-size.mjs <app>');
  process.exit(1);
}
const cwd = fileURLToPath(new URL(`../apps/${app}/`, import.meta.url));
const out = join(tmpdir(), `uilab-export-${app}`);
rmSync(out, { recursive: true, force: true });
execFileSync('npx', ['expo', 'export', '--platform', 'ios', '--output-dir', out], { cwd, stdio: 'ignore' });
const dir = join(out, '_expo/static/js/ios');
const hbc = readdirSync(dir).filter((f) => f.endsWith('.hbc')).map((f) => ({ f, size: statSync(join(dir, f)).size })).sort((a, b) => b.size - a.size)[0];
const result = { app, iosHbcBytes: hbc.size, date: new Date().toISOString().slice(0, 10), how: `npx expo export --platform ios, main Hermes bytecode file (${hbc.f.replace(/-[0-9a-f]+\.hbc$/, '-*.hbc')}), test screen with items 1–19` };
writeFileSync(new URL(`../results/${app}/bundle.json`, import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log(result);
