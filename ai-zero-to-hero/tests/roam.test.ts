import { describe, expect, it } from 'vitest';
import { clampTo, distance, pickWaypoint, stepToward, type Bounds } from '../src/lib/roam';

const bounds: Bounds = { minX: 50, maxX: 1390, minY: 165, maxY: 888 };

function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('stepToward', () => {
  it('walks at the requested speed in a straight line', () => {
    const r = stepToward({ x: 0, y: 0 }, { x: 300, y: 400 }, 1000, 50);
    expect(r.arrived).toBe(false);
    expect(distance({ x: 0, y: 0 }, r.pos)).toBeCloseTo(50, 6);
    expect(r.pos.x / r.pos.y).toBeCloseTo(300 / 400, 6); // same bearing
  });

  it('never overshoots and reports arrival', () => {
    const r = stepToward({ x: 0, y: 0 }, { x: 10, y: 0 }, 5000, 46);
    expect(r).toEqual({ pos: { x: 10, y: 0 }, arrived: true });
  });

  it('a 16ms frame at 46px/s moves under a pixel', () => {
    const r = stepToward({ x: 100, y: 100 }, { x: 900, y: 500 }, 16, 46);
    expect(distance({ x: 100, y: 100 }, r.pos)).toBeLessThan(1);
  });
});

describe('pickWaypoint', () => {
  it('always lands inside the bounds and is a real walk away', () => {
    const rand = seeded(1);
    let from = { x: 60, y: 880 };
    for (let i = 0; i < 300; i++) {
      const t = pickWaypoint(from, bounds, rand);
      expect(t).toEqual(clampTo(bounds, t));
      expect(distance(from, t)).toBeGreaterThanOrEqual(220);
      from = t;
    }
  });

  it('mostly crosses the page, so the duck really walks across the content', () => {
    const rand = seeded(7);
    const mid = (bounds.minX + bounds.maxX) / 2;
    let from = { x: 70, y: 500 };
    let crossings = 0;
    const N = 400;
    for (let i = 0; i < N; i++) {
      const t = pickWaypoint(from, bounds, rand);
      if ((from.x < mid) !== (t.x < mid)) crossings++;
      from = t;
    }
    expect(crossings / N).toBeGreaterThan(0.6);
  });

  it('uses the whole height of the content area, not one lane', () => {
    const rand = seeded(3);
    const ys: number[] = [];
    let from = { x: 70, y: 500 };
    for (let i = 0; i < 200; i++) {
      from = pickWaypoint(from, bounds, rand);
      ys.push(from.y);
    }
    expect(Math.min(...ys)).toBeLessThan(bounds.minY + 120);
    expect(Math.max(...ys)).toBeGreaterThan(bounds.maxY - 120);
  });

  it('copes with a very small window', () => {
    const tiny: Bounds = { minX: 10, maxX: 200, minY: 100, maxY: 160 };
    const t = pickWaypoint({ x: 20, y: 120 }, tiny, seeded(9));
    expect(t).toEqual(clampTo(tiny, t));
  });
});
