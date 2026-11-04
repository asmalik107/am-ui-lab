# To do

What's left before the results are complete. Each item says how to run it and what it updates.

← [Back to README](README.md)

## Still to measure, on the Galaxy A15

- [x] **Android re-renders:** measured on 2 November 2026 with `scripts/rerender-android.sh <serial>`
- [x] **Android reduced motion, 3 runs:** median of 3 per overlay since 2 November 2026 (`node scripts/motion-test.mjs <app> <bundleId> <serial> 3`)
- [x] **TalkBack by hand:** every Android failure traced to its code on 2 November 2026, in [Android accessibility](docs/android-accessibility.md), and checked with TalkBack on 4 November 2026. Two Reusables failures (Switch and Select trigger) turned out to be audit artifacts, because TalkBack reads their labels. The audit was fixed and rerun the same day

## Gaps in the current results

- [ ] **Tamagui re-renders on iOS:** its Debug build crashes there, so it has Android counts only. See `apps/tamagui/NOTES.md`
- [ ] **Tamagui Select and Accordion on iOS:** they couldn't be tested
- [ ] **gluestack's own bottom sheet:** tested on 4 of the 5 sheet checks

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
