import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Host, Switch as NativeSwitch } from '@expo/ui';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { copy, ids } from '@shared/content';
import type { ThemeName } from '@shared/tokens';

import { announce } from '../a11y';
import { Accordion } from '../components/accordion';
import { Button } from '../components/button';
import { Checkbox } from '../components/checkbox';
import { Dialog } from '../components/dialog';
import { ExerciseSheet } from '../components/exercise-sheet';
import { ExpoExerciseSheet } from '../components/expo-exercise-sheet';
import { Menu } from '../components/menu';
import { Progress } from '../components/progress';
import { RadioGroup } from '../components/radio-group';
import { Section } from '../components/section';
import { Segmented } from '../components/segmented';
import { Select } from '../components/select';
import { Slider } from '../components/slider';
import { SwitchRow } from '../components/switch-row';
import { Tabs } from '../components/tabs';
import { TextField } from '../components/text-field';
import { Toast } from '../components/toast';
import { mark, measure } from '../perf';
import { useTheme } from '../theme';

const themeNames: ThemeName[] = ['light', 'dark', 'brand'];

export default function TestScreen() {
  const { theme, setTheme } = useTheme();
  const c = theme.colors;

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
  const [weight, setWeight] = useState<number>(copy.slider.initial);
  const [range, setRange] = useState<string>(copy.segmentedOptions[0]);
  const sheet = useRef<BottomSheetModal>(null);
  const hideToast = useCallback(() => setToast(false), []);

  const validate = () => {
    const err = /.+@.+\..+/.test(email) ? undefined : copy.textFieldError;
    setEmailError(err);
    if (err) announce(err);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: theme.space.lg, paddingBottom: 120 }}>
        <Text role="heading" style={[theme.type.heading, { color: c.text }]}>
          {copy.screenTitle}
        </Text>

        <Section title={copy.themeLabel}>
          <RadioGroup
            testID={ids.themeSwitcher}
            label={copy.themeLabel}
            options={copy.themes}
            value={copy.themes[themeNames.indexOf(theme.name)]}
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

        <Section title={copy.moreTitle}>
          <Slider testID={ids.slider} label={copy.sliderLabel} unit={copy.sliderUnit} min={copy.slider.min} max={copy.slider.max} step={copy.slider.step} value={weight} onChange={setWeight} />
          <Progress testID={ids.progress} label={copy.progressLabel} value={copy.progress.value} max={copy.progress.max} valueText={copy.progressText} />
          <Accordion testID={ids.accordion} sections={copy.accordionSections} panels={copy.accordionPanels} />
          <Menu testID={ids.menu} label={copy.menuOpen} items={copy.menuItems} onSelect={() => {}} />
          <Segmented testID={ids.segmented} label={copy.segmentedLabel} options={copy.segmentedOptions} value={range} onChange={setRange} />
        </Section>

        <Section title="Native control (@expo/ui)">
          <Host matchContents colorScheme={theme.name === 'dark' ? 'dark' : 'light'} seedColor={c.primary}>
            <NativeSwitch testID={ids.nativeSwitch} label={copy.nativeSwitchLabel} value={sync} onValueChange={setSync} />
          </Host>
        </Section>

        <Section title="List">
          <View onTouchStart={mark}>
            <Button testID={ids.listLink} label={copy.listLink} variant="secondary" onPress={() => router.push('/list')} />
          </View>
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
