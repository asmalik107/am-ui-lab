// Scripted iOS accessibility audit for one lab app, run on a booted simulator
// through the argent CLI. Every app is put through the same states and the
// same rules, and the raw accessibility trees are saved next to the report.
//
// Usage: node scripts/a11y-audit.mjs <app> <bundleId> <udid> [--theme light|dark|brand]
// Output: results/<app>/ios-a11y.json and .md for light (the default), and
// ios-a11y-<theme>.json and .md for dark and brand.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { deviceInfo } from './device.mjs';

const argv = process.argv.slice(2);
const ti = argv.indexOf('--theme');
const themeName = ti >= 0 ? argv.splice(ti, 2)[1] : 'light';
const [app, bundleId, udid] = argv;
const themes = ['light', 'dark', 'brand'];
if (!app || !bundleId || !udid || !themes.includes(themeName)) {
  console.error('Usage: node scripts/a11y-audit.mjs <app> <bundleId> <udid> [--theme light|dark|brand]');
  process.exit(1);
}
const suffix = themeName === 'light' ? '' : `-${themeName}`;
const device = deviceInfo(udid);

const copyOptions = ['30 seconds', '45 seconds', '60 seconds', '90 seconds', '2 minutes'];
// Items 15–19, as in shared/content.ts.
const copyPanel = 'Five minutes of easy cycling';
const menuItems = ['Duplicate', 'Share', 'Archive'];
const segOptions = ['Week', 'Month', 'Year'];
const MIN_TARGET = 44; // Apple HIG default control size, in points
const outDir = new URL(`../results/${app}/`, import.meta.url);
mkdirSync(outDir, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const argent = (tool, args) =>
  JSON.parse(execFileSync('argent', ['run', tool, '--json', '--args', JSON.stringify({ udid, ...args })], { encoding: 'utf8', maxBuffer: 64 << 20 }));

// Two trees are read. native-describe-screen gives iOS traits and frames in
// points, but it walks the whole view hierarchy, including views VoiceOver
// can't reach behind a modal. describe reads the system accessibility tree,
// which is what VoiceOver gets: it is used for everything about reachability
// (what is exposed while an overlay is open) and for tap coordinates.
let screen;
function tree() {
  // The inspector can return no elements while the app is still launching.
  for (let i = 0; i < 20; i++) {
    let d;
    try {
      d = argent('native-describe-screen', { bundleId });
    } catch {
      d = null;
    }
    if (d?.elements?.length) {
      screen = d.screenFrame;
      return d.elements;
    }
    execFileSync('sleep', ['1']);
  }
  throw new Error('native-describe-screen returned no elements');
}
function axTree() {
  const text = argent('describe', {}).description;
  const els = [];
  for (const line of text.split('\n')) {
    const m = line.match(/^\s+(AX\w+)(?: "((?:[^"\\]|\\.)*)")?(?: value="((?:[^"\\]|\\.)*)")?(?: id="([^"]*)")?\s+\(([\d.]+), ([\d.]+), ([\d.]+), ([\d.]+)\)/);
    if (!m) continue;
    const [x, y, w, h] = m.slice(5, 9).map(Number);
    els.push({ role: m[1], label: m[2] ?? '', value: m[3], identifier: m[4], nx: x + w / 2, ny: y + h / 2, x, y, w, h });
  }
  return els;
}
const byId = (els, id) => els.find((e) => e.identifier === id);
const tap = (e) => argent('gesture-tap', { x: e.nx, y: e.ny });
const swipe = (dy) => argent('gesture-swipe', { fromX: 0.5, fromY: 0.5 + dy / 2, toX: 0.5, toY: 0.5 - dy / 2, momentum: false, durationMs: 300 });

// Scrolls until the element is comfortably on screen in the system tree.
async function reach(id) {
  for (let i = 0; i < 14; i++) {
    const e = byId(axTree(), id);
    if (e && e.y > 0.12 && e.y + e.h < 0.92) return e;
    const n = byId(tree(), id);
    if (!n) {
      // Not in the view-hierarchy walk: look for it in the system tree instead.
      const a = typeof scan === 'function' ? await scan(id) : null;
      if (a) return a;
      throw new Error(`element ${id} not in tree`);
    }
    swipe(n.frame.y / screen.height <= 0.12 ? -0.35 : 0.35);
    await sleep(400);
  }
  throw new Error(`could not scroll ${id} into view`);
}
const tapId = async (id) => tap(await reach(id));
async function waitFor(pred, ms = 4000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const els = axTree();
    if (pred(els)) return els;
    await sleep(250);
  }
  return null;
}
const hasLabel = (els, text) => els.some((e) => (e.label ?? '').includes(text));

