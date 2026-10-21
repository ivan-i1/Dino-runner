import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import type { GameEvent, GameHandle, HostCommand } from './bridge';
import type { PhaserViewHandle, PhaserViewProps } from './PhaserView';

/**
 * Web host: Phaser runs directly in the page. The game module (and Phaser itself) is
 * loaded with a dynamic import so it is code-split out of the main bundle.
 */
export const PhaserView = forwardRef<PhaserViewHandle, PhaserViewProps>(function PhaserView(
  { onEvent, background = '#0F1016' },
  ref
) {
  const host = useRef<View>(null);
  const game = useRef<GameHandle | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useImperativeHandle(ref, () => ({ send: (c: HostCommand) => game.current?.command(c) }), []);

  useEffect(() => {
    let cancelled = false;
    import('./game').then(({ startGame }) => {
      // On react-native-web a View ref is the DOM element.
      const el = host.current as unknown as HTMLElement | null;
      if (cancelled || !el) return;
      game.current = startGame(el, (e: GameEvent) => onEventRef.current?.(e), background);
    });
    return () => {
      cancelled = true;
      game.current?.destroy();
      game.current = null;
    };
  }, [background]);

  return <View ref={host} style={styles.fill} />;
});

const styles = StyleSheet.create({ fill: { flex: 1, overflow: 'hidden' } });
