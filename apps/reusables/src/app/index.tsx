import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Host, Switch as NativeSwitch } from '@expo/ui';
import type { Option } from '@rn-primitives/select';
import { Link } from 'expo-router';
import { Loader2 } from 'lucide-react-native';
import { useCallback, useRef, useState, type ReactNode } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Uniwind, useCSSVariable, useUniwind } from 'uniwind';

import { copy, ids } from '@shared/content';
import type { ThemeName } from '@shared/tokens';

import { announce } from '@/a11y';
import { ExerciseSheet, Toast } from '@/components/overlays';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { type } from '@/lib/type';
import { cn } from '@/lib/utils';
import { mark, measure } from '../perf';
import { View as PerfTouch } from 'react-native';

const themeNames: ThemeName[] = ['light', 'dark', 'brand'];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3 py-4">
      {/* RNR Text variant="h4" sets role="heading" itself. */}
      <Text variant="h4" className={type.title}>
        {title}
      </Text>
      {children}
    </View>
  );
}

// Labelled radio group, composed the way RNR's docs show it: RadioGroupItem +
// Label per option, Label onPress selecting on native. The group and item
// labels are linked with aria-labelledby/nativeID (RNR's Label example).
function LabelledRadioGroup({ testID, label, options, value, onChange }: { testID: string; label: string; options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <View className="gap-2">
      <Text nativeID={`${testID}-label`} className={type.label}>
        {label}
      </Text>
      <RadioGroup testID={testID} aria-labelledby={`${testID}-label`} value={value} onValueChange={onChange}>
        {options.map((opt, i) => (
          <View key={opt} className="flex-row items-center gap-3">
            <RadioGroupItem testID={`${testID}-${i}`} value={opt} aria-labelledby={`${testID}-${i}-label`} />
            <Label nativeID={`${testID}-${i}-label`} onPress={Platform.select({ native: () => onChange(opt) })}>
              {opt}
            </Label>
          </View>
        ))}
      </RadioGroup>
    </View>
  );
}

