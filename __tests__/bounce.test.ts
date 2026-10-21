import { stepBall, type Ball, type Bounds } from '@/engines/game-loop/bounce';

const bounds: Bounds = { width: 300, height: 600 };
const ball = (over: Partial<Ball> = {}): Ball => ({ x: 150, y: 300, vx: 0, vy: 0, r: 20, ...over });

describe('stepBall', () => {
  it('accelerates along the gravity vector, scaled by dtf', () => {
    const { ball: b } = stepBall(ball(), { x: 1, y: 0 }, bounds, { dtf: 2, friction: 1, bounciness: 1 });
    expect(b.vx).toBeCloseTo(2);
    expect(b.x).toBeCloseTo(154);
  });
  it('clamps to the wall, reflects velocity, and reports the pre-reflection impact speed', () => {
    const { ball: b, impact } = stepBall(ball({ x: 285, vx: 10 }), { x: 0, y: 0 }, bounds, {
      dtf: 1,
      friction: 1,
      bounciness: 0.5,
    });
    expect(b.x).toBe(280);
    expect(b.vx).toBe(-5);
    expect(impact).toBe(10);
  });
  it('reports no impact when nothing is hit', () => {
    expect(stepBall(ball(), { x: 0, y: 0 }, bounds, { dtf: 1, friction: 1, bounciness: 1 }).impact).toBe(0);
  });
});
