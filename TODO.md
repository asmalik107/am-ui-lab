# To do

What's left before the results are complete. Each item says how to run it and what it updates.

← [Back to README](README.md)

## Still to measure, on the Galaxy A15

- [ ] **Android re-renders**
  - Build Debug, install it on the phone and start Metro
  - Run `scripts/rerender-run.mjs`, which only writes iOS results today. It needs an Android output (`results/<app>/android-metrics.json`)
  - Then `rerendersAndroid` in `scripts/scorecard.mjs` and the `ioscode` table in `scripts/readme-tables.mjs` read it instead of "not measured"
- [ ] **Android reduced motion, 3 runs**
  - Each app has one run of the dialog and one of the bottom sheet, with motion on and off
  - Repeat with `node scripts/motion-test.mjs <app> <bundleId> <serial>`, 3 times per app, and report the median
  - Updates `results/<app>/android-motion.json` and the Reduced motion table in [Results](docs/results.md#reduced-motion)
- [ ] **TalkBack by hand**
  - The Android failures come from the audit only. None were traced to the code that causes them, unlike [iOS accessibility](docs/ios-accessibility.md)
  - Updates [Android accessibility](docs/android-accessibility.md)

## Gaps in the current results

- [ ] **Tamagui re-renders:** its Debug build crashes, so there are no counts on either platform. See `apps/tamagui/NOTES.md`
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
