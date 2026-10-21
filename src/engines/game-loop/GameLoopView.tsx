import { useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutRectangle } from 'react-native';
import { GameEngine, type GameEngineSystem } from 'react-native-game-engine';

import { frameScale } from './frameScale';

export type FrameContext = { dtf: number; deltaMs: number; bounds: { width: number; height: number } };
/** A system with the frame already normalised: mutate entities, return them. */
export type System<E> = (entities: E, frame: FrameContext) => E;

/**
 * Thin wrapper over react-native-game-engine. It measures its own box (not the
 * window, so it is correct inside headers, split-screen and after rotation), waits
 * for a size before starting, and hands each system a frameScale-normalised `dtf`.
 *
 * `entities` is read ONCE at mount (an RNGE rule). Keep the object stable (useRef)
 * and mutate it from systems; `running={false}` pauses the loop.
 * Every entity `renderer` component must begin with the `'use no memo'` directive —
 * the React Compiler otherwise memoises it against the mutated entity and it freezes.
 */
export function GameLoopView<E extends Record<string, any>>({
  entities,
  systems,
  running = true,
  children,
}: {
  entities: E;
  systems: System<E>[];
  running?: boolean;
  children?: ReactNode;
}) {
  const [layout, setLayout] = useState<LayoutRectangle>();
  const bounds = useRef({ width: 0, height: 0 });
  const wrapped = useRef<GameEngineSystem[]>(
    systems.map(
      (system): GameEngineSystem =>
        (ents, { time }) =>
          system(ents, { dtf: frameScale(time?.delta), deltaMs: time?.delta ?? 0, bounds: bounds.current })
    )
  );

  return (
    <View
      style={styles.fill}
      onLayout={(e) => {
        bounds.current = { width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height };
        setLayout(e.nativeEvent.layout);
      }}>
      {layout && (
        <GameEngine style={styles.fill} systems={wrapped.current} entities={entities} running={running} />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
