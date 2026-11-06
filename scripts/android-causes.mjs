// Hand-traced causes of the Android accessibility failures, inserted into
// docs/android-accessibility.md by checks-md.mjs. Traced on the Galaxy A15 against
// React Native 0.86.3; `RN/` is node_modules/react-native/ and
// `RN/…/uimanager/` is RN/ReactAndroid/src/main/java/com/facebook/react/uimanager/.
// Paths are relative to apps/<app>/ unless they say otherwise.
// Confirmed = the line that does it was read, or the phone showed it; Likely = inferred.
// Heard = TalkBack's own words, from its "Display speech output" setting, with focus
// moved by scripts/android-a11y-dump (`-e focus <testID>`).

export const everyApp = `**Why:**

- **@gorhom bottom sheet: screen behind still exposed.** Confirmed.
  - \`BottomSheetModal\` mounts through \`@gorhom/portal\` into the app’s own window (\`node_modules/@gorhom/bottom-sheet/src/components/bottomSheetModal/BottomSheetModal.tsx:537\`), so the screen stays in the tree TalkBack reads.
  - \`aria-modal\` does nothing on Android. It’s mapped only in \`RN/Libraries/NativeComponent/BaseViewConfig.ios.js:198\`, and no Android code reads \`accessibilityViewIsModal\`.
  - The baseline’s Dialog, Select and Menu pass because they use React Native’s \`Modal\`, a separate window.
  - **Fix:** set \`importantForAccessibility="no-hide-descendants"\` on the screen while the sheet is open.
- **Native switch (@expo/ui) 52 × 47.6 dp.** Confirmed: a one-pixel rounding artifact.
  - It’s a plain Material 3 \`Switch\` (\`node_modules/@expo/ui/android/src/main/java/expo/modules/ui/SwitchView.kt:55-103\`), which Material pads to 48 dp.
  - At the A15’s density (2.8125), 48 dp is 135 px. The \`Host\` row is 135 px (\`uiautomator dump\`: 1501–1636); the switch node inside it starts one pixel lower, so it’s 134 px, 47.64 dp. The pixel is lost inside the Compose layout, not at \`Host\`.
  - Not caught by the audit: the switch node has no name. Its label is a separate Compose \`Text\` beside it.`;

const shared = `- **[A] Portal overlays stay in the app’s window.** The screen behind stays in TalkBack’s tree, and Android has no \`aria-modal\` (see above).
- **[B] \`role="option"\` has no Android mapping.** It falls to \`else -> null\` in \`RN/…/uimanager/ReactAccessibilityDelegate.kt:543\`, so options get no role.
- **[C] Loading is disabled + spinner, with no busy state.** React Native adds “busy” to the name only when \`accessibilityState.busy\` is set (\`RN/…/uimanager/BaseViewManager.java:432-435\`). No library sets it. Heard in Reusables and gluestack: “Saving, Button, disabled”.`;

