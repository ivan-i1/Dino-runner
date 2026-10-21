// Pure tilt maths. The accelerometer reports gravity plus whatever the hand is doing;
// these helpers split the two and shape the result for gameplay.

export type Vec = { x: number; y: number };

/** Exponential moving average: moves `alpha` of the way toward the new sample. */
export function lowPass(prev: Vec, sample: Vec, alpha: number): Vec {
  return { x: prev.x + (sample.x - prev.x) * alpha, y: prev.y + (sample.y - prev.y) * alpha };
}

/**
 * Zeroes tilt inside a radial dead zone and rescales what is outside it, so input
 * starts from 0 at the edge of the zone instead of jumping to `deadzone`.
 */
export function applyDeadzone(v: Vec, deadzone: number): Vec {
  const mag = Math.hypot(v.x, v.y);
  if (mag <= deadzone || mag === 0) return { x: 0, y: 0 };
  const scale = (mag - deadzone) / mag;
  return { x: v.x * scale, y: v.y * scale };
}

/**
 * A shake is a large residual between the raw sample and the slow gravity estimate.
 * Differences between consecutive samples would telescope to ~0 over a shake cycle;
 * the residual does not.
 */
export function isShake(gravity: Vec, sample: Vec, threshold: number): boolean {
  return Math.hypot(sample.x - gravity.x, sample.y - gravity.y) > threshold;
}

/**
 * Device accelerometer → screen-space "downhill" vector for a portrait app.
 * The sensor reads +g on the axis pointing AWAY from the ground, so a raised edge reads
 * positive and things must roll the other way. Screen Y grows downward while device Y
 * grows upward, hence only X is negated. Verified on Android (expo-sensors issue #19229
 * reports platform sign differences — verify on iOS before relying on it).
 */
export function deviceToScreen(sample: Vec): Vec {
  return { x: -sample.x, y: sample.y };
}
