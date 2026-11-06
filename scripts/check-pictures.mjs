// Small drawn diagrams of each accessibility check: what passing looks like
// next to what failing looks like, drawn as the component the check tests,
// with the test screen's own copy (shared/content.ts). Shared by
// scripts/checks-md.mjs (standalone SVG files in docs/checks/pictures/) and
// scripts/site.mjs (inlined, coloured by the site's own theme variables).
//
// One visual language throughout:
// - the rounded panel is the phone screen,
// - the thick dashed outline is where the screen reader's focus is,
// - a pink dot is a finger tap,
// - the bubble under each screen is what the screen reader is given.

const W = 530; // two panels of 250, 10 apart, 10 margin
const H = 284;
const SY = 34; // screen top inside a panel
const SW = 250;
const SH = 150;

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// --- Primitives. Coordinates are inside the screen (0..250, 0..150).
const rect = (x, y, w, h, cls, rx = 6) => `<rect x="${x}" y="${SY + y}" width="${w}" height="${h}" rx="${rx}" class="${cls}"/>`;
const circle = (x, y, r, cls) => `<circle cx="${x}" cy="${SY + y}" r="${r}" class="${cls}"/>`;
const path = (d, cls) => `<path d="${d}" class="${cls}" transform="translate(0 ${SY})"/>`;
const text = (x, y, s, cls = 'cp-t', anchor = 'start') => `<text x="${x}" y="${SY + y}" class="${cls}" text-anchor="${anchor}">${esc(s)}</text>`;
const focus = ([x, y, w, h], pad = 4) => rect(x - pad, y - pad, w + pad * 2, h + pad * 2, 'cp-focus', pad + 5);
const ghost = ([x, y, w, h]) => rect(x - 4, y - 4, w + 8, h + 8, 'cp-ghost', 9);
const finger = (x, y) => circle(x, y, 9, 'cp-finger');
const dim = () => rect(0, 0, SW, SH, 'cp-dim', 14);
const chevron = (x, y, up = false) => path(up ? `M${x - 5} ${y + 3} L${x} ${y - 2} L${x + 5} ${y + 3}` : `M${x - 5} ${y - 2} L${x} ${y + 3} L${x + 5} ${y - 2}`, 'cp-stroke');
const lines = (x, y, widths) => widths.map((w, i) => rect(x, y + i * 10, w, 5, 'cp-line', 2.5)).join('');
const center = ([x, y, w, h]) => [x + w / 2, y + h / 2];