const states = {};
const findings = [];
const add = (component, check, pass, detail) => findings.push({ component, check, pass, detail });

// Name, role and value of an element, read back the way the report prints it.
const desc = (e) => (e ? `label="${e.label ?? ''}" value="${e.value ?? ''}" traits=[${e.traits.join(', ')}] ${Math.round(e.frame.width)}×${Math.round(e.frame.height)}pt` : 'missing');

// Each overlay test starts from a fresh launch, so an overlay that fails to
// close can't affect the next test. A restart resets the app to the light
// theme, so for dark and brand the theme radio is tapped after every launch,
// and the screen is scrolled back to the top so every test starts the same way.
async function fresh() {
  argent('restart-app', { bundleId });
  await waitFor((els) => hasLabel(els, 'Component test screen'), 60000);
  await sleep(800);
  if (themeName === 'light') return;
  await tapId(`test-theme-${themes.indexOf(themeName)}`);
  await sleep(800);
  for (let i = 0; i < 3; i++) swipe(-0.6);
  await sleep(600);
  // One screenshot per run shows the theme really was applied.
  if (!shot) {
    shot = `a11y-${themeName}.png`;
    execFileSync('argent', ['run', 'screenshot', '--udid', udid, '--scale', '0.5', '--out', fileURLToPath(new URL(shot, outDir))]);
  }
}
let shot;
await fresh();

// 1. Main screen: name, role, state and target size of every control.
const main = tree();
states.main = main;
const expect = [
  ['Button', 'test-button', (e) => e.traits.includes('button')],
  ['Button (disabled)', 'test-button-disabled', (e) => e.traits.includes('button') && e.traits.includes('notEnabled')],
  ['Button (loading)', 'test-button-loading', (e) => e.traits.includes('button') && /busy|progress|loading/i.test(`${e.label} ${e.value}`)],
  ['Text field', 'test-textfield', (e) => /Email/.test(e.label ?? '')],
  ['Switch', 'test-switch', (e) => (e.traits.includes('toggleButton') || /switch/i.test(e.value ?? '')) && /Workout reminders/.test(e.label ?? '') && e.value != null],
  ['Checkbox', 'test-checkbox', (e) => /checkbox/i.test(`${e.value} ${e.traits}`) && /(un)?checked|not checked|0|1/i.test(e.value ?? '') && /agree/i.test(e.label ?? '')],
  ['Radio option', 'test-radiogroup-0', (e) => /radio/i.test(`${e.value} ${e.traits}`) && /checked|selected|1/i.test(`${e.value} ${e.traits}`)],
  ['Select trigger', 'test-select', (e) => /Rest time/.test(`${e.label} ${e.value}`) && /60 seconds/.test(`${e.label} ${e.value}`) && (e.traits.includes('button') || /pop up|combo|menu|collapsed/i.test(`${e.value} ${e.traits}`))],
  ['Tab (selected)', 'test-tabs-0', (e) => e.traits.includes('selected') && (e.traits.includes('button') || /tab/i.test(`${e.value} ${e.label}`))],
  ['Native switch (@expo/ui)', 'test-native-switch', (e) => e.traits.includes('toggleButton') || e.value != null],
];
for (const [name, id, rule] of expect) {
  const e = byId(main, id);
  add(name, 'name, role, state', !!e && rule(e), desc(e));
  if (e && !name.startsWith('Text')) {
    const small = Math.min(e.frame.width, e.frame.height) < MIN_TARGET;
    add(name, `target ≥ ${MIN_TARGET}pt`, !small, `${Math.round(e.frame.width)}×${Math.round(e.frame.height)}pt`);
  }
}
const radios = main.filter((e) => /^test-radiogroup-\d$/.test(e.identifier ?? ''));
add('Radio group', 'all options exposed', radios.length === 3, `${radios.length} options found`);
add('Radio group', 'group label read', hasLabel(main, 'Experience level'), 'label text "Experience level" in tree');

