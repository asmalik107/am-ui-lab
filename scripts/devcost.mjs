// Developer-cost counts for every app, each from a command that can be re-run.
// Usage: node scripts/devcost.mjs
// Output: results/devcost.json and results/devcost.md
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const apps = ['baseline', 'unistyles', 'uniwind', 'nativewind', 'tamagui', 'gluestack', 'heroui', 'reusables'];
// Where each kit's CLI copies its components into the app. Lines there were
// written by the library, not by hand, so they're counted separately.
const copied = { gluestack: 'components/ui', reusables: 'src/components/ui' };

const files = (dir, test) => {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true }).map((f) => join(dir, f)).filter((f) => statSync(f).isFile() && test(f));
};
const lines = (fs) => fs.reduce((n, f) => n + readFileSync(f, 'utf8').split('\n').filter((l) => l.trim()).length, 0);
const tsx = (f) => /\.(tsx?|jsx?)$/.test(f);

// Config: files at the app root, plus CSS and .d.ts files in src/, that are
// new or differ from the baseline's. Lockfiles, app.json and package.json are
// left out: every app changes those.
const configFiles = (app) => {
  const dir = join(root, 'apps', app);
  const skip = new Set(['package.json', 'package-lock.json', 'app.json', 'NOTES.md', 'expo-env.d.ts', 'uniwind-types.d.ts']);
  const candidates = [
    ...readdirSync(dir).filter((f) => statSync(join(dir, f)).isFile() && !skip.has(f)),
    ...files(join(dir, 'src'), (f) => /\.(css|d\.ts)$/.test(f) && !f.endsWith('uniwind-types.d.ts')).map((f) => f.slice(dir.length + 1)),
  ];
  return candidates.filter((f) => {
    const base = join(root, 'apps/baseline', f);
    return !existsSync(base) || readFileSync(base, 'utf8') !== readFileSync(join(dir, f), 'utf8');
  });
};

// Numbered entries under a NOTES.md heading (list items "1." or table rows "| 1 |").
const notesCount = (app, heading) => {
  const f = join(root, 'apps', app, 'NOTES.md');
  if (!existsSync(f)) return null;
  let on = false;
  let n = 0;
  for (const l of readFileSync(f, 'utf8').split('\n')) {
    if (/^## /.test(l)) on = heading.test(l);
    else if (on && /^(\d+\. |\| *\d+ *\|)/.test(l)) n++;
  }
  return n;
};

// Hand-written accessibility: role/aria-*/accessibility* props in the app's own
// source (not the copied kit components).
const a11yProps = (app) => {
  const dir = join(root, 'apps', app, 'src');
  const own = files(dir, (f) => tsx(f) && !(copied[app] && f.includes(join(root, 'apps', app, copied[app]))));
  return own.reduce((n, f) => n + (readFileSync(f, 'utf8').match(/\s(role|aria-[a-z]+|accessib[a-zA-Z]+|importantForAccessibility)=/g) ?? []).length, 0);
};

const tscErrors = (app) => {
  let out = '';
  try {
    execFileSync('npx', ['tsc', '--noEmit'], { cwd: join(root, 'apps', app), encoding: 'utf8', stdio: 'pipe' });
  } catch (err) {
    out = String(err.stdout ?? '');
  }
  const errs = out.split('\n').filter((l) => /error TS\d+/.test(l));
  return { all: errs.length, src: errs.filter((l) => l.startsWith('src/') && !(copied[app] && l.startsWith(copied[app]))).length };
};

const rows = apps.map((app) => {
  const dir = join(root, 'apps', app);
  const ownSrc = files(join(dir, 'src'), (f) => tsx(f) && !(copied[app] && f.startsWith(join(dir, copied[app]))));
  return {
    app,
    screenLines: lines(ownSrc),
    copiedLines: copied[app] ? lines(files(join(dir, copied[app]), tsx)) : 0,
    configFiles: configFiles(app),
    setupSteps: notesCount(app, /setup/i),
    errorsHit: notesCount(app, /error/i),
    tsc: tscErrors(app),
    a11yProps: a11yProps(app),
  };
});

const how = {
  screenLines: "Non-blank lines in the app's own src/ .ts/.tsx files (kit components copied by a CLI excluded)",
  copiedLines: "Non-blank lines the kit's CLI copied into the app (gluestack components/ui, Reusables src/components/ui)",
  configFiles: "Files at the app root, plus .css and .d.ts files in src/, that are new or differ from the baseline's (package.json, lockfile, app.json and generated uniwind-types.d.ts left out)",
  setupSteps: 'Numbered steps under the setup heading of NOTES.md (as written; each app\'s notes break steps up differently)',
  errorsHit: 'Numbered entries under the errors heading of NOTES.md',
  tsc: '`npx tsc --noEmit` errors: all, and those in src/ outside copied kit code',
  a11yProps: "role=, aria-*=, accessibility*= and importantForAccessibility= props in the app's own src/ (kit components excluded)",
};
writeFileSync(join(root, 'results/devcost.json'), JSON.stringify({ date: new Date().toISOString().slice(0, 10), how, rows }, null, 2) + '\n');
const md = [
  '# Developer cost',
  '',
  `Counted ${new Date().toISOString().slice(0, 10)} with \`scripts/devcost.mjs\`.`,
  '',
  '| App | Own source lines | Copied kit lines | Config files | Setup steps | Errors hit | tsc errors (src/ / all) | Hand-written a11y props |',
  '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ...rows.map((r) => `| ${r.app} | ${r.screenLines} | ${r.copiedLines} | ${r.configFiles.length} | ${r.setupSteps ?? 'no NOTES'} | ${r.errorsHit ?? 'no NOTES'} | ${r.tsc.src} / ${r.tsc.all} | ${r.a11yProps} |`),
  '',
  ...Object.entries(how).map(([k, v]) => `- **${k}:** ${v}`),
  '',
  ...rows.map((r) => `- ${r.app} config files: ${r.configFiles.join(', ') || 'none'}`),
  '',
].join('\n');
writeFileSync(join(root, 'results/devcost.md'), md);
console.log(md);