// --- Components, each drawn as it looks on the test screen. Each returns
// { s: svg, b: named boxes [x, y, w, h] for focus and taps }.
const button = (x, y, w, h, label, { disabled = false, busy = false, destructive = false } = {}) => {
  const fill = disabled ? 'cp-off' : destructive ? 'cp-danger' : 'cp-btn';
  const ink = disabled ? 'cp-muted' : 'cp-inv';
  const s = rect(x, y, w, h, fill, 10)
    + (busy ? circle(x + w / 2 - 34, y + h / 2, 6, 'cp-spin') : '')
    + text(x + w / 2 + (busy ? 8 : 0), y + h / 2 + 4.5, label, `cp-t cp-b ${ink}`, 'middle');
  return { s, b: { self: [x, y, w, h] } };
};
const field = (x, y, w, { label = 'Email', value = '', placeholder = 'you@example.com', error = '' } = {}) => {
  const s = text(x, y + 10, label, 'cp-t cp-b')
    + rect(x, y + 18, w, 32, error ? 'cp-field cp-field-bad' : 'cp-field', 8)
    + text(x + 10, y + 38, value || placeholder, value ? 'cp-t' : 'cp-t cp-muted')
    + (error ? text(x, y + 66, error, 'cp-t cp-bad') : '');
  return { s, b: { self: [x, y + 18, w, 32], error: [x, y + 55, 180, 14], label: [x, y, 40, 12] } };
};
const switchRow = (x, y, w, label, on = true) => {
  const tx = x + w - 46;
  const s = text(x, y + 22, label) + rect(tx, y + 7, 44, 26, on ? 'cp-on' : 'cp-off', 13) + circle(on ? tx + 31 : tx + 13, y + 20, 10, 'cp-knob');
  return { s, b: { self: [x, y, w, 40], control: [tx, y + 7, 44, 26] } };
};
const checkbox = (x, y, label, checked = true) => {
  const s = rect(x, y + 5, 20, 20, checked ? 'cp-on' : 'cp-field', 5)
    + (checked ? path(`M${x + 5} ${y + 15} L${x + 9} ${y + 19} L${x + 16} ${y + 10}`, 'cp-stroke cp-inv-stroke') : '')
    + text(x + 30, y + 20, label);
  return { s, b: { self: [x, y + 2, 190, 26], control: [x, y + 5, 20, 20] } };
};
const radios = (x, y, options, sel = 0, groupLabel = 'Experience level') => {
  const rows = options.map((o, i) => {
    const cy = y + 34 + i * 30;
    return circle(x + 10, cy, 9, i === sel ? 'cp-ring cp-ring-on' : 'cp-ring') + (i === sel ? circle(x + 10, cy, 4.5, 'cp-dot') : '') + text(x + 28, cy + 4.5, o);
  }).join('');
  const boxes = options.map((_, i) => [x - 2, y + 34 + i * 30 - 10, 150, 20]);
  return { s: text(x, y + 12, groupLabel, 'cp-t cp-b') + rows, b: { label: [x - 2, y, 110, 16], options: boxes, all: [x - 2, y + 22, 150, options.length * 30 - 6], control: [x + 1, y + 25, 18, 18] } };
};
const selectTrigger = (x, y, w, value = '60 seconds') => {
  const s = text(x, y + 10, 'Rest time', 'cp-t cp-b') + rect(x, y + 18, w, 34, 'cp-field', 8) + text(x + 10, y + 39.5, value) + chevron(x + w - 16, y + 35);
  return { s, b: { self: [x, y + 18, w, 34], label: [x, y, 70, 12] } };
};
const SELECT = ['30 seconds', '45 seconds', '60 seconds', '90 seconds', '2 minutes'];
// The open select: a list of options over the dimmed screen, the current one ticked.
// It opens below the trigger, which stays in view at the top of the screen.
const selectList = (current = 2) => {
  const x = 20, y = 60, w = 210, rh = 16.4;
  const rows = SELECT.map((o, i) => text(x + 28, y + 12 + i * rh + 3.5, o, 'cp-t cp-small') + (i === current ? path(`M${x + 10} ${y + 11 + i * rh} L${x + 13} ${y + 14 + i * rh} L${x + 19} ${y + 7 + i * rh}`, 'cp-stroke cp-accent-stroke') : '')
    + (i ? rect(x + 8, y + 4 + i * rh, w - 16, 1, 'cp-line', 0) : '')).join('');
  return { s: rect(x, y, w, rh * SELECT.length + 6, 'cp-pop', 12) + rows, b: { options: SELECT.map((_, i) => [x + 4, y + 3 + i * rh, w - 8, rh]), all: [x, y, w, rh * SELECT.length + 6] } };
};
const tabs = (x, y, w, labels = ['Today', 'Plan', 'Progress'], sel = 0) => {
  const cw = w / labels.length;
  const s = labels.map((l, i) => text(x + cw * i + cw / 2, y + 18, l, i === sel ? 'cp-t cp-b cp-accent' : 'cp-t cp-muted', 'middle')).join('')
    + rect(x, y + 29, w, 1, 'cp-line', 0) + rect(x + cw * sel + 10, y + 27, cw - 20, 3, 'cp-on', 1.5)
    + lines(x, y + 46, [w - 40]);
  return { s, b: { tabs: labels.map((_, i) => [x + cw * i + 4, y, cw - 8, 30]) } };
};
const segmented = (x, y, w, opts = ['Week', 'Month', 'Year'], sel = 0) => {
  const cw = (w - 6) / opts.length;
  const s = text(x, y + 10, 'Chart range', 'cp-t cp-b') + rect(x, y + 18, w, 34, 'cp-off', 10) + rect(x + 3 + cw * sel, y + 21, cw, 28, 'cp-seg', 8)
    + opts.map((o, i) => text(x + 3 + cw * i + cw / 2, y + 39.5, o, i === sel ? 'cp-t cp-b' : 'cp-t', 'middle')).join('');
  return { s, b: { opts: opts.map((_, i) => [x + 3 + cw * i, y + 21, cw, 28]) } };
};
const slider = (x, y, w, frac = 0.3, value = '60 kg') => {
  const tx = x + w * frac;
  const s = text(x, y + 10, 'Weight', 'cp-t cp-b') + text(x + w, y + 10, value, 'cp-t cp-muted', 'end')
    + rect(x, y + 30, w, 4, 'cp-line', 2) + rect(x, y + 30, w * frac, 4, 'cp-on', 2) + circle(tx, y + 32, 11, 'cp-knob cp-edge');
  return { s, b: { self: [x, y + 18, w, 28], thumb: [tx, y + 32] } };
};
const progress = (x, y, w, frac = 3 / 8) => {
  const s = text(x, y + 10, 'Workout progress', 'cp-t cp-b') + rect(x, y + 22, w, 8, 'cp-line', 4) + rect(x, y + 22, w * frac, 8, 'cp-on', 4) + text(x, y + 48, '3 of 8 exercises', 'cp-t cp-muted');
  return { s, b: { self: [x, y, w, 52] } };
};
// The accordion: three section headers with chevrons and dividers; `open`
// shows that section's text under its header.
const accordion = (x, y, w, open = -1) => {
  const sections = ['Warm-up', 'Main set', 'Cool-down'];
  let cy = y;
  const boxes = [];
  let s = '';
  sections.forEach((t, i) => {
    s += text(x, cy + 21, t, 'cp-t cp-b') + chevron(x + w - 10, cy + 17, i === open);
    boxes.push([x - 2, cy + 6, w + 4, 22]);
    cy += 32;
    if (i === open) { s += text(x, cy + 18, 'Five minutes of easy cycling.', 'cp-t cp-muted'); cy += 26; }
    s += rect(x, cy, w, 1, 'cp-line', 0);
  });
  return { s, b: { headers: boxes, panel: [x - 2, y + 37, w, 16] } };
};
const menuTrigger = (x, y) => {
  const s = rect(x, y, 150, 34, 'cp-field', 10) + text(x + 12, y + 21.5, 'Workout options') + [0, 1, 2].map((i) => circle(x + 128 + i * 6, y + 17, 2, 'cp-dotfill')).join('');
  return { s, b: { self: [x, y, 150, 34] } };
};
const MENU = ['Duplicate', 'Share', 'Archive'];
const menuPopover = (x, y) => {
  const s = rect(x, y, 140, 90, 'cp-pop', 12) + MENU.map((m, i) => text(x + 14, y + 22 + i * 28, m) + (i ? rect(x + 8, y + 6 + i * 28, 124, 1, 'cp-line', 0) : '')).join('');
  return { s, b: { items: MENU.map((_, i) => [x + 4, y + 6 + i * 28, 132, 24]), all: [x, y, 140, 90] } };
};
// The bottom sheet: attached to the bottom edge, rounded top corners, a grab
// handle, then the exercise title, its description and Close.
const sheetPanel = () => {
  const y = 50;
  const s = `<path d="M0 ${SY + y + 16} Q0 ${SY + y} 16 ${SY + y} L${SW - 16} ${SY + y} Q${SW} ${SY + y} ${SW} ${SY + y + 16} L${SW} ${SY + SH - 14} Q${SW} ${SY + SH} ${SW - 14} ${SY + SH} L14 ${SY + SH} Q0 ${SY + SH} 0 ${SY + SH - 14} Z" class="cp-card"/>`
    + rect(SW / 2 - 18, y + 7, 36, 4, 'cp-line', 2)
    + text(16, y + 32, 'Goblet squat', 'cp-t cp-b cp-big')
    + text(16, y + 50, 'Hold the kettlebell at your chest, sit back', 'cp-t cp-muted cp-small')
    + text(16, y + 63, 'and down, then drive up through your heels.', 'cp-t cp-muted cp-small')
    + button(16, y + 72, SW - 32, 24, 'Close').s;
  return { s, b: { title: [12, y + 18, 110, 20], body: [12, y + 40, 226, 28], text: [12, y + 18, 226, 50], close: [16, y + 72, SW - 32, 24] } };
};
// The test screen behind each overlay, so "the screen behind" has something in it.
const behindSheet = () => button(16, 10, SW - 32, 30, 'Show exercise details');
const behindDialog = () => button(16, 10, SW - 32, 30, 'Delete workout', { destructive: true });
const dialogBox = () => {
  const x = 30, y = 34, w = 190;
  const s = rect(x, y, w, 104, 'cp-card', 14) + text(x + 14, y + 22, 'Delete this workout?', 'cp-t cp-b')
    + text(x + 14, y + 40, 'This removes the workout and its', 'cp-t cp-muted cp-small') + text(x + 14, y + 52, 'logged sets. You cannot undo this.', 'cp-t cp-muted cp-small')
    + text(x + 52, y + 84, 'Cancel', 'cp-t cp-b cp-accent', 'middle') + rect(x + 104, y + 68, 72, 26, 'cp-danger', 8) + text(x + 140, y + 85, 'Delete', 'cp-t cp-b cp-inv', 'middle');
  return { s, b: { title: [x + 10, y + 8, 150, 20], cancel: [x + 18, y + 68, 68, 26], del: [x + 104, y + 68, 72, 26] } };
};
const toast = () => {
  const s = rect(45, 108, 160, 32, 'cp-toast', 16) + path(`M62 124 L66 128 L73 119`, 'cp-stroke cp-inv-stroke') + text(132, 128.5, 'Set logged', 'cp-t cp-b cp-inv', 'middle');
  return { s, b: { self: [45, 108, 160, 32] } };
};

