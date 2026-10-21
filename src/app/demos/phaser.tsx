import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useTheme } from '@/core/theme/useTheme';
import { haptics } from '@/engines/haptics/haptics';
import { PhaserView, type GameEvent, type PhaserViewHandle } from '@/engines/phaser';
import { MenuHost, useMenu, useTopMenu } from '@/menu';
import { makePauseMenu, OptionsMenu } from '@/menu/commonMenus';

export default function PhaserDemo() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const game = useRef<PhaserViewHandle>(null);
  const [bounces, setBounces] = useState(0);
  const menuOpen = useTopMenu() !== undefined;
  const open = useMenu((s) => s.open);

  // The menu system drives the game: any open menu pauses the scene.
  useEffect(() => game.current?.send({ type: menuOpen ? 'pause' : 'resume' }), [menuOpen]);

  const menus = useMemo(
    () => ({
      pause: makePauseMenu(() => {
        setBounces(0);
        game.current?.send({ type: 'restart' });
      }),
      options: OptionsMenu,
    }),
    []
  );

  const onEvent = (e: GameEvent) => {
    if (e.type === 'bounce') {
      setBounces(e.count);
      haptics.impact('light');
    }
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.fill, { backgroundColor: colors.background }]}>
      <PhaserView ref={game} onEvent={onEvent} background={colors.background} />
      <View pointerEvents="box-none" style={styles.hud}>
        <View pointerEvents="none" style={styles.text}>
          <Text variant="heading">{t('phaser.bounces', { count: bounces })}</Text>
          <Text variant="caption">{t('phaser.hint')}</Text>
        </View>
        <Button variant="secondary" label="II" accessibilityLabel={t('menu.paused')} onPress={() => open('pause')} />
      </View>
      <MenuHost menus={menus} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  hud: { position: 'absolute', top: 12, left: 16, right: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  text: { flex: 1, gap: 4 },
});
