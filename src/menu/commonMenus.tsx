import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { Button } from '@/components/Button';
import { SettingsFields } from '@/components/SettingsFields';
import { Text } from '@/components/Text';
import { useMenu } from './menuStore';

/** Pause menu shared by game screens. `onRestart` lets each game reset its own state. */
export function makePauseMenu(onRestart?: () => void) {
  return function PauseMenu() {
    const { t } = useTranslation();
    const router = useRouter();
    const { closeAll, open } = useMenu();
    return (
      <>
        <Text variant="heading">{t('menu.paused')}</Text>
        <Button label={t('menu.resume')} onPress={closeAll} />
        {onRestart && (
          <Button
            variant="secondary"
            label={t('menu.restart')}
            onPress={() => {
              onRestart();
              closeAll();
            }}
          />
        )}
        <Button variant="secondary" label={t('menu.options')} onPress={() => open('options')} />
        <Button
          variant="secondary"
          label={t('menu.quit')}
          onPress={() => {
            closeAll();
            router.back();
          }}
        />
      </>
    );
  };
}

export function OptionsMenu() {
  const { t } = useTranslation();
  const back = useMenu((s) => s.back);
  return (
    <>
      <Text variant="heading">{t('menu.options')}</Text>
      <ScrollView contentContainerStyle={{ gap: 12 }}>
        <SettingsFields />
      </ScrollView>
      <Button variant="secondary" label={t('common.back')} onPress={back} />
    </>
  );
}
