import * as Phaser from 'phaser';

import type { GameEvent, GameHandle, HostCommand } from './bridge';
import { BounceScene } from './scenes/BounceScene';

/** Boots the Phaser game into `parent`. Shared by the web host and the WebView page. */
export function startGame(parent: HTMLElement, emit: (e: GameEvent) => void, background = '#0F1016'): GameHandle {
  const scene = new BounceScene(emit);
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: background,
    scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
    physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 900 } } },
    scene,
    banner: false,
  });
  game.events.once(Phaser.Core.Events.READY, () => emit({ type: 'ready' }));
  return {
    command: (c: HostCommand) => scene.onCommand(c),
    destroy: () => game.destroy(true),
  };
}
