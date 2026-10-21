import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen, Section } from '@/components/Screen';
import { Text } from '@/components/Text';
import { clearCustomSound, loadCustomSound, pickCustomSound, SoundBank, SOUNDS } from '@/engines/audio';
import { haptics } from '@/engines/haptics/haptics';
import { calibrateTilt, onShake, tilt, useTiltSensor } from '@/engines/sensors';

const SLOT = 'tap';

export default function MediaDemo() {
  const { t } = useTranslation();
  const bank = useRef<SoundBank | null>(null);
  const [custom, setCustom] = useState<string | null>(null);
  const sensor = useTiltSensor();
  const [reading, setReading] = useState({ x: 0, y: 0 });
  const [shakes, setShakes] = useState(0);

  useEffect(() => {
    const b = new SoundBank([...SOUNDS.tap]);
    bank.current = b;
    loadCustomSound(SLOT).then((s) => {
      if (s && bank.current === b) {
        b.setOverride({ uri: s.uri });
        setCustom(s.name);
      }
    });
    return () => b.release();
  }, []);

  // Poll the module-level tilt for display only; games read `tilt` directly each frame.
  useEffect(() => {
    if (!sensor) return;
    const id = setInterval(() => setReading({ ...tilt.gravity }), 100);
    const off = onShake(() => setShakes((n) => n + 1));
    return () => {
      clearInterval(id);
      off();
    };
  }, [sensor]);

  return (
    <Screen>
      <Section title={<Text variant="heading">{t('media.sound')}</Text>}>
        <Button label={t('media.playBank')} onPress={() => bank.current?.play()} />
        <Button
          variant="secondary"
          label={t('media.pickCustom')}
          onPress={async () => {
            const s = await pickCustomSound(SLOT);
            if (s) {
              bank.current?.setOverride({ uri: s.uri });
              setCustom(s.name);
            }
          }}
        />
        {custom && (
          <>
            <Text variant="caption">{t('media.customSet', { name: custom })}</Text>
            <Button
              variant="secondary"
              label={t('media.clearCustom')}
              onPress={async () => {
                await clearCustomSound(SLOT);
                bank.current?.setOverride(null);
                setCustom(null);
              }}
            />
          </>
        )}
      </Section>

      <Section title={<Text variant="heading">{t('media.haptics')}</Text>}>
        <View style={styles.row}>
          <Button style={styles.grow} variant="secondary" label={t('media.light')} onPress={() => haptics.impact('light')} />
          <Button style={styles.grow} variant="secondary" label={t('media.heavy')} onPress={() => haptics.impact('heavy')} />
          <Button style={styles.grow} variant="secondary" label={t('media.success')} onPress={() => haptics.success()} />
        </View>
      </Section>

      <Section title={<Text variant="heading">{t('media.sensors')}</Text>}>
        {sensor === false ? (
          <Text variant="caption">{t('media.unavailable')}</Text>
        ) : (
          <>
            <Text>{t('media.tilt', { x: reading.x.toFixed(2), y: reading.y.toFixed(2) })}</Text>
            <Text>{t('media.shakes', { count: shakes })}</Text>
            <Button variant="secondary" label={t('media.calibrate')} onPress={calibrateTilt} />
          </>
        )}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: 8 }, grow: { flex: 1, paddingHorizontal: 8 } });