// Anything from the main screen that is still in the system tree while an
// overlay is open can be reached by VoiceOver behind it.
const mainIds = new Set(main.filter((e) => e.identifier).map((e) => e.identifier));
const headings = ['Buttons', 'Form', 'Overlays', 'Tabs', 'More components', 'List', 'Native control (@expo/ui)', 'Component test screen'];
const leaks = (els, own) => els.filter((e) => (e.identifier && mainIds.has(e.identifier) && !own.includes(e.identifier)) || headings.includes(e.label));
const axDesc = (e) => (e ? `${e.role} label="${e.label}"${e.value != null ? ` value="${e.value}"` : ''}` : 'missing');
const leakDetail = (l) => (l.length ? `still exposed: ${l.map((e) => e.identifier ?? e.label).join(', ')}` : 'nothing behind it in the system tree');

// 2. Text field error: is the message present and linked to the field?
try {
  await tapId('test-textfield');
  await sleep(400);
  argent('keyboard', { text: 'not-an-email' });
  await tapId('test-button'); // moves focus away so the field validates on blur
  const errEls = await waitFor((els) => hasLabel(els, 'Enter a valid email'));
  states.textFieldError = errEls ?? axTree();
  const field = byId(tree(), 'test-textfield');
  add('Text field', 'error shown', !!errEls, errEls ? 'error text in tree' : 'no error text after blur');
  add('Text field', 'error reachable from field', !!field && /valid email/i.test(`${field.label} ${field.value ?? ''} ${field.hint ?? ''}`), `${desc(field)} hint="${field?.hint ?? ''}"`);
} catch (err) {
  // A missing element is a result too: record it and carry on.
  add('Text field', 'test could run', false, String(err.message ?? err));
}

// 3. Dialog: opens, hides the screen behind it, closes.
try {
  await fresh();
  await tapId('test-dialog-open');
  let dlg = await waitFor((els) => hasLabel(els, 'Delete this workout?'));
  if (dlg) { await sleep(1000); dlg = axTree(); } // judge the settled state, not the open animation
  states.dialog = dlg ?? axTree();
  add('Dialog', 'opens', !!dlg, dlg ? 'title in tree' : 'title not found');
  if (dlg) {
    const l = leaks(dlg, ['test-dialog', 'test-dialog-confirm', 'test-dialog-cancel']);
    add('Dialog', 'screen behind is hidden from VoiceOver', l.length === 0, leakDetail(l));
    const title = dlg.find((e) => e.label.includes('Delete this workout?'));
    add('Dialog', 'title is a heading', title?.role === 'AXHeading', axDesc(title));
    const cancel = dlg.find((e) => e.identifier === 'test-dialog-cancel' || e.label === 'Cancel');
    add('Dialog', 'actions are buttons', cancel?.role === 'AXButton', axDesc(cancel));
    if (cancel) tap(cancel);
    const closed = await waitFor((els) => !hasLabel(els, 'Delete this workout?'));
    add('Dialog', 'closes', !!closed, closed ? 'title gone' : 'still open');
  }
} catch (err) {
  // A missing element is a result too: record it and carry on.
  add('Dialog', 'test could run', false, String(err.message ?? err));
}