// The box under the screen: what the audit actually read for this check, in
// one app on one platform, and which one. It comes from results/*, not from
// the drawing: { lines: [up to two], source }.
const wrap = (str, max = 36, rows = 3) => {
  const out = [''];
  for (const w of String(str).split(' ')) {
    const l = out[out.length - 1];
    if ((l + ' ' + w).trim().length > max && l) out.push(w); else out[out.length - 1] = (l + ' ' + w).trim();
  }
  const cut = out.map((l) => (l.length > max ? `${l.slice(0, max - 1)}…` : l));
  return cut.length > rows ? [...cut.slice(0, rows - 1), `${cut[rows - 1].slice(0, max - 1)}…`] : cut;
};
const bubble = (ex, ok) => {
  const y = SY + SH + 10;
  const lines = wrap(ex.text);
  return `<rect x="2" y="${y}" width="${SW - 4}" height="66" rx="12" class="${ok ? 'cp-ok-b' : 'cp-bad-b'}"/>`
    + lines.map((l, i) => `<text x="10" y="${y + 16 + i * 13}" class="cp-say">${esc(l)}</text>`).join('')
    + `<text x="10" y="${y + 58}" class="cp-src">${esc(ex.source)}</text>`;
};
const noExample = {
  pass: { text: 'No app passes this check.', source: 'Pass side is a drawing, not a result' },
  'test-ran': { text: 'Recorded only when a test can’t start.', source: 'Otherwise the audit saves no result' },
  fail: { text: 'No app fails this check.', source: 'Fail side is a drawing, not a result' },
};

// --- The pictures. Each: [alt text, { screen, say } when it passes, { screen, say } when it fails].
const P = (alt, passScreen, passSay, failScreen, failSay) => [alt, { screen: passScreen, say: passSay }, { screen: failScreen, say: failSay }];
// Same screen and focus both sides; only what the screen reader is given differs.
const said = (alt, screen, passSay, failSay) => P(alt, screen, passSay, screen, failSay);

// Touch target: the control's tappable area against the 44 pt (48 dp) minimum.
// draw(y, h) draws the control filling a band of height h.
const target = (name, draw) => P(`${name}: the tappable area is at least 44 pt tall (48 dp on Android). When it fails, it is smaller than the dashed minimum.`,
  rect(12, 40, 226, 56, 'cp-guide', 4) + rect(12, 40, 226, 56, 'cp-hit', 4) + draw(40, 56), 'Tap area fills the 44 pt dashed box',
  rect(12, 40, 226, 56, 'cp-guide', 4) + rect(12, 52, 226, 32, 'cp-hit', 4) + draw(52, 32), 'Tap area only 32 pt tall');

const r = radios(20, 4, ['Beginner', 'Intermediate', 'Advanced']);
const sel = selectTrigger(20, 30, 210);
const selTop = selectTrigger(20, 2, 210); // with the list open below it
const selOpen = selectList();
const acc = accordion(20, 14, 210);
const accOpen = accordion(20, 14, 210, 0);
const mt = menuTrigger(20, 14);
const mp = menuPopover(80, 54);
const sh = sheetPanel();
const dl = dialogBox();
const fe = field(20, 30, 210, { value: 'not-an-email', error: 'Enter a valid email address.' });
const tb = tabs(20, 40, 210);
const sg = segmented(20, 40, 210);
const sg1 = segmented(20, 40, 210, undefined, 1);
const behindBtn = [16, 10, SW - 32, 30];