export default function TestScreen() {
  const { theme } = useUniwind();
  const primary = useCSSVariable('--color-primary');
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [reminders, setReminders] = useState(true);
  const [agree, setAgree] = useState(false);
  const [level, setLevel] = useState<string>(copy.radioOptions[0]);
  const [rest, setRest] = useState<Option>({ value: copy.selectOptions[2], label: copy.selectOptions[2] });
  const [tab, setTab] = useState<string>(copy.tabs[0]);
  const [toast, setToast] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sync, setSync] = useState(false);
  const sheet = useRef<BottomSheetModal<unknown>>(null);
  const hideToast = useCallback(() => setToast(false), []);

  const validate = () => {
    const err = /.+@.+\..+/.test(email) ? undefined : copy.textFieldError;
    setEmailError(err);
    // Manual: RNR's Input has no error state or announcement.
    if (err) announce(err);
  };

  // RNR Select docs pass safe-area insets to SelectContent.
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({ ios: insets.bottom, android: insets.bottom + 24 }),
    left: 12,
    right: 12,
  };

  const currentTheme = (themeNames as string[]).includes(theme) ? (theme as ThemeName) : 'light';

  return (
    <View className="flex-1">
      <ScrollView contentContainerClassName="p-4 pb-[120px]">
        <Text variant="h1" className={cn(type.heading, 'text-left')}>
          {copy.screenTitle}
        </Text>

        <Section title={copy.themeLabel}>
          {/* Uniwind.setTheme is the documented runtime switch; brand is
              registered through extraThemes in metro.config.js. */}
          <LabelledRadioGroup
            testID={ids.themeSwitcher}
            label={copy.themeLabel}
            options={copy.themes}
            value={copy.themes[themeNames.indexOf(currentTheme)]}
            onChange={(v) => {
              mark();
              Uniwind.setTheme(themeNames[copy.themes.indexOf(v as (typeof copy.themes)[number])]);
              measure('theme');
            }}
          />
        </Section>

        <Section title="Buttons">
          <Button
            testID={ids.button}
            disabled={saving}
            onPress={() => {
              setSaving(true);
              setTimeout(() => setSaving(false), 1500);
            }}>
            {saving && (
              <View className="pointer-events-none animate-spin">
                <Icon as={Loader2} className="text-primary-foreground" />
              </View>
            )}
            <Text>{copy.button}</Text>
          </Button>
          <Button testID={ids.buttonDisabled} disabled>
            <Text>{copy.buttonDisabled}</Text>
          </Button>
          {/* Loading state as RNR documents it: disabled + spinning icon. */}
          <Button testID={ids.buttonLoading} disabled>
            <View className="pointer-events-none animate-spin">
              <Icon as={Loader2} className="text-primary-foreground" />
            </View>
            <Text>{copy.buttonLoading}</Text>
          </Button>
        </Section>

        <Section title="Form">
          <View className="gap-1">
            <Label nativeID={`${ids.textField}-label`}>{copy.textFieldLabel}</Label>
            <Input
              testID={ids.textField}
              aria-labelledby={`${ids.textField}-label`}
              value={email}
              onChangeText={setEmail}
              onBlur={validate}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              className={cn(emailError && 'border-destructive border-2')}
            />
            {/* Manual: helper/error text. aria-live is the Android live region;
                iOS gets announce() in validate(). */}
            <Text aria-live={emailError ? 'polite' : undefined} className={cn(type.caption, emailError ? 'text-destructive' : 'text-muted-foreground')}>
              {emailError ?? copy.textFieldHelper}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Switch testID={ids.switch} checked={reminders} onCheckedChange={setReminders} aria-labelledby={`${ids.switch}-label`} />
            <Label nativeID={`${ids.switch}-label`} onPress={() => setReminders((v) => !v)}>
              {copy.switchLabel}
            </Label>
          </View>

          <View className="flex-row items-center gap-3">
            <Checkbox testID={ids.checkbox} checked={agree} onCheckedChange={setAgree} aria-labelledby={`${ids.checkbox}-label`} />
            <Label nativeID={`${ids.checkbox}-label`} onPress={Platform.select({ native: () => setAgree((v) => !v) })}>
              {copy.checkboxLabel}
            </Label>
          </View>

          <LabelledRadioGroup testID={ids.radioGroup} label={copy.radioGroupLabel} options={copy.radioOptions} value={level} onChange={setLevel} />

          <View className="gap-1">
            <Label nativeID={`${ids.select}-label`}>{copy.selectLabel}</Label>
            <Select value={rest} onValueChange={setRest}>
              <SelectTrigger testID={ids.select} aria-labelledby={`${ids.select}-label`} className="w-[200px]">
                <SelectValue placeholder={copy.selectLabel} />
              </SelectTrigger>
              <SelectContent insets={contentInsets} className="w-[200px]">
                <SelectGroup>
                  {copy.selectOptions.map((opt, i) => (
                    <SelectItem key={opt} testID={`${ids.select}-option-${i}`} label={opt} value={opt} />
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </View>
        </Section>

        <Section title="Overlays">
          {/* AlertDialogTrigger owns the ref that focus returns to on close. */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button testID={ids.dialogOpen} variant="destructive">
                <Text>{copy.dialogOpen}</Text>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent testID={ids.dialog}>
              <AlertDialogHeader>
                <AlertDialogTitle>{copy.dialogTitle}</AlertDialogTitle>
                <AlertDialogDescription>{copy.dialogBody}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel testID={ids.dialogCancel}>
                  <Text>{copy.dialogCancel}</Text>
                </AlertDialogCancel>
                <AlertDialogAction testID={ids.dialogConfirm} className="bg-destructive">
                  <Text className="text-destructive-foreground">{copy.dialogConfirm}</Text>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button testID={ids.sheetOpen} variant="outline" onPress={() => sheet.current?.present()}>
            <Text>{copy.sheetOpen}</Text>
          </Button>
          <Button testID={ids.toastShow} variant="outline" onPress={() => setToast(true)}>
            <Text>{copy.toastShow}</Text>
          </Button>
        </Section>

        <Section title="Tabs">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList testID={ids.tabs}>
              {copy.tabs.map((t, i) => (
                <TabsTrigger key={t} testID={`${ids.tabs}-${i}`} value={t}>
                  <Text>{t}</Text>
                </TabsTrigger>
              ))}
            </TabsList>
            {copy.tabs.map((t, i) => (
              <TabsContent key={t} value={t}>
                <Text className={type.body}>{copy.tabPanels[i]}</Text>
              </TabsContent>
            ))}
          </Tabs>
        </Section>

        <Section title="Native control (@expo/ui)">
          {/* Host colours come from the active Uniwind theme. */}
          <Host matchContents colorScheme={theme === 'dark' ? 'dark' : 'light'} seedColor={primary === undefined ? undefined : String(primary)}>
            <NativeSwitch testID={ids.nativeSwitch} label={copy.nativeSwitchLabel} value={sync} onValueChange={setSync} />
          </Host>
        </Section>

        <Section title="List">
          <PerfTouch onTouchStart={mark}>
            <Link href="/list" asChild>
              <Button testID={ids.listLink} variant="outline">
                <Text>{copy.listLink}</Text>
              </Button>
            </Link>
          </PerfTouch>
        </Section>
      </ScrollView>

      <ExerciseSheet sheetRef={sheet} testID={ids.sheet} title={copy.sheetTitle} body={copy.sheetBody} close={copy.sheetClose} />
      <Toast testID={ids.toast} message={copy.toastMessage} visible={toast} onHide={hideToast} />
    </View>
  );
}