// 4. Bottom sheets. Every sheet the app has gets the same five checks: the
// shared one (test-sheet-*), plus @expo/ui's, Tamagui's own Sheet, gluestack's
// own BottomSheet and HeroUI's raw gorhom sheet where those apps have them.
// Open is detected by the title or the Close button, so a sheet whose text is
// hidden from VoiceOver still counts as open.
const sheetVariants = [
  { name: 'Bottom sheet', open: 'test-sheet-open', close: 'test-sheet-close' },
  { name: 'Bottom sheet (@expo/ui)', open: 'test-sheet-open-expoui', close: 'test-sheet-expoui-close' },
  { name: 'Bottom sheet (Tamagui Sheet)', open: 'test-sheet-open-tamagui', close: 'test-sheet-tamagui-close' },
  { name: 'Bottom sheet (@gorhom, raw)', open: 'test-sheet-open-gorhom', close: 'test-sheet-gorhom-close' },
  { name: 'Bottom sheet (gluestack BottomSheet)', open: 'test-sheet-open-gluestack', close: 'test-sheet-gluestack-close' },
];
for (const v of sheetVariants) {
  if (v.open !== 'test-sheet-open' && !byId(main, v.open)) continue; // app doesn't have this sheet
  try {
    await fresh();
    await tapId(v.open);
    const isSheet = (els) => hasLabel(els, 'Goblet squat') || els.some((e) => e.identifier === v.close);
    let sh = await waitFor(isSheet);
    if (sh) { await sleep(1000); sh = axTree(); }
    states[`sheet:${v.open}`] = sh ?? axTree();
    add(v.name, 'opens', !!sh, sh ? 'sheet content in tree' : 'neither title nor Close button found');
    if (sh) {
      add(v.name, 'title and body readable', hasLabel(sh, 'Goblet squat') && hasLabel(sh, 'kettlebell'), hasLabel(sh, 'Goblet squat') ? 'title in tree' : 'title and body text not in the system tree');
      const l = leaks(sh, [v.open.replace('-open', ''), v.close]);
      add(v.name, 'screen behind is hidden from VoiceOver', l.length === 0, leakDetail(l));
      const close = sh.find((e) => e.identifier === v.close) ?? sh.find((e) => e.label === 'Close');
      if (close) tap(close);
      const gone = await waitFor((els) => !isSheet(els));
      add(v.name, 'closes', !!gone, gone ? 'sheet gone' : 'still open');
      if (gone) {
        await sleep(500);
        const after = axTree();
        const back = after.some((e) => e.identifier && mainIds.has(e.identifier));
        add(v.name, 'screen reachable again after close', back, back ? 'screen controls back in system tree' : 'no screen controls in system tree after close');
      }
    }
  } catch (err) {
    add(v.name, 'test could run', false, String(err.message ?? err));
  }
}

// 5. Select: options exposed with role and state.
try {
  await fresh();
  await tapId('test-select');
  let sel = await waitFor((els) => hasLabel(els, '90 seconds'));
  if (sel) { await sleep(1000); sel = axTree(); }
  states.select = sel ?? axTree();
  add('Select', 'opens', !!sel, sel ? 'options in tree' : 'options not found');
  if (sel) {
    const opts = sel.filter((e) => e.identifier !== 'test-select' && copyOptions.some((o) => e.label.includes(o)));
    const current = opts.find((e) => e.label.includes('60 seconds'));
    add('Select', 'current option marked', !!current && /selected|checked/i.test(`${current.value} ${current.role}`), axDesc(current));
    add('Select', 'options are actionable', opts.length >= 5 && opts.every((e) => e.role === 'AXButton' || /radio|menu|option/i.test(`${e.value} ${e.role}`)), opts.map(axDesc).join(' | '));
    const l = leaks(sel, ['test-select']);
    add('Select', 'screen behind is hidden from VoiceOver', l.length === 0, leakDetail(l));
    const pick = opts.find((e) => e.label.includes('90 seconds'));
    if (pick) tap(pick);
    await sleep(1000);
    const s = byId(tree(), 'test-select');
    add('Select', 'new value read on trigger', !!s && /90 seconds/.test(`${s.label} ${s.value}`), desc(s));
  }
} catch (err) {
  // A missing element is a result too: record it and carry on.
  add('Select', 'test could run', false, String(err.message ?? err));
}

// 6. Toast: present in the system tree while visible.
try {
  await fresh();
  await tapId('test-toast-show');
  const toast = await waitFor((els) => hasLabel(els, 'Set logged'), 3000);
  states.toast = toast ?? axTree();
  add('Toast', 'in accessibility tree', !!toast, toast ? axDesc(toast.find((e) => e.label.includes('Set logged'))) : 'not found within 3s');
} catch (err) {
  // A missing element is a result too: record it and carry on.
  add('Toast', 'test could run', false, String(err.message ?? err));
}

