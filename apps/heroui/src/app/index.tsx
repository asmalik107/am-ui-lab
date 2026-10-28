// HeroUI Native test screen. Every control is a HeroUI component except the
// section headings, the raw @gorhom/bottom-sheet (item 13) and the @expo/ui
// switch (item 14). Accessibility props are only the ones HeroUI's docs tell
// you to pass; manual additions are listed in NOTES.md.
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Host, Switch as NativeSwitch } from '@expo/ui';
import { useRouter } from 'expo-router';
import { BottomSheet } from 'heroui-native/bottom-sheet';
import { Button } from 'heroui-native/button';
import { ControlField } from 'heroui-native/control-field';
import { Description } from 'heroui-native/description';
import { Dialog } from 'heroui-native/dialog';
import { FieldError } from 'heroui-native/field-error';
import { useThemeColor } from 'heroui-native/hooks';
import { Input } from 'heroui-native/input';
import { Label } from 'heroui-native/label';
import { RadioGroup } from 'heroui-native/radio-group';
import { Select } from 'heroui-native/select';
import { Spinner } from 'heroui-native/spinner';
import { Tabs } from 'heroui-native/tabs';
import { TextField } from 'heroui-native/text-field';
import { Toast, useToast } from 'heroui-native/toast';
import { useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { copy, ids } from '@shared/content';
import type { ThemeName } from '@shared/tokens';

import { Accordion } from '../components/accordion';
import { ExerciseSheet } from '../components/exercise-sheet';
import { ExpoExerciseSheet } from '../components/expo-exercise-sheet';
import { Menu } from '../components/menu';
import { Progress } from '../components/progress';
import { Section } from '../components/section';
import { Segmented } from '../components/segmented';
import { Slider } from '../components/slider';
import { setTheme, space, themeNames, type, useThemeName } from '../theme';
import { mark, measure } from '../perf';
import { View as PerfTouch } from 'react-native';

const restOptions = copy.selectOptions.map((label) => ({ value: label, label }));
type RestOption = (typeof restOptions)[number];

export default function TestScreen() {
  const router = useRouter();
  const themeName = useThemeName();
  const [accent, accentForeground] = useThemeColor(['accent', 'accent-foreground']);
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [reminders, setReminders] = useState(true);
  const [agree, setAgree] = useState(false);
  const [level, setLevel] = useState<string>(copy.radioOptions[0]);
  const [rest, setRest] = useState<RestOption | undefined>(restOptions[2]);
  const [tab, setTab] = useState<string>(copy.tabs[0]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sync, setSync] = useState(false);
  const [expoSheet, setExpoSheet] = useState(false);
  const [weight, setWeight] = useState<number>(copy.slider.initial);
  const [range, setRange] = useState<string>(copy.segmentedOptions[0]);
  const gorhomSheet = useRef<BottomSheetModal<unknown>>(null);

  // No announcement call here: HeroUI's FieldError has no live region, and the
  // test records whether the library announces errors on its own.
  const validate = () => {
    setEmailError(/.+@.+\..+/.test(email) ? undefined : copy.textFieldError);
  };

  const showToast = () =>
    toast.show({
      component: (props) => (
        <Toast testID={ids.toast} {...props}>
          <Toast.Title>{copy.toastMessage}</Toast.Title>
        </Toast>
      ),
    });

  return (
    <ScrollView className="bg-background" contentContainerStyle={{ padding: space.lg, paddingBottom: 120 }}>
      <Text role="heading" className="text-foreground" style={type.heading}>
        {copy.screenTitle}
      </Text>

      {/* 12. Theme switcher: Uniwind.setTheme('light' | 'dark' | 'brand') */}
      <Section title={copy.themeLabel}>
        <Label>{copy.themeLabel}</Label>
        <RadioGroup
          testID={ids.themeSwitcher}
          aria-label={copy.themeLabel}
          value={themeName}
          onValueChange={(v) => {
            mark();
            setTheme(v as ThemeName);
            measure('theme');
          }}>
          {themeNames.map((name, i) => (
            <RadioGroup.Item key={name} value={name} testID={`${ids.themeSwitcher}-${i}`}>
              {copy.themes[i]}
            </RadioGroup.Item>
          ))}
        </RadioGroup>
      </Section>

      {/* 1. Buttons. HeroUI has no loading prop; the docs' loading pattern is a Spinner child. */}
      <Section title="Buttons">
        <Button
          testID={ids.button}
          isDisabled={saving}
          onPress={() => {
            setSaving(true);
            setTimeout(() => setSaving(false), 1500);
          }}>
          {saving && <Spinner size="sm" color={accentForeground} />}
          <Button.Label>{copy.button}</Button.Label>
        </Button>
        <Button testID={ids.buttonDisabled} isDisabled>
          {copy.buttonDisabled}
        </Button>
        <Button testID={ids.buttonLoading} isDisabled>
          <Spinner size="sm" color={accentForeground} />
          <Button.Label>{copy.buttonLoading}</Button.Label>
        </Button>
      </Section>

      <Section title="Form">
        {/* 2. Text field. nativeID / aria-labelledby linking is what HeroUI's
            Label docs describe; TextField does not link them itself. */}
        <TextField isInvalid={!!emailError}>
          <Label>
            <Label.Text nativeID={`${ids.textField}-label`}>{copy.textFieldLabel}</Label.Text>
          </Label>
          <Input
            testID={ids.textField}
            aria-labelledby={`${ids.textField}-label`}
            aria-describedby={`${ids.textField}-desc`}
            value={email}
            onChangeText={setEmail}
            onBlur={validate}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Description nativeID={`${ids.textField}-desc`} hideOnInvalid>
            {copy.textFieldHelper}
          </Description>
          <FieldError>{copy.textFieldError}</FieldError>
        </TextField>

        {/* 3. Switch inside ControlField (label + control in one pressable row). */}
        <ControlField testID={ids.switch} isSelected={reminders} onSelectedChange={setReminders}>
          <Label className="flex-1">{copy.switchLabel}</Label>
          <ControlField.Indicator />
        </ControlField>

        {/* 4. Checkbox. HeroUI has no indeterminate state. */}
        <ControlField testID={ids.checkbox} isSelected={agree} onSelectedChange={setAgree}>
          <Label className="flex-1">{copy.checkboxLabel}</Label>
          <ControlField.Indicator variant="checkbox" />
        </ControlField>

        {/* 5. Radio group. Visible label is a plain Label; the group name is aria-label (manual). */}
        <View style={{ gap: space.xs }}>
          <Label>{copy.radioGroupLabel}</Label>
          <RadioGroup testID={ids.radioGroup} aria-label={copy.radioGroupLabel} value={level} onValueChange={setLevel}>
            {copy.radioOptions.map((opt, i) => (
              <RadioGroup.Item key={opt} value={opt} testID={`${ids.radioGroup}-${i}`}>
                {opt}
              </RadioGroup.Item>
            ))}
          </RadioGroup>
        </View>

        {/* 8. Select, default popover presentation. */}
        <View style={{ gap: space.xs }}>
          <Label>{copy.selectLabel}</Label>
          <Select value={rest} onValueChange={(v) => setRest(v as RestOption | undefined)}>
            <Select.Trigger testID={ids.select}>
              <Select.Value placeholder={copy.selectLabel} />
              <Select.TriggerIndicator />
            </Select.Trigger>
            <Select.Portal>
              <Select.Overlay />
              <Select.Content presentation="popover" width="trigger">
                {restOptions.map((opt, i) => (
                  <Select.Item key={opt.value} value={opt.value} label={opt.label} testID={`${ids.select}-option-${i}`} />
                ))}
              </Select.Content>
            </Select.Portal>
          </Select>
        </View>
      </Section>

      <Section title="Overlays">
        {/* 6. Dialog with library defaults (no unstable_accessibilityContainerViewIsModal). */}
        <Dialog isOpen={dialogOpen} onOpenChange={setDialogOpen}>
          <Dialog.Trigger asChild>
            <Button testID={ids.dialogOpen} variant="danger">
              {copy.dialogOpen}
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content testID={ids.dialog}>
              <View style={{ gap: space.sm, marginBottom: space.lg }}>
                <Dialog.Title>{copy.dialogTitle}</Dialog.Title>
                <Dialog.Description>{copy.dialogBody}</Dialog.Description>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: space.sm }}>
                <Button testID={ids.dialogCancel} variant="outline" onPress={() => setDialogOpen(false)}>
                  {copy.dialogCancel}
                </Button>
                <Button testID={ids.dialogConfirm} variant="danger" onPress={() => setDialogOpen(false)}>
                  {copy.dialogConfirm}
                </Button>
              </View>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>

        {/* 7. HeroUI's own BottomSheet (built on @gorhom/bottom-sheet). */}
        <BottomSheet isOpen={sheetOpen} onOpenChange={setSheetOpen}>
          <BottomSheet.Trigger asChild>
            <Button testID={ids.sheetOpen} variant="outline">
              {copy.sheetOpen}
            </Button>
          </BottomSheet.Trigger>
          <BottomSheet.Portal>
            <BottomSheet.Overlay />
            <BottomSheet.Content>
              {/* BottomSheet.Content takes no testID, so it sits on this wrapper. */}
              <View testID={ids.sheet} style={{ gap: space.md, paddingBottom: space.xl }}>
                <BottomSheet.Title>{copy.sheetTitle}</BottomSheet.Title>
                <BottomSheet.Description>{copy.sheetBody}</BottomSheet.Description>
                <Button testID={ids.sheetClose} variant="outline" onPress={() => setSheetOpen(false)}>
                  {copy.sheetClose}
                </Button>
              </View>
            </BottomSheet.Content>
          </BottomSheet.Portal>
        </BottomSheet>

        {/* 13. Raw @gorhom/bottom-sheet themed via withUniwind. */}
        <Button testID={`${ids.sheetOpen}-gorhom`} variant="outline" onPress={() => gorhomSheet.current?.present()}>
          {`${copy.sheetOpen} (@gorhom)`}
        </Button>

        {/* @expo/ui's universal BottomSheet, coloured from HeroUI theme tokens. */}
        <Button testID={ids.expoSheetOpen} variant="outline" onPress={() => setExpoSheet(true)}>
          {copy.expoSheetOpen}
        </Button>

        {/* 10. Toast via useToast(). */}
        <Button testID={ids.toastShow} variant="outline" onPress={showToast}>
          {copy.toastShow}
        </Button>
      </Section>

      {/* 9. Tabs */}
      <Section title="Tabs">
        <Tabs value={tab} onValueChange={setTab}>
          <Tabs.List testID={ids.tabs}>
            <Tabs.Indicator />
            {copy.tabs.map((t, i) => (
              <Tabs.Trigger key={t} value={t} testID={`${ids.tabs}-${i}`}>
                <Tabs.Label>{t}</Tabs.Label>
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {copy.tabs.map((t, i) => (
            <Tabs.Content key={t} value={t}>
              <Text className="text-foreground" style={[type.body, { paddingTop: space.md }]}>
                {copy.tabPanels[i]}
              </Text>
            </Tabs.Content>
          ))}
        </Tabs>
      </Section>

      {/* 15–19. Slider, Accordion and Menu from HeroUI; Progress and segmented hand-built. */}
      <Section title={copy.moreTitle}>
        <Slider testID={ids.slider} label={copy.sliderLabel} unit={copy.sliderUnit} min={copy.slider.min} max={copy.slider.max} step={copy.slider.step} value={weight} onChange={setWeight} />
        <Progress testID={ids.progress} label={copy.progressLabel} value={copy.progress.value} max={copy.progress.max} valueText={copy.progressText} />
        <Accordion testID={ids.accordion} sections={copy.accordionSections} panels={copy.accordionPanels} />
        <Menu testID={ids.menu} label={copy.menuOpen} items={copy.menuItems} onSelect={() => {}} />
        <Segmented testID={ids.segmented} label={copy.segmentedLabel} options={copy.segmentedOptions} value={range} onChange={setRange} />
      </Section>

      {/* 14. @expo/ui native control, seeded from the active HeroUI accent token. */}
      <Section title="Native control (@expo/ui)">
        <Host matchContents colorScheme={themeName === 'dark' ? 'dark' : 'light'} seedColor={accent}>
          <NativeSwitch testID={ids.nativeSwitch} label={copy.nativeSwitchLabel} value={sync} onValueChange={setSync} />
        </Host>
      </Section>

      {/* 11. List link */}
      <Section title="List">
        <PerfTouch onTouchStart={mark}>
          <Button testID={ids.listLink} variant="outline" onPress={() => router.push('/list')}>
            {copy.listLink}
          </Button>
        </PerfTouch>
      </Section>

      <ExerciseSheet
        sheetRef={gorhomSheet}
        testID={`${ids.sheet}-gorhom`}
        title={copy.sheetTitle}
        body={copy.sheetBody}
        close={copy.sheetClose}
      />
      <ExpoExerciseSheet open={expoSheet} onClose={() => setExpoSheet(false)} testID={ids.expoSheet} title={copy.sheetTitle} body={copy.sheetBody} close={copy.sheetClose} />
    </ScrollView>
  );
}
