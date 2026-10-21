import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { useTheme } from '@/core/theme/useTheme';
import { impactGain, SoundBank, SOUNDS } from '@/engines/audio';
import { GameLoopView, stepBall, type Ball, type System } from '@/engines/game-loop';
import { haptics } from '@/engines/haptics/haptics';
import { tilt, useTiltSensor } from '@/engines/sensors';
import { MenuHost, useMenu, useTopMenu } from '@/menu';
import { makePauseMenu, OptionsMenu } from '@/menu/commonMenus';

const TILT_ACCEL = 1.3; // px/frame² per g of tilt
const FALLBACK_GRAVITY = { x: 0, y: 0.6 }; // web / no sensor: plain downward gravity
const MIN_FEEDBACK_SPEED = 1.5; // ignore resting micro-bounces

type Entities = { ball: Ball & { color: string; renderer: typeof BallView } };

// Entity renderers MUST opt out of the React Compiler: RNGE re-renders them with the
// same entity object mutated in place, which the compiler's memoisation treats as
// unchanged — the ball would freeze on its first frame.
function BallView({ x, y, r, color }: Ball & { color: string }) {
  'use no memo';
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, backgroundColor: color }}
    />
  );
}

export default function GameLoopDemo() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const sensor = useTiltSensor();
  const paused = useTopMenu() !== undefined;
  const open = useMenu((s) => s.open);
  const [bounces, setBounces] = useState(0);

  const bank = useRef<SoundBank | null>(null);
  useEffect(() => {
    bank.current = new SoundBank([...SOUNDS.bounce], { voices: 2, rate: [0.85, 1.2] });
    return () => bank.current?.release();
  }, []);

  // Entities are read once at mount (RNGE rule) — keep them stable and mutate in systems.
  const entities = useRef<Entities>({
    ball: { x: 120, y: 120, vx: 4, vy: 0, r: 22, color: colors.primary, renderer: BallView },
  }).current;
  entities.ball.color = colors.primary;

  const reset = useRef(() => {
    Object.assign(entities.ball, { x: 120, y: 120, vx: 4, vy: 0 });
    setBounces(0);
  }).current;

  const systems = useMemo<System<Entities>[]>(
    () => [
      (ents, { dtf, bounds }) => {
        const gravity = tilt.available ? { x: tilt.gravity.x * TILT_ACCEL, y: tilt.gravity.y * TILT_ACCEL } : FALLBACK_GRAVITY;
        const { ball, impact } = stepBall(ents.ball, gravity, bounds, { dtf, friction: 0.995, bounciness: 0.7 });
        Object.assign(ents.ball, ball);
        if (impact > MIN_FEEDBACK_SPEED) {
          bank.current?.play(impactGain(impact, 14, 0.25));
          haptics.impact(impact > 10 ? 'heavy' : impact > 5 ? 'medium' : 'light');
          setBounces((n) => n + 1);
        }
        return ents;
      },
    ],
    []
  );

  const menus = useMemo(() => ({ pause: makePauseMenu(reset), options: OptionsMenu }), [reset]);

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.fill, { backgroundColor: colors.background }]}>
      <GameLoopView entities={entities} systems={systems} running={!paused}>
        <Pressable style={StyleSheet.absoluteFill} accessibilityLabel={t('menu.paused')} onPress={() => open('pause')} />
      </GameLoopView>
      <View pointerEvents="none" style={styles.hud}>
        <Text variant="heading">{t('gameLoop.bounces', { count: bounces })}</Text>
        <Text variant="caption">{sensor === false ? t('gameLoop.noTilt') : t('gameLoop.hint')}</Text>
      </View>
      <MenuHost menus={menus} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  hud: { position: 'absolute', top: 12, left: 16, right: 16, gap: 4 },
});