export const libraries = {
  baseline: `**Why:** both are shared by every app (above). The loading button’s name was “busy” only, because \`aria-busy\` with no \`accessibilityLabel\` replaces the text (\`RN/…/uimanager/BaseViewManager.java:415-446\`, heard “busy, Button, disabled”). Fixed in the lab on 4 November 2026 by setting \`accessibilityLabel\`, in the four apps that share this button.`,

  tamagui: `**Why:**

${shared}
- **Screen behind exposed (Dialog, Sheet, Select):** [A]. Dialog content goes through \`PortalItem\` (\`node_modules/@tamagui/dialog/src/Dialog.tsx:205\`) and a modal Sheet through \`<Portal>\` (\`@tamagui/sheet/src/SheetImplementationCustom.tsx:1201\`).
- **Checkbox, Radio 22 and Switch 42 × 22:** Tamagui’s default size \`md\` (\`node_modules/tamagui/src/components/Checkbox.tsx:19-20\`, \`RadioGroup.tsx:18-19\`, \`Switch.tsx:18-19\`). Slider thumb 28: lab code (\`src/components/slider.tsx:16\`).
- **Switch: no name, role or state.** On native, \`useSwitch\` returns only \`onPress\` (\`node_modules/@tamagui/switch-headless/src/useSwitch.tsx:89-96\`); the role and state are set on web only.
- **Checkbox and Select trigger: no name.** \`Label htmlFor\` links the control on web only (\`node_modules/@tamagui/label/src/Label.tsx:54\`).
- **Button (loading):** [C]. Tamagui’s Button has no loading prop; the app adds a \`Spinner\` icon (\`src/components/button.tsx:26-28\`).
- **Accordion header isn’t a button.** The trigger’s “button” is \`render: 'button'\` (\`@tamagui/collapsible/src/Collapsible.tsx:87\`), an HTML element that gives no native role.
- **Menu items aren’t buttons.** Confirmed in the tree. On Android the menu is a Compose \`DropdownMenu\` (\`node_modules/@tamagui/native/src/setup-expo-ui-menu.ts:17-22\`). Each item is a clickable, focusable \`android.view.View\` with no role, its text in a child: TalkBack can activate it but can’t call it a button or menu item.
- **Segmented control: no role or selected state.** \`ToggleGroup\` items only use \`aria-pressed\` (\`node_modules/@tamagui/toggle-group/src/Toggle.tsx:71\`), which single mode drops (\`ToggleGroup.tsx:101\`) and React Native doesn’t support anyway.`,

  gluestack: `**Why:**

${shared}
- **Screen behind exposed (Dialog, BottomSheet, Select, Menu):** [A]. \`Overlay\` defaults to \`useRNModal = false\` and renders into a portal in the same window (\`node_modules/@gluestack-ui/core/lib/esm/overlay/creator/index.jsx:10\`, \`:37\`). \`useRNModalOnAndroid\` would fix it, but nothing sets it.
- **BottomSheet title and body unread.** Confirmed in the tree; the same structure as HeroUI’s sheet, which was heard. gorhom makes the sheet content \`accessible\`, labelled “Bottom Sheet” (\`@gorhom/bottom-sheet/src/components/bottomSheet/constants.ts:29-31\`), which TalkBack reads as one stop. The baseline opts out with \`accessible={false}\` (\`apps/baseline/src/components/exercise-sheet.tsx:18\`); gluestack’s wrapper doesn’t (\`components/ui/bottomsheet/index.tsx:222-243\`).
- **BottomSheet doesn’t close.** Confirmed in the code. \`close()\` only sets \`index\` to -1 (\`components/ui/bottomsheet/index.tsx:113-115\`). When the prop changes, gorhom 5.2.14 calls \`handleSnapToIndex(-1)\`, which animates to \`detents[-1]\`, undefined (\`node_modules/@gorhom/bottom-sheet/src/components/bottomSheet/BottomSheet.tsx:1123\`, \`:1789\`). Only the first mount maps -1 to the closed position (\`:875-877\`). Same on iOS. **Fix:** call the sheet ref’s \`close()\`.
- **Touch targets:** library sizes. Button and Menu trigger 36 (\`components/ui/button/index.tsx:39\`), Select trigger 40 (\`select/index.tsx:60\`), Tab 31 (\`tabs/index.tsx:42\`), Accordion 20 (the padding is on the header, not the trigger: \`accordion/index.tsx:39\`, \`:48\`), Checkbox and Radio 22.
- **Button (loading):** [C]. \`ButtonSpinner\` has \`aria-label="loading"\`, but it isn’t read: heard “Saving, Button, disabled”.
- **Unnamed stops (Dialog, Menu).** The dialog’s backdrop is a clickable \`AnimatedPressable\` with no name (\`components/ui/alert-dialog/index.tsx:22\`, \`:32\`). The menu has two unnamed views inside it, 352 × 6 and 210 × 140 dp (Likely its content frame and a spacer, not traced to a line).
- **Switch: no name.** React Native’s \`Switch\` with a \`Text\` beside it, as the docs show (\`src/components/switch-row.tsx:11-19\`).
- **Checkbox named “terms”:** \`aria-label || value\` (\`node_modules/@gluestack-ui/core/lib/esm/checkbox/creator/Checkbox.jsx:30\`).
- **Select trigger: an empty button.** The value sits in a hidden \`TextInput\` (\`select/creator/SelectInput.jsx:28-30\`). Options pass \`checked\` only as a style state (\`SelectItem.jsx:24-40\`).
- **Slider: no role or value.** They’re in \`inputProps\`, rendered on web only (\`slider/creator/SliderThumb.jsx:122-124\`).
- **Progress: no name.** It sets \`progressbar\` and “38%” but no label (\`progress/creator/Progress.jsx:21-28\`).
- **Text field error not reachable:** React Native has no \`aria-describedby\`, and \`FormControlError\` isn’t linked.`,

  heroui: `**Why:**

${shared}
- **Screen behind exposed (Dialog, BottomSheet, Select, Menu):** [A]. HeroUI’s \`FullWindowOverlay\` is a bare fragment unless \`Platform.OS === 'ios'\` (\`node_modules/heroui-native/src/helpers/internal/components/full-window-overlay.tsx:56-62\`).
- **Both sheets’ title and body unread.** Heard: TalkBack focuses the whole sheet and says only “Bottom Sheet, Slider”; the title and body inside aren’t focusable. gorhom makes the content \`accessible\` (\`@gorhom/bottom-sheet/src/components/bottomSheet/constants.ts:29-31\`), and neither HeroUI’s sheet nor the app’s raw one opts out (\`src/components/exercise-sheet.tsx:22-26\`).
- **Switch and Checkbox: row and control are separate.** \`ControlField\` is a bare \`Pressable\` with no role or state (\`node_modules/heroui-native/src/components/control-field/control-field.tsx:127\`). TalkBack gets a row with no role, then a control with no name.
- **Touch targets:** library size tokens. Switch 24 (\`src/styles/components/switch.css:3-4\`), Checkbox and Radio 24 (\`checkbox.css:3-4\`, \`radio.css:11-12\`), Slider thumb 28 × 20 (\`slider.css:78-81\`), Tab 36 (\`tabs.css:61\`).
- **Button (loading):** [C]. Only \`disabled\` is set (\`node_modules/heroui-native/src/components/button/button.tsx:297\`).
- **Select trigger: no name.** It’s a \`combobox\` with no label (\`src/primitives/select/select.tsx:242\`), and the “Rest time” label isn’t linked (\`src/app/index.tsx:177-179\`). Options are \`role="option"\`: [B].
- **Unnamed backdrop (Dialog, Bottom sheet, Select, Menu).** Heard on the dialog: “Unlabelled”. Each overlay’s backdrop is the primitive \`Overlay\`, a full-screen clickable view with no name (in \`node_modules/heroui-native/src/components/\`: \`dialog/dialog.tsx:48\`, \`bottom-sheet/bottom-sheet.tsx:45\`, \`select/select.tsx:73\`, \`menu/menu.tsx:67\`). Whether swiping reads the dialog title twice wasn’t checked: TalkBack’s swipe gestures can’t be sent over adb.
- **Text field error not reachable:** React Native has no \`aria-describedby\`; \`FieldError\` is plain text.`,

  reusables: `**Why:**

${shared}
- **Screen behind exposed (Dialog, Select, Menu):** [A]. The copied components use \`FullWindowOverlay\` on iOS only (\`src/components/ui/alert-dialog.tsx:17\`, \`select.tsx:68\`, \`dropdown-menu.tsx:88\`).
- **Touch targets:** the library’s Tailwind sizes, kept on purpose (NOTES.md). Button and Menu trigger \`h-10\` (\`src/components/ui/button.tsx:43\`), Switch 32 × 18 (\`switch.tsx:12\`), Checkbox and Radio \`size-4\` (\`checkbox.tsx:23\`, \`radio-group.tsx:19\`), Tab 30 (\`tabs.tsx:20\`), Segmented \`h-10\` (\`toggle.tsx:28\`).
- **Button (loading):** [C]. RNR’s Button has no \`aria-busy\` (NOTES.md).
- **Unnamed stops (Select, Menu).** Each overlay is a full-screen \`Pressable\` that closes on tap, with no name (\`src/components/ui/select.tsx:83-90\`, \`dropdown-menu.tsx:104-116\`). The menu’s content (\`test-menu\`) has no name either.
- **Dialog title isn’t a heading.** The copied overlay wraps the content in a full-screen \`Pressable\` (\`src/components/ui/alert-dialog.tsx:37-41\`), which absorbs title and description into one stop.
- **Select options:** \`role="option"\`: [B]. Selection still comes through, so “current option marked” passes.
- **Progress reads “0%”:** \`value\` goes only to the indicator, never to the root (\`src/components/ui/progress.tsx:14-24\`).
- **Text field error not reachable:** React Native has no \`aria-describedby\`.`,
};