export const pictures = {
  // Name, role and state, one per control.
  'button-nrs': said('A button read with its label and the button role passes. Read with its label only, the user isn’t told it can be activated.', button(30, 55, 190, 40, 'Save workout').s + focus([30, 55, 190, 40]), '“Save workout, button”', '“Save workout” (no role)'),
  'button-disabled-nrs': said('A disabled button is read as dimmed or disabled. When it fails, it sounds like a button that works.', button(30, 55, 190, 40, 'Unavailable', { disabled: true }).s + focus([30, 55, 190, 40]), '“Unavailable, dimmed, button”', '“Unavailable, button” (sounds enabled)'),
  'button-loading-nrs': said('A button that is saving says it is busy. When it fails, nothing says it is working.', button(30, 55, 190, 40, 'Saving', { busy: true }).s + focus([30, 55, 190, 40]), '“Saving, busy, button”', '“Saving, button” (not busy)'),
  'field-nrs': said('A text field read with its label passes. Without it, the user hears an unnamed field.', field(20, 40, 210).s + focus(field(20, 40, 210).b.self), '“Email, text field”', '“Text field” (no name)'),
  'switch-nrs': said('A switch read with its label, the switch role and on or off passes. Read with its label only, it fails.', switchRow(20, 55, 210, 'Workout reminders').s + focus([20, 55, 210, 40]), '“Workout reminders, switch, on”', '“Workout reminders” (no role or state)'),
  'native-switch-nrs': said('The native switch is read with its label, the switch role and on or off.', switchRow(20, 55, 210, 'Sync with Health', false).s + focus([20, 55, 210, 40]), '“Sync with Health, switch, on”', '“Sync with Health” (no role or state)'),
  'checkbox-nrs': said('A checkbox read with its label, the checkbox role and checked passes. Without its role or state, it fails.', checkbox(30, 58, 'I agree to the terms', false).s + focus([28, 60, 190, 26]), '“I agree to the terms, checkbox, ticked”', '“I agree to the terms” (no state)'),
  'radio-nrs': said('A radio option read with its label, the radio role and selected passes. Without its role or state, it fails.', r.s + focus(r.b.options[0]), '“Beginner, radio button, selected”', '“Beginner” (no role or state)'),
  'select-nrs': said('The select trigger is read with its name, its value and a button role. When it fails, a part is missing.', sel.s + focus(sel.b.self), '“Rest time, 60 seconds, button”', '“60 seconds” (no name or role)'),
  'tab-nrs': said('The selected tab is read with the tab role and as selected. When it fails, nothing says which tab is open.', tb.s + focus(tb.b.tabs[0]), '“Today, tab, selected”', '“Today” (no role or state)'),
  'slider-nrs': said('The slider is read with its label, its value and the adjustable role. When it fails, a part is missing.', slider(20, 45, 210).s + focus(slider(20, 45, 210).b.self), '“Weight, 60 kg, adjustable”', '“Weight” (no value or role)'),
  'progress-nrs': said('The progress bar is read with its label and how far along it is. When it fails, the value or label is missing.', progress(20, 45, 210).s + focus(progress(20, 45, 210).b.self), '“Workout progress, 3 of 8”', '“Workout progress” (no value)'),
  'menu-trigger': said('The menu button is read with its name and the button role. When it fails, the user hears an unnamed button or plain text.', mt.s + focus(mt.b.self), '“Workout options, button”', '“Button” (no name)'),
  'segmented-nrs': said('Each segment is read with its label and a button, radio or tab role. When it fails, it sounds like plain text.', sg.s + focus(sg.b.opts[0]), '“Week, button”', '“Week” (no role)'),

  // Touch targets.
  'target-button': target('Button', (y, h) => button(20, y, 210, h, 'Save workout').s),
  'target-switch': target('Switch row', (y, h) => text(20, y + h / 2 + 4, 'Workout reminders') + rect(184, y + h / 2 - 13, 44, 26, 'cp-on', 13) + circle(215, y + h / 2, 10, 'cp-knob')),
  'target-native-switch': target('Native switch row', (y, h) => text(20, y + h / 2 + 4, 'Sync with Health') + rect(184, y + h / 2 - 13, 44, 26, 'cp-off', 13) + circle(197, y + h / 2, 10, 'cp-knob')),
  'target-checkbox': target('Checkbox', (y, h) => rect(22, y + h / 2 - 10, 20, 20, 'cp-field', 5) + text(52, y + h / 2 + 4, 'I agree to the terms')),
  'target-radio': target('Radio option', (y, h) => circle(32, y + h / 2, 9, 'cp-ring cp-ring-on') + circle(32, y + h / 2, 4.5, 'cp-dot') + text(50, y + h / 2 + 4.5, 'Beginner')),
  'target-select': target('Select trigger', (y, h) => rect(20, y + 4, 210, h - 8, 'cp-field', 8) + text(30, y + h / 2 + 4, '60 seconds') + chevron(214, y + h / 2)),
  'target-tab': target('Tab', (y, h) => text(58, y + h / 2 + 4, 'Today', 'cp-t cp-b cp-accent', 'middle') + text(125, y + h / 2 + 4, 'Plan', 'cp-t cp-muted', 'middle') + text(192, y + h / 2 + 4, 'Progress', 'cp-t cp-muted', 'middle') + rect(28, y + h - 4, 60, 3, 'cp-on', 1.5)),
  'target-slider': target('Slider thumb', (y, h) => rect(20, y + h / 2 - 2, 210, 4, 'cp-line', 2) + rect(20, y + h / 2 - 2, 63, 4, 'cp-on', 2) + circle(83, y + h / 2, 11, 'cp-knob cp-edge')),
  'target-accordion': target('Accordion header', (y, h) => text(20, y + h / 2 + 4, 'Warm-up', 'cp-t cp-b') + chevron(220, y + h / 2)),
  'target-menu': target('Menu button', (y, h) => rect(20, y + 4, 210, h - 8, 'cp-field', 10) + text(32, y + h / 2 + 4, 'Workout options') + [0, 1, 2].map((i) => circle(208 + i * 6, y + h / 2, 2, 'cp-dotfill')).join('')),
  'target-segmented': target('Segment', (y, h) => rect(20, y + 2, 210, h - 4, 'cp-off', 10) + rect(23, y + 5, 68, h - 10, 'cp-seg', 8) + ['Week', 'Month', 'Year'].map((o, i) => text(57 + i * 68, y + h / 2 + 4, o, i ? 'cp-t' : 'cp-t cp-b', 'middle')).join('')),

  // Radio group.
  'radio-options': P('Each of the three radio options is its own stop for the screen reader. When it fails, they are merged into one stop, or some are missing.',
    r.s + r.b.options.map(focus).join(''), '3 stops, one per option', r.s + focus(r.b.all), '1 stop for all three options'),
  'radio-label': P('The group label “Experience level” is in the tree, so it is read with the options. When it fails, it is drawn but the screen reader can’t reach it.',
    r.s + focus(r.b.label), '“Experience level”', r.s + ghost(r.b.label), 'Label visible, but not in the tree'),

  // Text field errors.
  'field-error-shown': P('After an invalid email, the error message is in the tree. When it fails, it never appears there.',
    fe.s + focus(fe.b.error), '“Enter a valid email address.”', fe.s + ghost(fe.b.error), 'Error drawn, but not in the tree'),
  'field-error-linked': said('The error is part of what the field reads, so it is heard with the field. When it fails, the field is read without it.',
    fe.s + focus(fe.b.self), '“Email, not-an-email, Enter a valid…”', '“Email, not-an-email” (no error)'),

  // Dialog.
  'dialog-opens': P('Tapping Delete workout opens the dialog. When it fails, nothing new appears in the tree.',
    behindDialog().s + dim() + dl.s, 'Dialog appears: “Delete this workout?”', behindDialog().s + finger(...center(behindBtn)), 'Tap: nothing new in the tree'),
  'dialog-behind': P('With the dialog open, the screen reader can only reach the dialog. When it fails, it can still reach Delete workout behind it.',
    behindDialog().s + dim() + dl.s + focus(dl.b.cancel), 'Reaches the dialog only', behindDialog().s + dim() + dl.s + focus(behindBtn), '“Delete workout, button” (behind it)'),
  'dialog-unnamed': P('Every stop in the dialog has a name. When it fails, the dimmed backdrop is a stop of its own, read as “Unlabelled”.',
    behindDialog().s + dim() + dl.s + focus(dl.b.del), '“Delete, button”', behindDialog().s + dim() + dl.s + rect(3, 3, SW - 6, SH - 6, 'cp-focus', 12), '“Unlabelled” (the backdrop)'),
  'dialog-heading': P('The dialog title is read as a heading, so screen reader users can jump to it. In the failing app the whole dialog is one element, so there is no title stop at all.',
    behindDialog().s + dim() + dl.s + focus(dl.b.title), '', behindDialog().s + dim() + dl.s + focus([30, 34, 190, 104]), ''),
  'dialog-buttons': said('Cancel is read as a button. When it fails, it sounds like plain text.',
    behindDialog().s + dim() + dl.s + focus(dl.b.cancel), '“Cancel, button”', '“Cancel” (no role)'),
  'dialog-closes': P('Tapping Cancel closes the dialog. When it fails, the dialog is still in the tree.',
    behindDialog().s, 'Gone after tapping Cancel', behindDialog().s + dim() + dl.s + finger(...center(dl.b.cancel)), 'Still open'),

  // Bottom sheets.
  'sheet-opens': P('Tapping Show exercise details slides the sheet up from the bottom. When it fails, nothing new appears in the tree.',
    behindSheet().s + dim() + sh.s, 'Sheet appears: “Goblet squat”', behindSheet().s + finger(...center(behindBtn)), 'Tap: nothing new in the tree'),
  'sheet-text': P('The sheet’s title and description are in the tree. When it fails, they are drawn but the screen reader can’t reach them.',
    behindSheet().s + dim() + sh.s + focus(sh.b.text), '“Goblet squat. Hold the kettlebell…”', behindSheet().s + dim() + sh.s + ghost(sh.b.text), 'Text visible, but not in the tree'),
  'sheet-behind': P('With the sheet open, the screen reader can only reach the sheet. When it fails, it can still reach the screen above it.',
    behindSheet().s + dim() + sh.s + focus(sh.b.close), 'Reaches the sheet only', behindSheet().s + dim() + sh.s + focus(behindBtn), '“Show exercise details” (behind it)'),
  'sheet-unnamed': P('Every stop in the sheet has a name. When it fails, the dimmed area above the sheet is a stop of its own, read as “Unlabelled”.',
    behindSheet().s + dim() + sh.s + focus(sh.b.close), '“Close, button”', behindSheet().s + dim() + sh.s + rect(3, 3, SW - 6, 44, 'cp-focus', 12), '“Unlabelled” (the backdrop)'),
  'sheet-closes': P('Tapping Close slides the sheet away. When it fails, the sheet is still in the tree.',
    behindSheet().s, 'Gone after tapping Close', behindSheet().s + dim() + sh.s + finger(...center(sh.b.close)), 'Still open'),
  'sheet-after': P('After the sheet closes, the screen’s controls are back for the screen reader. When it fails, they stay hidden as if the sheet were still open.',
    behindSheet().s + lines(16, 56, [200, 160]) + focus(behindBtn), '“Show exercise details, button”', behindSheet().s + lines(16, 56, [200, 160]) + ghost([0, 0, SW, SH].map((v, i) => (i < 2 ? v + 4 : v - 8))), 'Nothing to reach: still blocked'),

  // Select.
  'select-opens': P('Tapping the Rest time select shows its options. When it fails, nothing new appears in the tree.',
    selTop.s + dim() + selOpen.s, 'Options appear', selTop.s + finger(...center(selTop.b.self)), 'Tap: nothing new in the tree'),
  'select-current': said('The open list marks the option already chosen, 60 seconds, as selected. When it fails, nothing says which one is chosen.',
    selTop.s + dim() + selOpen.s + focus(selOpen.b.options[2], 0), '“60 seconds, selected”', '“60 seconds” (not marked)'),
  'select-options': said('Every option has a button, radio or option role, so the user knows it can be picked. When it fails, options sound like plain text.',
    selTop.s + dim() + selOpen.s + focus(selOpen.b.options[3], 0), '“90 seconds, button”', '“90 seconds” (no role)'),
  'select-behind': P('With the list open, the screen reader can only reach the options. When it fails, it can still reach the screen behind.',
    selTop.s + dim() + selOpen.s + focus(selOpen.b.options[0], 0), 'Reaches the options only', selTop.s + dim() + selOpen.s + focus(selTop.b.self), '“Rest time, 60 seconds” (behind it)'),
  'select-unnamed': P('Every stop in the open list has a name. When it fails, the backdrop behind the list is a stop of its own, read as “Unlabelled”.',
    selTop.s + dim() + selOpen.s + focus(selOpen.b.options[1], 0), '“45 seconds, button”', selTop.s + dim() + selOpen.s + rect(3, 3, SW - 6, SH - 6, 'cp-focus', 12), '“Unlabelled” (the backdrop)'),
  'select-new-value': said('After picking 90 seconds, the trigger reads the new value. When it fails, it still reads the old one.',
    selectTrigger(20, 30, 210, '90 seconds').s + focus(sel.b.self), '“Rest time, 90 seconds”', '“Rest time, 60 seconds” (old value)'),

  // Toast.
  toast: P('The toast is in the tree while it is on screen. When it fails, it is drawn but the screen reader never finds it.',
    button(20, 14, 210, 34, 'Log set').s + toast().s + focus(toast().b.self), '“Set logged”', button(20, 14, 210, 34, 'Log set').s + toast().s + ghost(toast().b.self), 'Visible, but not in the tree'),

  // Slider.
  'slider-drag': P('Dragging the thumb changes the value the screen reader is given. When it fails, the value stays the same.',
    slider(20, 45, 210, 0.9, '180 kg').s + circle(83, 77, 11, 'cp-ghostfill') + finger(209, 77) + path('M96 100 L196 100 M190 95 L196 100 L190 105', 'cp-stroke cp-muted-stroke'), 'Value 60 kg → 120 kg',
    slider(20, 45, 210, 0.9, '180 kg').s + circle(83, 77, 11, 'cp-ghostfill') + finger(209, 77) + path('M96 100 L196 100 M190 95 L196 100 L190 105', 'cp-stroke cp-muted-stroke'), 'Value stays 60 kg'),

  // Accordion.
  'accordion-button': said('The section header is read as a button, so the user knows it opens. When it fails, it sounds like a heading or plain text.',
    acc.s + focus(acc.b.headers[0]), '“Warm-up, button”', '“Warm-up” (no role)'),
  'accordion-expanded': P('An open section’s header is read as expanded, and a closed one as collapsed. When it fails, the header sounds the same either way.',
    accOpen.s + focus(accOpen.b.headers[0]), '“Warm-up, button, expanded”', accOpen.s + focus(accOpen.b.headers[0]), '“Warm-up, button” (open or shut?)'),
  'accordion-content': P('Tapping the header shows the section’s text, and tapping again hides it. When it fails, the text doesn’t appear, or doesn’t go.',
    accOpen.s + finger(...center(accOpen.b.headers[0])) + focus(accOpen.b.panel), 'Text appears, then goes on 2nd tap', acc.s + finger(...center(acc.b.headers[0])), 'Tap: no section text'),

  // Menu.
  'menu-opens': P('Tapping Workout options shows its three actions. When it fails, nothing new appears in the tree.',
    mt.s + mp.s, 'Duplicate, Share, Archive appear', mt.s + finger(...center(mt.b.self)), 'Tap: nothing new in the tree'),
  'menu-items': said('Each menu action is read as a button. When it fails, actions sound like plain text.',
    mt.s + mp.s + focus(mp.b.items[0]), '“Duplicate, button”', '“Duplicate” (no role)'),
  'menu-behind': P('With the menu open, the screen reader can only reach the menu. When it fails, it can still reach the screen behind.',
    lines(20, 70, [50, 40, 54]) + mt.s + mp.s + focus(mp.b.items[1]), 'Reaches the menu only', lines(20, 70, [50, 40, 54]) + mt.s + mp.s + focus([16, 68, 58, 26]), 'Screen behind still reachable'),
  'menu-unnamed': P('Every stop in the open menu has a name. When it fails, a backdrop that closes the menu is a stop of its own, read as “Unlabelled”.',
    mt.s + mp.s + focus(mp.b.items[2]), '“Archive, button”', mt.s + mp.s + rect(3, 3, SW - 6, SH - 6, 'cp-focus', 12), '“Unlabelled” (the backdrop)'),
  'menu-closes': P('Tapping Duplicate runs it and closes the menu. When it fails, the menu stays open.',
    mt.s, 'Menu gone after the tap', mt.s + mp.s + finger(...center(mp.b.items[0])), 'Still open'),

  // Segmented control.
  'segmented-selected': said('The selected segment, Week, is read as selected, and the others aren’t. When it fails, nothing says which one is selected.',
    sg.s + focus(sg.b.opts[0]), '“Week, selected”', '“Week” (not marked)'),
  'segmented-moves': P('Tapping Month moves the selected state to it. When it fails, the tree still says Week is selected.',
    sg1.s + finger(...center(sg1.b.opts[1])) + focus(sg1.b.opts[1]), '“Month, selected”', sg1.s + finger(...center(sg1.b.opts[1])) + focus(sg1.b.opts[1]), '“Month” (Week still selected)'),

  // Any test.
  'test-ran': P('The test finds the element it starts from, so its other checks run. When it fails, the element isn’t there and the rest of that test is marked not run.',
    button(30, 55, 190, 40, 'Delete workout', { destructive: true }).s + focus([30, 55, 190, 40]), 'Found, so the checks run', ghost([34, 59, 182, 32]) + text(125, 80, '?', 'cp-t cp-b cp-big', 'middle'), 'Not found: checks not run'),
};

