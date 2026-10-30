# am-ui-lab

A side-by-side comparison of React Native UI libraries. Every library builds the same test screen from the same tokens and copy, and each app goes through the same scripted checks on iOS and Android. Every number below was measured. Where something couldn't be measured, this page says so.

|  | iOS | Android |
| --- | --- | --- |
| Device | iPhone 17 simulator, iOS 27.0 (Xcode 27.1) | Samsung Galaxy A15 5G (SM-A156E), Android 16. A physical budget phone. |
| What was measured | Accessibility in the light, dark and brand themes, largest text size, Reduce Motion, timings, startup, memory, scrolling, re-renders and bundle size | Timings, startup, memory and scrolling |
| Last run | 30 October 2026 | 30 October 2026 |

- **Stack:** Expo SDK 57, React Native 0.86.3, React 19.2.3, New Architecture, Reanimated 4.5.1, expo-router.
- **Builds:** Release, except the re-render counts (Debug, see [iOS](#startup-memory-scrolling-and-re-renders)).
- **Every check side by side:** [docs/checks.html](docs/checks.html) has every check for all eight apps on both platforms, with the measured detail for each cell and charts of the scores and metrics. It's generated from `results/` by `scripts/report-html.mjs`.

## The apps

| App | Library | What it is |
| --- | --- | --- |
| `apps/baseline` | none | Plain React Native with accessibility written by hand. The reference point. |
| `apps/unistyles` | react-native-unistyles 3.6.0 | Styling engine only, so components are hand-built (the baseline's, restyled) |
| `apps/uniwind` | uniwind 1.13.0 (free), Tailwind 4.3.3 | Styling engine only; the baseline's components restyled with `className` |
| `apps/nativewind` | nativewind 5.0.0-rc.0 (react-native-css 3.1.0-rc.0), Tailwind 4.1.12 | Styling engine only, release candidate; the baseline's components restyled with `className` |
| `apps/tamagui` | tamagui 3.1.2 | Styling engine + compiler + UI kit |
| `apps/gluestack` | gluestack-ui 5 (core 5.0.15) on Uniwind 1.13.0 | Copy-paste components on react-aria |
| `apps/heroui` | heroui-native 1.0.11 on Uniwind 1.13.0 | Component kit |
| `apps/reusables` | React Native Reusables (CLI 0.7.1, @rn-primitives 1.5.2) on Uniwind 1.13.0 | shadcn-style copy-paste components |

The test screen has 19 items, from buttons and form controls to overlays, a 200-row list, a theme switcher, a slider, progress bar, accordion, menu and segmented control. Its spec is in [docs/method.md](docs/method.md). Each app's `NOTES.md` records exact versions, every setup step and config file touched, every error hit and how it was fixed, and which items use library components and which are hand-built.

## Summary

**iOS**
- **Accessibility:** the baseline and the three styling engines pass 58 of 62 checks. The component kits pass 35 to 44, with gaps that would have to be fixed by hand.
- **Speed:** every app switches theme within a frame (about 32 ms) and mounts the 200-row list in about 83 ms, except Tamagui (99 ms and 115 ms).
- **Memory:** the kits use 11 to 29 MiB more than the baseline's 63 MiB at idle. After use, Tamagui uses the most (161 MiB).
- **Bundle:** from 3.95 MB (baseline) to 6.83 MB (Reusables).

**Android**
- **Speed:** Tamagui takes 632 ms to switch theme, about 7 times the baseline, and 2.4 times as long to mount the list. HeroUI is next slowest, at 246 ms.
- **Memory:** HeroUI's memory roughly doubles after use (198 → 416 MiB). The other apps grow by about 50 MiB, except gluestack (112 MiB).
- **Styling engines:** Unistyles and Reusables are within noise of the baseline. Uniwind and NativeWind are a little slower to switch theme.
- **Scrolling:** smooth in every app, with at most 1 janky frame in about 1,250.

## iOS results

All from the iPhone 17 simulator, iOS 27.0, 30 October 2026.

### Accessibility

`scripts/a11y-audit.mjs` checks every control's name, role, state and touch-target size, and then the harder cases:
- that a text-field error is reachable from the field
- that the screen behind a dialog, bottom sheet, select or menu is hidden from VoiceOver
- that toasts reach the accessibility tree
- the slider, progress bar, accordion, menu and segmented control

Every check runs in the light, dark and brand themes. No check gave a different result in dark or brand than in light, in any app, so the scores hold for all three.

| App | Test screen | Extra sheets | All checks |
| --- | --- | --- | --- |
| baseline | 53 / 57 | 5 / 5 | 58 / 62 |
| unistyles | 53 / 57 | 5 / 5 | 58 / 62 |
| uniwind | 53 / 57 | 5 / 5 | 58 / 62 |
| nativewind | 53 / 57 | 5 / 5 | 58 / 62 |
| heroui | 36 / 57 | 8 / 10 | 44 / 67 |
| reusables | 32 / 57 | 5 / 5 | 37 / 62 |
| gluestack | 29 / 57 | 6 / 9 | 35 / 66 |
| tamagui | 27 / 47 (10 checks couldn't run) | 9 / 10 | 36 / 57 |

The three styling engines carry the baseline's hand-written accessibility, so they score the same. NativeWind's score is with a line-height workaround; without it, the page was 18 screens tall (see `apps/nativewind/NOTES.md`).

The main failures:
- **In every app, the baseline included:** React Native gives `role="combobox"` and `role="tab"` no iOS trait, the `@expo/ui` Switch is 28 pt tall (under the 44 pt this check uses), and the @gorhom bottom sheet leaves the screen behind it reachable.
- **Only the `@expo/ui` BottomSheet** passes all 5 sheet checks, in every app. Every other sheet leaves the screen behind it reachable.
- **Tamagui:** disabled buttons, the switch, the checkbox and the select trigger have no usable accessibility element.
- **gluestack:** controls are under 44 pt, the switch has no name, and the field error isn't linked to the field.
- **HeroUI:** its labelled switch and checkbox row swallows the inner control's role and state, and its own bottom sheet hides its content.
- **Reusables:** controls have no name on iOS, and its Progress always reads 0%.

Every failure, with the source line that causes it, is in [docs/ios-accessibility.md](docs/ios-accessibility.md).

### Largest text size

`scripts/textsize-test.mjs` compares control heights at the default text size against the largest accessibility size (AX5). Screenshots are in `results/<app>/textsize-*.png`.

| App | Controls that grew | Clipping seen in screenshots |
| --- | --- | --- |
| baseline | 16 / 17 | none |
| unistyles | 16 / 17 | none |
| uniwind | 16 / 17 | none |
| nativewind | 16 / 17 | none |
| tamagui | 9 / 13 | none |
| gluestack | 15 / 16 | none |
| heroui | 11 / 16 | button labels partly cut off |
| reusables | 2 / 17 | **button labels cut off completely** (fixed-height buttons) |

The `@expo/ui` Switch is pushed past the screen edge in every app. The count only covers controls the app exposes as elements.

### Reduce Motion

`scripts/motion-test.mjs` times how long each overlay takes to open, from a real-time screen recording, with Reduce Motion off and then on. One frame is 33 ms.

| App | Dialog, off → on | Bottom sheet, off → on |
| --- | --- | --- |
| baseline | 333 → 67 ms | 400 → 33 ms |
| unistyles | 333 → 67 ms | 400 → 33 ms |
| uniwind | 333 → 67 ms | 400 → 33 ms |
| nativewind | 433 → 67 ms | 400 → 33 ms |
| tamagui | 100 → 100 ms (no open animation) | 400 → 33 ms |
| gluestack | 233 → 33 ms | 467 → 33 ms |
| heroui | 233 → 33 ms | 567 → 67 ms |
| reusables | 133 → 33 ms | 367 → 33 ms |

Every animated overlay respected Reduce Motion when it was on at launch. Turning it on while the app runs wasn't tested.

### Timings and bundle size

`scripts/perf-run.mjs` times from the tap to the second frame after the update, 10 runs each. One frame is 16.7 ms, so about 32 ms means it finished within a frame.

| App | Theme switch, median | 200-row list mount, median (range) | JS bundle |
| --- | --- | --- | --- |
| baseline | 32.3 ms | 82.1 ms (77–99) | 3.95 MB |
| unistyles | 32.5 ms | 82.8 ms (82–100) | 4.15 MB |
| uniwind | 32.3 ms | 82.7 ms (82–99) | 4.24 MB |
| nativewind | 32.4 ms | 82.9 ms (82–117) | 4.47 MB |
| tamagui | 99.2 ms | 115.2 ms (99–116) | 5.44 MB |
| gluestack | 32.4 ms | 83.0 ms (82–83) | 5.66 MB |
| heroui | 32.2 ms | 82.8 ms (82–99) | 5.24 MB |
| reusables | 32.1 ms | 83.2 ms (82–100) | 6.83 MB |

- **Theme switch:** a run only counts when the readout changes. Two runs in a row with exactly the same time can't be told apart from no update, so some apps have fewer than 10 runs (Unistyles has 4).
- **JS bundle:** the Hermes bytecode from `npx expo export --platform ios` (`scripts/bundle-size.mjs`). Reusables bundles every lucide icon (1,917 of them) although it uses 4.

### Startup, memory, scrolling and re-renders

`scripts/metrics-run.mjs` (Release builds, 10 cold launches) and `scripts/rerender-run.mjs` (Debug build, argent's React profiler).

| App | Startup until readable | Memory at idle → after use | App CPU during 5 list flings | Components rendered per theme switch |
| --- | --- | --- | --- | --- |
| baseline | 8.0 s | 62.9 → 124.5 MiB | 2.00 s | 298 / 298 / 290 |
| unistyles | 7.9 s | 64.2 → 125.2 MiB | 1.69 s | 128 / 128 / 126 |
| uniwind | 7.9 s | 64.0 → 131.2 MiB | 1.91 s | 507 / 509 / 302 |
| nativewind | 8.0 s | 66.9 → 132.5 MiB | 2.08 s | 460 / 460 / 456 |
| tamagui | 8.4 s | 82.2 → 160.8 MiB | 1.98 s | not measured (Debug build aborts) |
| gluestack | 7.9 s | 74.2 → 127.0 MiB | 2.15 s | 815 / 815 / 508 |
| heroui | 7.9 s | 91.4 → 127.6 MiB | 2.46 s | 1137 / 1135 / 948 |
| reusables | 7.9 s | 75.5 → 143.0 MiB | 1.91 s | 603 / 608 / 356 |

- **Startup until readable:** from the launch call until the screen title is in the accessibility tree, which is when VoiceOver could first read it. It isn't first paint. The apps sit close together and the figure moves from day to day, so read it as a group, not a ranking.
- **Memory:** `phys_footprint` from `footprint`. "After use" is after scrolling the list and opening and closing every overlay once.
- **Scrolling:** the simulator can't record frame hitches, so this is the CPU time of the app's threads while the list is flung 5 times. No app had a main-thread hang.
- **Re-renders:** components React rendered for light → dark, dark → brand and brand → light. Counts only, because Debug timings aren't representative.

## Android results

All from a Samsung Galaxy A15 5G (SM-A156E), Android 16, 30 October 2026. It's a budget phone, so it shows what each library costs on slow hardware. The accessibility, text-size and Reduce Motion checks haven't been run on Android yet.

### Timings, startup, memory and scrolling

The same `scripts/perf-run.mjs` and `scripts/metrics-run.mjs` as on iOS, given the phone's adb serial. Release builds, 10 runs each.

| App | Theme switch, median (range) | 200-row list mount, median (range) | Startup until readable | Memory at idle → after use | App CPU during 5 list flings | Janky frames |
| --- | --- | --- | --- | --- | --- | --- |
| baseline | 92.7 ms (76–124) | 155.7 ms (135–190) | 2.88 s | 163.1 → 213.4 MiB | 8.53 s | 0 of 1,224 |
| unistyles | 83.2 ms (61–118) | 149.4 ms (133–182) | 2.98 s | 163.7 → 220.3 MiB | 9.12 s | 0 of 1,290 |
| uniwind | 126.0 ms (97–181) | 169.6 ms (146–201) | 2.92 s | 160.6 → 217.2 MiB | 9.08 s | 0 of 1,286 |
| nativewind | 182.3 ms (150–232) | 181.5 ms (159–277) | 2.94 s | 161.0 → 208.5 MiB | 9.34 s | 0 of 1,250 |
| tamagui | **631.5 ms** (615–641) | **374.0 ms** (332–423) | 3.38 s | 180.2 → 226.4 MiB | 8.96 s | 1 of 1,224 |
| gluestack | 158.1 ms (137–238) | 153.6 ms (124–200) | 3.23 s | 179.6 → **292.4 MiB** | 9.14 s | 0 of 1,280 |
| heroui | **245.6 ms** (210–325) | 202.0 ms (180–265) | 3.35 s | 197.8 → **416.3 MiB** | 10.31 s | 0 of 1,260 |
| reusables | 100.7 ms (68–107) | 157.4 ms (145–200) | 3.14 s | 172.8 → 221.1 MiB | 8.24 s | 1 of 1,248 |

- **Memory** is total PSS from `dumpsys meminfo`, which isn't the same measure as iOS's `phys_footprint`. Compare apps within one platform, not across platforms.
- **Startup until readable** is when TalkBack could first read the screen. As on iOS, read it as a group. Android's own first-frame time (`am start -W`, which here is the splash screen) is in each app's `results/<app>/android-metrics.md`.
- **CPU** is user plus system time of the app's threads during the flings, read from `/proc`.
- **Janky frames** come from `dumpsys gfxinfo`. iOS has no equivalent on the simulator.
- **Conditions:** the phone was charging, with power saving off and no thermal throttling. It warmed from 32.5 °C to 34.8 °C. The apps ran in the order baseline, unistyles, uniwind, tamagui, gluestack, heroui, reusables, nativewind, so the baseline ran on the coolest phone.
- **Idle CPU** (one check, 10 s on the test screen): most apps used about 5.8 s, mostly the always-spinning "Saving" indicator. HeroUI used 9.1 s and Reusables 1.1 s.

An Android emulator was tried first. Emulator 37.1 and 37.2 crashed repeatedly, so no emulator numbers are reported.

## Developer cost

What it would cost a developer to build the same test screen with each library. Code, not a platform measure. Counted by `scripts/devcost.mjs` on 28 October, before the one-component-per-file refactor; the raw output is in `results/devcost.md`.

| What it counts | baseline | unistyles | uniwind | nativewind | heroui | gluestack | tamagui | reusables |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Lines of screen code you write | 840 | 957 | 814 | 819 | 641 | 770 | 812 | 654 |
| Kit code copied into your app (lines) | 0 | 0 | 0 | 0 | 0 | 7,488 | 0 | 1,519 |
| Config files added or changed | 0 | 2 | 3 | 6 | 3 | 8 | 5 | 4 |
| Setup steps | n/a | 8 | 11 | 14 | 10 | 5 | 11 | 12 |
| Setup problems hit | n/a | 2 | 0 | 0 | 4 | 8 | 6 | 6 |
| Type errors in your own code | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Type errors in copied kit code | 0 | 0 | 0 | 0 | 0 | 17 | 0 | 0 |
| Accessibility props written by hand | 75 | 75 | 75 | 75 | 20 | 11 | 12 | 21 |

- **Kit code copied into your app:** gluestack and Reusables don't ship as npm packages. Their CLI copies each component's source into the app, and from then on it's yours to maintain.
- **Setup steps and problems:** counted from each app's `NOTES.md`. A rough guide: one problem took two minutes, another twenty.
- **Type errors:** from `npx tsc --noEmit`. All 17 of gluestack's are in its copied components. The app still builds, but the project's type-check fails until someone fixes code they didn't write.
- **Accessibility props written by hand:** the styling engines repeat the baseline's 75, while the kits supply some of it themselves.

## Limits

**iOS**
- The simulator exposes the accessibility tree but doesn't let you hear VoiceOver, check the spoken swipe order or test Switch Control. Those need a device.
- Frame hitches and first paint aren't measured.
- The timing clock runs in JS. Libraries that apply styles natively (Unistyles, Tamagui's native runtime) may do work it doesn't see.
- Some Tamagui elements aren't in argent's view-hierarchy walk, so those checks read the system tree, which gives no selected state.
- Tamagui's Debug build aborts on a Yoga layout assertion, so its re-renders aren't counted. Its RadioGroup doesn't draw the selected dot, although the tree reports it as checked.

**Android**
- Only timings and metrics have been run, on one budget phone. The accessibility audit, text size, Reduce Motion and TalkBack haven't been tested.
- Memory (PSS) isn't comparable with iOS's `phys_footprint`.

## Reproduce

These need [argent](https://github.com/software-mansion/argent) for device control, plus ffmpeg for the Reduce Motion recordings.

**iOS**

```bash
scripts/build-ios.sh <app> Release
```

```bash
scripts/run-all.sh <simulator-udid>
```

For the re-render counts, build Debug, start Metro and install with `scripts/audit-app.sh <app> <udid> Debug`, then:

```bash
node scripts/rerender-run.mjs <app> dev.asimmalik.uilab.<app> <simulator-udid>
```

**Android**

Build and install each app, then pass the device's adb serial instead of a simulator UDID. Results go to `results/<app>/android-*`.

```bash
scripts/build-android.sh <app> Release
```

```bash
adb -s <serial> install -r -g apps/<app>/android/app/build/outputs/apk/release/app-release.apk
```

```bash
node scripts/perf-run.mjs <app> dev.asimmalik.uilab.<app> <serial>
```

```bash
node scripts/metrics-run.mjs <app> dev.asimmalik.uilab.<app> <serial>
```

`scripts/contrast.mjs` checks the shared tokens against WCAG contrast; `scripts/devcost.mjs` and `scripts/bundle-size.mjs` produce the cost table and bundle sizes; `scripts/report-html.mjs` rebuilds `docs/checks.html`.
