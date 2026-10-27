# Method

Every library builds the same screen to the same spec, then goes through the same checks. Results are only recorded if they were measured. Anything not tested is marked `not tested`, with the reason.

## Why one app per library

Most of these libraries change global Babel or Metro config: a Babel plugin, a compiler, Tailwind/CSS processing. Putting them in one app would make them interfere with each other and skew bundle-size and render measurements. Each library gets its own Expo app under `apps/<library>` with identical Expo, React Native and Reanimated versions.

## Pinned stack

| Package | Version |
| --- | --- |
| expo | ~57.0.31 |
| react-native | 0.86.3 |
| react | 19.2.3 |
| react-native-reanimated | 4.5.1 |
| react-native-worklets | 0.10.1 |
| expo-router | ~57.0.29 |

New Architecture on (the default in SDK 57). Every app runs as a development build, not in Expo Go.

## The test screen

Each app builds these from the library's own components where it has them. Where it doesn't, the app uses the library's styling or theming API on React Native primitives, and the README says which approach was used.

| # | Component | Must support |
| --- | --- | --- |
| 1 | Button | Pressed, disabled and loading states |
| 2 | Text field | Visible label, helper text, error message |
| 3 | Switch | Labelled |
| 4 | Checkbox | Labelled, including an indeterminate state if the library has one |
| 5 | Radio group | Three options, group label |
| 6 | Modal dialog | Title, body, confirm/cancel |
| 7 | Bottom sheet | Opened from a button |
| 8 | Menu / select | Five options |
| 9 | Tabs | Three tabs |
| 10 | Toast | Shown after a button press |
| 11 | List | 200 themed rows (title, subtitle, icon) |
| 12 | Theme switcher | Light, dark, and a third brand theme |
| 13 | Third-party component | `@gorhom/bottom-sheet` themed with the library's tokens |
| 14 | Native component | An `@expo/ui` control placed next to the library's components and themed with its tokens |
| 15 | Slider | Labelled, value announced, adjustable (weight 0–200 kg, step 2.5) |
| 16 | Progress | Labelled, with a value (workout 3 of 8) |
| 17 | Accordion | Three sections, expanded/collapsed state |
| 18 | Menu / popover | Opened from a button, three actions |
| 19 | Segmented control | Three options, selected state |

Items 15–19 were added on 27 October 2026. Test IDs and copy are in `shared/content.ts`. Each app's `NOTES.md` says which of them use the library's own component and which are hand-built.

All apps use the same tokens: colours, spacing, radii and type scale from `packages/tokens`.

## Accessibility checks

Measured on the iOS simulator (argent `describe` reads the iOS accessibility tree) and the Android emulator (uiautomator dump).

| Check | Pass condition | Reference |
| --- | --- | --- |
| Name, role, value | Every control exposes a label, the correct role, and its state: checked, selected, expanded, disabled or busy | WCAG 2.2 SC 4.1.2 |
| Focus on modal open | Focus moves into the dialog or sheet, background content is hidden from assistive technology, and focus returns to the trigger on close | WCAG 2.2 SC 2.4.3; RN `aria-modal`/`accessibilityViewIsModal` (iOS-only) and `importantForAccessibility` (Android) |
| Announcements | Form errors and toasts are announced. Live regions (`aria-live`) are Android-only in React Native, so iOS needs `AccessibilityInfo.announceForAccessibility` | WCAG 2.2 SC 4.1.3 (AA) |
| Text scaling | At the largest accessibility text size, nothing is clipped, overlapping or truncated without a way to read it | WCAG 2.2 SC 1.4.4; Apple Dynamic Type |
| Reduce Motion | With Reduce Motion on, sheet, dialog and toast animations are removed or reduced. Checked both when the setting is on at launch and when it's switched on while the app runs | WCAG 2.2 SC 2.3.3 (AAA, not AA); Apple HIG |
| Touch targets | At least 44×44pt on iOS (Apple's default control size; 28pt is its minimum) and 48×48dp on Android, measured from accessibility-tree frames | Apple HIG; Material; WCAG 2.2 SC 2.5.8 (24px at AA) |
| Contrast | The default theme's text/background token pairs meet 4.5:1 (3:1 for large text and UI components) | WCAG 2.2 SC 1.4.3, 1.4.11 |

Every accessibility check is run three times: in the light, dark and brand themes (`scripts/a11y-audit.mjs --theme`).

Checks for items 15–19:

| Item | Checks |
| --- | --- |
| Slider | Name, `adjustable` trait and value; target ≥ 44 pt; dragging the thumb changes the value. VoiceOver's swipe up can't be performed on the simulator without VoiceOver, so the drag stands in for it. |
| Progress | Name and value |
| Accordion | Header is a button; its expanded state is exposed; content appears and disappears |
| Menu | Trigger name and role; target ≥ 44 pt; opens; items are buttons; screen behind hidden; closes after an action |
| Segmented control | Each option has a name and role; the selected one is marked; target ≥ 44 pt; selection moves on tap |

**Not covered by simulators:** spoken VoiceOver/TalkBack output, swipe navigation order as heard, and Switch Control. These are listed as `needs device` in the results until they've been run on hardware.

## Performance checks

Run on the same simulator, as a release-mode build where the library supports one. Three runs each, reporting the median and the range.

- Mount time and commit count for the 200-row list (React profiler)
- Commits and time to re-render after switching theme
- JS bundle size (`expo export`), compared with an app that uses no library
- Cold start to first screen (`expo-router` index mounted)

Added on 27 October 2026 (`scripts/metrics-run.mjs`, `scripts/rerender-run.mjs`):

- Startup: terminate, `launch-app`, until the screen title is in the accessibility tree. Median of 10.
- Memory: `footprint` phys_footprint at idle and after using the list and every overlay.
- Scrolling: frame hitches can't be recorded on the simulator (xctrace's Animation Hitches template: "Hitches is not supported on this platform"). Main-thread hangs and the app's CPU time during 5 list flings are recorded instead.
- Re-renders on a theme switch: React commits and component renders from argent's React profiler, on a Debug build (counts only).

## Ease-of-use log

For each app, record:
- The setup steps and config files touched
- Every error hit while building it, and how it was fixed
- Lines of code for the test screen
