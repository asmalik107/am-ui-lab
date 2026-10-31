# am-ui-lab

A side-by-side comparison of React Native UI libraries on iOS and Android. Every library builds the same test screen from the same tokens and copy, and each app goes through the same scripted checks on both platforms. Every number below was measured. Where something couldn't be measured, this page says so.

|  | iOS | Android |
| --- | --- | --- |
| Device | iPhone 17 simulator, iOS 27.0 (Xcode 27.1) | Samsung Galaxy A15 5G (SM-A156E), Android 16. A physical budget phone. |
| Screen reader whose tree is checked | VoiceOver | TalkBack |
| Last run | 30 October 2026 | 30–31 October 2026 |

- **Stack:** Expo SDK 57, React Native 0.86.3, React 19.2.3, New Architecture, Reanimated 4.5.1, expo-router.
- **Builds:** Release, except the re-render counts (Debug, iOS only).
- **Every check side by side:** [docs/checks.html](docs/checks.html) has every check for all eight apps, with the iOS and Android result in each cell, the measured detail on hover, and charts. It's generated from `results/` by `scripts/report-html.mjs`.
- **How each check works on each platform:** [docs/method.md](docs/method.md#ios-and-android).

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

- **Accessibility:** the baseline and the three styling engines pass 58 of 62 checks on iOS and 60 of 62 on Android. The component kits pass 35 to 47, with much the same gaps on both platforms. No check changed between the light, dark and brand themes on either platform.
- **Where the platforms disagree:** React Native's `combobox` and `tab` roles reach TalkBack but give VoiceOver no trait, so every app passes those two checks on Android only. Controls 44 tall pass Apple's 44 pt and fail Google's 48 dp. Each kit has a few more of its own, listed under [Accessibility](#accessibility).
- **Largest text size:** text grows on both platforms. On iOS the controls grow with it. On Android most controls are already 48 dp tall and the text fits inside, so few of them change height. Reusables' button labels are cut off on both.
- **Reduced motion:** every animated overlay drops to one or two frames on both platforms.
- **Speed:** on iOS every app switches theme within a frame except Tamagui (99 ms). On the budget phone the apps spread out: Tamagui takes 630 ms, about 6 times the baseline, and HeroUI, gluestack and NativeWind 180 to 240 ms. Unistyles is the fastest there, ahead of the baseline.
- **Memory:** on Android, HeroUI's memory roughly doubles after use (199 → 416 MiB) and gluestack's grows by 103 MiB. The other apps grow by about 50 MiB. On iOS Tamagui uses the most.
- **Scrolling:** smooth on the phone in every app, with at most 1 janky frame in about 1,250.

## Where the platforms differ

The checks are the same on both platforms. These are the places where the platforms themselves differ, so the measure or the threshold differs too.

| Check | iOS | Android |
| --- | --- | --- |
| Accessibility tree | What VoiceOver is given: the view hierarchy and system tree, through argent | What TalkBack is given: the active window's tree, read through UiAutomation by `scripts/android-a11y-dump` |
| Touch target | 44 pt (Apple) | 48 dp (Material) |
| Largest text size | AX5, the largest accessibility size | Font scale 2.0, the largest the system offers |
| Reduced motion | Reduce Motion on | Remove animations on (all three animation scales at 0) |
| Memory | `phys_footprint` | Total PSS from `dumpsys meminfo` |
| Scrolling | App CPU during flings (the simulator can't record hitches) | App CPU during flings, plus janky frames from `dumpsys gfxinfo` |
| Bundle size and re-renders | Measured | Not measured: the JS is the same, so it would repeat the iOS figures |

Don't compare memory or speed across platforms: one is a simulator on a Mac, the other a budget phone. Compare the apps within each platform, and compare how each app ranks on the two.

## Accessibility

`scripts/a11y-audit.mjs` checks every control's name, role, state and touch-target size, and then the harder cases:
- that a text-field error is reachable from the field
- that the screen behind a dialog, bottom sheet, select or menu is hidden from the screen reader
- that toasts reach the accessibility tree
- the slider, progress bar, accordion, menu and segmented control

Every check runs in the light, dark and brand themes. The table is the light theme. "Checks that differ" counts checks that pass on one platform and fail on the other.

<!-- begin:accessibility -->
| App | Test screen, iOS | Test screen, Android | Extra sheets, iOS | Extra sheets, Android | All checks, iOS | All checks, Android | Checks that differ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| baseline | 53 / 57 | 55 / 57 | 5 / 5 | 5 / 5 | 58 / 62 | 60 / 62 | 2 |
| unistyles | 53 / 57 | 55 / 57 | 5 / 5 | 5 / 5 | 58 / 62 | 60 / 62 | 2 |
| uniwind | 53 / 57 | 55 / 57 | 5 / 5 | 5 / 5 | 58 / 62 | 60 / 62 | 2 |
| nativewind | 53 / 57 | 55 / 57 | 5 / 5 | 5 / 5 | 58 / 62 | 60 / 62 | 2 |
| tamagui | 27 / 47 | 33 / 57 | 9 / 10 | 9 / 10 | 36 / 57 | 42 / 67 | 9 |
| gluestack | 29 / 57 | 29 / 57 | 6 / 9 | 7 / 9 | 35 / 66 | 36 / 66 | 5 |
| heroui | 36 / 57 | 38 / 57 | 8 / 10 | 9 / 10 | 44 / 67 | 47 / 67 | 7 |
| reusables | 32 / 57 | 32 / 57 | 5 / 5 | 5 / 5 | 37 / 62 | 37 / 62 | 6 |
<!-- end:accessibility -->

Failing in every app, the baseline included, on both platforms:
- **The `@expo/ui` Switch is under the touch-target size:** 28 pt tall on iOS, and 47.6 dp on Android, one pixel short of 48 dp.
- **The @gorhom bottom sheet leaves the screen behind it reachable.** Only the `@expo/ui` BottomSheet passes every sheet check on both platforms.

Where the platforms disagree:
- **Every app:** `role="combobox"` (the select trigger) and `role="tab"` are announced by TalkBack but give VoiceOver no trait, so they fail on iOS only. These are the baseline's 2 differences.
- **Touch targets of 44:** pass Apple's 44 pt and fail Google's 48 dp. That's Tamagui's buttons, tabs, menu and segmented control, the segmented control in gluestack and HeroUI, and Reusables' slider.
- **Tamagui:** the disabled button and the slider have a usable element on Android but not on iOS. The menu hides the screen behind it on Android only. Its menu items are buttons on iOS only. On iOS its Select and Accordion couldn't be tested at all (not in the tree); on Android they could.
- **gluestack:** the loading button says "In progress" on iOS only. Its own BottomSheet's text is readable on Android but hidden on iOS. Menu items are menu items on Android only.
- **HeroUI:** the dialog title is a heading on iOS only. Sheet text is readable on Android but hidden on iOS. The slider and menu items get a role on Android only.
- **Reusables:** the select marks the current option on Android only. The select and menu hide the screen behind them on iOS only.

Failing on both platforms, by kit:
- **Tamagui:** the switch and checkbox have no name, and the select trigger reads only its value. Every sheet but `@expo/ui`'s, and the dialog, leave the screen behind reachable.
- **gluestack:** controls are 22 to 40 tall, the switch has no name, the field error isn't linked to the field, the slider has no value, and its own BottomSheet doesn't close.
- **HeroUI:** the labelled switch and checkbox rows swallow the inner control's name, role and state, and the field error isn't linked to the field.
- **Reusables:** small controls (the checkbox is 16 tall), no name on the text field or checkbox, the field error isn't linked to the field, and its Progress always reads 0%.

Every iOS failure, with the source line that causes it, is in [docs/ios-accessibility.md](docs/ios-accessibility.md). NativeWind's score is with a line-height workaround; without it, the page was 18 screens tall (see `apps/nativewind/NOTES.md`).

## Largest text size

`scripts/textsize-test.mjs` compares control heights at the default text size against the largest one. Screenshots are in `results/<app>/textsize-*.png` (iOS) and `results/<app>/android-textsize-*.png` (Android).

<!-- begin:textsize -->
| App | Controls that grew, iOS (AX5) | Controls that grew, Android (2.0) | Pushed off screen, iOS | Pushed off screen, Android |
| --- | --- | --- | --- | --- |
| baseline | 16 / 17 | 1 / 16 | native-switch | native-switch |
| unistyles | 16 / 17 | 1 / 16 | native-switch | native-switch |
| uniwind | 16 / 17 | 1 / 16 | native-switch | native-switch |
| nativewind | 16 / 17 | 1 / 16 | native-switch | native-switch |
| tamagui | 9 / 13 | 5 / 16 | native-switch | native-switch |
| gluestack | 15 / 16 | 13 / 16 | tabs-2, native-switch | native-switch |
| heroui | 11 / 16 | 9 / 16 | tabs-2, native-switch | native-switch |
| reusables | 2 / 17 | 1 / 16 | tabs-0, tabs-2, native-switch | native-switch |
<!-- end:textsize -->

- **Growth works differently on the two platforms.** At AX5, iOS controls grow with their text (the baseline's button goes from 44 to 72 pt). At font scale 2.0 the text grows too, but the baseline's controls are already 48 dp tall and the larger text fits inside, so only the text field gets taller. gluestack, HeroUI and Tamagui size their controls from the text, so more of theirs grow.
- **Pushed off screen:** the `@expo/ui` Switch on both platforms in every app, and on iOS some tabs in gluestack, HeroUI and Reusables.
- **Clipping seen in the screenshots:** Reusables' button labels are cut off on both platforms (fixed-height buttons). HeroUI's are partly cut off on iOS and fit on Android. No other app clips.

## Reduced motion

`scripts/motion-test.mjs` times how long each overlay takes to open, from a real-time screen recording, with reduced motion off and then on. One frame is 33 ms.

<!-- begin:motion -->
| App | Dialog, iOS | Dialog, Android | Bottom sheet, iOS | Bottom sheet, Android |
| --- | --- | --- | --- | --- |
| baseline | 333 → 67 ms | 200 → 67 ms | 400 → 33 ms | 200 → 33 ms |
| unistyles | 333 → 67 ms | 500 → 33 ms | 400 → 33 ms | 267 → 67 ms |
| uniwind | 333 → 67 ms | 233 → 33 ms | 400 → 33 ms | 200 → 33 ms |
| nativewind | 433 → 67 ms | 200 → 67 ms | 400 → 33 ms | 267 → 33 ms |
| tamagui | 100 → 100 ms | 33 → 33 ms | 400 → 33 ms | 267 → 33 ms |
| gluestack | 233 → 33 ms | 267 → 67 ms | 467 → 33 ms | 233 → 33 ms |
| heroui | 233 → 33 ms | 233 → 67 ms | 567 → 67 ms | 433 → 33 ms |
| reusables | 133 → 33 ms | 233 → 67 ms | 367 → 33 ms | 233 → 33 ms |
<!-- end:motion -->

- **Every animated overlay respects reduced motion** on both platforms, dropping to one or two frames. Tamagui's dialog has no open animation on either.
- **Each figure is one recording**, so a frame or two either way is noise. Unistyles' 500 ms Android dialog is the baseline's component, which took 200 ms; treat single outliers with care.
- Turning reduced motion on while the app runs wasn't tested.

## Timings

`scripts/perf-run.mjs` times from the tap to the second frame after the update, 10 runs each, median (range). One frame is 16.7 ms on both devices.

<!-- begin:timings -->
| App | Theme switch, iOS | Theme switch, Android | List mount, iOS | List mount, Android |
| --- | --- | --- | --- | --- |
| baseline | 32.3 ms (32–32) | 98.9 ms (87–164) | 82.1 ms (77–99) | 147.6 ms (141–177) |
| unistyles | 32.5 ms (32–33) | 70.6 ms (54–139) | 82.8 ms (82–100) | 150.4 ms (137–173) |
| uniwind | 32.3 ms (32–33) | 136.8 ms (104–178) | 82.7 ms (82–99) | 163.9 ms (139–183) |
| nativewind | 32.4 ms (32–33) | 183.4 ms (154–207) | 82.9 ms (82–117) | 189.3 ms (171–294) |
| tamagui | 99.2 ms (99–116) | 629.6 ms (583–676) | 115.2 ms (99–116) | 365.1 ms (290–447) |
| gluestack | 32.4 ms (32–33) | 192.0 ms (137–244) | 83.0 ms (82–83) | 142.6 ms (134–164) |
| heroui | 32.2 ms (32–67) | 238.7 ms (206–324) | 82.8 ms (82–99) | 203.5 ms (188–253) |
| reusables | 32.1 ms (16–33) | 96.8 ms (82–123) | 83.2 ms (82–100) | 161.3 ms (143–199) |
<!-- end:timings -->

- **On iOS** the simulator runs on a Mac, and every app but Tamagui finishes within a frame or two, so they can't be told apart. **On the phone** they spread out, and Tamagui is the slowest on both.
- **Unistyles** is the fastest theme switch on Android (71 ms, against the baseline's 99 ms), as it applies styles natively. Reusables is level with the baseline.
- **iOS run counts:** a run only counts when the readout changes. Two runs in a row with exactly the same time can't be told apart from no update, so some iOS apps have fewer than 10 runs (Unistyles has 4).

## Startup, memory and scrolling

`scripts/metrics-run.mjs`, Release builds, 10 cold launches.

<!-- begin:metrics -->
| App | Startup, iOS | Startup, Android | Memory idle → used, iOS | Memory idle → used, Android | CPU in flings, iOS | CPU in flings, Android | Janky frames, Android |
| --- | --- | --- | --- | --- | --- | --- | --- |
| baseline | 8.03 s | 2.80 s | 62.9 → 124.5 MiB | 163.1 → 212.9 MiB | 2.00 s | 8.62 s | 0 of 1232 |
| unistyles | 7.95 s | 2.87 s | 64.2 → 125.2 MiB | 170.5 → 224.6 MiB | 1.69 s | 8.95 s | 0 of 1244 |
| uniwind | 7.86 s | 2.95 s | 64.0 → 131.2 MiB | 163.7 → 214.5 MiB | 1.91 s | 8.60 s | 0 of 1238 |
| nativewind | 8.04 s | 3.02 s | 66.9 → 132.5 MiB | 164.4 → 196.8 MiB | 2.08 s | 8.77 s | 0 of 1212 |
| tamagui | 8.40 s | 3.42 s | 82.2 → 160.8 MiB | 182.8 → 228.3 MiB | 1.98 s | 9.65 s | 1 of 1296 |
| gluestack | 7.87 s | 3.34 s | 74.2 → 127.0 MiB | 182.3 → 285.7 MiB | 2.15 s | 8.89 s | 0 of 1232 |
| heroui | 7.85 s | 3.53 s | 91.4 → 127.6 MiB | 199.3 → 415.6 MiB | 2.46 s | 10.26 s | 0 of 1250 |
| reusables | 7.86 s | 3.21 s | 75.5 → 143.0 MiB | 173.8 → 221.8 MiB | 1.91 s | 8.39 s | 1 of 1240 |
<!-- end:metrics -->

- **Startup** is from the launch call until the screen title is in the accessibility tree, when the screen reader could first read it. It isn't first paint. Within each platform the apps sit close together and the figure moves from day to day, so read it as a group. Android's own first-frame time (`am start -W`, the splash screen) is in `results/<app>/android-metrics.md`.
- **Memory** is idle (5 s after launch) and after scrolling the list and opening and closing every overlay once.
- **CPU** is user plus system time of the app's threads while the list is flung 5 times. No iOS app had a main-thread hang.
- **Janky frames** come from `dumpsys gfxinfo`. The simulator has no equivalent.

## Bundle size and re-renders (iOS)

The JS is the same on both platforms, so these were measured once. Bundle size is the Hermes bytecode from `npx expo export --platform ios` (`scripts/bundle-size.mjs`). Re-renders are components React rendered for light → dark, dark → brand and brand → light, counted with argent's React profiler on a Debug build (`scripts/rerender-run.mjs`).

<!-- begin:ioscode -->
| App | JS bundle | Components rendered per theme switch |
| --- | --- | --- |
| baseline | 3.95 MB | 298 / 298 / 290 |
| unistyles | 4.15 MB | 128 / 128 / 126 |
| uniwind | 4.24 MB | 507 / 509 / 302 |
| nativewind | 4.47 MB | 460 / 460 / 456 |
| tamagui | 5.44 MB | not measured |
| gluestack | 5.66 MB | 815 / 815 / 508 |
| heroui | 5.24 MB | 1137 / 1135 / 948 |
| reusables | 6.83 MB | 603 / 608 / 356 |
<!-- end:ioscode -->

Reusables bundles every lucide icon (1,917 of them) although it uses 4. Tamagui's Debug build aborts on a Yoga layout assertion, so its re-renders aren't counted.

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

- **Screen readers:** the checks read the tree VoiceOver and TalkBack are given. They don't listen to what is spoken or check the swipe order, and Switch Control and Switch Access aren't tested.
- **One device each:** a simulator and one budget phone. An Android emulator was tried first; emulator 37.1 and 37.2 crashed repeatedly, so no emulator numbers are reported.
- **iOS:** frame hitches and first paint aren't measured. The timing clock runs in JS, so libraries that apply styles natively (Unistyles, Tamagui's native runtime) may do work it doesn't see. Some Tamagui elements aren't in argent's view-hierarchy walk, so those checks read the system tree, which gives no selected state. Tamagui's RadioGroup doesn't draw the selected dot, although the tree reports it as checked.
- **Android:** the phone was charging, with power saving off and no thermal throttling. Turning reduced motion on while an app runs wasn't tested on either platform.

## Reproduce

These need [argent](https://github.com/software-mansion/argent) for device control, plus ffmpeg for the reduced-motion recordings.

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

Build and install each app on a phone with USB debugging on:

```bash
scripts/build-android.sh <app> Release
```

```bash
adb -s <serial> install -r -g apps/<app>/android/app/build/outputs/apk/release/app-release.apk
```

Then run every check for the apps you name. It builds and installs the accessibility reader (`scripts/android-a11y-dump`), keeps the screen awake, and restores the font scale and animation settings it changes:

```bash
scripts/run-all-android.sh <serial> baseline unistyles
```

**Tables and report**

```bash
node scripts/readme-tables.mjs
```

```bash
node scripts/report-html.mjs
```

`scripts/contrast.mjs` checks the shared tokens against WCAG contrast; `scripts/devcost.mjs` and `scripts/bundle-size.mjs` produce the cost table and bundle sizes.
