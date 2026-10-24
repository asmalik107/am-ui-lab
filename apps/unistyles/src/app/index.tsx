import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Host, Switch as NativeSwitch } from '@expo/ui';
import { Link } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { StyleSheet, UnistylesRuntime, useUnistyles, withUnistyles } from 'react-native-unistyles';

import { copy, ids } from '@shared/content';
import { space, type ThemeName } from '@shared/tokens';

import { Button, Checkbox, RadioGroup, Section, SwitchRow, Tabs, TextField, announce } from '../components/controls';
import { Dialog, ExerciseSheet, ExpoExerciseSheet, Select, Toast } from '../components/overlays';
import { mark, measure } from '../perf';
import { View as PerfTouch } from 'react-native';

const themeNames: ThemeName[] = ['light', 'dark', 'brand'];

// The switcher needs the current theme name as a value (for aria-checked),
// not as a style, so it reads it with useUnistyles. Kept in its own small
// component so only the switcher re-renders, as the docs advise.
// https://www.unistyl.es/v3/references/use-unistyles
function ThemeSwitcher() {
  const { theme } = useUnistyles();
  return (
    <RadioGroup
      testID={ids.themeSwitcher}
      label={copy.themeLabel}
      options={copy.themes}
      value={copy.themes[themeNames.indexOf(theme.name)]}
      onChange={(v) => {
              mark();
              UnistylesRuntime.setTheme(themeNames[copy.themes.indexOf(v as (typeof copy.themes)[number])]);
              measure('theme');
            }}
    />
  );
}

// @expo/ui Host takes colorScheme / seedColor as props, so they are mapped
// from the active Unistyles theme with withUnistyles.
// https://www.unistyl.es/v3/references/with-unistyles
const ThemedHost = withUnistyles(Host, (theme) => ({
  colorScheme: theme.name === 'dark' ? ('dark' as const) : ('light' as const),
  seedColor: theme.colors.primary,
}));

export default function TestScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [reminders, setReminders] = useState(true);
  const [agree, setAgree] = useState(false);
  const [level, setLevel] = useState<string>(copy.radioOptions[0]);
  const [rest, setRest] = useState<string>(copy.selectOptions[2]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sync, setSync] = useState(false);
  const [expoSheet, setExpoSheet] = useState(false);
  const sheet = useRef<BottomSheetModal>(null);
  const hideToast = useCallback(() => setToast(false), []);

  const validate = () => {
    const err = /.+@.+\..+/.test(email) ? undefined : copy.textFieldError;
    setEmailError(err);
    if (err) announce(err);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={contentStyle}>
        <Text role="heading" style={styles.heading}>
          {copy.screenTitle}
        </Text>

        <Section title={copy.themeLabel}>
          <ThemeSwitcher />
        </Section>

        <Section title="Buttons">
          <Button
            testID={ids.button}
            label={copy.button}
            loading={saving}
            onPress={() => {
              setSaving(true);
              setTimeout(() => setSaving(false), 1500);
            }}
          />
          <Button testID={ids.buttonDisabled} label={copy.buttonDisabled} disabled />
          <Button testID={ids.buttonLoading} label={copy.buttonLoading} loading />
        </Section>

        <Section title="Form">
          <TextField
            testID={ids.textField}
            label={copy.textFieldLabel}
            helper={copy.textFieldHelper}
            error={emailError}
            value={email}
            onChangeText={setEmail}
            onBlur={validate}
          />
          <SwitchRow testID={ids.switch} label={copy.switchLabel} value={reminders} onValueChange={setReminders} />
          <Checkbox testID={ids.checkbox} label={copy.checkboxLabel} checked={agree} onChange={setAgree} />
          <RadioGroup testID={ids.radioGroup} label={copy.radioGroupLabel} options={copy.radioOptions} value={level} onChange={setLevel} />
          <Select testID={ids.select} label={copy.selectLabel} options={copy.selectOptions} value={rest} onChange={setRest} />
        </Section>

        <Section title="Overlays">
          <Button testID={ids.dialogOpen} label={copy.dialogOpen} variant="danger" onPress={() => setDialogOpen(true)} />
          <Button testID={ids.sheetOpen} label={copy.sheetOpen} variant="secondary" onPress={() => sheet.current?.present()} />
          <Button testID={ids.expoSheetOpen} label={copy.expoSheetOpen} variant="secondary" onPress={() => setExpoSheet(true)} />
          <Button testID={ids.toastShow} label={copy.toastShow} variant="secondary" onPress={() => setToast(true)} />
        </Section>

        <Section title="Tabs">
          <Tabs testID={ids.tabs} tabs={copy.tabs} panels={copy.tabPanels} />
        </Section>

        <Section title="Native control (@expo/ui)">
          <ThemedHost matchContents>
            <NativeSwitch testID={ids.nativeSwitch} label={copy.nativeSwitchLabel} value={sync} onValueChange={setSync} />
          </ThemedHost>
        </Section>

        <Section title="List">
          <PerfTouch onTouchStart={mark}>
            <Link href="/list" asChild>
              <Button testID={ids.listLink} label={copy.listLink} variant="secondary" />
            </Link>
          </PerfTouch>
        </Section>
      </ScrollView>

      <Dialog
        testID={ids.dialog}
        open={dialogOpen}
        title={copy.dialogTitle}
        body={copy.dialogBody}
        confirm={copy.dialogConfirm}
        cancel={copy.dialogCancel}
        onConfirm={() => setDialogOpen(false)}
        onClose={() => setDialogOpen(false)}
      />
      <ExerciseSheet ref={sheet} testID={ids.sheet} title={copy.sheetTitle} body={copy.sheetBody} close={copy.sheetClose} />
      <ExpoExerciseSheet open={expoSheet} onClose={() => setExpoSheet(false)} testID={ids.expoSheet} title={copy.sheetTitle} body={copy.sheetBody} close={copy.sheetClose} />
      <Toast testID={ids.toast} message={copy.toastMessage} visible={toast} onHide={hideToast} />
    </View>
  );
}

// contentContainerStyle is not bound by the Babel plugin (only `style` is);
// the docs say to wrap the ScrollView in withUnistyles when it depends on the
// theme. Padding is a theme-independent token, so it is a plain object here.
const contentStyle = { padding: space.lg, paddingBottom: 120 };

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1 },
  heading: { ...theme.type.heading, color: theme.colors.text },
}));
