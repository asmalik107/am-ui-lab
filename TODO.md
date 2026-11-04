# To do

What's left before the results are complete. Each item says how to run it and what it updates.

← [Back to README](README.md)

## Still to measure, on the Galaxy A15

- [x] **Android re-renders:** measured on 2 November 2026 with `scripts/rerender-android.sh <serial>`
- [x] **Android reduced motion, 3 runs:** median of 3 per overlay since 2 November 2026 (`node scripts/motion-test.mjs <app> <bundleId> <serial> 3`)
- [x] **TalkBack by hand:** every Android failure traced to its code on 2 November 2026, in [Android accessibility](docs/android-accessibility.md), and checked with TalkBack on 4 November 2026. Two Reusables failures (Switch and Select trigger) turned out to be audit artifacts, because TalkBack reads their labels. The audit was fixed and rerun the same day

## Gaps in the current results

- [x] **Tamagui re-renders on iOS:** not measurable, recorded as a Tamagui shortcoming. Its closed Select keeps a `display: none` view, which crashes the Debug build through an open React Native bug, [react-native#52349](https://github.com/react/react-native/issues/52349). Traced on 4 November 2026 in [its notes](apps/tamagui/NOTES.md#ios-debug-build-crashes-traced-4-november-2026)
- [x] **Tamagui Select and Accordion on iOS:** a Tamagui result, not a gap. Their triggers aren't accessibility elements, so VoiceOver can't open them ([its notes](apps/tamagui/NOTES.md#select-and-accordion-triggers-re-checked-29-october-2026))
- [x] **gluestack's own bottom sheet:** a gluestack result, not a gap. It never closes on either platform, so "screen reachable again after close" can't run. `close()` only sets the index to -1, and @gorhom/bottom-sheet 5.2.14 then animates to `detents[-1]`, which is undefined ([Android accessibility](docs/android-accessibility.md#gluestack))

## Optional

- [x] **A physical iPhone:** speed, memory and scrolling now run on an iPhone 12 Pro (`scripts/run-all-iphone.sh`); accessibility stays on the simulator
- [ ] **Neutral wording:** "The answer" and the library roles (such as "Best all-rounder") rank the libraries. The site title no longer does

## After any new results

Regenerate the docs and the site, then commit `site/` with them:

```bash
node scripts/readme-tables.mjs
```

```bash
node scripts/checks-md.mjs
```

```bash
node scripts/site.mjs
```