// 7. Items 15–19: slider, progress, accordion, menu and segmented control.
// They run after the 39 core checks so those keep their order.
// System-tree frames come as 3-decimal fractions of the screen, so their
// sizes are only good to half a step (about ±0.4 pt on this screen); the
// check allows that much and says so.
const target = (name, e) => {
  if (!e) return;
  const tol = e.source ? 0.0005 * Math.max(screen.width, screen.height) : 0;
  const min = Math.min(e.frame.width, e.frame.height);
  add(name, `target ≥ ${MIN_TARGET}pt`, min >= MIN_TARGET - tol, `${Math.round(e.frame.width)}×${Math.round(e.frame.height)}pt${tol ? ` (system tree, ±${tol.toFixed(1)} pt)` : ''}`);
};
// Some kits' elements are in the system accessibility tree (what VoiceOver
// gets) but not in the view-hierarchy walk, e.g. Tamagui's Progress and its
// native SwiftUI menu button. For items 15–19 the system tree is used then:
// it gives role, label, value and frame, but not the selected state, and the
// detail says "(system tree)".
const axTraits = { AXButton: ['button'], AXAdjustable: ['adjustable'], AXHeading: ['header'], AXLink: ['link'], AXStaticText: ['staticText'], AXImage: ['image'] };
async function scan(id) {
  for (const dir of [0.35, -0.35]) {
    for (let i = 0; i < 14; i++) {
      const e = byId(axTree(), id);
      // Only once it's fully on screen, or its frame is clipped by the edge.
      if (e && e.y > 0.12 && e.y + e.h < 0.92) return e;
      swipe(e ? (e.y <= 0.12 ? -0.2 : 0.2) : dir);
      await sleep(400);
    }
  }
  return null;
}
async function element(id) {
  const n = byId(tree(), id);
  if (n) return n;
  const a = await scan(id);
  return a && { label: a.label, value: a.value, traits: axTraits[a.role] ?? [], frame: { width: a.w * screen.width, height: a.h * screen.height }, source: 'system tree' };
}
const desc2 = (e) => (e ? `${desc(e)}${e.source ? ` (${e.source})` : ''}` : 'missing');
const valueOf = async (id) => (await element(id))?.value;
try {
  await fresh();
  const sl = await element('test-slider');
  add('Slider', 'name, role, value', !!sl && sl.traits.includes('adjustable') && /Weight/.test(sl.label ?? '') && /\d/.test(sl.value ?? ''), desc2(sl));
  target('Slider', sl);
  // VoiceOver's swipe up (the increment action) can't be performed on the
  // simulator without VoiceOver running, so the thumb is dragged instead.
  const e = await reach('test-slider');
  const before = await valueOf('test-slider');
  argent('gesture-swipe', { fromX: e.x + e.w * 0.1, fromY: e.ny, toX: e.x + e.w * 0.9, toY: e.ny, momentum: false, durationMs: 600 });
  await sleep(600);
  const after = await valueOf('test-slider');
  add('Slider', 'dragging changes the value', before !== after && after != null, `value "${before ?? ''}" → "${after ?? ''}"`);
} catch (err) {
  add('Slider', 'test could run', false, String(err.message ?? err));
}

try {
  await fresh();
  const pr = await element('test-progress');
  add('Progress', 'name and value', !!pr && /Workout progress/.test(pr.label ?? '') && !!pr.value, desc2(pr));
} catch (err) {
  add('Progress', 'test could run', false, String(err.message ?? err));
}

try {
  await fresh();
  const h0 = await element('test-accordion-0');
  add('Accordion', 'header is a button', !!h0 && h0.traits.includes('button'), desc2(h0));
  target('Accordion', h0);
  const shut = (v) => !/\bexpanded/i.test(v ?? '');
  await tapId('test-accordion-0');
  const shown = await waitFor((els) => hasLabel(els, copyPanel));
  await sleep(500);
  const open = await element('test-accordion-0');
  add('Accordion', 'expanded state exposed', !!h0 && shut(`${h0.value} ${h0.label}`) && !shut(`${open?.value} ${open?.label}`), `closed: ${desc2(h0)}; open: ${desc2(open)}`);
  await tapId('test-accordion-0');
  const hidden = await waitFor((els) => !hasLabel(els, copyPanel));
  add('Accordion', 'content shows and hides', !!shown && !!hidden, `${shown ? 'panel text appeared' : 'panel text never appeared'}; ${hidden ? 'gone after second tap' : 'still there after second tap'}`);
} catch (err) {
  add('Accordion', 'test could run', false, String(err.message ?? err));
}

