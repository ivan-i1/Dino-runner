// Messages between the React Native host and the Phaser game. The same types are used
// on web (direct calls) and native (postMessage through the WebView), so a game written
// against them runs unchanged on all three platforms.

/** Game → host. */
export type GameEvent = { type: 'ready' } | { type: 'bounce'; count: number } | { type: 'log'; message: string };

/** Host → game. */
export type HostCommand =
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'restart' }
  | { type: 'settings'; sound: boolean; volume: number };

export type GameHandle = { command: (c: HostCommand) => void; destroy: () => void };
