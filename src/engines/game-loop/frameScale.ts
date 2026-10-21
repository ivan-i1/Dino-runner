/** Nominal frame length the game's constants are tuned for. */
export const FRAME_MS = 1000 / 60;

/**
 * Converts the loop's real frame delta into a multiplier relative to a 60 Hz frame.
 *
 * The loop is driven by requestAnimationFrame, so it ticks at the display's refresh
 * rate. Without this, a 120 Hz phone runs everything twice as fast on the same
 * constants. Every force, velocity and damping step must be scaled by it.
 * Clamped to [0.5, 2] so one long stall (GC, backgrounding) cannot teleport entities.
 */
export function frameScale(deltaMs: number | undefined): number {
  if (deltaMs === undefined || !Number.isFinite(deltaMs) || deltaMs <= 0) return 1;
  return Math.min(2, Math.max(0.5, deltaMs / FRAME_MS));
}
