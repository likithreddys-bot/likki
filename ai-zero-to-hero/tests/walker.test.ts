import { describe, expect, it } from 'vitest';
import { buildTrail, distanceBetween, pointAt, TEASER_NODES } from '../src/lib/trail';
import { stepWalker } from '../src/lib/walker';

const trail = buildTrail(TEASER_NODES);

describe('stepWalker', () => {
  it('does not move when already at the target', () => {
    expect(stepWalker(trail, 2, 2, 16, 50)).toEqual({ t: 2, arrived: true });
  });

  it('walks at the requested pixel speed', () => {
    const { t, arrived } = stepWalker(trail, 0, 5, 1000, 50);
    expect(arrived).toBe(false);
    expect(distanceBetween(trail, 0, t)).toBeCloseTo(50, 3);
  });

  it('walks backwards too', () => {
    const { t } = stepWalker(trail, 3, 0, 1000, 80);
    expect(t).toBeLessThan(3);
    expect(distanceBetween(trail, t, 3)).toBeCloseTo(80, 3);
  });

  it('never overshoots the target and reports arrival', () => {
    const { t, arrived } = stepWalker(trail, 0.98, 1, 5000, 60);
    expect(t).toBe(1);
    expect(arrived).toBe(true);
  });

  it('crosses segment boundaries using each segment\'s own length', () => {
    const need = trail.lengths[0] + 40;
    const { t } = stepWalker(trail, 0, 5, (need / 100) * 1000, 100);
    expect(t).toBeGreaterThan(1);
    expect(distanceBetween(trail, 0, t)).toBeCloseTo(need, 3);
  });

  it('reaches the end eventually, in many small frames, without jumping', () => {
    let t = 0;
    let prev = pointAt(trail, 0);
    let arrived = false;
    let frames = 0;
    while (!arrived && frames < 100000) {
      ({ t, arrived } = stepWalker(trail, t, 5, 16, 46));
      const p = pointAt(trail, t);
      expect(Math.hypot(p.x - prev.x, p.y - prev.y)).toBeLessThan(2);
      prev = p;
      frames++;
    }
    expect(arrived).toBe(true);
    // a slow, duck-paced walk: whole trail takes well over 10 seconds
    expect((frames * 16) / 1000).toBeGreaterThan(10);
  });
});
