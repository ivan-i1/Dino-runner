import { FRAME_MS, frameScale } from '@/engines/game-loop/frameScale';

describe('frameScale', () => {
  it('is exactly 1 at 60 Hz so tuning done at 60 Hz is preserved', () => {
    expect(frameScale(FRAME_MS)).toBe(1);
  });
  it('halves at 120 Hz so a faster display does not run the game faster', () => {
    expect(frameScale(FRAME_MS / 2)).toBeCloseTo(0.5);
  });
  it('clamps a long stall so one hitch cannot teleport entities', () => {
    expect(frameScale(1000)).toBe(2);
  });
  it('treats a missing or bogus delta as one nominal frame', () => {
    expect(frameScale(undefined)).toBe(1);
    expect(frameScale(NaN)).toBe(1);
    expect(frameScale(-5)).toBe(1);
  });
});
