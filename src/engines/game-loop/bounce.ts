// Pure physics for the demo entity. Import-free on purpose: anything the frame loop
// decides that can be expressed as maths lives in a module like this so it is testable
// without a device.

export type Vec = { x: number; y: number };
export type Ball = { x: number; y: number; vx: number; vy: number; r: number };
export type Bounds = { width: number; height: number };
export type StepOptions = {
  /** frameScale() for this frame. */
  dtf: number;
  /** Per-60Hz-frame velocity retention, 0..1 (1 = frictionless). */
  friction: number;
  /** Fraction of speed kept on a wall hit, 0..1. */
  bounciness: number;
};

/**
 * Advances the ball one frame. Returns the new ball plus the strongest impact speed
 * this frame (0 when no wall was hit), measured BEFORE reflection so feedback (sound,
 * haptics) can scale with how hard the hit was.
 */
export function stepBall(b: Ball, gravity: Vec, bounds: Bounds, o: StepOptions): { ball: Ball; impact: number } {
  const damping = Math.pow(o.friction, o.dtf);
  let vx = (b.vx + gravity.x * o.dtf) * damping;
  let vy = (b.vy + gravity.y * o.dtf) * damping;
  let x = b.x + vx * o.dtf;
  let y = b.y + vy * o.dtf;
  let impact = 0;

  if (x < b.r || x > bounds.width - b.r) {
    x = x < b.r ? b.r : bounds.width - b.r;
    impact = Math.max(impact, Math.abs(vx));
    vx = -vx * o.bounciness;
  }
  if (y < b.r || y > bounds.height - b.r) {
    y = y < b.r ? b.r : bounds.height - b.r;
    impact = Math.max(impact, Math.abs(vy));
    vy = -vy * o.bounciness;
  }
  return { ball: { ...b, x, y, vx, vy }, impact };
}
