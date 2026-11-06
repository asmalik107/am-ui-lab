// Builds site/og.png, the 1200 × 630 image a link preview shows (Slack,
// LinkedIn, X, iMessage): the site's name and headline beside the README's
// hero chart (docs/hero.svg, from scripts/readme-tables.mjs). Previews don't
// accept SVG, so the layout is drawn as HTML and screenshotted by headless
// Chrome. Run it again after the hero chart changes.
// Usage: node scripts/og-image.mjs
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { headline } from './scorecard.mjs';

const root = new URL('../', import.meta.url);
const chrome = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!existsSync(chrome)) {
  console.error(`Chrome not found at ${chrome}. Set CHROME to a Chrome or Chromium binary.`);
  process.exit(1);
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// The chart's dark-mode rule is switched off, so it keeps its light colours
// whatever the machine's appearance is.
const hero = readFileSync(new URL('docs/hero.svg', root), 'utf8')
  .replace(/<svg /, '<svg class="hero" ')
  .replace(/@media \(prefers-color-scheme: dark\)/g, '@media not all');
const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
body { background: #f6f5f1; color: #18181b; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; display: grid; grid-template-columns: 420px 1fr; align-items: center; gap: 24px; padding: 0 48px 0 64px; box-sizing: border-box; }
h1 { font-size: 54px; line-height: 1.05; margin: 0 0 20px; letter-spacing: -.02em; }
p { font-size: 25px; line-height: 1.35; color: #5d5a55; margin: 0 0 16px; }
p strong { color: #18181b; }
.bar { width: 64px; height: 6px; border-radius: 3px; background: #4f46e5; margin-bottom: 28px; }
.hero { width: 100%; height: auto; background: #fff; border-radius: 16px; box-shadow: 0 8px 24px rgba(24, 24, 27, .08); }
</style></head><body>
<div><div class="bar"></div><h1>React Native UI Lab</h1>
<p>8 UI libraries compared on accessibility, theming speed and memory.</p>
${headline.map(([where, what]) => `<p><strong>${esc(where)}:</strong> ${esc(what)}.</p>`).join('\n')}</div>
<div>${hero}</div>
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'uilab-og-'));
const page = join(dir, 'og.html');
writeFileSync(page, html);
const out = fileURLToPath(new URL('site/og.png', root));
execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1200,630', `--screenshot=${out}`, `file://${page}`], { stdio: 'ignore' });
rmSync(dir, { recursive: true, force: true });
console.log(`site/og.png: 1200 × 630, from docs/hero.svg`);
