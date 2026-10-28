import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { BottomSheetRef } from '@/components/ui/bottomsheet';
import { Host, Switch as NativeSwitch } from '@expo/ui';
import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { copy, ids } from '@shared/content';
import type { ThemeName } from '@shared/tokens';

import { Heading } from '@/components/ui/heading';

import { AppButton, EmailField, RadioField, Section, SectionsAccordion, Segmented, SwitchRow, TermsCheckbox, TestTabs, WeightSlider, WorkoutProgress } from '../components/controls';
import { Dialog, ExerciseSheet, ExpoExerciseSheet, GluestackSheet, RestSelect, useLogSetToast, WorkoutMenu } from '../components/overlays';
import { useThemeName, useTokenColor } from '../theme';
import { mark, measure } from '../perf';
import { View as PerfTouch } from 'react-native';

const themeNames: ThemeName[] = ['light', 'dark', 'brand'];

export default function TestScreen() {
  const { name, setName } = useThemeName();
  const primary = useTokenColor('primary');

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [reminders, setReminders] = useState(true);
  const [agree, setAgree] = useState(false);
  const [level, setLevel] = useState<string>(copy.radioOptions[0]);
  const [rest, setRest] = useState<string>(copy.selectOptions[2]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sync, setSync] = useState(false);
  const [expoSheet, setExpoSheet] = useState(false);
  const [weight, setWeight] = useState<number>(copy.slider.initial);
  const [range, setRange] = useState<string>(copy.segmentedOptions[0]);
  const sheet = useRef<BottomSheetModal>(null);
  const gluestackSheet = useRef<BottomSheetRef>(null);
  const showToast = useLogSetToast(copy.toastMessage, ids.toast);

  // No manual announcement of the error: gluestack's FormControl does not
  // provide one, and the lab does not add it by hand (see NOTES.md).
  const validate = () => setEmailError(/.+@.+\..+/.test(email) ? undefined : copy.textFieldError);

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-lg pb-[120px]">
        <Heading className="text-heading text-foreground">{copy.screenTitle}</Heading>

        <Section title={copy.themeLabel}>
          <RadioField
            testID={ids.themeSwitcher}
            label={copy.themeLabel}
            options={copy.themes}
            value={copy.themes[themeNames.indexOf(name)]}
            onChange={(v) => {
              mark();
              setName(themeNames[copy.themes.indexOf(v as (typeof copy.themes)[number])]);
              measure('theme');
            }}
          />
        </Section>

        <Section title="Buttons">
          <AppButton
            testID={ids.button}
            label={copy.button}
            loading={saving}
            onPress={() => {
              setSaving(true);
              setTimeout(() => setSaving(false), 1500);
            }}
          />
          <AppButton testID={ids.buttonDisabled} label={copy.buttonDisabled} disabled />
          <AppButton testID={ids.buttonLoading} label={copy.buttonLoading} loading />
        </Section>

        <Section title="Form">
          <EmailField
            testID={ids.textField}
            label={copy.textFieldLabel}
            helper={copy.textFieldHelper}
            error={emailError}
            value={email}
            onChangeText={setEmail}
            onBlur={validate}
          />
          <SwitchRow testID={ids.switch} label={copy.switchLabel} value={reminders} onValueChange={setReminders} />
          <TermsCheckbox testID={ids.checkbox} label={copy.checkboxLabel} checked={agree} onChange={setAgree} />
          <RadioField testID={ids.radioGroup} label={copy.radioGroupLabel} options={copy.radioOptions} value={level} onChange={setLevel} />
          <RestSelect testID={ids.select} label={copy.selectLabel} options={copy.selectOptions} value={rest} onChange={setRest} />
        </Section>

        <Section title="Overlays">
          <AppButton testID={ids.dialogOpen} label={copy.dialogOpen} variant="danger" onPress={() => setDialogOpen(true)} />
          <AppButton testID={ids.sheetOpen} label={copy.sheetOpen} variant="secondary" onPress={() => sheet.current?.present()} />
          <AppButton testID={ids.expoSheetOpen} label={copy.expoSheetOpen} variant="secondary" onPress={() => setExpoSheet(true)} />
          <AppButton testID={`${ids.sheetOpen}-gluestack`} label={`${copy.sheetOpen} (gluestack BottomSheet)`} variant="secondary" onPress={() => gluestackSheet.current?.open()} />
          <AppButton testID={ids.toastShow} label={copy.toastShow} variant="secondary" onPress={showToast} />
        </Section>

        <Section title="Tabs">
          <TestTabs testID={ids.tabs} tabs={copy.tabs} panels={copy.tabPanels} />
        </Section>

        <Section title={copy.moreTitle}>
          <WeightSlider testID={ids.slider} label={copy.sliderLabel} unit={copy.sliderUnit} min={copy.slider.min} max={copy.slider.max} step={copy.slider.step} value={weight} onChange={setWeight} />
          <WorkoutProgress testID={ids.progress} label={copy.progressLabel} value={copy.progress.value} max={copy.progress.max} valueText={copy.progressText} />
          <SectionsAccordion testID={ids.accordion} sections={copy.accordionSections} panels={copy.accordionPanels} />
          <WorkoutMenu testID={ids.menu} label={copy.menuOpen} items={copy.menuItems} onSelect={() => {}} />
          <Segmented testID={ids.segmented} label={copy.segmentedLabel} options={copy.segmentedOptions} value={range} onChange={setRange} />
        </Section>

        <Section title="Native control (@expo/ui)">
          <Host matchContents colorScheme={name === 'dark' ? 'dark' : 'light'} seedColor={primary}>
            <NativeSwitch testID={ids.nativeSwitch} label={copy.nativeSwitchLabel} value={sync} onValueChange={setSync} />
          </Host>
        </Section>

        <Section title="List">
          <PerfTouch onTouchStart={mark}>
            <Link href="/list" asChild>
              <AppButton testID={ids.listLink} label={copy.listLink} variant="secondary" />
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
      <ExerciseSheet sheetRef={sheet} testID={ids.sheet} title={copy.sheetTitle} body={copy.sheetBody} close={copy.sheetClose} />
      <GluestackSheet sheetRef={gluestackSheet} testID={`${ids.sheet}-gluestack`} title={copy.sheetTitle} body={copy.sheetBody} close={copy.sheetClose} />
      <ExpoExerciseSheet open={expoSheet} onClose={() => setExpoSheet(false)} testID={ids.expoSheet} title={copy.sheetTitle} body={copy.sheetBody} close={copy.sheetClose} />
    </View>
  );
}
