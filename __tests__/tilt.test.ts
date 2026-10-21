import { applyDeadzone, isShake, lowPass } from '@/engines/sensors/tilt';

describe('tilt maths', () => {
  it('low-pass moves a fraction of the way toward the new sample', () => {
    expect(lowPass({ x: 0, y: 0 }, { x: 1, y: -1 }, 0.25)).toEqual({ x: 0.25, y: -0.25 });
  });
  it('dead zone zeroes tiny tilts and rescales the rest so there is no jump at the edge', () => {
    expect(applyDeadzone({ x: 0.01, y: 0 }, 0.05)).toEqual({ x: 0, y: 0 });
    const out = applyDeadzone({ x: 0.06, y: 0 }, 0.05);
    expect(out.x).toBeGreaterThan(0);
    expect(out.x).toBeLessThan(0.02);
  });
  it('a shake is a large residual from the gravity estimate', () => {
    expect(isShake({ x: 0, y: 0 }, { x: 1.5, y: 0 }, 1.2)).toBe(true);
    expect(isShake({ x: 0.3, y: 0 }, { x: 0.4, y: 0 }, 1.2)).toBe(false);
  });
});
