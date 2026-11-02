import { execFileSync } from 'node:child_process';

export function androidA11y({ udid, bundleId, swipe, sleep }) {
  const adb = (...args) => execFileSync('adb', ['-s', udid, ...args], { encoding: 'utf8', maxBuffer: 64 << 20 });
  const screen = { width: 0, height: 0 };
  let display;

  function dump() {
    for (let i = 0; i < 10; i++) {
      try {
        const m = adb('shell', 'am', 'instrument', '-w', 'dev.asimmalik.uilab.a11ydump/.Dump').match(/json=(\S+)/);
        const d = m && JSON.parse(Buffer.from(m[1], 'base64').toString('utf8'));
        if (d?.activePackage === bundleId && d.nodes.length) {
          display ??= [...adb('shell', 'wm', 'size').matchAll(/(\d+)x(\d+)/g)].pop().slice(1).map(Number);
          const [pw, ph] = display;
          screen.width = pw / d.density;
          screen.height = ph / d.density;
          return d.nodes;
        }
      } catch {
        execFileSync('sleep', ['1']);
      }
      adb('shell', 'am', 'force-stop', 'com.argent.androiddevtools');
      execFileSync('sleep', ['1']);
    }
    throw new Error('accessibility dump returned nothing for the app');
  }

  function fromNode(n) {
    const cls = (n.className ?? '').split('.').pop();
    const rd = (n.roleDescription ?? '').toLowerCase();
    const has = (a) => n.actions.includes(a);
    const traits = [];
    if (/^(Button|ImageButton)$/.test(cls) || rd === 'button') traits.push('button');
    if (!n.enabled) traits.push('notEnabled');
    if (/^(Switch|ToggleButton)$/.test(cls) || rd === 'switch') traits.push('toggleButton');
    if (cls === 'CheckBox' || rd === 'checkbox') traits.push('checkbox');
    if (cls === 'RadioButton' || rd === 'radio button') traits.push('radio');
    if (cls === 'SeekBar' || (n.range && has('setProgress'))) traits.push('adjustable');
    if (n.heading) traits.push('header');
    if (n.selected) traits.push('selected');
    if (cls === 'Spinner' || /combo|drop ?down|pop ?up/.test(rd)) traits.push('combobox');
    if (rd === 'tab' || cls === 'TabWidget') traits.push('tab');
    if (/menu ?item/.test(rd)) traits.push('menuitem');
    const state = [
      n.stateDescription,
      n.checkable ? (n.checked ? 'checked' : 'unchecked') : null,
      n.selected ? 'selected' : null,
      has('collapse') ? 'expanded' : has('expand') ? 'collapsed' : null,
      n.range && !n.stateDescription ? String(n.range.current) : null,
    ].filter(Boolean);
    const role = n.heading ? 'AXHeading' : traits.includes('button') ? 'AXButton' : traits.includes('menuitem') ? 'AXMenuItem' : `AX${cls}`;
    const b = n.bounds;
    const x = b.x / screen.width;
    const y = b.y / screen.height;
    const w = b.w / screen.width;
    const h = b.h / screen.height;
    return {
      identifier: n.id ?? undefined,
      // TalkBack skips an empty description, and names a control by its labelledby
      // node; a text field's own text is its value, so the label comes first there.
      label: n.contentDescription || (n.editable && n.labeledBy) || n.text || n.labeledBy || '',
      value: state.length ? state.join(', ') : n.editable ? n.text ?? '' : undefined,
      hint: [n.error, n.tooltip, n.hint].filter(Boolean).join(' ') || undefined,
      traits,
      role,
      roleDescription: n.roleDescription ?? undefined,
      frame: { x: b.x, y: b.y, width: b.w, height: b.h },
      visible: n.visible && b.h > 0 && b.w > 0,
      x, y, w, h, nx: x + w / 2, ny: y + h / 2,
    };
  }

  function tree() {
    const nodes = dump();
    const stack = [];
    // A focusable container (React Native's accessible={true}) is one TalkBack stop
    // that reads its children; scroll containers are focusable too but aren't stops.
    const scroller = (n) => n.actions.includes('scrollForward') || n.actions.includes('scrollBackward') || /ScrollView|RecyclerView|ListView$/.test(n.className ?? '');
    const own = nodes.map((n) => n.clickable || n.screenReaderFocusable || n.editable || n.checkable || (n.focusable && !scroller(n)));
    const els = nodes.map((n, i) => {
      stack.length = n.depth;
      const inside = stack.some(Boolean);
      stack[n.depth] = own[i];
      const e = fromNode(n);
      e.focusable = own[i] || (!inside && !!(n.text || n.contentDescription));
      return e;
    });
    nodes.forEach((n, i) => {
      if (!own[i] || els[i].label) return;
      const words = [];
      for (let j = i + 1; j < nodes.length && nodes[j].depth > n.depth; j++) {
        if (own[j]) {
          const d = nodes[j].depth;
          while (j + 1 < nodes.length && nodes[j + 1].depth > d) j++;
          continue;
        }
        const t = nodes[j].contentDescription ?? nodes[j].text;
        if (t) words.push(t);
      }
      els[i].label = words.join(' ');
    });
    return els;
  }
  const focusable = () => tree().filter((e) => e.focusable);
  const byId = (els, id) => els.find((e) => e.identifier === id);

  async function reach(id) {
    let down = true;
    let last = '';
    for (let i = 0; i < 40; i++) {
      const els = tree();
      const e = byId(els, id);
      if (e?.visible && e.y > 0.12 && e.y + e.h < 0.92) return e;
      const seen = els.filter((x) => x.visible).map((x) => x.label).join('|');
      if (!e && seen === last) down = !down;
      last = seen;
      swipe((e ? e.y < 0.12 : !down) ? -0.35 : 0.35);
      await sleep(400);
    }
    throw new Error(`could not scroll ${id} into view`);
  }

  async function toTop() {
    for (let i = 0; i < 16; i++) swipe(-0.6);
    await sleep(600);
  }

  async function everything() {
    const all = new Map();
    let last = '';
    for (let i = 0; i < 30; i++) {
      const els = tree();
      for (const e of els) {
        const k = e.identifier ?? `label:${e.label}`;
        if (!all.has(k) || e.visible) all.set(k, e);
      }
      const seen = els.filter((x) => x.visible).map((x) => x.label).join('|');
      if (seen === last) break;
      last = seen;
      swipe(0.6);
      await sleep(400);
    }
    await toTop();
    return [...all.values()];
  }

  function setting(namespace, key, value) {
    const before = adb('shell', 'settings', 'get', namespace, key).trim();
    adb('shell', 'settings', 'put', namespace, key, String(value));
    return () => (before === 'null' ? adb('shell', 'settings', 'delete', namespace, key) : adb('shell', 'settings', 'put', namespace, key, before));
  }

  return { adb, screen, tree, focusable, reach, everything, toTop, setting };
}