try {
  await fresh();
  const trig = await element('test-menu-open');
  add('Menu', 'trigger name and role', !!trig && trig.traits.includes('button') && /Workout options/.test(trig.label ?? ''), desc2(trig));
  target('Menu', trig);
  await tapId('test-menu-open');
  let mn = await waitFor((els) => menuItems.every((m) => hasLabel(els, m)));
  if (mn) { await sleep(1000); mn = axTree(); }
  states.menu = mn ?? axTree();
  add('Menu', 'opens', !!mn, mn ? 'all three actions in tree' : 'actions not found');
  if (mn) {
    const items = menuItems.map((m) => mn.find((e) => e.label.includes(m)));
    add('Menu', 'items are buttons', items.every((e) => e && (e.role === 'AXButton' || /menu/i.test(e.role))), items.map(axDesc).join(' | '));
    const l = leaks(mn, ['test-menu-open', 'test-menu']);
    add('Menu', 'screen behind is hidden from VoiceOver', l.length === 0, leakDetail(l));
    if (items[0]) tap(items[0]);
    const closed = await waitFor((els) => !hasLabel(els, menuItems[2]));
    add('Menu', 'closes after an action', !!closed, closed ? 'actions gone' : 'still open');
  }
} catch (err) {
  add('Menu', 'test could run', false, String(err.message ?? err));
}

try {
  await fresh();
  const opts = [];
  for (const i of [0, 1, 2]) opts.push(await element(`test-segmented-${i}`));
  const role = (e) => e.traits.includes('button') || /radio|tab|segment/i.test(`${e.value} ${e.traits}`);
  const sel = (e) => !!e && (e.traits.includes('selected') || /selected|checked/i.test(e.value ?? ''));
  add('Segmented control', 'options have name and role', opts.every((e, i) => e && e.label?.includes(segOptions[i]) && role(e)), opts.map(desc2).join(' | '));
  add('Segmented control', 'selected option marked', sel(opts[0]) && !sel(opts[1]), opts.map(desc2).join(' | '));
  target('Segmented control', opts[0]);
  await tapId('test-segmented-1');
  await sleep(600);
  const now = [await element('test-segmented-0'), await element('test-segmented-1')];
  add('Segmented control', 'selection moves on tap', sel(now[1]) && !sel(now[0]), now.map(desc2).join(' | '));
} catch (err) {
  add('Segmented control', 'test could run', false, String(err.message ?? err));
}

writeFileSync(new URL(`ios-a11y${suffix}.json`, outDir), JSON.stringify({ app, bundleId, udid, device, theme: themeName, date: new Date().toISOString(), findings, states }, null, 2));
const passed = findings.filter((f) => f.pass).length;
const md = [
  `# ${app}: iOS accessibility audit, ${themeName} theme`,
  '',
  `Run ${new Date().toISOString().slice(0, 10)} on the ${device.name} simulator (${device.runtime}, ${udid}), ${process.env.BUILD_CONFIG ?? 'Release'} build, ${themeName} theme, with \`scripts/a11y-audit.mjs\`. ${passed}/${findings.length} checks passed.`,
  '',
  'Traits and sizes come from the view hierarchy (argent `native-describe-screen`). Reachability (what is exposed while an overlay is open) and taps come from the system accessibility tree (argent `describe`). Both show what VoiceOver is given, not what it speaks; spoken output needs a device.',
  '',
  '| Component | Check | Result | Detail |',
  '| --- | --- | --- | --- |',
  ...findings.map((f) => `| ${f.component} | ${f.check} | ${f.pass ? 'pass' : '**fail**'} | ${String(f.detail).replace(/\|/g, '\\|')} |`),
  '',
].join('\n');
writeFileSync(new URL(`ios-a11y${suffix}.md`, outDir), md);
console.log(md);
