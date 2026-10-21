import { createAudioPlayer, type AudioPlayer, type AudioSource } from 'expo-audio';

import { getSettings } from '@/core/settings/store';
import { pickVariant, type Rng } from './pickVariant';

export type BankOptions = {
  /** Players per variant, so rapid hits overlap instead of cutting each other off. */
  voices?: number;
  /** Random playback-rate range per hit; [1, 1] disables pitch variation. */
  rate?: [number, number];
  /** ± fraction of random volume variation per hit. */
  volumeJitter?: number;
  rng?: Rng;
};

const between = (lo: number, hi: number, rng: Rng) => lo + rng() * (hi - lo);

/**
 * A set of interchangeable sound variants (e.g. three bounce samples) with
 * overlapping voices, non-repeating variant choice and per-hit pitch/volume jitter.
 * Respects the Sound and Volume settings. Create once (module scope or a ref), call
 * play() as often as you like, release() on unmount.
 */
export class SoundBank {
  private players: AudioPlayer[] = [];
  private voices: number;
  private last = -1;
  private cursor = 0;
  private override: AudioPlayer | null = null;

  constructor(
    private sources: AudioSource[],
    private o: BankOptions = {}
  ) {
    this.voices = Math.max(1, o.voices ?? 2);
    for (const source of sources) {
      for (let v = 0; v < this.voices; v++) this.players.push(this.makePlayer(source));
    }
  }

  private makePlayer(source: AudioSource) {
    const p = createAudioPlayer(source);
    // Let rate changes drag the pitch with them — that variation is the point.
    p.shouldCorrectPitch = false;
    return p;
  }

  /** Replace the whole bank with one user-chosen sound (null restores the built-ins). */
  setOverride(source: AudioSource | null) {
    this.override?.remove();
    this.override = source ? this.makePlayer(source) : null;
  }

  /** gain 0..1 multiplies the master volume (use impactGain() for collisions). */
  play(gain = 1) {
    const s = getSettings();
    if (!s.sound || gain <= 0) return;
    const rng = this.o.rng ?? Math.random;
    let player = this.override;
    if (!player) {
      const variant = pickVariant(this.sources.length, this.last, rng);
      if (variant < 0) return;
      this.last = variant;
      player = this.players[variant * this.voices + (this.cursor++ % this.voices)];
    }
    try {
      const [lo, hi] = this.o.rate ?? [0.9, 1.1];
      // Must be setPlaybackRate(), not `player.playbackRate = x`: the type declares an
      // assignable property but the runtime object only has a getter, so assigning
      // throws — which typecheck and unit tests both miss. Out-of-range rates throw too.
      player.setPlaybackRate(Math.max(0.5, Math.min(2, between(lo, hi, rng))));
      const jitter = this.o.volumeJitter ?? 0.1;
      player.volume = Math.max(0, Math.min(1, s.volume * gain * between(1 - jitter, 1, rng)));
      player.seekTo(0);
      player.play();
    } catch (err) {
      // A dropped sound effect is not worth a frame — but never swallow it silently.
      if (__DEV__) console.warn('[audio] play failed', err);
    }
  }

  release() {
    for (const p of this.players) p.remove();
    this.players = [];
    this.setOverride(null);
  }
}