// Which picture a component's check gets. Bottom sheets of every kind share
// the sheet pictures; anything not listed falls back to the check's default
// in scripts/checks-data.mjs.
const forComponent = {
  Button: { 'name, role, state': 'button-nrs', 'touch target': 'target-button' },
  'Button (disabled)': { 'name, role, state': 'button-disabled-nrs', 'touch target': 'target-button' },
  'Button (loading)': { 'name, role, state': 'button-loading-nrs', 'touch target': 'target-button' },
  'Text field': { 'name, role, state': 'field-nrs', 'error shown': 'field-error-shown', 'error reachable from field': 'field-error-linked' },
  Switch: { 'name, role, state': 'switch-nrs', 'touch target': 'target-switch' },
  'Native switch (@expo/ui)': { 'name, role, state': 'native-switch-nrs', 'touch target': 'target-native-switch' },
  Checkbox: { 'name, role, state': 'checkbox-nrs', 'touch target': 'target-checkbox' },
  'Radio option': { 'name, role, state': 'radio-nrs', 'touch target': 'target-radio' },
  'Radio group': { 'all options exposed': 'radio-options', 'group label read': 'radio-label' },
  'Select trigger': { 'name, role, state': 'select-nrs', 'touch target': 'target-select' },
  'Tab (selected)': { 'name, role, state': 'tab-nrs', 'touch target': 'target-tab' },
  Dialog: { opens: 'dialog-opens', 'screen behind is hidden from VoiceOver': 'dialog-behind', 'every stop has a name': 'dialog-unnamed', 'title is a heading': 'dialog-heading', 'actions are buttons': 'dialog-buttons', closes: 'dialog-closes' },
  'Bottom sheet': { opens: 'sheet-opens', 'title and body readable': 'sheet-text', 'screen behind is hidden from VoiceOver': 'sheet-behind', 'every stop has a name': 'sheet-unnamed', closes: 'sheet-closes', 'screen reachable again after close': 'sheet-after' },
  Select: { opens: 'select-opens', 'current option marked': 'select-current', 'options are actionable': 'select-options', 'screen behind is hidden from VoiceOver': 'select-behind', 'every stop has a name': 'select-unnamed', 'new value read on trigger': 'select-new-value' },
  Toast: { 'in accessibility tree': 'toast' },
  Slider: { 'name, role, value': 'slider-nrs', 'touch target': 'target-slider', 'dragging changes the value': 'slider-drag' },
  Progress: { 'name and value': 'progress-nrs' },
  Accordion: { 'header is a button': 'accordion-button', 'touch target': 'target-accordion', 'expanded state exposed': 'accordion-expanded', 'content shows and hides': 'accordion-content' },
  Menu: { 'trigger name and role': 'menu-trigger', 'touch target': 'target-menu', opens: 'menu-opens', 'items are buttons': 'menu-items', 'screen behind is hidden from VoiceOver': 'menu-behind', 'every stop has a name': 'menu-unnamed', 'closes after an action': 'menu-closes' },
  'Segmented control': { 'options have name and role': 'segmented-nrs', 'selected option marked': 'segmented-selected', 'touch target': 'target-segmented', 'selection moves on tap': 'segmented-moves' },
};
export const pictureFor = (component, check, fallback) => {
  if (check === 'test could run') return 'test-ran';
  const own = forComponent[component.startsWith('Bottom sheet') ? 'Bottom sheet' : component];
  return own?.[check] ?? fallback;
};

