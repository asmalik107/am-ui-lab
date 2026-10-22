import type { BottomSheetModal } from '@gorhom/bottom-sheet'
import { Host, Switch as NativeSwitch } from '@expo/ui'
import { Link } from 'expo-router'
import { useRef, useState } from 'react'
import { H1, ScrollView, useTheme, useThemeName, View } from 'tamagui'
import { toast } from 'tamagui/toast'

import { copy, ids } from '@shared/content'
import type { ThemeName } from '@shared/tokens'

import { Button, Checkbox, RadioGroup, Section, SwitchRow, Tabs, TextField } from '../components/controls'
import { Dialog, ExerciseSheet, Select, TamaguiSheet } from '../components/overlays'
import { useThemeSwitch } from '../theme'
import { mark, measure } from '../perf'
import { View as PerfTouch } from 'react-native'

const themeNames: ThemeName[] = ['light', 'dark', 'brand']

export default function TestScreen() {
  const { name, setTheme } = useThemeSwitch()
  // @expo/ui is native SwiftUI/Compose, outside Tamagui: its Host is fed the
  // active Tamagui theme's scheme and primary colour.
  const theme = useTheme()
  const themeName = useThemeName()

  const [reminders, setReminders] = useState(true)
  const [agree, setAgree] = useState<boolean | 'indeterminate'>(false)
  const [level, setLevel] = useState<string>(copy.radioOptions[0])
  const [rest, setRest] = useState<string>(copy.selectOptions[2])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [tamaguiSheetOpen, setTamaguiSheetOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sync, setSync] = useState(false)
  const sheet = useRef<BottomSheetModal>(null)

  return (
    <View flex={1}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <H1 color="color" fontSize={28} lineHeight="34px" fontWeight="700">
          {copy.screenTitle}
        </H1>

        <Section title={copy.themeLabel}>
          <RadioGroup
            testID={ids.themeSwitcher}
            label={copy.themeLabel}
            options={copy.themes}
            value={copy.themes[themeNames.indexOf(name)]}
            onChange={(v) => {
              mark();
              setTheme(themeNames[copy.themes.indexOf(v as (typeof copy.themes)[number])]);
              measure('theme');
            }}
          />
        </Section>

        <Section title="Buttons">
          <Button
            testID={ids.button}
            label={copy.button}
            loading={saving}
            onPress={() => {
              setSaving(true)
              setTimeout(() => setSaving(false), 1500)
            }}
          />
          <Button testID={ids.buttonDisabled} label={copy.buttonDisabled} disabled />
          <Button testID={ids.buttonLoading} label={copy.buttonLoading} loading />
        </Section>

        <Section title="Form">
          <TextField testID={ids.textField} label={copy.textFieldLabel} helper={copy.textFieldHelper} error={copy.textFieldError} />
          <SwitchRow testID={ids.switch} label={copy.switchLabel} value={reminders} onValueChange={setReminders} />
          <Checkbox testID={ids.checkbox} label={copy.checkboxLabel} checked={agree} onChange={setAgree} />
          <RadioGroup testID={ids.radioGroup} label={copy.radioGroupLabel} options={copy.radioOptions} value={level} onChange={setLevel} />
          <Select testID={ids.select} label={copy.selectLabel} options={copy.selectOptions} value={rest} onChange={setRest} />
        </Section>

        <Section title="Overlays">
          <Dialog
            testID={ids.dialog}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            trigger={<Button testID={ids.dialogOpen} label={copy.dialogOpen} variant="danger" />}
            title={copy.dialogTitle}
            body={copy.dialogBody}
            confirm={copy.dialogConfirm}
            cancel={copy.dialogCancel}
            onConfirm={() => setDialogOpen(false)}
          />
          <Button testID={ids.sheetOpen} label={copy.sheetOpen} variant="secondary" onPress={() => sheet.current?.present()} />
          <Button
            testID={`${ids.sheetOpen}-tamagui`}
            label={`${copy.sheetOpen} (Tamagui Sheet)`}
            variant="secondary"
            onPress={() => setTamaguiSheetOpen(true)}
          />
          <Button testID={ids.toastShow} label={copy.toastShow} variant="secondary" onPress={() => toast(copy.toastMessage)} />
        </Section>

        <Section title="Tabs">
          <Tabs testID={ids.tabs} label="Workout views" tabs={copy.tabs} panels={copy.tabPanels} />
        </Section>

        <Section title="Native control (@expo/ui)">
          <Host matchContents colorScheme={themeName.startsWith('dark') ? 'dark' : 'light'} seedColor={theme.primary.val}>
            <NativeSwitch testID={ids.nativeSwitch} label={copy.nativeSwitchLabel} value={sync} onValueChange={setSync} />
          </Host>
        </Section>

        <Section title="List">
          <PerfTouch onTouchStart={mark}>
            <Link href="/list" asChild>
              <Button testID={ids.listLink} label={copy.listLink} variant="secondary" />
            </Link>
          </PerfTouch>
        </Section>
      </ScrollView>

      <ExerciseSheet ref={sheet} testID={ids.sheet} title={copy.sheetTitle} body={copy.sheetBody} close={copy.sheetClose} onClose={() => sheet.current?.dismiss()} />
      <TamaguiSheet
        open={tamaguiSheetOpen}
        onOpenChange={setTamaguiSheetOpen}
        testID={`${ids.sheet}-tamagui`}
        title={copy.sheetTitle}
        body={copy.sheetBody}
        close={copy.sheetClose}
        onClose={() => setTamaguiSheetOpen(false)}
      />
    </View>
  )
}
