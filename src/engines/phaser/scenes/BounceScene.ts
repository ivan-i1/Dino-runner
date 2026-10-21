import * as Phaser from 'phaser';

import type { GameEvent, HostCommand } from '../bridge';

const MIN_IMPACT_SPEED = 90; // px/s

/**
 * Example scene: a ball under gravity that you launch by tapping. Replace with your
 * own scenes; keep talking to the host only through `emit` and `onCommand`.
 * This file is bundled into the native WebView by scripts/build-phaser-html.mjs —
 * import only 'phaser' and relative files, never React Native modules.
 */
export class BounceScene extends Phaser.Scene {
  private ball!: Phaser.Physics.Arcade.Image;
  private bounces = 0;

  constructor(private emit: (e: GameEvent) => void) {
    super('bounce');
  }

  create() {
    const g = this.add.graphics();
    g.fillStyle(0x8c98ff, 1).fillCircle(24, 24, 24);
    g.generateTexture('ball', 48, 48);
    g.destroy();

    const { width, height } = this.scale;
    this.ball = this.physics.add.image(width / 2, height / 3, 'ball');
    this.ball.setCollideWorldBounds(true).setBounce(0.8).setVelocity(180, 0);
    (this.ball.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;

    // Arcade fires 'worldbounds' every frame while the ball rests on or slides along a
    // wall, so only count hits with real speed INTO that wall (the perpendicular axis).
    this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body, up: boolean, down: boolean) => {
      const into = up || down ? Math.abs(body.velocity.y) : Math.abs(body.velocity.x);
      if (into < MIN_IMPACT_SPEED) return;
      this.bounces++;
      this.emit({ type: 'bounce', count: this.bounces });
    });

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      const dx = this.ball.x - p.x;
      const dy = this.ball.y - p.y;
      const len = Math.hypot(dx, dy) || 1;
      this.ball.setVelocity((dx / len) * 700, (dy / len) * 700);
    });

    this.scale.on('resize', (size: Phaser.Structs.Size) => {
      this.physics.world.setBounds(0, 0, size.width, size.height);
    });
  }

  onCommand(c: HostCommand) {
    if (c.type === 'pause') this.scene.pause();
    else if (c.type === 'resume') this.scene.resume();
    else if (c.type === 'restart') {
      this.bounces = 0;
      this.scene.restart();
    }
  }
}