// Light and dark colours for the standalone files; the site maps the same
// classes onto its own theme variables.
const fileStyle = `<style>
svg { font: 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
.cp-bg { fill: #ffffff; } .cp-screen { fill: #f6f5f1; stroke: #d9d5cc; }
.cp-card, .cp-knob, .cp-seg { fill: #ffffff; } .cp-pop { fill: #ffffff; stroke: #d9d5cc; } .cp-knob, .cp-seg { stroke: #d9d5cc; } .cp-edge { stroke: #8a867f; }
.cp-field { fill: #ffffff; stroke: #c9c5bd; } .cp-field-bad { stroke: #b3261e; stroke-width: 1.5; }
.cp-line { fill: #d9d5cc; } .cp-on, .cp-btn, .cp-dot { fill: #4f63c9; } .cp-off { fill: #e6e3dc; } .cp-danger { fill: #c0392b; } .cp-toast { fill: #26262b; }
.cp-ring { fill: #ffffff; stroke: #8a867f; stroke-width: 1.5; } .cp-ring-on { stroke: #4f63c9; stroke-width: 2; } .cp-dotfill { fill: #5d5a55; }
.cp-spin { fill: none; stroke: #ffffff; stroke-width: 2; stroke-dasharray: 22 16; }
.cp-stroke { fill: none; stroke: #5d5a55; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; } .cp-inv-stroke { stroke: #ffffff; } .cp-accent-stroke { stroke: #4f63c9; } .cp-muted-stroke { stroke: #8a867f; }
.cp-dim { fill: #18181b; fill-opacity: .35; } .cp-ghost { fill: none; stroke: #8a867f; stroke-dasharray: 2 4; } .cp-ghostfill { fill: none; stroke: #8a867f; stroke-dasharray: 2 3; }
.cp-guide { fill: none; stroke: #8a867f; stroke-width: 1.5; stroke-dasharray: 3 3; } .cp-hit { fill: #4f46e5; fill-opacity: .12; }
.cp-focus { fill: none; stroke: #4f46e5; stroke-width: 3; stroke-dasharray: 7 4; }
.cp-finger { fill: #db2777; fill-opacity: .5; }
.cp-t { fill: #18181b; } .cp-b { font-weight: 700; } .cp-big { font-size: 14px; } .cp-small { font-size: 10px; } .cp-muted { fill: #5d5a55; } .cp-accent { fill: #4f63c9; }
.cp-s { fill: #5d5a55; font-size: 13px; font-weight: 700; } .cp-inv { fill: #ffffff; }
.cp-bad { fill: #b3261e; } .cp-ok { fill: #1d7a3e; } .cp-head { font-size: 13px; font-weight: 700; }
.cp-ok-b { fill: #e2f4e8; stroke: #1d7a3e; } .cp-bad-b { fill: #fde4e1; stroke: #b3261e; } .cp-say { fill: #18181b; font: 600 10.5px ui-monospace, SFMono-Regular, Menlo, monospace; } .cp-src { fill: #5d5a55; font-size: 10px; }
@media (prefers-color-scheme: dark) {
  .cp-bg { fill: #17171c; } .cp-screen { fill: #0e0e11; stroke: #33333c; }
  .cp-card, .cp-knob, .cp-seg, .cp-pop, .cp-field { fill: #23232a; } .cp-pop, .cp-knob, .cp-seg, .cp-field { stroke: #3a3a44; }
  .cp-line { fill: #3a3a44; } .cp-on, .cp-btn, .cp-dot { fill: #8fa3ff; } .cp-off { fill: #2c2c34; } .cp-danger { fill: #e5675a; } .cp-toast { fill: #ececf1; }
  .cp-ring { fill: #23232a; stroke: #a09da6; } .cp-ring-on { stroke: #8fa3ff; } .cp-dotfill { fill: #a09da6; }
  .cp-spin { stroke: #0e0e11; } .cp-stroke { stroke: #a09da6; } .cp-inv-stroke { stroke: #0e0e11; } .cp-accent-stroke { stroke: #8fa3ff; }
  .cp-dim { fill: #000000; fill-opacity: .55; } .cp-focus { stroke: #a5a6ff; } .cp-guide { stroke: #a09da6; } .cp-hit { fill: #8b8cff; }
  .cp-t, .cp-say { fill: #ececf1; } .cp-muted, .cp-s, .cp-src { fill: #a09da6; } .cp-accent { fill: #8fa3ff; } .cp-inv { fill: #0e0e11; }
  .cp-bad { fill: #ff8a80; } .cp-ok { fill: #6fd28f; } .cp-field-bad { stroke: #ff8a80; }
  .cp-ok-b { fill: #15301f; stroke: #6fd28f; } .cp-bad-b { fill: #3a1c1b; stroke: #ff8a80; }
}
</style>`;

