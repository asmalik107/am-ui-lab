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
    // The iOS 27 section is the same three steps in every app, so it's left out.
    if (/^## /.test(l)) on = heading.test(l) && !/iOS 27/.test(l);
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
  screenLines: "Non-blank lines of TypeScript in the app's own src/ folder: the test screen, any components built by hand and the theme setup. Code a kit's CLI copied in isn't counted here.",
  copiedLines: "Non-blank lines a kit's CLI copied into the app (gluestack's components/ui, Reusables' src/components/ui). This code is now yours to maintain and fix. The other kits ship as npm packages, so they show 0.",
  configFiles: "Files at the app root, and .css or .d.ts files in src/, that are new or differ from the baseline app's (Babel, Metro, Tailwind, theme and type files). package.json, the lockfile and app.json are left out, because every app changes them.",
  setupSteps: "How many numbered steps the setup section of the app's NOTES.md lists. A rough guide only: each app's notes split steps differently. The iOS 27 step, the same in every app, is left out.",
  errorsHit: "How many problems came up while setting the app up and had to be worked around (a CLI that hung or overwrote files, docs that disagree with the code, wrong package versions), as listed in the app's NOTES.md. A count, not a measure of effort: one took two minutes, another twenty.",
  tscOwn: "TypeScript errors that npx tsc --noEmit reports in the app's own files.",
  tscKit: "TypeScript errors that npx tsc --noEmit reports in the files a kit's CLI copied in. The app still builds and runs, because Metro doesn't type-check, but the project's type-check fails until someone fixes code they didn't write.",
  a11yProps: "role, aria-*, accessibility* and importantForAccessibility props in the app's own code. Higher means more accessibility written by hand; the kits supply some of it themselves.",
};
writeFileSync(join(root, 'results/devcost.json'), JSON.stringify({ date: new Date().toISOString().slice(0, 10), how, rows }, null, 2) + '\n');
const md = [
  '# Developer cost',
  '',
  `Counted ${new Date().toISOString().slice(0, 10)} with \`scripts/devcost.mjs\`.`,
  '',
  '| App | Lines of screen code you write | Kit code copied into your app (lines) | Config files added or changed | Setup steps | Setup problems hit | Type errors in your own code | Type errors in copied kit code | Accessibility props written by hand |',
  '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ...rows.map((r) => `| ${r.app} | ${r.screenLines} | ${r.copiedLines} | ${r.configFiles.length} | ${r.setupSteps ?? 'n/a (reference app)'} | ${r.errorsHit ?? 'n/a (reference app)'} | ${r.tsc.src} | ${r.tsc.all - r.tsc.src} | ${r.a11yProps} |`),
  '',
  ...Object.entries(how).map(([k, v]) => `- **${k}:** ${v}`),
  '',
  ...rows.map((r) => `- ${r.app} config files: ${r.configFiles.join(', ') || 'none'}`),
  '',
].join('\n');
writeFileSync(join(root, 'results/devcost.md'), md);
console.log(md);
