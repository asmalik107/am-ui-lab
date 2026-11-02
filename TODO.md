# To do

What's left before the results are complete. Each item says how to run it and what it updates.

← [Back to README](README.md)

## Still to measure, on the Galaxy A15

- [x] **Android re-renders:** measured on 2 November 2026 with `scripts/rerender-android.sh <serial>`
- [ ] **Android reduced motion, 3 runs**
  - Each app has one run of the dialog and one of the bottom sheet, with motion on and off
  - Repeat with `node scripts/motion-test.mjs <app> <bundleId> <serial>`, 3 times per app, and report the median
  - Updates `results/<app>/android-motion.json` and the Reduced motion table in [Results](docs/results.md#reduced-motion)
- [ ] **TalkBack by hand**
  - The Android failures come from the audit only. None were traced to the code that causes them, unlike [iOS accessibility](docs/ios-accessibility.md)
  - Updates [Android accessibility](docs/android-accessibility.md)

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
