export type Rng = () => number;

/**
 * Picks the next sound variant from a bank of `count`, never repeating `last` when
 * there is a choice — back-to-back identical samples are what makes a sound feel
 * mechanical. Randomness is injected so the behaviour is assertable.
 */
export function pickVariant(count: number, last: number, rng: Rng): number {
  if (count <= 0) return -1;
  if (count === 1) return 0;
  // Draw from the other count-1 slots, then skip over `last`.
  const pick = Math.min(count - 2, Math.floor(rng() * (count - 1)));
  return last >= 0 && pick >= last ? pick + 1 : pick;
}

/** Maps an impact speed to a playback gain so a slam is louder than a graze. */
export function impactGain(speed: number, loudSpeed: number, minGain: number): number {
  if (!(speed > 0)) return 0;
  return Math.max(minGain, Math.min(1, speed / loudSpeed));
}