// Site CSS for the inlined pictures: the same classes on the site's variables.
export const siteStyle = `.cp { display: block; width: 100%; max-width: 530px; height: auto; margin: 8px 0; font: 12px ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
.cp .cp-bg { fill: var(--surface); } .cp .cp-screen { fill: var(--bg); stroke: var(--line); }
.cp .cp-card, .cp .cp-knob, .cp .cp-seg, .cp .cp-pop, .cp .cp-field { fill: var(--surface); } .cp .cp-pop, .cp .cp-knob, .cp .cp-seg, .cp .cp-field { stroke: var(--line); } .cp .cp-edge { stroke: var(--muted); }
.cp .cp-field-bad { stroke: #d0453b; stroke-width: 1.5; }
.cp .cp-line { fill: var(--line); } .cp .cp-on, .cp .cp-btn, .cp .cp-dot { fill: var(--ios); } .cp .cp-off { fill: color-mix(in srgb, var(--muted) 18%, var(--surface)); } .cp .cp-danger { fill: #d0453b; } .cp .cp-toast { fill: var(--text); }
.cp .cp-ring { fill: var(--surface); stroke: var(--muted); stroke-width: 1.5; } .cp .cp-ring-on { stroke: var(--ios); stroke-width: 2; } .cp .cp-dotfill { fill: var(--muted); }
.cp .cp-spin { fill: none; stroke: var(--surface); stroke-width: 2; stroke-dasharray: 22 16; }
.cp .cp-stroke { fill: none; stroke: var(--muted); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; } .cp .cp-inv-stroke { stroke: var(--surface); } .cp .cp-accent-stroke { stroke: var(--ios); } .cp .cp-muted-stroke { stroke: var(--muted); }
.cp .cp-dim { fill: #000; fill-opacity: .4; } .cp .cp-ghost, .cp .cp-ghostfill { fill: none; stroke: var(--muted); stroke-dasharray: 2 4; }
.cp .cp-guide { fill: none; stroke: var(--muted); stroke-width: 1.5; stroke-dasharray: 3 3; } .cp .cp-hit { fill: var(--accent); fill-opacity: .12; }
.cp .cp-focus { fill: none; stroke: var(--accent); stroke-width: 3; stroke-dasharray: 7 4; }
.cp .cp-finger { fill: var(--accent-2); fill-opacity: .5; }
.cp .cp-t, .cp .cp-say { fill: var(--text); } .cp .cp-b { font-weight: 700; } .cp .cp-big { font-size: 14px; } .cp .cp-small { font-size: 10px; } .cp .cp-muted, .cp .cp-s { fill: var(--muted); } .cp .cp-accent { fill: var(--ios); } .cp .cp-inv { fill: var(--surface); }
.cp .cp-s { font-size: 13px; font-weight: 700; } .cp .cp-bad { fill: #d0453b; } .cp .cp-ok { fill: #2e9255; } .cp .cp-head { font-size: 13px; font-weight: 700; }
.cp .cp-ok-b { fill: var(--pass-bg); stroke: #2e9255; } .cp .cp-bad-b { fill: var(--fail-bg); stroke: #d0453b; } .cp .cp-say { font: 600 10.5px ui-monospace, SFMono-Regular, Menlo, monospace; } .cp .cp-src { fill: var(--muted); font-size: 10px; }`;

