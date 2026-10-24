import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Host, Switch as NativeSwitch } from '@expo/ui';
import { Link } from 'expo-router';
import { styled } from 'nativewind';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { copy, ids } from '@shared/content';

import { Button, Checkbox, RadioGroup, Section, SwitchRow, Tabs, TextField, announce } from '../components/controls';
import { Dialog, ExerciseSheet, ExpoExerciseSheet, Select, Toast } from '../components/overlays';
import { mark, measure } from '../perf';
import { View as PerfTouch } from 'react-native';
import { themeNames, useThemeName } from '../theme';

// The switcher needs the current theme name as a value (for aria-checked),
// so it reads it from the theme-name context. Kept in its own component so
// a switch re-renders only the switcher and the VariableContextProvider
// consumers, not this screen's state.
function ThemeSwitcher() {
  const { name, setTheme } = useThemeName();
  return (
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
  );
}

// @expo/ui Host takes seedColor as a prop. styled() sends the colour of a
// className (text-primary, a theme variable) to that prop. colorScheme is
// not a style value, so it comes from the theme name.
// https://www.nativewind.dev/v5/guides/third-party-components
const StyledHost = styled(Host, {
  className: { target: false, nativeStyleMapping: { color: 'seedColor' } },
});

function ThemedHost({ children }: { children: React.ReactNode }) {
  const { name } = useThemeName();
  return (
    <StyledHost matchContents colorScheme={name === 'dark' ? 'dark' : 'light'} className="text-primary">
      {children}
    </StyledHost>
  );
}

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
    <View className="flex-1">
      <ScrollView contentContainerClassName="p-lg pb-[120px]">
        <Text role="heading" className="text-heading text-text">
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
          <ThemedHost>
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
