// Baseline controls ported to Unistyles. Unistyles ships no components, so
// accessibility (roles, labels, states) is still hand-written exactly as in
// the baseline. What changes is styling: every style lives in
// StyleSheet.create((theme, rt) => ...), and a theme switch is applied by
// Unistyles' C++ core to the shadow tree without re-rendering these
// components. Props that are not styles (Switch trackColor,
// ActivityIndicator color) go through withUnistyles.
import { StyleSheet } from 'react-native-unistyles';

import { target } from './shared';

// Indicator glyphs (checkbox box, radio ring) follow the system text size.
// RN Text already scales fontSize, so rt.fontScale is used only for
// non-text sizes, capped so the box never dwarfs its label.
const glyph = (size: number, fontScale: number) => Math.round(size * Math.min(fontScale, 2));

export const styles = StyleSheet.create((theme, rt) => ({
  label: { ...theme.type.label, color: theme.colors.text },
  bodyText: { ...theme.type.body, color: theme.colors.text },
  rowText: { ...theme.type.body, color: theme.colors.text, flex: 1 },
  switchRow: { minHeight: target, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  choiceRow: { minHeight: target, flexDirection: 'row', alignItems: 'center', gap: theme.space.md },
  group: { gap: theme.space.xs },
  checkbox: (checked: boolean) => ({
    width: glyph(24, rt.fontScale),
    height: glyph(24, rt.fontScale),
    borderRadius: theme.radius.sm,
    borderWidth: 2,
    borderColor: checked ? theme.colors.primary : theme.colors.border,
    backgroundColor: checked ? theme.colors.primary : 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  checkmark: { color: theme.colors.onPrimary, fontWeight: '700' },
  radio: (selected: boolean) => ({
    width: glyph(22, rt.fontScale),
    height: glyph(22, rt.fontScale),
    borderRadius: glyph(11, rt.fontScale),
    borderWidth: 2,
    borderColor: selected ? theme.colors.primary : theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  }),
  radioDot: {
    width: glyph(10, rt.fontScale),
    height: glyph(10, rt.fontScale),
    borderRadius: glyph(5, rt.fontScale),
    backgroundColor: theme.colors.primary,
  },
  tabsWrap: { gap: theme.space.md },
  tablist: { flexDirection: 'row', borderBottomWidth: 1, borderColor: theme.colors.border },
  tab: (selected: boolean) => ({
    flex: 1,
    minHeight: target,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderColor: selected ? theme.colors.primary : 'transparent',
  }),
  tabLabel: (selected: boolean) => ({ ...theme.type.label, color: selected ? theme.colors.primary : theme.colors.textMuted }),
  caption: { ...theme.type.caption, color: theme.colors.textMuted },
  chevron: { color: theme.colors.textMuted },
  sliderHit: { height: target, justifyContent: 'center' },
  track: { height: 6, borderRadius: 3, backgroundColor: theme.colors.border },
  fill: (pct: number) => ({ width: `${pct * 100}%`, height: 6, borderRadius: 3, backgroundColor: theme.colors.primary }),
  thumb: (left: number) => ({ position: 'absolute', left, width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.surfaceRaised, borderWidth: 2, borderColor: theme.colors.primary }),
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: theme.colors.border },
  progressFill: (pct: number) => ({ width: `${pct * 100}%`, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary }),
  accordion: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md },
  accordionItem: (divider: boolean) => ({ borderTopWidth: divider ? 1 : 0, borderColor: theme.colors.border }),
  accordionHeader: { minHeight: target, paddingHorizontal: theme.space.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  accordionPanel: { ...theme.type.body, color: theme.colors.textMuted, paddingHorizontal: theme.space.md, paddingBottom: theme.space.md },
  segmented: { flexDirection: 'row', borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: 2 },
  segment: (selected: boolean) => ({ flex: 1, minHeight: target, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.sm, backgroundColor: selected ? theme.colors.primary : 'transparent' }),
  segmentLabel: (selected: boolean) => ({ ...theme.type.label, color: selected ? theme.colors.onPrimary : theme.colors.text }),
  scrim: { flex: 1, backgroundColor: theme.colors.scrim, justifyContent: 'center', padding: theme.space.xl },
  menuWrap: { flex: 1, justifyContent: 'center', padding: theme.space.xl },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: theme.colors.scrim },
  card: { backgroundColor: theme.colors.surfaceRaised, borderRadius: theme.radius.lg, padding: theme.space.xl, gap: theme.space.md },
  title: { ...theme.type.title, color: theme.colors.text },
  body: { ...theme.type.body, color: theme.colors.textMuted },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: theme.space.sm },
  selectWrap: { gap: theme.space.xs },
  trigger: {
    minHeight: target,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceRaised,
  },
  value: { ...theme.type.body, color: theme.colors.text },
  menu: { backgroundColor: theme.colors.surfaceRaised, borderRadius: theme.radius.lg, paddingVertical: theme.space.sm },
  option: { minHeight: target, paddingHorizontal: theme.space.lg, justifyContent: 'center' },
  optionText: (selected: boolean) => ({
    ...theme.type.body,
    color: selected ? theme.colors.primary : theme.colors.text,
    fontWeight: selected ? '700' : '400',
  }),
  sheet: { padding: theme.space.xl, gap: theme.space.md, paddingBottom: theme.space.xxl },
}));
