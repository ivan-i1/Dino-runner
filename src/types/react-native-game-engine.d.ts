// react-native-game-engine ships no types. Only the surface Base App uses is declared.
declare module 'react-native-game-engine' {
  import type { Component, ReactNode } from 'react';
  import type { StyleProp, ViewStyle } from 'react-native';

  export type GameEngineTime = { current: number; previous: number | null; delta: number };
  export type GameEngineUpdateEventOptionType = {
    time: GameEngineTime;
    touches: { type: string; event: { pageX: number; pageY: number; locationX: number; locationY: number } }[];
    dispatch: (event: unknown) => void;
    events: unknown[];
    screen: { width: number; height: number };
  };
  export type GameEngineSystem = (entities: any, args: GameEngineUpdateEventOptionType) => any;

  export interface GameEngineProps {
    systems?: GameEngineSystem[];
    entities?: Record<string, any>;
    running?: boolean;
    onEvent?: (event: any) => void;
    style?: StyleProp<ViewStyle>;
    children?: ReactNode;
  }
  export class GameEngine extends Component<GameEngineProps> {
    swap(entities: Record<string, any>): void;
    start(): void;
    stop(): void;
    dispatch(event: unknown): void;
  }
}
