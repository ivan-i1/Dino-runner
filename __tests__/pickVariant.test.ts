import { pickVariant } from '@/engines/audio/pickVariant';

describe('pickVariant', () => {
  it('never repeats the previous variant when there is a choice', () => {
    const seq = [0, 0.4, 0.99, 0.5, 0.1];
    let last = -1;
    for (const r of seq) {
      const next = pickVariant(3, last, () => r);
      expect(next).not.toBe(last);
      expect(next).toBeGreaterThanOrEqual(0);
      expect(next).toBeLessThan(3);
      last = next;
    }
  });
  it('returns 0 for a single-variant bank', () => {
    expect(pickVariant(1, 0, () => 0.7)).toBe(0);
  });
  it('returns -1 for an empty bank', () => {
    expect(pickVariant(0, -1, () => 0.7)).toBe(-1);
  });
});