const panel = (x, pass, p, ex) => `<g transform="translate(${x} 0)">`
  + `<text x="4" y="22" class="cp-head ${pass ? 'cp-ok' : 'cp-bad'}">${pass ? '✓ Passes' : '✗ Fails'}</text>`
  + `<rect x="0" y="${SY}" width="${SW}" height="${SH}" rx="14" class="cp-screen"/>`
  + `<g clip-path="url(#cpclip)">${p.screen}</g>`
  + bubble(ex, pass) + '</g>';

// The picture as SVG. standalone: its own colours (a file); otherwise the
// site's classes and a `cp` class on the root.
// examples: { pass, fail }, each { text, source } from results/* or missing.
export const picture = (id, { standalone = true, examples = {} } = {}) => {
  const p = pictures[id];
  if (!p) throw new Error(`No picture "${id}"`);
  const [alt, pass, fail] = p;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"${standalone ? ` width="${W}" height="${H}"` : ' class="cp"'} role="img" aria-label="${esc(alt)}">`
    + (standalone ? fileStyle : '') + `<defs><clipPath id="cpclip"><rect x="0" y="${SY}" width="${SW}" height="${SH}" rx="14"/></clipPath></defs><rect width="${W}" height="${H}" rx="10" class="cp-bg"/>`
    + `<g transform="translate(10 4)">${panel(0, true, pass, examples.pass ?? (id === 'test-ran' ? noExample['test-ran'] : noExample.pass))}${panel(260, false, fail, examples.fail ?? noExample.fail)}</g></svg>\n`;
};
export const alt = (id) => pictures[id][0];