export const differences = `**Why they differ** (Confirmed unless marked):

- **Select trigger, Tab, Menu items and Slider pass on Android only.** Android maps \`combobox\`, \`tab\`, \`menuitem\` and \`slider\` to roles (\`RN/…/uimanager/ReactAccessibilityDelegate.kt:520-539\`). iOS’s trait table has none of them (\`RN/ReactCommon/react/renderer/components/view/accessibilityPropsConversions.h\`).
- **Bottom sheets’ title and body no longer differ.** They fail on both platforms in HeroUI and gluestack, for the same reason: gorhom’s \`accessible\` sheet content is one stop.
- **Tamagui Menu: screen behind hidden passes on Android only.** Android’s menu is a Compose popup in its own window; iOS’s is a SwiftUI context menu over the screen.
- **Reusables Select and Menu: screen behind hidden passes on iOS only.** \`FullWindowOverlay\` is iOS only.
- **Reusables Text field, Checkbox, Switch and Select trigger pass on Android only.** Android honours \`aria-labelledby\`; iOS doesn’t.
  - TalkBack reads the linked label after the control’s own description. Heard: “off, Switch for Workout reminders” and “collapsed, 60 seconds, Combo box for Rest time”.
  - The switch’s own description is “on” or “off”, from the \`aria-valuetext\` that @rn-primitives sets (\`node_modules/@rn-primitives/switch/dist/switch.mjs:27\`, applied at \`RN/…/uimanager/BaseViewManager.java:437-442\`). The trigger’s is its value.
- **Reusables Select: current option marked passes on Android only.** \`aria-selected\` becomes \`setSelected\` on Android (\`ReactAccessibilityDelegate.kt:633\`); on iOS the \`option\` has no trait to carry it.
- **Tamagui Button (disabled) passes on Android only.** Disabled sets \`tabIndex: -1\` (\`@tamagui/button/src/Button.tsx:172-175\`), which removes it on iOS. On Android the node is \`focusable: false\` but still clickable, which TalkBack stops on: heard “Unavailable, Button, disabled”.
- **gluestack Button (loading) passes on iOS only.** VoiceOver folds the spinner into the button as “In progress” (Likely); on Android the spinner isn’t read (heard “Saving, Button, disabled”).
- **Touch targets at 44 pass on iOS only.** 44 pt is Apple’s minimum; Google’s is 48 dp.
- **gluestack, HeroUI and Reusables: everything the screen reader lands on has a name passes on iOS only.** Their unnamed backdrops are clickable views TalkBack stops on, heard as “Unlabelled”. On iOS a view is a VoiceOver element only when it’s \`accessible\`, and these backdrops aren’t, so VoiceOver skips them.`;
